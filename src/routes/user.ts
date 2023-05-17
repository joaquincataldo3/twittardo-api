import express from 'express'
import userController from '../controllers/user'

const router = express.Router()

router.get('/all', userController.allUsers)
router.get('/:userId', userController.oneUser)
router.get('/logout', userController.logout)

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/follow', userController.follow)

router.put('/:userId/update', userController.follow)

router.delete('/:userId', userController.deleteUser)

export default router