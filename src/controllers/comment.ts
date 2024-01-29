import { Request, Response } from 'express';
import Comment from '../database/models/comment';
import Twitt from '../database/models/twitt';
import User from '../database/models/user';
import { isValidObjectId } from 'mongoose';
import { IComment } from '../utils/interfaces/interfaces' ;
import { modelPaths } from '../utils/constants/modelsPath';


const {userPath,twittCommentedPath} = modelPaths;

const controller = {
    createComment: async (req: Request, res: Response): Promise<void> => {
        try { 
            const user = req.user;
            const {_id} = user;
            const twittId: string = req.params.twittId;
            if(!isValidObjectId(twittId)){
                res.status(400).json({msg: 'Twitt id invalido'});
                return;
            }
            const commentData: IComment = {
                comment: req.body.comment,
                user: _id,
                twittCommented: twittId,
                favourites: 0
            };
            const newComment = await Comment.create(commentData);
            const pushCommentInTwitt = await Twitt.findByIdAndUpdate(twittId, 
                {
                $addToSet: { 
                    comments: newComment._id
                },
                $inc: {
                    commentsNumber: 1
                }
            }, {
                new: true
            });
            const pushCommentInUser = await User.findByIdAndUpdate(_id, 
                {
                $addToSet: { 
                    comments: newComment._id
                }
            }, {
                new: true
            });
            res.status(200).json({newComment, pushCommentInTwitt, pushCommentInUser});
            return;
        } catch (error) {
            res.status(500).json({msg: 'Ocurrió un problema mientras se creaba un comentario'});
            return;
        }
    },
    getCommentsByUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;
            const page: string = String(req.query.p);
            const pageNumber: number = Number(page);
            const commentsPerPage: number = 5; 
            if(!isValidObjectId(userId)) {
                res.status(400).json({msg: 'Id invalido'});
                return;
            }
            const comments = await Comment
            .find({user: userId})
            .populate(userPath)
            .populate(twittCommentedPath)
            .skip((pageNumber - 1) * commentsPerPage)
            .limit(commentsPerPage)
            console.log({comments: comments});
            res.status(200).json({comments});
            return;
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: 'Problema interno en el servidor'});
            return;
        }
    },
    favOneComment: async (req: Request, res: Response): Promise<void> => {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!isValidObjectId(userId) || !isValidObjectId(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
                return;
            }
            await Comment.findByIdAndUpdate(twittId,
                { $inc: { favourites: 1 } },
                { new: true });

            await User.findByIdAndUpdate(userId,
                {
                    $addToSet: {
                        favourites: twittId
                    },
                }, {
                new: true
            });
            res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' });
            return;
        } catch (error) {
            res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
            return;
        }
    },
    deleteComment: async (req: Request, res: Response): Promise<void> => {
        try {
            const commentIdToDelete: string = req.params.commentId;
            if(!isValidObjectId(commentIdToDelete)){
                res.status(400).json({msg: 'Comentario id invalido'});
                return;
            }
            await Comment.findByIdAndRemove(commentIdToDelete);
            res.status(200).json(commentIdToDelete);
            return;
        } catch (error) {
            res.status(400).json({msg: `Problema mientras se borraba un comentario: ${error}`});
            return;
        } 
    }
}

export default controller