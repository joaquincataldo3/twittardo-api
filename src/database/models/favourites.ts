import mongoose from "mongoose";
import { Schema, Types} from "mongoose";
import { modelsName } from "../../utils/constants/modelsName";

const {User, Twitt} = modelsName

const favouriteSchema: Schema =new Schema  ({
    user: {
        type: Types.ObjectId,
        ref: User, 
        required: true
    },
    twittFaved: {
        type: Types.ObjectId,
        ref: Twitt, 
        required: true
    }
})

const model = mongoose.model('Favourite', favouriteSchema)

export default model