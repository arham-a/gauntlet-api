// User.js
import mongoose from 'mongoose';

const instance = new mongoose.Schema(
  {
    username: { 
      type: String,
      required: true,
      unique: true,
    },
    password: { 
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    myJoinComp: {
      type: [String],
      default: [],
    },
    myCreatedComp: {
      type: [String],
      default: [],
    },
    // Fields below back the /setting routes. Without them mongoose runs in
    // strict mode and these paths are undefined, so the controllers either
    // throw on assignment (info/profile/apiKeys) or silently discard the
    // write (subscription).
    info: {
      name: { type: String, default: '' },
      language: { type: String, default: 'en' },
    },
    profile: {
      profilePictureURL: { type: String, default: '' },
    },
    apiKeys: {
      chatGPT: { type: String, default: '' },
      gemini: { type: String, default: '' },
    },
    subscription: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);

const modelName = 'User';

export default mongoose.model(modelName, instance);