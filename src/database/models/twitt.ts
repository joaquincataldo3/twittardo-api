import mongoose from "mongoose"
import schemas from "../../utils/schemaNames"
import { Schema, Types} from "mongoose"

const twittSchema: Schema = new Schema ({
    twitt: {
        type: String,
        required: true
    },
    image: {
        type: Types.ObjectId,
        ref: schemas.users
    },
    user: {
        type: Types.ObjectId,
        ref: schemas.users, 
        required: true
    },
    comments: [{
        type: Types.ObjectId,
        ref: schemas.comments
    }]

})

const model = mongoose.model(schemas.twitts, twittSchema)

export default model