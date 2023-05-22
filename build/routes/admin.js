"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = __importDefault(require("../controllers/admin"));
const router = express_1.default.Router();
router.get('/all', admin_1.default.allUsers);
router.get('/:adminId', admin_1.default.oneAdmin);
router.get('/logout', admin_1.default.logout);
router.post('/login', admin_1.default.login);
exports.default = router;
