"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_1 = __importDefault(require("../controllers/comment"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.get('/by-user/:userId', comment_1.default.getCommentsByUser);
router.post('/:twittId/create', auth_1.verifyToken, comment_1.default.createComment);
router.delete('/:commentId/delete', auth_1.verifyToken, auth_1.verifyUserOrAdmin, comment_1.default.deleteComment);
exports.default = router;
