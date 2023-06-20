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
const twitt_1 = __importDefault(require("../database/models/twitt"));
const mongoose_1 = require("mongoose");
const controller = {
    allTwitts: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twitts = yield twitt_1.default
                .find()
                .populate('user');
            return res.status(200).json(twitts);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se buscaban los twitts: ${error}` });
        }
    }),
    oneTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            const twitt = yield twitt_1.default.findById(twittId);
            return res.status(200).json(twitt);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se buscaba un twitt en particular: ${error}` });
        }
    }),
    createTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const twittData = {
                twitt: req.body.twitt,
                user: userId
            };
            if (req.file) {
                twittData.image = req.file.path;
            }
            const newTwitt = yield twitt_1.default.create(twittData);
            return res.status(200).json(newTwitt);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se creaba un twitt: ${error}` });
        }
    }),
    deleteTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittIdToDelete = req.params.twittIdToDelete;
            if (!(0, mongoose_1.isValidObjectId)(twittIdToDelete)) {
                return res.status(400).json({ msg: 'Twitt id invalido' });
            }
            yield twitt_1.default.findByIdAndRemove(twittIdToDelete);
            return res.status(200).json(twittIdToDelete);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se borraba un twitt: ${error}` });
        }
    })
};
exports.default = controller;
