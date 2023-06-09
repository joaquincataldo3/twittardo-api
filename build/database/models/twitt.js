"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const twittSchema = new mongoose_2.Schema({
    twitt: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    user: {
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [{
            type: mongoose_2.Types.ObjectId,
            ref: 'Comment'
        }]
});
const model = mongoose_1.default.model('Twitt', twittSchema);
exports.default = model;
