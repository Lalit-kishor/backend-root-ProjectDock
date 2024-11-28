import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';

export const hashPassword = (password)=>{
  return bcrypt.hash(password, 5);
}

export const comparePassword = (hash, password)=> {
  return bcrypt.compare(password, hash);
}

export const generateToken= (user)=>{
  return jwt.sign({username: user.username, email: user.email}, process.env.SECRET_KEY, {expiresIn: '1h'});
}

export const verifyJWT = async (req, res, next)=> {

    // console.log('JWT Middleware is working...');

    try {

      const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer", "");
      
      // console.log('token: ', token);

      if(!token) {
        // console.log('No token');
        return res.status(401).json({message: 'Unauthorized', authenticated: false});
      }
  
      const decodedUser = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
      // console.log('decodedUser: ', decodedUser);

      const user = await userModel.findOne({email: decodedUser.email}).select('-password -refreshToken');
      // console.log('user: ', user);
  
      if(!user) {
        return res.status(401).json({message: 'Invalid Access Token'});
      }
      
      // console.log('User: ', user);
      

      req.user = user;
      // console.log('request User: ', req.user);

      next();

    } catch (error) {
      return res.status(401).json({message: 'Catch part Unauthorized', authenticated: false});
    }
} 