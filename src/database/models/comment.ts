import mongoose from "mongoose"
import { Schema, Types} from "mongoose"
import { modelsName } from "../../utils/constants/modelsName"

const {UserModel, TwittModel, CommentModel} = modelsName;

const commentSchema: Schema = new Schema({
    comment: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: UserModel, 
        required: true
    },
    favourites: {
        type: Number
    },
    twittCommented: {
        type: Types.ObjectId,
        ref: TwittModel, 
        required: true
    }
})

const model = mongoose.model(CommentModel, commentSchema)

export default model