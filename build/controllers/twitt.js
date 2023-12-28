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
const comment_1 = __importDefault(require("../database/models/comment"));
const user_1 = __importDefault(require("../database/models/user"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("mongoose");
const s3ConfigCommands_1 = require("../utils/s3ConfigCommands");
dotenv_1.default.config();
const controller = {
    allTwitts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = String(req.query.p);
            const pageNumber = Number(page);
            const twittPerPage = 5;
            const twittsResponse = yield twitt_1.default
                .find()
                .sort({ createdAt: -1 })
                .skip(twittPerPage * (pageNumber - 1))
                .limit(twittPerPage)
                .select('-password -email')
                .populate('user', '-password -email')
                .populate('comments');
            // two awaits bc we are populating comments and then user inside comments
            if (twittsResponse) {
                for (let twitt of twittsResponse) {
                    if (twitt.comments.length > 0) {
                        yield twitt.populate('comments.user');
                    }
                }
            }
            // aca voy por cada imagen y hago un getobjectcommand para obtener el url
            let folder = 'twitts';
            for (let i = 0; i < twittsResponse.length; i++) {
                let twitt = twittsResponse[i];
                if (twitt.image) {
                    let url = yield (0, s3ConfigCommands_1.handleGetCommand)(twitt.image, folder);
                    twitt.image_url = url;
                }
            }
            ;
            // voy por cada imagen del usuario
            folder = 'avatars';
            for (let i = 0; i < twittsResponse.length; i++) {
                let twitt = twittsResponse[i];
                let url = yield (0, s3ConfigCommands_1.handleGetCommand)(twitt.user.avatar, folder);
                twitt.user.image_url = url;
            }
            ;
            return res.status(200).json(twittsResponse);
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se buscaban los twitts: ${error}` });
        }
    }),
    oneTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            if (!(0, mongoose_1.isValidObjectId)(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' });
            }
            const twittResponse = yield twitt_1.default
                .findById(twittId)
                .select('-password -email')
                .populate({ path: 'user', select: '-password -email' })
                .populate({ path: 'comments', model: 'Comment' });
            if (!twittResponse) {
                return res.status(404).json({ msg: "Twitt no encontrado" });
            }
            else {
                if (twittResponse.comments.length > 0) {
                    yield twittResponse.populate('comments.user');
                }
                let folder;
                if (twittResponse.image) {
                    folder = 'twitts';
                    let url = yield (0, s3ConfigCommands_1.handleGetCommand)(twittResponse.image, folder);
                    twittResponse.image_url = url;
                }
                // voy por cada imagen del usuario
                folder = 'avatars';
                let url = yield (0, s3ConfigCommands_1.handleGetCommand)(twittResponse.user.avatar, folder);
                twittResponse.user.image_url = url;
                return res.status(200).json(twittResponse);
            }
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se buscaba un twitt en particular: ${error}` });
        }
    }),
    favOneTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' });
            }
            yield twitt_1.default.findByIdAndUpdate(twittId, { $inc: { favourites: 1 } }, { new: true });
            yield user_1.default.findByIdAndUpdate(userId, {
                $addToSet: {
                    favourites: twittId
                },
            }, {
                new: true
            });
            return res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' });
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
        }
    }),
    unfavOneTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' });
            }
            yield twitt_1.default.findByIdAndUpdate(twittId, { $inc: { favourites: -1 } }, { new: true });
            yield user_1.default.findByIdAndUpdate(userId, {
                $pull: {
                    favourites: twittId,
                },
            }, { new: true });
            return res.status(200).json({ msg: 'Desfavorecido satisfactoriamente' });
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se desfavorecía un twitt: ${error}` });
        }
    }),
    createTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const twittImage = req.file;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' });
            }
            let randomName = null;
            const folder = 'twitts';
            if (twittImage) {
                randomName = yield (0, s3ConfigCommands_1.handlePutCommand)(twittImage, folder);
            }
            const twittData = {
                twitt: req.body.twitt,
                favourites: 0,
                commentsNumber: 0,
                user: userId,
                image: randomName != null ? randomName : null,
                image_url: null
            };
            const newTwitt = yield twitt_1.default.create(twittData);
            yield user_1.default.findByIdAndUpdate(userId, {
                $addToSet: {
                    twitts: newTwitt._id
                },
            }, {
                new: true
            });
            return res.status(200).json(newTwitt);
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se creaba un twitt: ${error}` });
        }
    }),
    deleteTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittIdToDelete = req.params.twittIdToDelete;
            if (!(0, mongoose_1.isValidObjectId)(twittIdToDelete)) {
                return res.status(400).json({ msg: 'Twitt id invalido' });
            }
            const deletedDocument = yield twitt_1.default.findByIdAndRemove(twittIdToDelete);
            if (deletedDocument) {
                const folder = 'twitts';
                yield (0, s3ConfigCommands_1.handleDeleteCommand)(deletedDocument.image, folder);
            }
            yield comment_1.default.deleteMany({ twittCommented: twittIdToDelete });
            return res.status(200).json(twittIdToDelete);
        }
        catch (error) {
            return res.status(400).json({ msg: `Problema mientras se borraba un twitt: ${error}` });
        }
    })
};
exports.default = controller;
