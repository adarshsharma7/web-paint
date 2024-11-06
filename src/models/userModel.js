import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: [true, "Username is not unique"]
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, "Please provide your full name"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  avatar: {
    type: String,
    default: null
  },
  forgetPasswordToken: {
    type: String,
    default: null
  },
  forgetPasswordTokenExpiry: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: String,
  },
  verifyCodeExpiry: {
    type: Date,
  },
}, { timestamps: true });


const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
