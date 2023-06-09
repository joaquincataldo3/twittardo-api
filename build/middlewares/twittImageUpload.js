"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'src/images/twitsImages');
    },
    filename: (_req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});
const uploadFile = (0, multer_1.default)({ storage: storage });
exports.default = uploadFile;
