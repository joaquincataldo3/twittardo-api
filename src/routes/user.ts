import express from 'express'
import userController from '../controllers/user'

const router = express.Router()

router.get('/', userController.allUsers)

export default router