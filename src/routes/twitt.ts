import express from 'express'
import twittController from '../controllers/twitt'

const router = express.Router()

router.post('/create', twittController.createTwitt)

export default router