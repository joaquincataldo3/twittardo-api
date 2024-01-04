import mongoose from "mongoose"
import { Schema, Types} from "mongoose"
import { modelsName } from "../../utils/constants/modelsName"

const {User, Twitt} = modelsName;

const commentSchema: Schema = new Schema({
    comment: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: User, 
        required: true
    },
    favourites: {
        type: Number
    },
    twittCommented: {
        type: Types.ObjectId,
        ref: Twitt, 
        required: true
    }
})

const model = mongoose.model('Comment', commentSchema)

export default model