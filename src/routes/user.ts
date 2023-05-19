import express from 'express'
import userController from '../controllers/user'
import avatarUpload from '../middlewares/avatarUpload'
import { verifyAdmin, verifyToken, verifyUserOrAdmin } from '../middlewares/auth'

const router = express.Router()
router.get('/all', verifyToken, verifyAdmin, userController.allUsers)
router.get('/:userId', verifyToken, verifyUserOrAdmin, userController.oneUser)
router.get('/logout', userController.logout)

router.post('/register', avatarUpload.single('avatar'), userController.register)
router.post('/login', userController.login)
router.post('/follow', userController.follow)

router.put('/:userId/update', userController.follow)
router.put('/:userId/toAdmin', verifyToken, userController.convertUserToAdmin)

router.delete('/:userId', verifyToken, verifyUserOrAdmin, userController.deleteUser)

export default router