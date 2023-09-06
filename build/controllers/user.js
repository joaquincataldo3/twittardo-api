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
const s3ConfigCommands_1 = require("../utils/s3ConfigCommands");
dotenv_1.default.config();
const controller = {
    allUsers: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const usersResponse = yield user_1.default
                .find()
                .select('-_id -password -email');
            const users = usersResponse.map((user) => ({
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
                let url = yield (0, s3ConfigCommands_1.handleGetCommand)(user.avatar, folder);
                user.image_url = url;
            }
            ;
            return res.status(200).json(users);
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se buscaban los usuarios: ${error}` });
        }
    }),
    oneUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            const userToFind = yield user_1.default
                .findById(id)
                .populate('twitts');
            if (userToFind === null) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            const userFound = userToFind;
            let oneUser = {
                _id: userFound._id,
                username: userFound.username,
                email: userFound.email,
                avatar: userFound.avatar,
                isAdmin: userFound.isAdmin,
                favourites: userFound.favourites,
                twitts: userFound.twitts,
                followers: userFound.followers,
                following: userFound.following,
                image_url: '',
            };
            const folder = 'avatars';
            let url = yield (0, s3ConfigCommands_1.handleGetCommand)(oneUser.avatar, folder);
            oneUser.image_url = url;
            return res.status(200).json(oneUser);
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se buscaba el usuario especificado: ${error}` });
        }
    }),
    follow: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userBeingFollowedId = req.params.userBFId;
            const userWantingToFollowId = req.params.userWFId;
            if (!(0, mongoose_1.isValidObjectId)(userBeingFollowedId) || !(0, mongoose_1.isValidObjectId)(userWantingToFollowId)) {
                return res.status(400).json({ msg: 'Id de usuarios invalidos' });
            }
            const getUserBeingFollowed = yield user_1.default.findById(userBeingFollowedId);
            const getUserWantingToFollow = yield user_1.default.findById(userWantingToFollowId);
            if (!getUserBeingFollowed || !getUserWantingToFollow) {
                return res.status(404).json({ msg: 'Uno de los dos usuarios no fue encontrado' });
            }
            const UserBeingFollowedUpdated = yield user_1.default.findByIdAndUpdate(userBeingFollowedId, { $addToSet: { followers: userWantingToFollowId } }, { new: true });
            const userFollowingUpdated = yield user_1.default.findByIdAndUpdate(userWantingToFollowId, { $addToSet: { following: userBeingFollowedId } }, { new: true });
            return res.status(201).json({ userFollowed: UserBeingFollowedUpdated, userFollowing: userFollowingUpdated });
        }
        catch (error) {
            return res.status(400).json({ msg: 'Error mientras se seguía al usuario' });
        }
    }),
    processLogin: ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { password, email } = req.body;
            const secretKey = process.env.JWT_KEY;
            if (!password || !email) {
                return res.status(400).json({ msg: 'Por favor completar los campos solicitados' });
            }
            const verifyEmail = yield user_1.default.findOne({ email });
            if (!verifyEmail) {
                return res.status(404).json({ msg: 'Credenciales invalidas' });
            } // user could be null
            const userToVerify = verifyEmail;
            const verifyPassword = yield bcryptjs_1.default.compare(password, userToVerify.password);
            if (!verifyPassword) {
                return res.status(404).json({ msg: 'Credenciales invalidas' });
            }
            let userVerified = {
                _id: verifyEmail._id,
                username: verifyEmail.username,
                email: verifyEmail.email,
                avatar: verifyEmail.avatar,
                isAdmin: verifyEmail.isAdmin,
                favourites: verifyEmail.favourites,
                twitts: verifyEmail.twitts,
                followers: verifyEmail.followers,
                following: verifyEmail.following,
                image_url: ''
            };
            const folder = "users";
            let imageUrl = yield (0, s3ConfigCommands_1.handleGetCommand)(userToVerify.avatar, folder);
            userVerified.image_url = imageUrl;
            const token = jsonwebtoken_1.default.sign(Object.assign({}, userVerified), secretKey);
            res.cookie('user_access_token', token, {
                httpOnly: true, maxAge: 2 * 60 * 60 * 1000 // 2 hours
            });
            req.session.userLogged = userVerified;
            return res.status(200).json({ userVerified, token });
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se logueaba al usuario: ${error}` });
        }
    })),
    register: ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, username, password } = req.body;
            const avatar = req.file;
            if (!email || !username || !password) {
                return res.status(400).json({ msg: 'Es necesario completar los campos solicitados' });
            }
            const emailAlreadyInDb = yield user_1.default.find({ email });
            if (emailAlreadyInDb.length > 0) {
                return res.status(409).json({ msg: 'Email ya en uso' });
            }
            const usernameAlreadyInDb = yield user_1.default.find({ username });
            if (usernameAlreadyInDb.length > 0) {
                return res.status(409).json({ msg: 'Nombre de usuario ya en uso' });
            }
            const hashPassword = yield bcryptjs_1.default.hash(password, 10);
            let randomName = null;
            const folder = 'avatars';
            if (avatar) {
                randomName = yield (0, s3ConfigCommands_1.handlePutCommand)(avatar, folder);
            }
            else {
                randomName = 'default_avatar.jpg';
            }
            let newUserData = {
                email,
                username,
                password: hashPassword,
                isAdmin: 0,
                avatar: randomName,
                image_url: ''
            };
            let newUser = yield user_1.default.create(newUserData);
            return res.status(201).json(newUser);
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` });
        }
    })),
    checkLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.session.userLogged;
        if (user) {
            return res.status(200).json({ loggedIn: true, user });
        }
        else {
            return res.status(200).json({ loggedIn: false });
        }
    }),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            const userToFind = yield user_1.default.findById(userId);
            if (!userToFind) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            else { // i had to do this because userToFind is possibly null
                const user = userToFind;
                const bodyAvatar = req.file;
                let randomName;
                let folder = 'avatars';
                if (user.avatar && bodyAvatar) {
                    yield (0, s3ConfigCommands_1.handleDeleteCommand)(user.avatar, folder);
                    randomName = yield (0, s3ConfigCommands_1.handlePutCommand)(bodyAvatar, folder);
                }
                else if (!user.avatar && bodyAvatar) {
                    randomName = yield (0, s3ConfigCommands_1.handlePutCommand)(bodyAvatar, folder);
                }
                else {
                    const defAvatar = 'default_avatar.jpg';
                    yield (0, s3ConfigCommands_1.handleDeleteCommand)(user.avatar, folder);
                    randomName = yield (0, s3ConfigCommands_1.handlePutCommand)(defAvatar, folder);
                }
                const dataToUpdate = {
                    username: req.body.username ? req.body.username : user.username,
                    email: req.body.email ? req.body.email : user.email,
                    password: req.body.password ? req.body.password : user.password,
                    isAdmin: 0,
                    avatar: randomName,
                    image_url: ''
                };
                const updatedUser = yield user_1.default.findByIdAndUpdate(userId, dataToUpdate, { new: true });
                return res.status(200).json(updatedUser);
            }
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se hacía una actualización del usuario: ${error}` });
        }
    }),
    convertUserToAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const key = req.body.key;
            const adminKey = process.env.ADMIN_KEY;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            if (key === adminKey) {
                const userToFind = yield user_1.default.findByIdAndUpdate(userId, { isAdmin: 1 }, { new: true });
                if (!userToFind) {
                    res.status(404).json({ msg: 'Usuario no encontrado' });
                }
                else {
                    const admin = userToFind;
                    res.status(200).json(admin);
                }
            }
            else {
                res.status(400).json({ msg: 'Key de admin incorrecta' });
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: `Problema mientras se convertia al usuario en admin: ${error}` });
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            const userToDelete = yield user_1.default.findByIdAndRemove(userId);
            if (userToDelete == null) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            if (userToDelete.avatar) {
                const folder = 'avatars';
                yield (0, s3ConfigCommands_1.handleDeleteCommand)(userToDelete.avatar, folder);
            }
            return res.status(200).json(userId);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se eliminaba el usuario: ${error}` });
        }
    }),
    logout: (_req, res) => {
        res.cookie('user_access_token', '', { maxAge: 1 });
        return res.status(200).json({ msg: "Fuiste deslogueado" });
    }
};
exports.default = controller;
