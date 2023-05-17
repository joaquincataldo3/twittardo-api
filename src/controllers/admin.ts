
import express from 'express'
import Admin from '../database/models/user'
import { isValidObjectId } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

type Response = express.Response
type Request = express.Request

const controller = {
    allUsers: async (_req: Request, res: Response) => {
        try {
            const admins = await Admin.find()
            res.status(200).json(admins)
        } catch (error) {
            console.log(error)
            res.status(400).json({msg: 'Problema mientras se buscaban los usuarios'})
        }
     
    },
    oneAdmin: async (req: Request, res: Response) => {
        try {
            const id = req.params.adminId
            if (!isValidObjectId(id)) {
                res.status(400).json({ msg: 'Id de admin invalido' })
            }
            const adminToFind = await Admin.findById(id)
            if (!adminToFind) {
                res.status(404).json({ msg: 'Admin no encontrado' })
            }
            const admin = adminToFind
            res.status(200).json(admin)
        } catch (error) {
            console.log(error)
            res.status(400).json({msg: 'Problema mientras se buscaba el admin especificado'})
        }
       
    }, 
    login: (async (req: Request, res: Response) => {
        const { password, email } = req.body

        if (!password || !email) {
            res.status(400).json({msg: 'Por favor completar los campos solicitados'})
        }

        const verifyEmail = await Admin.findOne({ email })

        if (!verifyEmail) {
            res.status(404).json({msg: 'Credenciales invalidas'})
        } else { // i had to do this else because user could be null
            const user = verifyEmail
            const verifyPassword = bcrypt.compare(password, user.password)
            if(!verifyPassword) {
                    res.status(404).json({msg: 'Credenciales invalidas'})    
            }
            const secretKey = process.env.JWT

            const token = jwt.sign({...user, isAdmin: true}, secretKey)
    
            res.cookie('user_access_token', token, {
                httpOnly: true, maxAge: 2 * 60 * 60 * 1000 // 2 hours
            })
            
            res.status(200).json({ user, token }) 
        } 
    }),
    logout: (_req: Request, res: Response) => {
        res.cookie('user_access_token', '', { maxAge: 1 })
        res.status(200).json({ msg: "Fuiste deslogueado" })
    }
}

export default controller