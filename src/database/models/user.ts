import mongoose from "mongoose"
import { Schema, Types } from "mongoose"

  const userSchema: Schema = new Schema ({
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    isAdmin: {
      type: Number
    },
    twitts: [{
      type: Types.ObjectId,
      ref: 'Twitt'
    }],
    followers: [{
      type: Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: () => Date.now(),
      immutable: true
    }
  });

const model = mongoose.model('User', userSchema)

export default model