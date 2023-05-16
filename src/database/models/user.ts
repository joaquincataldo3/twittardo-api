import mongoose from "mongoose"
import schemas from "../../utils/schemaNames"
import { Schema, Types } from "mongoose"

  const userSchema: Schema = new Schema ({
    username: {
      type: String,
      required: true
    },
    email: {
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
      ref: schemas.twitts
    }],
    followers: [{
      type: Types.ObjectId,
      ref: schemas.users
    }],
    following: [{
      type: Types.ObjectId,
      ref: schemas.users
    }],
    createdAt: {
      type: Date,
      default: () => Date.now(),
      immutable: true
    }
  });

const model = mongoose.model(schemas.users, userSchema)

export default model