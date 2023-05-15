import mongoose from "mongoose"
import schemas from "../../utils/schemaNames"
import { Schema, Types} from "mongoose"

const commentSchema = new Schema  ({
    comment: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: schemas.users, 
        required: true
    }
})

const model = mongoose.model(schemas.comments, commentSchema)

export default model