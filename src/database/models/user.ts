import mongoose from "mongoose"
import schemas from "../../utils/schemaNames"
import { Schema, Types } from "mongoose"

  const userSchema = new Schema ({
    user: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
    },
    twitts: [{
      type: Types.ObjectId,
      ref: schemas.twitt
    }],
    isAdmin: {
      type: Boolean,
    },
    createdAt: {
      type: Date,
      default: () => Date.now(),
      immutable: true
    }
  });

const model = mongoose.model(schemas.user, userSchema)

export default model