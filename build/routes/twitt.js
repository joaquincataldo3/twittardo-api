"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const twitt_1 = __importDefault(require("../controllers/twitt"));
const auth_1 = require("../middlewares/auth");
const twittImageUpload_1 = __importDefault(require("../middlewares/twittImageUpload"));
const router = express_1.default.Router();
router.get('/', twitt_1.default.allTwitts);
router.get('/:twittId', twitt_1.default.oneTwitt);
router.post('/:userId/create', auth_1.verifyToken, auth_1.verifyUserOrAdmin, twittImageUpload_1.default.single('image'), twitt_1.default.createTwitt);
router.delete('/:twittId/delete', auth_1.verifyToken, auth_1.verifyUserOrAdmin, twitt_1.default.createTwitt);
exports.default = router;
