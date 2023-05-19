import mongoose from "mongoose"
import { Schema, Types} from "mongoose"

const twittSchema: Schema = new Schema ({
    twitt: {
        type: String,
        required: true
    },
    image: {
        type: Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: Types.ObjectId,
        ref: 'User', 
        required: true
    },
    comments: [{
        type: Types.ObjectId,
        ref: 'Comment'
    }]

})

const model = mongoose.model('Twitt', twittSchema)

export default model