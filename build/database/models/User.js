"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const modelsName_1 = require("../../utils/constants/modelsName");
const { UserModel, CommentModel, TwittModel } = modelsName_1.modelsName;
const userSchema = new mongoose_2.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        public_id: String,
        secure_url: String
    },
    isAdmin: {
        type: Number
    },
    favourites: [{
            type: mongoose_2.Types.ObjectId,
            ref: TwittModel
        }],
    twitts: [{
            type: mongoose_2.Types.ObjectId,
            ref: TwittModel
        }],
    comments: [{
            type: mongoose_2.Types.ObjectId,
            ref: CommentModel
        }],
    followers: [{
            type: mongoose_2.Types.ObjectId,
            ref: UserModel
        }],
    following: [{
            type: mongoose_2.Types.ObjectId,
            ref: UserModel
        }],
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    }
});
const model = mongoose_1.default.model(UserModel, userSchema);
exports.default = model;
