import express from 'express'
import userController from '../controllers/user'
import {/*  verifyAdmin, */ verifyToken, verifyUserOrAdmin } from '../middlewares/auth'

const router = express.Router()
router.get('/check-session', userController.checkSession);
router.get('/check-cookie', verifyToken, userController.checkCookie);
router.get('/logout', verifyToken, userController.logout);
router.get('/:userId', userController.oneUser);
router.get('/favourites/:userId', userController.getFavouritesByUser);

router.post('/register',  userController.register);
router.post('/login', userController.processLogin);

router.put('/:userId/update', verifyToken, verifyUserOrAdmin, userController.follow);
router.put('/:userId/toAdmin', verifyToken, userController.convertUserToAdmin);
router.put('/:userBFId/:userWFId/follow', verifyToken, userController.follow);


router.delete('/:userId', verifyToken, verifyUserOrAdmin, userController.deleteUser);
router.get('/:userId', verifyToken, verifyUserOrAdmin, userController.oneUser);

export default router