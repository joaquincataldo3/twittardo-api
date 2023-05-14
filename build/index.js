"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routes/user"));
// npm i @types/express -D
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/user', user_1.default);
const PORT = 3050;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
