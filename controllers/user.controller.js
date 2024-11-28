import userModel from '../models/user.js';
import {hashPassword, generateToken, comparePassword} from '../middlewares/auth.js';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import { log } from 'console';

const app = express();
app.use(cookieParser());

const generateAccessAndRefreshToken = async (user) => {

  try {

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // console.log('Original Refresh token: ', refreshToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false});
  
    return {accessToken, refreshToken};

  } catch (error) {
    return {error: 'Error occured while generating access and refresh token'};
  }
}

export const createNewUser = async (req, res)=> {

  const {username, email, password} = req.body;
  
  // console.log(username, email, password);

  try{

    const alreadyExists = await userModel.findOne({email});

    // If we want to search the database with one of the available fields, we can use

    // const alreadyExists = await userModel.findOne({$or: [{email}, {username}]});

    if(alreadyExists) {
      return res.status(400).json({message: 'User already exists'});
    }
    
    const hashedPassword = await hashPassword(password);
    
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword
    });
    
    await newUser.save();

    const createdUser = await userModel.findById(newUser._id).select('-password -refreshToken');
    if(!createdUser) {
      return res.status(500).json({message: "Error occured while registering user"});
    }

    const {accessToken, refreshToken, error} = await generateAccessAndRefreshToken(createdUser);
    if (error) {
      return res.status(500).json({ message: error });
    }    


      const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false,
          maxAge: 24*60*60*1000
      }

      return res.status(200).cookie('accessToken', accessToken, options)
                            .cookie('refreshToken', refreshToken, options)
                            .json({ message: "User registered successfully", accessToken: accessToken, refreshToken: refreshToken });
    
  }catch(err){
  
    res.status(500).json({message: "Catch part in createUser controller"});
  }

};

export const validateLogin= async (req, res)=> {

  const {email, password} = req.body;
  // console.log(email, password);

  try {
      
      const user = await userModel.findOne({email});

      if(!user) {
          return res.status(400).json({message: "User not found"});
      }

      const isMatch = await comparePassword(user.password, password);

      if(!isMatch) {
          return res.status(400).json({message: "Invalid Password"});
      }
      
      // console.log(user)
      const {accessToken, refreshToken, error} = await generateAccessAndRefreshToken(user);
      if (error) {
        return res.status(500).json({ message: error });
      }

      const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false,
          maxAge: 24*60*60*1000
      }

      return res.status(200).cookie('accessToken', accessToken, options)
                            .cookie('refreshToken', refreshToken, options)
                            .json({ message: "User logged in successfully", accessToken: accessToken, refreshToken: refreshToken });

  } catch (error) {
      res.status(500).json({message: "Catch part in validateLogin controller"});
  }
};

export const logout = async (req, res) => {

    await userModel.findByIdAndUpdate( req.user._id, { $unset: { refreshToken: 1} }, { new: true} );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false
    }

    return res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).json({message: 'Logged out successfully', loggedOut: true});
};

export const refreshAccessToken = async (req, res)=> {

  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if(!incomingRefreshToken) {
    return res.status(400).json({message: 'Refresh token not found'});
  }

  // verify the refresh token

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_SECRET_KEY);
    console.log(decoded);

    const user = await userModel.findOne({email: decoded.email}).select('-password');
    console.log(user);

    if(!user) {
      return res.status(401).json({message: 'No user found corresponding to this refresh token'});
    }
    
    if(incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({message: 'Refresh token has been changed.'});
    }
    console.log('first phase passed')

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user);
    console.log('second phase passed')
    // console.log('**************************************************')
    // console.log('Refresh token: ', newRefreshToken);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: 24*60*60*1000
    }
  
    return res.status(200).cookie('accessToken', accessToken, options)
                          .cookie('refreshToken', newRefreshToken, options)
                          .json({message: 'Access token refreshed successfully'});
  } catch (error) {
    return res.status(500).json({message: 'Refresh token has been expired or tampererd'});
  }
}

export const frontendTokenValidation = async (req, res)=> {
  return res.status(200).json({message: "Authenticated User" , authenticated: true});
}