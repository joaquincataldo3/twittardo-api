"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const modelsName_1 = require("../../utils/constants/modelsName");
const { UserModel, CommentModel, TwittModel } = modelsName_1.modelsName;
const twittSchema = new mongoose_2.Schema({
    twitt: {
        type: String,
        required: true
    },
    image: {
        public_id: String,
        secure_url: String
    },
    user: {
        type: mongoose_2.Types.ObjectId,
        ref: UserModel,
        required: true
    },
    comments: [{
            type: mongoose_2.Types.ObjectId,
            ref: CommentModel
        }],
    favourites: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    }
});
const model = mongoose_1.default.model(TwittModel, twittSchema);
exports.default = model;
