import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  projectList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewProject'
    }
  ],
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewProject'
    }
  ]
}, 
{
  timestamps: true
}
);

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
  // const secret = process.env.ACCESS_SECRET_KEY;
  // console.log('secretA: ', secret);
  return jwt.sign({ username: this.username, email: this.email }, process.env.ACCESS_SECRET_KEY, {expiresIn: '1d'});
}

userSchema.methods.generateRefreshToken = function() {
  // const secret = process.env.REFRESH_SECRET_KEY;
  // console.log('secretR: ', secret);
  return jwt.sign({ username: this.username, email: this.email }, process.env.REFRESH_SECRET_KEY, {expiresIn: '7d'});
}

const userModel = mongoose.model("User", userSchema);

export default userModel;