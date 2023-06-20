import express from 'express'
import twittController from '../controllers/twitt'
import { verifyToken, verifyUserOrAdmin } from '../middlewares/auth'
import twittImageUpload from '../middlewares/twittImageUpload'


const router = express.Router()


router.get('/all', twittController.allTwitts)
router.get('/:twittId',  twittController.oneTwitt)

router.post('/:userId/create', verifyToken, verifyUserOrAdmin, twittImageUpload.single('image'), twittController.createTwitt)

router.delete('/:twittId/delete', verifyToken, verifyUserOrAdmin, twittController.createTwitt)

export default router