import jwt from 'jsonwebtoken'
import { Response, NextFunction, Request } from 'express'
import User from '../database/models/user'
import { UserT } from '../types'
import dotenv from 'dotenv'
dotenv.config()

declare module 'express' { // declaration merging
    interface Request {
        user?: any;
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {

    const jwtKey = process.env.JWT_KEY!
    const userAccessToken: string = req.cookies.user_access_token;
    console.log("Verify:", req.cookies);

    if (!userAccessToken) {
        return res.status(401).json({ msg: 'No estás autenticado' })
    }

    if (jwtKey) {
        jwt.verify(userAccessToken, jwtKey, (err: any, user) => {
            if (err) {
                return res.status(403).json({ msg: 'Token invalido' })
            }
            req.user = user
            next()
            return;
        })     
    }

    return;

}


const verifyUserOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (req.user.isAdmin == 1) {
            return next()
        }

        const compareUser = await User.findById(req.user._id)

        if (!compareUser) {
            return res.status(403).json({ msg: 'No estás autorizado a performar esta acción' })
        }

        next();

        return;

    } catch (error) {
        console.log(error)
        return res.status(400).json({ msg: `Problema mientras se verificaba usuario o admin: ${error}` })
    }


}

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user: UserT = req.user._doc
    if (user.isAdmin) {
        next()
        return;
    } else {
        return res.status(403).json({ msg: 'No estás autorizado a performar esta acción' })
    }
}


export { verifyToken, verifyUserOrAdmin, verifyAdmin }