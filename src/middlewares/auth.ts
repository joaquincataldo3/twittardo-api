import jwt from 'jsonwebtoken'
import { Response, NextFunction, Request } from 'express'
import User from '../database/models/user'
import {UserT} from '../types'

declare module 'express' { // declaration merging
    interface Request {
        user?: any;
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {

    const jwtKey = process.env.JWT
    const token = req.cookies.user_access_token

    if (!token) {
        res.status(401).json({ msg: 'No estás autenticado' })
    }

    if (jwtKey) {
        jwt.verify(token, jwtKey, (err: any, user: any) => {
            if (err) {
                res.status(403).json({ msg: 'Token invalido' })
            }
            req.user = user
            next()

        })
    }
}


const verifyUserOrAdmin = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const compareUser = await User.findById(req.user.id)

        const user: UserT = req.user._doc

        if (user.isAdmin || compareUser) {
            next()
        } else {
            res.status(403).json({ msg: 'No estás autorizado a performar esta acción' })
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({ msg: `Problema mientras se verificaba usuario o admin: ${error}` })
    }


}

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user: UserT = req.user._doc
    if (user.isAdmin) {
        next()
    } else {
        res.status(403).json({ msg: 'No estás autorizado a performar esta acción' })
    }
}


export { verifyToken, verifyUserOrAdmin, verifyAdmin }