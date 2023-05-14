
import express from 'express'
import User from '../database/models/user'
import { isValidObjectId } from 'mongoose'

type Response = express.Response
type Request = express.Request

const controller = {
    allUsers: async (_req: Request, res: Response) => {
        const users = await User.find()
        return res.status(200).json(users)
    },
    oneUser: async (req: Request, res: Response) => {
        const id = req.params.userId
        if (!isValidObjectId(id)) {
            res.status(400).json({msg: 'Id de usuario invalido'})
        }
        const userToFind = await User.findById(id)
        if (!userToFind) {
            res.status(404).json({ msg: 'Usuario no encontrado' })
        }
        const user = userToFind
        res.status(200).json(user)
    },
}

export default controller