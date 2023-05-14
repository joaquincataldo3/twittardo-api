"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller = {
    allUsers: (_req, res) => {
        return res.status(200).json({ msg: 'user' });
    }
};
exports.default = controller;
