import express from 'express'
import userController from '../controllers/user'
import avatarUpload from '../middlewares/avatarUpload'
import { verifyAdmin, verifyToken, verifyUserOrAdmin } from '../middlewares/auth'

const router = express.Router()
router.get('/', verifyToken, verifyAdmin, userController.allUsers)
router.post('/register', avatarUpload.single('avatar'), userController.register)
router.post('/login', userController.login)
router.get('/logout', verifyToken, verifyUserOrAdmin, userController.logout)
router.get('/:userId', verifyToken, verifyUserOrAdmin, userController.oneUser)


router.put('/:userId/update', verifyToken, verifyUserOrAdmin, userController.follow)
router.put('/:userId/toAdmin', verifyToken, userController.convertUserToAdmin)
router.put('/:userBFId/:userWFId/follow', verifyToken, userController.follow)


router.delete('/:userId', verifyToken, verifyUserOrAdmin, userController.deleteUser)
router.get('/:userId', verifyToken, verifyUserOrAdmin, userController.oneUser)

export default router