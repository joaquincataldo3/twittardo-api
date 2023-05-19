import mongoose from "mongoose"
import { Schema, Types} from "mongoose"

const commentSchema: Schema =new Schema  ({
    comment: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: 'User', 
        required: true
    }
})

const model = mongoose.model('Comment', commentSchema)

export default model