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
exports.verifyAdmin = exports.verifyUserOrAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../database/models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyToken = (req, res, next) => {
    const jwtKey = process.env.JWT_KEY;
    const token = req.cookies.user_access_token;
    if (!token) {
        return res.status(401).json({ msg: 'No estás autenticado' });
    }
    if (jwtKey) {
        jsonwebtoken_1.default.verify(token, jwtKey, (err, user) => {
            if (err) {
                return res.status(403).json({ msg: 'Token invalido' });
            }
            req.user = user;
            next();
            return;
        });
    }
    return res.status(500).json({ msg: 'Error interno del servidor' });
};
exports.verifyToken = verifyToken;
const verifyUserOrAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.isAdmin == 1) {
            return next();
        }
        const compareUser = yield user_1.default.findById(req.user._id);
        if (!compareUser) {
            return res.status(403).json({ msg: 'No estás autorizado a performar esta acción' });
        }
        next();
        return;
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ msg: `Problema mientras se verificaba usuario o admin: ${error}` });
    }
});
exports.verifyUserOrAdmin = verifyUserOrAdmin;
const verifyAdmin = (req, res, next) => {
    const user = req.user._doc;
    if (user.isAdmin) {
        next();
        return;
    }
    else {
        return res.status(403).json({ msg: 'No estás autorizado a performar esta acción' });
    }
};
exports.verifyAdmin = verifyAdmin;
