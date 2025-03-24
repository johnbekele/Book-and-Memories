import { Admin } from 'mongodb';
import mongoose from 'mongoose';

// Define the schema
const userSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /\S+@\S+\.\S+/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phone: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return /^\d+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      required: false,
    },
    otherDetails: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed type for JSON
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      User: {
        default: 2001,
        type: Number,
      },
      Admin: Number,
      Moderator: Number,
    },
    refreshToken: {
      type: String,
      maxlength: 512,
      required: false,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

// Define static methods for associations, if needed
userSchema.statics.associate = function (models) {
  // If you need to define relationships, you can do so here
  // But typically in Mongoose, you use refs in the schema itself
};

// Create the model
const User = mongoose.model('User', userSchema);

export default User;
