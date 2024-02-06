
import User from '../database/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ILoginUser, IRegisterUser, IUser, IImage } from '../utils/interfaces/interfaces';
import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { modelPaths } from '../utils/constants/modelsPath';
import { folderNames, handleDeleteImage, handleUploadImage } from '../cloudinary/cloudinaryConfig';
import { defaultAvatarPaths } from '../utils/constants/defaultAvatar';
import { userExcludedFields } from '../utils/constants/userUtils';
import { deleteTempFiles } from '../utils/functions/deleteTempFiles';

dotenv.config();

const { userPath, favouritePath, twittPath } = modelPaths;
const { default_secure_url, default_public_id } = defaultAvatarPaths;
const { avatarsFolder } = folderNames;

const controller = {
    oneUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.userId;
            if (!isValidObjectId(id)) {
                res.status(500).json({ msg: 'Id de usuario invalido' });
                return;
            }
            // busco el usuario y traigo los 5 primeros resultados de cada campo
            const userToFind = await User
                .findById(id)
                .select('-password')
                .populate('following')
                .populate('followers');
            if (!userToFind) {
                res.status(404).json({ msg: 'El usuario no fue encontrado' });
                return;
            }
            let userFound = userToFind;
            res.status(200).json(userFound);
            return;
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaba el usuario especificado` })
            return;
        }

    },
    getFavouritesByUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId: string = req.params.userId;
            const page: string = String(req.query.p);
            const pageNumber: number = Number(page);
            const favouritesPerPage: number = 5;
            if (isNaN(pageNumber) || pageNumber < 1) {
                res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
                return;
            };
            const userToFind = await User
                .findById(userId)
                .populate({
                    path: favouritePath,
                    populate: {
                        path: userPath,
                        options: {
                            skip: (pageNumber - 1) * favouritesPerPage,
                            limit: favouritesPerPage
                        }
                    }
                })
                .populate(twittPath)
                .select(userExcludedFields)
            if (!userToFind) {
                res.status(404).json({ msg: 'El usuario no fue encontrado' });
                return;
            }
            const userFound = userToFind;
            res.status(200).json(userFound);
            return;
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaba los favoritos por usuario` });
            return;
        }

    },
    follow: async (req: Request, res: Response): Promise<void> => {
        try {
            const userToFollowId: string = req.params.userId;
            const userWantingToFollowId: string = req.user._id;

            if (!isValidObjectId(userToFollowId) || !isValidObjectId(userWantingToFollowId)) {
                res.status(400).json({ msg: 'Id de usuarios invalidos' });
                return;
            }

            const getUserBeingFollowed = await User.findById(userToFollowId);
            const getUserWantingToFollow = await User.findById(userWantingToFollowId);

            if (!getUserBeingFollowed || !getUserWantingToFollow) {
                res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' });
                return;
            }

            await User.findByIdAndUpdate(
                userToFollowId,
                { $addToSet: { followers: userWantingToFollowId } },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userWantingToFollowId,
                { $addToSet: { following: userToFollowId } },
                { new: true }
            );
            res.status(201).json({ msg: 'Usuario seguido satisfactoriamente' });
            return;
        } catch (error) {
            res.status(500).json({ msg: 'Error mientras se seguía al usuario' });
            return;
        }
    },
    unfollow: async (req: Request, res: Response): Promise<void> => {
        try {
            const userToFollowId: string = req.params.userId;
            const userWantingToFollowId: string = req.user._id;

            if (!isValidObjectId(userToFollowId) || !isValidObjectId(userWantingToFollowId)) {
                res.status(400).json({ msg: 'Id de usuarios invalidos' })
            }

            const getUserToFollowId = await User.findById(userToFollowId);
            const getUserWantingToFollow = await User.findById(userWantingToFollowId);

            if (!getUserToFollowId || !getUserWantingToFollow) {
                res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' })
            }

            const UserBeingFollowedUpdated = await User.findByIdAndUpdate(
                userToFollowId,
                { $pull: { followers: userWantingToFollowId } },
                { new: true }
            );

            const userFollowingUpdated = await User.findByIdAndUpdate(
                userWantingToFollowId,
                { $pull: { following: userToFollowId } },
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
                res.status(400).json({ msg: 'Por favor completar los campos solicitados' });
                return;
            }
            const verifyEmail = await User.findOne({ email });
            if (!verifyEmail) {
                res.status(404).json({ msg: 'Credenciales invalidas' });
                return;
            } // user could be null
            const userToVerify = verifyEmail
            const verifyPassword = await bcrypt.compare(password, userToVerify?.password!)
            if (!verifyPassword) {
                res.status(404).json({ msg: 'Credenciales invalidas' });
                return;
            }
            const userVerified: IUser = userToVerify?.toObject() as IUser;
            delete userVerified.password;
            const token = jwt.sign({ ...userVerified }, secretKey);
            res.cookie('user_access_token', token, { httpOnly: true, secure: false });
            req.session.userLogged = userVerified;
            res.status(200).json({ userVerified, token });
            return;
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se logueaba al usuario` });
            return;
        }

    }),
    register: (async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, username, password }: IRegisterUser = req.body

            if (!email || !username || !password) {
                res.status(400).json({ msg: 'Es necesario completar los campos solicitados' })
                return;
            }
            const emailAlreadyInDb = await User.find({ email })
            if (emailAlreadyInDb.length > 0) {
                res.status(409).json({ msg: 'Email ya en uso' });
                return;
            }
            const usernameAlreadyInDb = await User.find({ username })
            if (usernameAlreadyInDb.length > 0) {
                res.status(409).json({ msg: 'Nombre de usuario ya en uso' });
                return;
            }
            const hashPassword = await bcrypt.hash(password, 10)
            let result: IImage;
            if (req.files) {
                const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
                const file = files[0];
                result = await handleUploadImage(file.tempFilePath, avatarsFolder);
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
            let newUser = await User.create(newUserData);
            let newUserObject = newUser.toObject();
            delete newUserObject.password;
            res.status(201).json(newUserObject);
            deleteTempFiles();
            return;
        } catch (error) {
            res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` });
            return;
        }

    }),
    checkSession: async (req: Request, res: Response): Promise<void> => {
        const user = req.session.userLogged
        if (user) {
            res.status(200).json({ loggedIn: true, user });
            return;
        } else {
            res.status(200).json({ loggedIn: false });
            return;
        }

    },
    checkCookie: async (req: Request, res: Response): Promise<void> => {
        try {
            const userAccessToken = req.cookies.user_access_token;
            const userInRequest = req.user;
            if (userAccessToken) {
                const userToFind = await User
                    .findById(userInRequest._id)
                    .populate(twittPath)
                    .populate(favouritePath)
                    .populate('following')
                    .populate('followers');

                if (!userToFind) {
                    res.status(404).json({ msg: "Usuario no encontrado" });
                    return;
                }
                const userFound = userToFind
                res.status(200).json({ loggedIn: true, user: userFound });
                return;
            }
            else {
                res.status(200).json({ loggedIn: false });
                return;
            }
        } catch (error) {
            res.status(500).json({ msg: 'Probleam mientras se chequeaba la cookie de usuario' });
            return;
        }

    },
    updateUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId: string = req.params.userId;
            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' })
                return;
            }
            const userToFind = await User.findById(userId);
            if (!userToFind) {
                res.status(404).json({ msg: 'Usuario no encontrado' })
                return;
            } else { // i had to do this because userToFind is possibly null
                const user = userToFind;

                let result: IImage;
                await handleDeleteImage(user.image.public_id);
                if (req.files) {
                    const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
                    const file = files[0];
                    result = await handleUploadImage(file.tempFilePath, avatarsFolder);
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
                const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, { new: true });
                res.status(200).json(updatedUser);
                deleteTempFiles();
                return;
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({ msg: `Problema mientras se hacía una actualización del usuario: ${error}` })
            return;
        }
    },
    convertUserToAdmin: async (req: Request, res: Response) => {
        try {
            const userId: string = req.params.userId;
            const key: string = req.body.key
            const adminKey = process.env.ADMIN_KEY
            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
                return;
            }
            if (key === adminKey) {
                const userToFind = await User.findByIdAndUpdate(userId, { isAdmin: 1 }, { new: true })
                if (!userToFind) {
                    res.status(404).json({ msg: 'Usuario no encontrado' });
                    return;
                } else {
                    const admin = userToFind
                    res.status(200).json(admin);
                    return;
                }
            } else {
                res.status(400).json({ msg: 'Key de admin incorrecta' });
                return;
            }
        } catch (error) {
            res.status(400).json({ msg: `Problema mientras se convertia al usuario en admin: ${error}` });
            return;
        }
    },
    deleteUser: async (req: Request, res: Response): Promise<void> => {
        try {
            const userId: string = req.params.userId
            if (!isValidObjectId(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
                return;
            }
            const userToDelete = await User.findByIdAndRemove(userId);
            if (!userToDelete) {
                res.status(404).json({ msg: 'Usuario no encontrado' });
                return;
            } else {
                const userAvatarPublicId = userToDelete.image.public_id;
                const defaultAvatarPublicId = defaultAvatarPaths.default_public_id;
                if (!(userAvatarPublicId === defaultAvatarPublicId)) {
                    await handleDeleteImage(userAvatarPublicId);
                }
                res.status(200).json({ msg: 'User successfully deleted' });
                return;
            }
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se eliminaba el usuario` });
            return;
        }

    },
    logout: (_req: Request, res: Response): void => {
        try {
            res.cookie('user_access_token', '', { maxAge: 1, httpOnly: true, secure: false })
            res.status(200).json({ msg: "Fuiste deslogueado" });
            return;
        } catch (error) {
            res.status(500).json({ msg: error });
            return;
        }
    }
}

export default controller