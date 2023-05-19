import express from 'express'
import commentController from '../controllers/comment'
import { verifyToken, verifyUserOrAdmin } from '../middlewares/auth'

const router = express.Router()


router.get('/all', commentController.allComments)

router.post('/:twittId/:userId/create', verifyToken, commentController.createComment)

router.delete('/:commentId/delete', verifyToken, verifyUserOrAdmin, commentController.deleteComment)

export default router