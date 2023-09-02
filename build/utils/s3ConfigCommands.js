"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetCommand = exports.handleDeleteCommand = exports.handlePutCommand = exports.s3Config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const client_s3_1 = require("@aws-sdk/client-s3");
const randomImageName_1 = require("./randomImageName");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
dotenv_1.default.config();
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;
exports.s3Config = {
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
};
const s3 = new client_s3_1.S3Client(exports.s3Config);
let randomName = null;
// armamos el objeto que tiene que tener estos parametros para el bucket
const handlePutCommand = (avatar, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const bucketParams = {
        Bucket: bucketName,
        Key: `${folder}/${(0, randomImageName_1.randomImageName)()}`,
        Body: avatar.buffer,
        ContentType: avatar.mimetype
    };
    randomName = bucketParams.Key;
    // instanciamos la clase de put object comand con los params
    const command = new client_s3_1.PutObjectCommand(bucketParams);
    // enviamos
    yield s3.send(command);
    return randomName;
});
exports.handlePutCommand = handlePutCommand;
// en este caso recibe el string de avatar que es el randomname
const handleDeleteCommand = (avatar, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteParams = {
        Bucket: bucketName,
        Key: `${folder}/${avatar}`
    };
    const delCommand = new client_s3_1.DeleteObjectCommand(deleteParams);
    yield s3.send(delCommand);
});
exports.handleDeleteCommand = handleDeleteCommand;
// para obtener la url temporal
const handleGetCommand = (image, folder) => __awaiter(void 0, void 0, void 0, function* () {
    let getObjectParams = {
        Bucket: bucketName,
        Key: `${folder}/${image}`
    };
    let command = new client_s3_1.GetObjectCommand(getObjectParams);
    let url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 1800 }); //30 min
    return url;
});
exports.handleGetCommand = handleGetCommand;
