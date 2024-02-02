"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../database/models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("mongoose");
const modelsPath_1 = require("../utils/constants/modelsPath");
const cloudinaryConfig_1 = require("../cloudinary/cloudinaryConfig");
const defaultAvatar_1 = require("../utils/constants/defaultAvatar");
const userUtils_1 = require("../utils/constants/userUtils");
dotenv_1.default.config();
const { userPath, favouritePath, twittPath } = modelsPath_1.modelPaths;
const { default_secure_url, default_public_id } = defaultAvatar_1.defaultAvatarPaths;
const { avatarsFolder } = cloudinaryConfig_1.folderNames;
const controller = {
    oneUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(500).json({ msg: 'Id de usuario invalido' });
                return;
            }
            // busco el usuario y traigo los 5 primeros resultados de cada campo
            const userToFind = yield user_1.default
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
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaba el usuario especificado` });
            return;
        }
    }),
    getFavouritesByUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const page = String(req.query.p);
            const pageNumber = Number(page);
            const favouritesPerPage = 5;
            if (isNaN(pageNumber) || pageNumber < 1) {
                res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
                return;
            }
            ;
            const userToFind = yield user_1.default
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
                .select(userUtils_1.userExcludedFields);
            if (!userToFind) {
                res.status(404).json({ msg: 'El usuario no fue encontrado' });
                return;
            }
            const userFound = userToFind;
            res.status(200).json(userFound);
            return;
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaba los favoritos por usuario` });
            return;
        }
    }),
    follow: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userToFollowId = req.params.userId;
            const userWantingToFollowId = req.user._id;
            if (!(0, mongoose_1.isValidObjectId)(userToFollowId) || !(0, mongoose_1.isValidObjectId)(userWantingToFollowId)) {
                res.status(400).json({ msg: 'Id de usuarios invalidos' });
                return;
            }
            const getUserBeingFollowed = yield user_1.default.findById(userToFollowId);
            const getUserWantingToFollow = yield user_1.default.findById(userWantingToFollowId);
            if (!getUserBeingFollowed || !getUserWantingToFollow) {
                res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' });
                return;
            }
            yield user_1.default.findByIdAndUpdate(userToFollowId, { $addToSet: { followers: userWantingToFollowId } }, { new: true });
            yield user_1.default.findByIdAndUpdate(userWantingToFollowId, { $addToSet: { following: userToFollowId } }, { new: true });
            res.status(201).json({ msg: 'Usuario seguido satisfactoriamente' });
            return;
        }
        catch (error) {
            res.status(500).json({ msg: 'Error mientras se seguía al usuario' });
            return;
        }
    }),
    unfollow: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userToFollowId = req.params.userId;
            const userWantingToFollowId = req.user._id;
            if (!(0, mongoose_1.isValidObjectId)(userToFollowId) || !(0, mongoose_1.isValidObjectId)(userWantingToFollowId)) {
                res.status(400).json({ msg: 'Id de usuarios invalidos' });
            }
            const getUserToFollowId = yield user_1.default.findById(userToFollowId);
            const getUserWantingToFollow = yield user_1.default.findById(userWantingToFollowId);
            if (!getUserToFollowId || !getUserWantingToFollow) {
                res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' });
            }
            const UserBeingFollowedUpdated = yield user_1.default.findByIdAndUpdate(userToFollowId, { $pull: { followers: userWantingToFollowId } }, { new: true });
            const userFollowingUpdated = yield user_1.default.findByIdAndUpdate(userWantingToFollowId, { $pull: { following: userToFollowId } }, { new: true });
            res.status(201).json({ userFollowed: UserBeingFollowedUpdated, userFollowing: userFollowingUpdated });
        }
        catch (error) {
            res.status(500).json({ msg: 'Error mientras se seguía al usuario' });
        }
    }),
    processLogin: ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { password, email } = req.body;
            const secretKey = process.env.JWT_KEY;
            if (!password || !email) {
                res.status(400).json({ msg: 'Por favor completar los campos solicitados' });
                return;
            }
            const verifyEmail = yield user_1.default.findOne({ email });
            if (!verifyEmail) {
                res.status(404).json({ msg: 'Credenciales invalidas' });
                return;
            } // user could be null
            const userToVerify = verifyEmail;
            const verifyPassword = yield bcryptjs_1.default.compare(password, userToVerify === null || userToVerify === void 0 ? void 0 : userToVerify.password);
            if (!verifyPassword) {
                res.status(404).json({ msg: 'Credenciales invalidas' });
                return;
            }
            const userVerified = userToVerify === null || userToVerify === void 0 ? void 0 : userToVerify.toObject();
            delete userVerified.password;
            const token = jsonwebtoken_1.default.sign(Object.assign({}, userVerified), secretKey);
            res.cookie('user_access_token', token, { httpOnly: true, secure: false });
            console.log({ cookies: req.cookies });
            req.session.userLogged = userVerified;
            res.status(200).json({ userVerified, token });
            return;
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se logueaba al usuario` });
            return;
        }
    })),
    register: ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, username, password } = req.body;
            const avatar = req.file;
            if (!email || !username || !password) {
                res.status(400).json({ msg: 'Es necesario completar los campos solicitados' });
                return;
            }
            const emailAlreadyInDb = yield user_1.default.find({ email });
            if (emailAlreadyInDb.length > 0) {
                res.status(409).json({ msg: 'Email ya en uso' });
                return;
            }
            const usernameAlreadyInDb = yield user_1.default.find({ username });
            if (usernameAlreadyInDb.length > 0) {
                res.status(409).json({ msg: 'Nombre de usuario ya en uso' });
                return;
            }
            const hashPassword = yield bcryptjs_1.default.hash(password, 10);
            let result;
            if (avatar) {
                result = yield (0, cloudinaryConfig_1.handleUploadImage)(avatar.path, avatarsFolder);
            }
            else {
                result = {
                    secure_url: default_secure_url,
                    public_id: default_public_id
                };
            }
            let newUserData = {
                email,
                username,
                password: hashPassword,
                isAdmin: 0,
                image: result
            };
            let newUser = yield user_1.default.create(newUserData);
            let newUserObject = newUser.toObject();
            delete newUserObject.password;
            res.status(201).json(newUserObject);
            return;
        }
        catch (error) {
            res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` });
            return;
        }
    })),
    checkSession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.session.userLogged;
        if (user) {
            res.status(200).json({ loggedIn: true, user });
            return;
        }
        else {
            res.status(200).json({ loggedIn: false });
            return;
        }
    }),
    checkCookie: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userAccessToken = req.cookies.user_access_token;
            const userInRequest = req.user;
            if (userAccessToken) {
                const userToFind = yield user_1.default
                    .findById(userInRequest._id)
                    .populate(twittPath)
                    .populate(favouritePath)
                    .populate('following')
                    .populate('followers');
                if (!userToFind) {
                    res.status(404).json({ msg: "Usuario no encontrado" });
                    return;
                }
                const userFound = userToFind;
                res.status(200).json({ loggedIn: true, user: userFound });
                return;
            }
            else {
                res.status(200).json({ loggedIn: false });
                return;
            }
        }
        catch (error) {
            res.status(500).json({ msg: 'Probleam mientras se chequeaba la cookie de usuario' });
            return;
        }
    }),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
                return;
            }
            const userToFind = yield user_1.default.findById(userId);
            if (!userToFind) {
                res.status(404).json({ msg: 'Usuario no encontrado' });
                return;
            }
            else { // i had to do this because userToFind is possibly null
                const user = userToFind;
                const bodyAvatar = req.file;
                let result;
                yield (0, cloudinaryConfig_1.handleDeleteImage)(user.avatar);
                if (bodyAvatar) {
                    result = yield (0, cloudinaryConfig_1.handleUploadImage)(bodyAvatar.path, avatarsFolder);
                }
                else {
                    result = {
                        secure_url: default_secure_url,
                        public_id: default_public_id
                    };
                }
                const dataToUpdate = {
                    username: req.body.username ? req.body.username : user.username,
                    email: req.body.email ? req.body.email : user.email,
                    password: req.body.password ? req.body.password : user.password,
                    isAdmin: 0,
                    image: result
                };
                const updatedUser = yield user_1.default.findByIdAndUpdate(userId, dataToUpdate, { new: true });
                res.status(200).json(updatedUser);
                return;
            }
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se hacía una actualización del usuario: ${error}` });
            return;
        }
    }),
    convertUserToAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const key = req.body.key;
            const adminKey = process.env.ADMIN_KEY;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
                return;
            }
            if (key === adminKey) {
                const userToFind = yield user_1.default.findByIdAndUpdate(userId, { isAdmin: 1 }, { new: true });
                if (!userToFind) {
                    res.status(404).json({ msg: 'Usuario no encontrado' });
                    return;
                }
                else {
                    const admin = userToFind;
                    res.status(200).json(admin);
                    return;
                }
            }
            else {
                res.status(400).json({ msg: 'Key de admin incorrecta' });
                return;
            }
        }
        catch (error) {
            res.status(400).json({ msg: `Problema mientras se convertia al usuario en admin: ${error}` });
            return;
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
                return;
            }
            const userToDelete = yield user_1.default.findByIdAndRemove(userId);
            if (!userToDelete) {
                res.status(404).json({ msg: 'Usuario no encontrado' });
                return;
            }
            else {
                const userAvatarPublicId = userToDelete.image.public_id;
                const defaultAvatarPublicId = defaultAvatar_1.defaultAvatarPaths.default_public_id;
                if (!(userAvatarPublicId === defaultAvatarPublicId)) {
                    yield (0, cloudinaryConfig_1.handleDeleteImage)(userAvatarPublicId);
                }
                res.status(200).json({ msg: 'User successfully deleted' });
                return;
            }
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se eliminaba el usuario` });
            return;
        }
    }),
    logout: (_req, res) => {
        try {
            res.cookie('user_access_token', '', { maxAge: 1, httpOnly: true, secure: false });
            res.status(200).json({ msg: "Fuiste deslogueado" });
            return;
        }
        catch (error) {
            res.status(500).json({ msg: error });
            return;
        }
    }
};
exports.default = controller;
