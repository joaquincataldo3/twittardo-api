import express from 'express'
import twittController from '../controllers/twitt'
import { verifyToken, verifyUserOrAdmin } from '../middlewares/auth'
import imageUpload from '../middlewares/imageUpload'


const router = express.Router()


router.get('/all/:userId', twittController.allTwitts);
router.get('/:twittId',  twittController.oneTwitt);

router.post('/:userId/create', verifyToken, verifyUserOrAdmin, imageUpload.single('image'), twittController.createTwitt);

router.put('/add-fav/:twittId/:userId', verifyToken, twittController.favOneTwitt);
router.put('/undo-fav/:twittId/:userId', verifyToken, twittController.favOneTwitt);

router.delete('/:twittId/delete', verifyToken, verifyUserOrAdmin, twittController.createTwitt);

export default router