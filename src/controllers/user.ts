
import { Request, Response } from 'express'
import User from '../database/models/user'
import { UserT } from '../types'
import { isValidObjectId } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


const controller = {
    allUsers: async (_req: Request, res: Response) => {
        try {
            const users = await User
                .find()
                .select('-_id -password -email')
            return res.status(200).json(users)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se buscaban los usuarios: ${error}` })
        }

    },
    oneUser: async (req: Request, res: Response) => {
        try {
            const id = req.params.userId
            if (!isValidObjectId(id)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' })
            }
            const userToFind = await User
                .findById(id)
                .populate('twitts')

            if (!userToFind) {
                return res.status(404).json({ msg: 'Usuario no encontrado' })
            }
            const user = userToFind
            return res.status(200).json(user)
        } catch (error) {

            return res.status(400).json({ msg: `Problema mientras se buscaba el usuario especificado: ${error}` })
        }

    },
    follow: async (req: Request, res: Response) => {
        try {
            const userBeingFollowedId = req.params.userBFId;
            const userWantingToFollowId = req.params.userWFId;

            if (!isValidObjectId(userBeingFollowedId) || !isValidObjectId(userWantingToFollowId)) {
                return res.status(400).json({ msg: 'Id de usuarios invalidos' })
            }

            const getUserBeingFollowed = await User.findById(userBeingFollowedId);
            const getUserWantingToFollow = await User.findById(userWantingToFollowId);

            if (!getUserBeingFollowed || !getUserWantingToFollow) {
                return res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' })
            }


            const UserBeingFollowedUpdated = await User.findByIdAndUpdate(
                userBeingFollowedId,
                { $addToSet: { followers: userWantingToFollowId } },
                { new: true }
            );

            const userFollowingUpdated = await User.findByIdAndUpdate(
                userWantingToFollowId,
                { $addToSet: { following: userBeingFollowedId } },
                { new: true }
            );


            return res.status(201).json({ userFollowed: UserBeingFollowedUpdated, userFollowing: userFollowingUpdated })

        } catch (error) {
            return res.status(400).json({ msg: 'Error mientras se seguía al usuario' })
        }
    },
    login: (async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body
            const secretKey = process.env.JWT_KEY!

            if (!password || !email) {
                return res.status(400).json({ msg: 'Por favor completar los campos solicitados' })
            }

            const verifyEmail = await User.findOne({ email })

            if (!verifyEmail) {
                return res.status(404).json({ msg: 'Credenciales invalidas' })
            } else { // user could be null
                const user = verifyEmail
                const verifyPassword = bcrypt.compare(password, user.password)
                if (!verifyPassword) {
                    return res.status(404).json({ msg: 'Credenciales invalidas' })
                }
                delete user.password;
                const token = jwt.sign({ ...user }, secretKey)
                res.cookie('user_access_token', token, {
                    httpOnly: true, maxAge: 2 * 60 * 60 * 1000 // 2 hours
                })

                return res.status(200).json({ user, token })
            }
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se logueaba al usuario: ${error}` })
        }

    }),
    register: (async (req: Request, res: Response) => {
        try {
            const password = req.body.password
            const username = req.body.username
            const email = req.body.email
            const avatar = req.file

            if (!email || !username || !password) {
                return res.status(400).json({ msg: 'Es necesario completar los campos solicitados' })
            }

            const emailAlreadyInDb = await User.find({ email })

            if (emailAlreadyInDb.length > 0) {
                return res.status(409).json({ msg: 'Email ya en uso' })
            }


            const usernameAlreadyInDb = await User.find({ username })

            if (usernameAlreadyInDb.length > 0) {
                return res.status(409).json({ msg: 'Nombre de usuario ya en uso' })
            }


            const hashPassword = bcrypt.hashSync(password, 10)

            const newUserData: UserT = {
                email,
                username,
                password: hashPassword,
                isAdmin: 0
            }

            if (avatar) {
                newUserData.avatar = avatar.path
            }

            const newUser = await User.create(newUserData)

            return res.status(201).json(newUser);
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` })
        }

    }),
    checkLogin: async (req: Request, res: Response) => {
        const userAccessToken = req.cookies['user_access_token'];


        if (userAccessToken) {
            const secretKey = process.env.JWT_KEY!
            const decodedToken = jwt.verify(userAccessToken, secretKey);

            return res.status(200).json({ isLoggedIn: true, user: decodedToken});
        } else {
            return res.status(401).json({ isLoggedIn: false });
        }
    },
    updateUser: async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId;

            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' })
            }

            const userToFind = await User.findById(userId)

            if (!userToFind) {
                res.status(404).json({ msg: 'Usuario no encontrado' })
            } else { // i had to do this because userToFind is possibly null
                const user = userToFind;

                const dataToUpdate: UserT = {
                    username: req.body.username ? req.body.username : user.username,
                    email: req.body.email ? req.body.email : user.email,
                    password: req.body.password ? req.body.password : user.password,
                    isAdmin: 0
                }

                if (req.file) {
                    dataToUpdate.avatar = req.file.filename
                }

                const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true })

                res.status(200).json(updatedUser)
            }


        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se hacía una actualización del usuario: ${error}` })
        }
    },
    convertUserToAdmin: async (req: Request, res: Response) => {

        try {
            const userId = req.params.userId;
            const key = req.body.key
            const adminKey = process.env.ADMIN_KEY

            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' })
            }

            if (key === adminKey) {
                const userToFind = await User.findByIdAndUpdate(userId, { isAdmin: 1 }, { new: true })

                if (!userToFind) {
                    res.status(404).json({ msg: 'Usuario no encontrado' })
                } else {
                    const admin = userToFind
                    res.status(200).json(admin)
                }

            } else {
                res.status(400).json({ msg: 'Key de admin incorrecta' })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se convertia al usuario en admin: ${error}` })
        }


    },
    deleteUser: async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId

            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' })
            }

            await User.findByIdAndRemove(userId)

            res.status(200).json(userId)

        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se eliminaba el usuario: ${error}` })
        }

    },
    logout: (_req: Request, res: Response) => {
        res.cookie('user_access_token', '', { maxAge: 1 })
        return res.status(200).json({ msg: "Fuiste deslogueado" })
    }
}

export default controller