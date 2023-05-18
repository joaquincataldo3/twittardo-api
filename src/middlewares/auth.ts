import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'
import { GetInfoAuthRequest } from '../utils/getUserReq'
import User from '../database/models/user'

const verifyToken = (req: GetInfoAuthRequest, res: Response, next: NextFunction) => {

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

            console.log(user)
            req.user = user
            next()

        })
    }
}



// TODO - MODIFY MIDDLEWARE TO ASK FOR FIELD IS ADMIN
const verifyUserOrAdmin = async (req: GetInfoAuthRequest, res: Response, next: NextFunction) => {

    const compareUser = await User.find({ id: req.user.id })

    console.log(req.user)

    if (req.user.isAdmin || compareUser) {
        next()
    } else {
        res.status(403).json({ msg: 'No estás autorizado a performar esta acción' })
    }

}

const verifyAdmin = async (req: GetInfoAuthRequest, res: Response, next: NextFunction) => {

    if (req.user.isAdmin) {
        next()
    } else {
        res.status(403).json({ msg: 'No estás autorizado a performar esta acción' })
    }


}



export { verifyToken, verifyUserOrAdmin, verifyAdmin }