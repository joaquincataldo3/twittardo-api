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
const controller = {
    allUsers: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const admins = yield user_1.default.find();
            res.status(200).json(admins);
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: 'Problema mientras se buscaban los usuarios' });
        }
    }),
    oneAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.adminId;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(400).json({ msg: 'Id de admin invalido' });
            }
            const adminToFind = yield user_1.default.findById(id);
            if (!adminToFind) {
                res.status(404).json({ msg: 'Admin no encontrado' });
            }
            const admin = adminToFind;
            res.status(200).json(admin);
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: 'Problema mientras se buscaba el admin especificado' });
        }
    }),
    login: ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { password, email } = req.body;
        if (!password || !email) {
            res.status(400).json({ msg: 'Por favor completar los campos solicitados' });
        }
        const verifyEmail = yield user_1.default.findOne({ email });
        if (!verifyEmail) {
            res.status(404).json({ msg: 'Credenciales invalidas' });
        }
        else { // i had to do this else because user could be null
            const user = verifyEmail;
            const verifyPassword = bcryptjs_1.default.compare(password, user.password);
            if (!verifyPassword) {
                res.status(404).json({ msg: 'Credenciales invalidas' });
            }
            const secretKey = process.env.JWT;
            const token = jsonwebtoken_1.default.sign(Object.assign(Object.assign({}, user), { isAdmin: true }), secretKey);
            res.cookie('user_access_token', token, {
                httpOnly: true, maxAge: 2 * 60 * 60 * 1000 // 2 hours
            });
            res.status(200).json({ user, token });
        }
    })),
    logout: (_req, res) => {
        res.cookie('user_access_token', '', { maxAge: 1 });
        res.status(200).json({ msg: "Fuiste deslogueado" });
    }
};
exports.default = controller;
