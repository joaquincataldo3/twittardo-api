
import User from '../database/models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { LoginUser, RegisterUser, UserT } from '../types'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { handlePutCommand, handleDeleteCommand, handleGetCommand } from '../utils/s3ConfigCommands'

dotenv.config()

const controller = {
    allUsers: async (_req: Request, res: Response) => {
        try {
            const usersResponse = await User
                .find()
                .select('-_id -password -email')
            const users: UserT[] = usersResponse.map((user: any) => ({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                image_url: user.image_url,
                isAdmin: user.isAdmin,
                favourites: user.favourites,
                twitts: user.twitts,
                followers: user.followers,
                following: user.following
            }));
            // aca voy por cada imagen y hago un getobjectcommand para obtener el url
            const folder = 'avatars';
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let url = await handleGetCommand(user.avatar, folder);
                user.image_url = url;
            };
            return res.status(200).json(users)
        } catch (error) {
            return res.status(400).json({ msg: `Problema mientras se buscaban los usuarios: ${error}` })
        }
    },
    oneUser: async (req: Request, res: Response) => {
        try {
            const id: string = req.params.userId
            if (!isValidObjectId(id)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' })
            }
            const userToFind = await User
                .findById(id)
                .populate('twitts')
            if (userToFind === null) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            const userFound = userToFind
            let oneUser: UserT = {
                _id: userFound._id as string,
                username: userFound.username,
                email: userFound.email,
                avatar: userFound.avatar,
                isAdmin: userFound.isAdmin,
                favourites: userFound.favourites,
                twitts: userFound.twitts,
                followers: userFound.followers,
                following: userFound.following,
                image_url: '',
            }
            const folder = 'avatars';
            let url = await handleGetCommand(oneUser.avatar, folder);
            oneUser.image_url = url;
            return res.status(200).json(oneUser)
        } catch (error) {
            return res.status(400).json({ msg: `Problema mientras se buscaba el usuario especificado: ${error}` })
        }

    },
    follow: async (req: Request, res: Response) => {
        try {
            const userBeingFollowedId: string = req.params.userBFId;
            const userWantingToFollowId: string = req.params.userWFId;

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
    processLogin: (async (req: Request, res: Response) => {
        try {
            const { password, email }: LoginUser = req.body
            const secretKey = process.env.JWT_KEY!

            if (!password || !email) {
                return res.status(400).json({ msg: 'Por favor completar los campos solicitados' })
            }

            const verifyEmail = await User.findOne({ email })

            if (!verifyEmail) {
                return res.status(404).json({ msg: 'Credenciales invalidas' })
            } // user could be null
            const userToVerify = verifyEmail
            const verifyPassword = await bcrypt.compare(password, userToVerify.password)
            if (!verifyPassword) {
                return res.status(404).json({ msg: 'Credenciales invalidas' })
            }
            let userVerified: UserT = {
                _id: verifyEmail._id as string,
                username: verifyEmail.username,
                email: verifyEmail.email,
                avatar: verifyEmail.avatar,
                isAdmin: verifyEmail.isAdmin,
                favourites: verifyEmail.favourites,
                twitts: verifyEmail.twitts,
                followers: verifyEmail.followers,
                following: verifyEmail.following,
                image_url: ''
            }
            const folder = "users";
            let imageUrl = await handleGetCommand(userToVerify.avatar, folder);
            userVerified.image_url = imageUrl;
            const token = jwt.sign({ ...userVerified }, secretKey, {expiresIn: "1d"});
            console.log(userVerified);
            const cookie = res.cookie('user_access_token', token, {
                httpOnly: true,
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
                domain: 'localhost:5173'
            });
            console.log("Login: ", cookie);
            req.session.userLogged = userVerified;

            return res.status(200).json({ userVerified, token })

        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se logueaba al usuario: ${error}` })
        }

    }),
    register: (async (req: Request, res: Response) => {
        try {
            const { email, username, password }: RegisterUser = req.body
            const avatar = req.file as Express.Multer.File

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

            const hashPassword = await bcrypt.hash(password, 10)

            let randomName = null;
            const folder = 'avatars';
            if (avatar) {
                randomName = await handlePutCommand(avatar, folder);
            } else {
                randomName = 'default_avatar.jpg';
            }

            let newUserData: UserT = {
                email,
                username,
                password: hashPassword,
                isAdmin: 0,
                avatar: randomName,
                image_url: ''
            }

            let newUser = await User.create(newUserData)
            return res.status(201).json(newUser);
        } catch (error) {
            return res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` })
        }

    }),
    checkSession: async (req: Request, res: Response) => {
        const user = req.session.userLogged

        if (user) {
            return res.status(200).json({ loggedIn: true, user })
        } else {
            return res.status(200).json({ loggedIn: false })
        }

    },
    checkCookie: async (req: Request, res: Response) => {
        console.log(req.user)
        if (req.user) {
            return res.status(200).json({ loggedIn: true, user: req.user })
        }
        else {
            return res.status(200).json({ loggedIn: false })
        }
    },
    updateUser: async (req: Request, res: Response) => {
        try {
            const userId: string = req.params.userId;

            if (!isValidObjectId(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' })
            }

            const userToFind = await User.findById(userId)

            if (!userToFind) {
                return res.status(404).json({ msg: 'Usuario no encontrado' })
            } else { // i had to do this because userToFind is possibly null
                const user = userToFind;
                const bodyAvatar = req.file;

                let randomName: string;
                let folder = 'avatars';
                if (user.avatar && bodyAvatar) {
                    await handleDeleteCommand(user.avatar, folder);
                    randomName = await handlePutCommand(bodyAvatar, folder);
                } else if (!user.avatar && bodyAvatar) {
                    randomName = await handlePutCommand(bodyAvatar, folder);
                } else {
                    const defAvatar = 'default_avatar.jpg';
                    await handleDeleteCommand(user.avatar, folder);
                    randomName = await handlePutCommand(defAvatar, folder)
                }

                const dataToUpdate: UserT = {
                    username: req.body.username ? req.body.username : user.username,
                    email: req.body.email ? req.body.email : user.email,
                    password: req.body.password ? req.body.password : user.password,
                    isAdmin: 0,
                    avatar: randomName,
                    image_url: ''
                }

                const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true })

                return res.status(200).json(updatedUser)
            }


        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se hacía una actualización del usuario: ${error}` })
        }
    },
    convertUserToAdmin: async (req: Request, res: Response) => {

        try {
            const userId: string = req.params.userId;
            const key: string = req.body.key
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
            const userId: string = req.params.userId

            if (!isValidObjectId(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' });
            }

            const userToDelete = await User.findByIdAndRemove(userId);

            if (userToDelete == null) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            if (userToDelete.avatar) {
                const folder = 'avatars';
                await handleDeleteCommand(userToDelete.avatar, folder);
            }

            return res.status(200).json(userId)

        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se eliminaba el usuario: ${error}` })
        }

    },
    logout: (_req: Request, res: Response) => {
        res.cookie('user_access_token', '', { maxAge: 1 })
        return res.status(200).json({ msg: "Fuiste deslogueado" })
    }
}

export default controller