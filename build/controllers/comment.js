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
const mongoose_1 = require("mongoose");
const controller = {
    allComments: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const comments = yield comment_1.default.find();
            return res.status(200).json(comments);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se buscaban los comentarios: ${error}` });
        }
    }),
    createComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const twittId = req.params.twittId;
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' });
            }
            const commentData = {
                comment: req.body.comment,
                user: userId,
            };
            const newComment = yield comment_1.default.create(commentData);
            const pushCommentInTwitt = yield twitt_1.default.findByIdAndUpdate(twittId, {
                $addToSet: {
                    comments: newComment._id
                },
            }, {
                new: true
            });
            return res.status(200).json({ newComment, pushCommentInTwitt });
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se creaba un comentario: ${error}` });
        }
    }),
    deleteComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const commentIdToDelete = req.params.commentId;
            if (!(0, mongoose_1.isValidObjectId)(commentIdToDelete)) {
                res.status(400).json({ msg: 'Comentario id invalido' });
            }
            yield comment_1.default.findByIdAndRemove(commentIdToDelete);
            res.status(200).json(commentIdToDelete);
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ msg: `Problema mientras se borraba un comentario: ${error}` });
        }
    })
};
exports.default = controller;
