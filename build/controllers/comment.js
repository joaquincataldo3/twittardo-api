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
const comment_1 = __importDefault(require("../database/models/comment"));
const twitt_1 = __importDefault(require("../database/models/twitt"));
const user_1 = __importDefault(require("../database/models/user"));
const mongoose_1 = require("mongoose");
const modelsPath_1 = require("../utils/constants/modelsPath");
const { userPath, twittCommentedPath } = modelsPath_1.modelPaths;
const controller = {
    createComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { _id } = user;
            const twittId = req.params.twittId;
            if (!(0, mongoose_1.isValidObjectId)(twittId)) {
                res.status(400).json({ msg: 'Twitt id invalido' });
                return;
            }
            const commentData = {
                comment: req.body.comment,
                user: _id,
                twittCommented: twittId,
                favourites: 0
            };
            const newComment = yield comment_1.default.create(commentData);
            const pushCommentInTwitt = yield twitt_1.default.findByIdAndUpdate(twittId, {
                $addToSet: {
                    comments: newComment._id
                },
                $inc: {
                    commentsNumber: 1
                }
            }, {
                new: true
            });
            const pushCommentInUser = yield user_1.default.findByIdAndUpdate(_id, {
                $addToSet: {
                    comments: newComment._id
                }
            }, {
                new: true
            });
            res.status(200).json({ newComment, pushCommentInTwitt, pushCommentInUser });
            return;
        }
        catch (error) {
            res.status(500).json({ msg: 'Ocurrió un problema mientras se creaba un comentario' });
            return;
        }
    }),
    getCommentsByUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const page = String(req.query.p);
            const pageNumber = Number(page);
            const commentsPerPage = 5;
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                res.status(400).json({ msg: 'Id invalido' });
                return;
            }
            const comments = yield comment_1.default
                .find({ user: userId })
                .populate(userPath)
                .populate({
                path: twittCommentedPath,
                populate: userPath
            })
                .skip((pageNumber - 1) * commentsPerPage)
                .limit(commentsPerPage);
            res.status(200).json({ comments });
            return;
        }
        catch (error) {
            res.status(500).json({ msg: 'Problema interno en el servidor' });
            return;
        }
    }),
    favOneComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
                return;
            }
            yield comment_1.default.findByIdAndUpdate(twittId, { $inc: { favourites: 1 } }, { new: true });
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
            res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
            return;
        }
    }),
    deleteComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const commentIdToDelete = req.params.commentId;
            if (!(0, mongoose_1.isValidObjectId)(commentIdToDelete)) {
                res.status(400).json({ msg: 'Comentario id invalido' });
                return;
            }
            yield comment_1.default.findByIdAndRemove(commentIdToDelete);
            res.status(200).json(commentIdToDelete);
            return;
        }
        catch (error) {
            res.status(400).json({ msg: `Problema mientras se borraba un comentario: ${error}` });
            return;
        }
    })
};
exports.default = controller;
