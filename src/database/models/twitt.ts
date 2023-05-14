import mongoose from "mongoose"
import schemas from "../../utils/schemaNames"
import { Schema, Types} from "mongoose"

const twittSchema = new Schema ({
    twitt: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        ref: schemas.user, 
        required: true
    },
    comments: [{
        type: Types.ObjectId,
        ref: schemas.comment
    }]

})

const model = mongoose.model(schemas.twitt, twittSchema)

export default model