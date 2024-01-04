
import User from '../database/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ILoginUser, IRegisterUser, IUser, IImage } from '../types';
import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { modelPaths } from '../utils/constants/modelsPath';
import { folderNames, handleDeleteImage, handleUploadImage } from '../utils/util-functions/cloudinaryConfig';
import { defaultAvatarPaths } from '../utils/constants/defaultAvatar';


dotenv.config();

declare module 'express' { // declaration merging
    interface Request {
        user?: any;
    }
}

const { CommentPath, UserPath, FavouritePath, TwittPath, TwittCommentedPath } = modelPaths;
const { default_secure_url, default_public_id } = defaultAvatarPaths;
const { avatarsFolder} = folderNames;

const controller = {
    oneUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.userId;
            const limitFirstFetch = 5;
            if (!isValidObjectId(id)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            // busco el usuario y traigo los 5 primeros resultados de cada campo
            const userToFind = await User
                .findById(id)
                .populate({
                    path: TwittPath,
                    options: {
                        limit: limitFirstFetch,
                        sort: { createdAt: -1 }
                    }
                })
                .populate({
                    path: FavouritePath,
                    options: {
                        limit: limitFirstFetch,
                        sort: { createdAt: -1 }
                    },
                    populate: {
                        path: UserPath
                    }
                })
                .populate({
                    path: CommentPath,
                    options: {
                        limit: limitFirstFetch,
                        sort: { createdAt: -1 }
                    },
                    populate: {
                        path: TwittCommentedPath,
                        populate: {
                            path: UserPath,
                            select: 'username'
                        }
                    }
                })
                .select('-password')
            if (!userToFind) {
                res.status(404).json({ msg: 'El usuario no fue encontrado' })
            }
            let userFound = userToFind;
            res.status(200).json(userFound)
        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se buscaba el usuario especificado: ${error}` })
        }

    },
    getCommentsByUser: async (req: Request, res: Response): Promise<void> => {
        const userId: string = req.params.userId;
        const page: string = String(req.query.p);
        const pageNumber: number = Number(page);
        const commentsByPage: number = 5;
        if (isNaN(pageNumber) || pageNumber < 1) {
            res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
        }
        const userToFind = await User
            .findById(userId)
            .populate({
                path: CommentPath,
                options: {
                    skip: (pageNumber - 1) * commentsByPage,
                    limit: commentsByPage,
                    sort: { createdAt: -1 }
                },
                populate: {
                    path: TwittCommentedPath,
                    populate: {
                        path: UserPath,
                        select: 'username'
                    }
                }
            });
        if (!userToFind) {
            res.status(404).json({ msg: 'El usuario no fue encontrado' })
        }
        const user = userToFind;
        res.status(200).json(user);
    },
    getTwittsByUser: async (req: Request, res: Response): Promise<void> => {
        const userId: string = req.params.userId;
        const page: string = String(req.query.p);
        const pageNumber: number = Number(page);
        const commentsByPage: number = 5;
        if (isNaN(pageNumber) || pageNumber < 1) {
            res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
        };
        const userToFind = await User
            .findById(userId)
            .populate({
                path: TwittPath,
                options: {
                    skip: (pageNumber - 1) * commentsByPage,
                    limit: commentsByPage,
                    sort: { createdAt: -1 }
                }
            });
        if (!userToFind) {
            res.status(404).json({ msg: 'El usuario no fue encontrado' })
        }
        res.status(200).json(userToFind);
    },
    getFavouritesByUser: async (req: Request, res: Response): Promise<void> => {
        const userId: string = req.params.userId;
        const page: string = String(req.query.p);
        const pageNumber: number = Number(page);
        const commentsByPage: number = 5;
        if (isNaN(pageNumber) || pageNumber < 1) {
            res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
        };
        const userToFind = await User
            .findById(userId)
            .populate({
                path: FavouritePath,
                options: {
                    skip: (pageNumber - 1) * commentsByPage,
                    limit: commentsByPage,
                    sort: { createdAt: -1 }
                },
                populate: {
                    path: UserPath
                }
            });
        if (!userToFind) {
            res.status(404).json({ msg: 'El usuario no fue encontrado' })
        }
        const userFound = userToFind;
        res.status(200).json(userFound);
    },
    follow: async (req: Request, res: Response): Promise<void> => {
        try {
            const userBeingFollowedId: string = req.params.userBFId;
            const userWantingToFollowId: string = req.params.userWFId;

            if (!isValidObjectId(userBeingFollowedId) || !isValidObjectId(userWantingToFollowId)) {
                res.status(400).json({ msg: 'Id de usuarios invalidos' })
            }

            const getUserBeingFollowed = await User.findById(userBeingFollowedId);
            const getUserWantingToFollow = await User.findById(userWantingToFollowId);

            if (!getUserBeingFollowed || !getUserWantingToFollow) {
                res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' })
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
            res.status(201).json({ userFollowed: UserBeingFollowedUpdated, userFollowing: userFollowingUpdated })
        } catch (error) {
            res.status(500).json({ msg: 'Error mientras se seguía al usuario' })
        }
    },
    processLogin: (async (req: Request, res: Response): Promise<void> => {
        try {
            const { password, email }: ILoginUser = req.body
            const secretKey = process.env.JWT_KEY!

            if (!password || !email) {
                res.status(400).json({ msg: 'Por favor completar los campos solicitados' })
            }

            const verifyEmail = await User.findOne({ email })
            if (!verifyEmail) {
                res.status(404).json({ msg: 'Credenciales invalidas' })
            } // user could be null
            const userToVerify = verifyEmail
            const verifyPassword = await bcrypt.compare(password, userToVerify?.password)
            if (!verifyPassword) {
                res.status(404).json({ msg: 'Credenciales invalidas' })
            }
            const userVerified = userToVerify;
            const token = jwt.sign({ ...userVerified }, secretKey);
            res.cookie('user_access_token', token, { httpOnly: true, secure: false });
            req.session.userLogged = userVerified;
            res.status(200).json({ userVerified, token })
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se logueaba al usuario: ${error}` })
        }

    }),
    register: (async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, username, password }: IRegisterUser = req.body
            const avatar = req.file as Express.Multer.File

            if (!email || !username || !password) {
                res.status(400).json({ msg: 'Es necesario completar los campos solicitados' })
            }

            const emailAlreadyInDb = await User.find({ email })

            if (emailAlreadyInDb.length > 0) {
                res.status(409).json({ msg: 'Email ya en uso' })
            }

            const usernameAlreadyInDb = await User.find({ username })

            if (usernameAlreadyInDb.length > 0) {
                res.status(409).json({ msg: 'Nombre de usuario ya en uso' })
            }

            const hashPassword = await bcrypt.hash(password, 10)

            let result: IImage;
            if (avatar) {
                result = await handleUploadImage(avatar.path, avatarsFolder);
            } else {
                result = {
                    secure_url: default_secure_url,
                    public_id: default_public_id
                }
            }

            let newUserData: IUser = {
                email,
                username,
                password: hashPassword,
                isAdmin: 0,
                image: result
            }

            let newUser = await User.create(newUserData)
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` })
        }

    }),
    checkSession: async (req: Request, res: Response): Promise<void> => {
        const user = req.session.userLogged
        if (user) {
            res.status(200).json({ loggedIn: true, user })
        } else {
            res.status(200).json({ loggedIn: false })
        }

    },
    checkCookie: async (req: Request, res: Response): Promise<void> => {
        const userAccessToken = req.cookies.user_access_token;
        if (userAccessToken) {
            const userToFind = await User
                .findById(req.user._id)
                .populate('twitts')
            if (!userToFind) {
                res.status(404).json({ msg: "Usuario no encontrado" })
            }
            const userFound = userToFind
            res.status(200).json({ loggedIn: true, user: userFound })
        }
        else {
            res.status(200).json({ loggedIn: false })
        }
    },
    updateUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId: string = req.params.userId;
            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' })
            }
            const userToFind = await User.findById(userId)
            if (!userToFind) {
                res.status(404).json({ msg: 'Usuario no encontrado' })
            } else { // i had to do this because userToFind is possibly null
                const user = userToFind;
                const bodyAvatar = req.file;
                let result: IImage;
                await handleDeleteImage(user.avatar);
                if (bodyAvatar) {
                    result = await handleUploadImage(bodyAvatar.path, avatarsFolder);
                } else {
                    result = {
                        secure_url: default_secure_url,
                        public_id: default_public_id
                    }
                }
                const dataToUpdate: IUser = {
                    username: req.body.username ? req.body.username : user.username,
                    email: req.body.email ? req.body.email : user.email,
                    password: req.body.password ? req.body.password : user.password,
                    isAdmin: 0,
                    image: result
                }

                const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true })

                res.status(200).json(updatedUser)
            }


        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se hacía una actualización del usuario: ${error}` })
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
            await handleDeleteImage(userToDelete.image.public_id);
            return res.status(200).json(userId)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se eliminaba el usuario: ${error}` })
        }

    },
    logout: (_req: Request, res: Response) => {
        try {
            res.cookie('user_access_token', '', { maxAge: 1, httpOnly: true, secure: false })
            return res.status(200).json({ msg: "Fuiste deslogueado" })
        } catch (error) {
            return res.status(400).json({ msg: error })
        }

    }
}

export default controller