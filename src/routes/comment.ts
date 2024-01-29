import express from 'express'
import commentController from '../controllers/comment'
import { verifyToken, verifyUserOrAdmin } from '../middlewares/auth'

const router = express.Router()

router.get('/by-user/:userId', commentController.getCommentsByUser)

router.post('/:twittId/create', verifyToken, commentController.createComment);

router.delete('/:commentId/delete', verifyToken, verifyUserOrAdmin, commentController.deleteComment);

export default router