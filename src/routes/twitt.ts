import express from 'express'
import twittController from '../controllers/twitt'
import { verifyToken, verifyUserOrAdmin } from '../middlewares/auth'


const router = express.Router()


router.get('/all', twittController.allTwitts);
router.get('/one/:twittId',  twittController.oneTwitt);
router.get('/by-user/:userId',  twittController.twittsByUser);

router.post('/create', verifyToken, verifyUserOrAdmin, twittController.createTwitt);

router.put('/add-fav/:twittId', verifyToken, twittController.favOneTwitt);
router.put('/undo-fav/:twittId', verifyToken, twittController.favOneTwitt);

router.delete('/:twittId/delete', verifyToken, verifyUserOrAdmin, twittController.createTwitt);

export default router