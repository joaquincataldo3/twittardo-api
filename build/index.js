"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_1 = __importDefault(require("./routes/user"));
const twitt_1 = __importDefault(require("./routes/twitt"));
const comment_1 = __importDefault(require("./routes/comment"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../')));
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: './src/tmpUploads',
    debug: true
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        sameSite: false,
        secure: process.env.NODE_ENV == 'production' ? true : false
    }
}));
app.use((0, cors_1.default)({
    origin: process.env.REACT_APP_URL,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use('/users', user_1.default);
app.use('/twitts', twitt_1.default);
app.use('/comments', comment_1.default);
mongoose_1.default.set('strictQuery', false);
if (MONGO_URI) {
    mongoose_1.default.connect(MONGO_URI)
        .then(() => {
        console.log('Mongo DB Connected');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server opened on ${PORT}`);
        });
    })
        .catch(err => {
        console.log(`Mongo DB connection error: ${err}`);
        process.exit(1);
    });
}
else {
    console.log('MONGO_URI undefined');
    process.exit(1);
}
