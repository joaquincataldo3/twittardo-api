import mongoose from "mongoose"
import { Schema, Types } from "mongoose"

const userSchema: Schema = new Schema({
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
  image: {
    public_id: String,
    secure_url: String
  },
  isAdmin: {
    type: Number
  },
  favourites: [{
    type: Types.ObjectId,
    ref: 'Favourite'
  }],
  twitts: [{
    type: Types.ObjectId,
    ref: 'Twitt'
  }],
  comments: [{
    type: Types.ObjectId,
    ref: 'Comment'
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