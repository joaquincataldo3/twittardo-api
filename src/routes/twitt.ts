import express from 'express'
import twittController from '../controllers/twitt'
import { verifyToken, verifyUserOrAdmin } from '../middlewares/auth'
import imageUpload from '../middlewares/imageUpload'


const router = express.Router()


router.get('/all', twittController.allTwitts)
router.get('/favourite',  twittController.favOneTwitt)
router.get('/:twittId',  twittController.oneTwitt)

router.post('/:userId/create', verifyToken, verifyUserOrAdmin, imageUpload.single('image'), twittController.createTwitt)

router.delete('/:twittId/delete', verifyToken, verifyUserOrAdmin, twittController.createTwitt)

export default router