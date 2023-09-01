"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
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
    avatar: {
        type: String,
    },
    isAdmin: {
        type: Number
    },
    favourites: [{
            type: mongoose_2.Types.ObjectId,
            ref: 'Twitt'
        }],
    twitts: [{
            type: mongoose_2.Types.ObjectId,
            ref: 'Twitt'
        }],
    followers: [{
            type: mongoose_2.Types.ObjectId,
            ref: 'User'
        }],
    following: [{
            type: mongoose_2.Types.ObjectId,
            ref: 'User'
        }],
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    }
});
const model = mongoose_1.default.model('User', userSchema);
exports.default = model;
