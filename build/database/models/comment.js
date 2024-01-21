"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const modelsName_1 = require("../../utils/constants/modelsName");
const { UserModel, TwittModel } = modelsName_1.modelsName;
const commentSchema = new mongoose_2.Schema({
    comment: {
        type: String,
        required: true
    },
    user: {
        type: mongoose_2.Types.ObjectId,
        ref: UserModel,
        required: true
    },
    favourites: {
        type: Number
    },
    twittCommented: {
        type: mongoose_2.Types.ObjectId,
        ref: TwittModel,
        required: true
    }
});
const model = mongoose_1.default.model('Comment', commentSchema);
exports.default = model;
