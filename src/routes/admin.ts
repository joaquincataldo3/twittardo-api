import express from 'express'
import adminController from '../controllers/admin'

const router = express.Router()

router.get('/all', adminController.allUsers)
router.get('/:adminId', adminController.oneAdmin)
router.get('/logout', adminController.logout)

router.post('/login', adminController.login)


export default router