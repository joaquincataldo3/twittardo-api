import { Request, Response } from 'express'
import Comment from '../database/models/comment'
import Twitt from '../database/models/twitt'
import User from '../database/models/user'
import { isValidObjectId } from 'mongoose'
import { CommentT } from '../types'



const controller = {
    allComments: async (_req: Request, res: Response) => {
        try {
            const comments = await Comment.find();
            return res.status(200).json(comments);
        } catch (error) {
            return res.status(400).json({ msg: `Problema mientras se buscaban los comentarios: ${error}` });
        }

    },
    createComment: async (req: Request, res: Response) => {
        try { 
            const userId: string = req.params.userId;
            const twittId: string = req.params.twittId;
            if(!isValidObjectId(userId) || !isValidObjectId(twittId)){
                return res.status(400).json({msg: 'Twitt o usuario id invalido'})
            }
            const commentData: CommentT = {
                comment: req.body.comment,
                user: userId,
                twittCommented: twittId,
                favourites: 0
            }
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
            })
            const pushCommentInUser = await User.findByIdAndUpdate(userId, 
                {
                $addToSet: { 
                    comments: newComment._id
                }
            }, {
                new: true
            })
            return res.status(200).json({newComment, pushCommentInTwitt, pushCommentInUser});
        } catch (error) {
            return res.status(400).json({msg: `Problema mientras se creaba un comentario: ${error}`});
        }
    },
    favOneComment: async (req: Request, res: Response) => {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!isValidObjectId(userId) || !isValidObjectId(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' })
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
            })
            return res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' });
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
        }
    },
    deleteComment: async (req: Request, res: Response) => {
        try {
            const commentIdToDelete: string = req.params.commentId;
            if(!isValidObjectId(commentIdToDelete)){
                res.status(400).json({msg: 'Comentario id invalido'})
            }
            await Comment.findByIdAndRemove(commentIdToDelete);
            res.status(200).json(commentIdToDelete);
        } catch (error) {
            res.status(400).json({msg: `Problema mientras se borraba un comentario: ${error}`});
        } 
    }
}

export default controller