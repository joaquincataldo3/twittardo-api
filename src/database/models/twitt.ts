import mongoose from "mongoose"
import { Schema, Types} from "mongoose"

const twittSchema: Schema = new Schema ({
    twitt: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    user: {
        type: Types.ObjectId,
        ref: 'User', 
        required: true
    },
    comments: [{
        type: Types.ObjectId,
        ref: 'Comment'
    }],
    favourites: {type: Number}

})

const model = mongoose.model('Twitt', twittSchema)

export default model