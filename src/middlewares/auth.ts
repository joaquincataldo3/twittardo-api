import jwt from 'jsonwebtoken';
import { Response, NextFunction, Request } from 'express';
import User from '../database/models/user';
import dotenv from 'dotenv';
import { IUser } from '../utils/interfaces/interfaces';
dotenv.config();
/// <reference path=""..//express.d.ts"" />

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const jwtKey = process.env.JWT_KEY!
    const userAccessToken = req.cookies.user_access_token;
    if (!userAccessToken) {
        return res.status(401).json({ msg: 'No estás autenticado' })
    }
    if (jwtKey) {
        jwt.verify(userAccessToken, jwtKey, (err: any, user: any) => {
            if (err) {
                return res.status(403).json({ msg: 'Token invalido' })
            }
            const userVerified: IUser = {
                _id: user._id,
                email: user.email,
                username: user.username,
                password: user.password,
                isAdmin: user.isAdmin,
                image: user.image,
                favourites: user.favourites || [],
                twitts: user.twitts || [],
                followers: user.followers || [],
                following: user.following || [],
                comments: user.comments || []
            };
            req.user = userVerified
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
        return res.status(400).json({ msg: `Problema mientras se verificaba usuario o admin: ${error}` })
    }
}

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user._doc
    if (user.isAdmin) {
        next()
        return;
    } else {
        return res.status(403).json({ msg: 'No estás autorizado a performar esta acción' })
    }
}


export { verifyToken, verifyUserOrAdmin, verifyAdmin }