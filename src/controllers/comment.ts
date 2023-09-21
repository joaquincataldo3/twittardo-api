import { Request, Response } from 'express'
import Comment from '../database/models/comment'
import Twitt from '../database/models/twitt'
import { isValidObjectId } from 'mongoose'
import { CommentT } from '../types'



const controller = {
    allComments: async (_req: Request, res: Response) => {
        try {
            const comments = await Comment.find()
            return res.status(200).json(comments)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se buscaban los comentarios: ${error}` })
        }

    },
    createComment: async (req: Request, res: Response) => {
        try {
            const userId: string = req.params.userId
            const twittId: string = req.params.twittId

            
            if(!isValidObjectId(userId) || !isValidObjectId(twittId)){
                return res.status(400).json({msg: 'Twitt o usuario id invalido'})
            }

            const commentData: CommentT = {
                comment: req.body.comment,
                user: userId,
                twittId
            }

            const newComment = await Comment.create(commentData)

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

            return res.status(200).json({newComment, pushCommentInTwitt})

        } catch (error) {
            console.log(error)
            return res.status(400).json({msg: `Problema mientras se creaba un comentario: ${error}`})
        }
    },
    deleteComment: async (req: Request, res: Response) => {

        try {
            const commentIdToDelete: string = req.params.commentId

            if(!isValidObjectId(commentIdToDelete)){
                res.status(400).json({msg: 'Comentario id invalido'})
            }

            await Comment.findByIdAndRemove(commentIdToDelete)

            res.status(200).json(commentIdToDelete)

        } catch (error) {
            console.log(error)
            res.status(400).json({msg: `Problema mientras se borraba un comentario: ${error}`})
        } 
    }
}

export default controller