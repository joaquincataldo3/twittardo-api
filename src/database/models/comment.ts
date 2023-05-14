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
        ref: schemas.user, 
        required: true
    }
})

const model = mongoose.model(schemas.comment, commentSchema)

export default model