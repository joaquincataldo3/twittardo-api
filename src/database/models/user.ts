import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
import { modelsName } from "../../utils/constants/modelsName";

const {UserModel, CommentModel, TwittModel } = modelsName;

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
    ref: TwittModel
  }],
  twitts: [{
    type: Types.ObjectId,
    ref: TwittModel
  }],
  comments: [{
    type: Types.ObjectId,
    ref: CommentModel
  }],
  followers: [{
    type: Types.ObjectId,
    ref: UserModel
  }],
  following: [{
    type: Types.ObjectId,
    ref: UserModel
  }],
  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: true
  }
});

const model = mongoose.model(UserModel, userSchema)

export default model