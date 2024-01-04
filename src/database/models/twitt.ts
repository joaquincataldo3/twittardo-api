import mongoose from "mongoose";
import { Schema, Types} from "mongoose";
import { modelsName } from "../../utils/constants/modelsName";

const {User, Comment, Twitt} = modelsName

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
        ref: User, 
        required: true
    },
    comments: [{
        type: Types.ObjectId,
        ref: Comment
    }],
    favourites: [{
        type: Types.ObjectId,
        ref: Twitt
    }],
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
      }
})

const model = mongoose.model('Twitt', twittSchema)

export default model