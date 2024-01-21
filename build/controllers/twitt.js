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
const modelsPath_1 = require("../utils/constants/modelsPath");
const cloudinaryConfig_1 = require("../cloudinary/cloudinaryConfig");
const cloudinaryConfig_2 = require("../cloudinary/cloudinaryConfig");
dotenv_1.default.config();
const { commentPath, userPath } = modelsPath_1.modelPaths;
const { twittsFolder } = cloudinaryConfig_2.folderNames;
const userExcludedField = '-password -email';
const controller = {
    allTwitts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = String(req.query.p);
            const pageNumber = Number(page);
            if (isNaN(pageNumber) || pageNumber < 1) {
                res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
            }
            const twittPerPage = 5;
            const twitts = yield twitt_1.default
                .find()
                .sort({ createdAt: -1 })
                .skip(twittPerPage * (pageNumber - 1))
                .limit(twittPerPage)
                .populate(userPath, userExcludedField)
                .populate({
                path: commentPath,
                populate: {
                    path: userPath,
                    select: userExcludedField
                }
            });
            yield twitt_1.default.populate(twitts, { path: 'comments.user' });
            res.status(200).json(twitts);
            return;
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaban los twitts: ${error}` });
            return;
        }
    }),
    oneTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            if (!(0, mongoose_1.isValidObjectId)(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
                return;
            }
            const twittResponse = yield twitt_1.default
                .findById(twittId)
                .populate({ path: 'user', select: userExcludedField })
                .populate({
                path: commentPath,
                populate: {
                    path: userPath,
                    select: userExcludedField
                }
            });
            if (!twittResponse) {
                res.status(404).json({ msg: "Twitt no encontrado" });
                return;
            }
            else {
                res.status(200).json(twittResponse);
                return;
            }
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaba un twitt en particular: ${error}` });
            return;
        }
    }),
    favOneTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
                return;
            }
            yield twitt_1.default.findByIdAndUpdate(userId, {
                $addToSet: {
                    favourites: twittId
                },
            }, {
                new: true
            });
            yield user_1.default.findByIdAndUpdate(userId, {
                $addToSet: {
                    favourites: twittId
                },
            }, {
                new: true
            });
            res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' });
            return;
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
            return;
        }
    }),
    unfavOneTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
            }
            yield twitt_1.default.findByIdAndUpdate(twittId, { $inc: { favourites: -1 } }, { new: true });
            yield user_1.default.findByIdAndUpdate(userId, {
                $pull: {
                    favourites: twittId,
                },
            }, { new: true });
            res.status(200).json({ msg: 'Desfaveado satisfactoriamente' });
            return;
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se desfavorecía un twitt: ${error}` });
            return;
        }
    }),
    createTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userInRequest = req.user;
            const { _id } = userInRequest;
            if (!(0, mongoose_1.isValidObjectId)(_id)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
                return;
            }
            let result;
            if (req.files) {
                const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
                const file = files[0];
                result = yield (0, cloudinaryConfig_1.handleUploadImage)(file.tempFilePath, twittsFolder);
            }
            else {
                result = null;
            }
            const twittData = {
                twitt: req.body.twitt,
                favourites: 0,
                user: userInRequest._id,
                image: result,
                comments: [],
            };
            const newTwitt = yield twitt_1.default.create(twittData);
            yield user_1.default.findByIdAndUpdate(_id, {
                $addToSet: {
                    twitts: newTwitt._id
                },
            }, {
                new: true
            });
            res.status(200).json(newTwitt);
        }
        catch (error) {
            res.status(500).json({ msg: `Problema mientras se creaba un twitt` });
            return;
        }
    }),
    deleteTwitt: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittIdToDelete = req.params.twittIdToDelete;
            if (!(0, mongoose_1.isValidObjectId)(twittIdToDelete)) {
                res.status(400).json({ msg: 'Twitt id invalido' });
                return;
            }
            const deletedDocument = yield twitt_1.default.findByIdAndRemove(twittIdToDelete);
            if (!deletedDocument) {
                res.status(404).json({ msg: 'Twitt no encontrado' });
            }
            else {
                const twittImagePublicId = deletedDocument.image.public_id;
                if (twittImagePublicId) {
                    yield (0, cloudinaryConfig_1.handleDeleteImage)(twittImagePublicId);
                }
                yield comment_1.default.deleteMany({ twittCommented: twittIdToDelete });
                res.status(200).json(twittIdToDelete);
                return;
            }
        }
        catch (error) {
            res.status(400).json({ msg: `Problema mientras se borraba un twitt: ${error}` });
            return;
        }
    })
};
exports.default = controller;
