
import { Request, Response } from 'express'
import User from '../database/models/user'
import { UserT } from '../types'
import { isValidObjectId } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



const controller = {
    allUsers: async (_req: Request, res: Response) => {
        try {
            const users = await User.find()
            res.status(200).json(users)
        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se buscaban los usuarios: ${error}` })
        }

    },
    oneUser: async (req: Request, res: Response) => {
        try {
            const id = req.params.userId
            if (!isValidObjectId(id)) {
                res.status(400).json({ msg: 'Id de usuario invalido' })
            }
            const userToFind = await User.findById(id)
            if (!userToFind) {
                res.status(404).json({ msg: 'Usuario no encontrado' })
            }
            const user = userToFind
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se buscaba el usuario especificado: ${error}` })
        }

    },
    follow: async (req: Request, res: Response) => {
        try {
            const userBeingFollowedId = req.query.mu;
            const userWantingToFollowId = req.query.uf;

            if (!isValidObjectId(userBeingFollowedId) || isValidObjectId(userWantingToFollowId)) {
                res.status(400).json({ msg: 'Id de usuarios invalidos' })
            }

            const getUserBeingFollowed = await User.findById(userBeingFollowedId);
            const getUserWantingToFollow = await User.findById(userWantingToFollowId);

            if (!getUserBeingFollowed || !getUserWantingToFollow) {
                res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' })
            }


            const UserBeingFollowedUpdated = await User.findByIdAndUpdate(userBeingFollowedId,
                {
                    $addToSet: {
                        followers: userWantingToFollowId,
                    },
                }, {
                new: true
            }).populate('followers', 'following')

            const userFollowingUpdated = await User.findByIdAndUpdate(userWantingToFollowId,
                {
                    $addToSet: {
                        following: userBeingFollowedId,
                    },
                }, {
                new: true
            }).populate('followers', 'following')


            res.status(201).json({ userFollowed: UserBeingFollowedUpdated, userFollowing: userFollowingUpdated })

        } catch (error) {
            res.json({ msg: 'Error mientras se seguía al usuario' })
        }
    },
    login: (async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            if (!password || !email) {
                res.status(400).json({ msg: 'Por favor completar los campos solicitados' })
            }

            const verifyEmail = await User.findOne({ email })

            if (!verifyEmail) {
                res.status(404).json({ msg: 'Credenciales invalidas' })
            } else { // i had to do this else because user could be null
                const user = verifyEmail
                const verifyPassword = bcrypt.compare(password, user.password)
                if (!verifyPassword) {
                    res.status(404).json({ msg: 'Credenciales invalidas' })
                }
                const secretKey = process.env.JWT

                const token = jwt.sign({ ...user, isAdmin: false }, secretKey)

                res.cookie('user_access_token', token, {
                    httpOnly: true, maxAge: 2 * 60 * 60 * 1000 // 2 hours
                })

                res.status(200).json({ user, token })
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se logueaba al usuario: ${error}` })
        }

    }),
    register: (async (req: Request, res: Response) => {
        try {
            const { email, username, password } = req.body

            const emailAlreadyInDb = await User.find({ email })
            const usernameAlreadyInDb = await User.find({ username })

            if (emailAlreadyInDb || usernameAlreadyInDb) {
                res.status(409).json({ msg: 'Nombre de usuario o email están en uso' })
            }

            if (!email || !username || !password) {
                res.status(400).json({ msg: 'Es necesario completar los campos solicitados' })
            }

            const hashPassword = bcrypt.hashSync(password, 10)

            const newUserData: UserT = {
                email,
                username,
                password: hashPassword,
                isAdmin: false
            }

            if (req.file) {
                newUserData.avatar = req.file.filename
            }

            const newUser = await User.create({ email, username, password: hashPassword })

            res.status(201).json(newUser);
        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` })
        }

    }),
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
                    isAdmin: false
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
            const adminKeyInBody = req.body.adminKey
            const adminKey = process.env.ADMIN_KEY

            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' })
            }

            if (adminKeyInBody === adminKey) {
                const userToFind = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true })

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
        res.status(200).json({ msg: "Fuiste deslogueado" })
    }
}

export default controller