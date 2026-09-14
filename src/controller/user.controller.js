import User from "../models/user.mode";
import argon2 from "argon2";
import fs from "fs";
import { generateToken } from "../libs/jsonWebToken";

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

    if (req.file) {
      // TODO : implement cloudinary logic

    }

    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

    const newUser = new User({
      userName,
      password : hashedPassword,
      name,
      bio
    });

    if (newUser) {
      // TODO: send the user a jwt token through cookies
      await newUser.save();
      generateToken(newUser, res);

      // TODO: send the success message to the user
      return res.json({
        message: "Registration successfull",
      });
    } else {
      return res.status(400).json({
        message: "Invalid credentials"
      })
    }

  } catch (e) {
    if (e.code === 11000) {
        return res.status(400).json({
          message: "A user with this username already exists"
        });
    }

    console.log("Error in register user controller", e.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}
