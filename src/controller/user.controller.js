import User from "../models/user.mode";
import argon2 from "argon2";
import fs from "fs";

export const register = async (req, res) => {
  const { userName, password, name, bio } = req.body;

  if (!userName || !password || !name) {
    return res.status(400).json({
      message: "Please provide all the required details"
    });
  }

  try {
    const existingUser = User.findOne({
      userName
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this username already exists"
      });
    }

    if (req.file) {
      // TODO : implement cloudinary logic
    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

    const newUser = new User({
      userName,
      password,
      name,
      bio
    });

    newUser.save();

    if (newUser) {
      // TODO: send the user a jwt token through cookies
      // TODO: send the success message to the user
    } else {
      return res.status(400).json({
        message: "Invalid credentials"
      })
    }

  } catch (e) {
    console.log("Error in register user controller", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}
