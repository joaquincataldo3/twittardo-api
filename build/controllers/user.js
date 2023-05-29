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
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const controller = {
    allUsers: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield user_1.default.find();
            res.status(200).json(users);
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: `Problema mientras se buscaban los usuarios: ${error}` });
        }
    }),
    oneUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            const userToFind = yield user_1.default.findById(id);
            if (!userToFind) {
                res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            const user = userToFind;
            res.status(200).json(user);
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: `Problema mientras se buscaba el usuario especificado: ${error}` });
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
    login: ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { password, email } = req.body;
            const secretKey = process.env.JWT_KEY;
            if (!password || !email) {
                return res.status(400).json({ msg: 'Por favor completar los campos solicitados' });
            }
            const verifyEmail = yield user_1.default.findOne({ email });
            if (!verifyEmail) {
                return res.status(404).json({ msg: 'Credenciales invalidas' });
            }
            else { // user could be null
                const user = verifyEmail;
                const verifyPassword = bcryptjs_1.default.compare(password, user.password);
                if (!verifyPassword) {
                    return res.status(404).json({ msg: 'Credenciales invalidas' });
                }
                const token = jsonwebtoken_1.default.sign(Object.assign({}, user), secretKey);
                res.cookie('user_access_token', token, {
                    httpOnly: true, maxAge: 2 * 60 * 60 * 1000 // 2 hours
                });
                return res.status(200).json({ user, token });
            }
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se logueaba al usuario: ${error}` });
        }
    })),
    register: ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const password = req.body.password;
            const username = req.body.username;
            const email = req.body.email;
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
            const hashPassword = bcryptjs_1.default.hashSync(password, 10);
            const newUserData = {
                email,
                username,
                password: hashPassword,
                isAdmin: false
            };
            if (avatar) {
                newUserData.avatar = avatar.path;
            }
            const newUser = yield user_1.default.create(newUserData);
            return res.status(201).json(newUser);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se registraba el usuario: ${error}` });
        }
    })),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            const userToFind = yield user_1.default.findById(userId);
            if (!userToFind) {
                res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            else { // i had to do this because userToFind is possibly null
                const user = userToFind;
                const dataToUpdate = {
                    username: req.body.username ? req.body.username : user.username,
                    email: req.body.email ? req.body.email : user.email,
                    password: req.body.password ? req.body.password : user.password,
                    isAdmin: false
                };
                if (req.file) {
                    dataToUpdate.avatar = req.file.filename;
                }
                const updatedUser = yield user_1.default.findByIdAndUpdate(userId, dataToUpdate, { new: true });
                res.status(200).json(updatedUser);
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: `Problema mientras se hacía una actualización del usuario: ${error}` });
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
                const userToFind = yield user_1.default.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });
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
                res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            yield user_1.default.findByIdAndRemove(userId);
            res.status(200).json(userId);
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: `Problema mientras se eliminaba el usuario: ${error}` });
        }
    }),
    logout: (_req, res) => {
        res.cookie('user_access_token', '', { maxAge: 1 });
        res.status(200).json({ msg: "Fuiste deslogueado" });
    }
};
exports.default = controller;
