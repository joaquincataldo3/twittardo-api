import express from 'express'
import userController from '../controllers/user'

const router = express.Router()

router.get('/all', userController.allUsers)
router.get('/:userId', userController.allUsers)

router.post('/register', userController.allUsers)
router.post('/login', userController.allUsers)

export default router