import mongoose from "mongoose";
import { Schema, Types} from "mongoose";
import { modelsName } from "../../utils/constants/modelsName";

const {UserModel, CommentModel, TwittModel} = modelsName

const twittSchema: Schema = new Schema ({
    twitt: {
        type: String,
        required: true
    },
    image: {
        public_id: String,
        secure_url: String
    },
    user: {
        type: Types.ObjectId,
        ref: UserModel, 
        required: true
    },
    comments: [{
        type: Types.ObjectId,
        ref: CommentModel
    }],
    favourites: {
        type: Number},
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
      }
})

const model = mongoose.model(TwittModel, twittSchema)

export default model