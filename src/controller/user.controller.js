import User from "../models/user.mode.js";
import argon2 from "argon2";
import fs from "fs";
import { generateToken } from "../libs/jsonWebToken.js";
import cloudinary from "../libs/cloudinary.js";

export const register = async (req, res) => {
  const { userName, password, name, bio } = req.body;

  if (!userName || !password || !name) {
    return res.status(400).json({
      message: "Please provide all the required details"
    });
  }

  try {
    const existingUser = await User.findOne({
      userName
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this username already exists"
      });
    }

    let imageUrl = null;

    if (req.file) {
      // TODO : implement cloudinary logic
      try {
        const fileLink = await cloudinary.uploader.upload(req.file.path, {
          folder: "profile_pictures"
        });

        imageUrl = fileLink.secure_url;
      } finally {
        fs.unlinkSync(req.file.path);
      }
    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

    const newUser = new User({
      userName,
      password : hashedPassword,
      profile: {
        name,
        bio,
        profilePicture: imageUrl,
      }
    });

      // TODO: send the user a jwt token through cookies
      await newUser.save();
      generateToken(newUser._id, res);

      // TODO: send the success message to the user
      return res.json({
        message: "Registration successfull",
      });
  } catch (e) {
    if (e.code === 11000) {
        return res.status(400).json({
          message: "A user with this username already exists"
        });
    }

    console.log("Error in register user controller", e.message, e);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

export const login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({
      message: "Invalid Credentials"
    });
  }

  try {
    const user = await User.findOne({ userName }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

    const passwordCompare = await argon2.verify(user.password, password);

    if (!passwordCompare) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      message: "Logged In Successfully"
    });
  } catch (e) {
    console.log("error in login auth controller", e.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true
    });
    res.status(200).json({
      message: "Logged out sucessfully",
    });
  } catch (e) {
    console.log("Error in logout controller", e.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json(user);
  } catch (e) {
    console.log("Error In check auth controller at check auth", e.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
