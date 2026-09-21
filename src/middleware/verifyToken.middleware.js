import jwt from 'jsonwebtoken';
import User from '../models/user.mode.js';

const verifyToken = async (req, res, next) => {
  try {

    const token = await req.cookies?.token;

    if (!token) {
      return res.status(400).json({
        message: "Not Authenticated"
      });
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorised - No Token Provided"
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res.status(401).json({
        message: "Unauthorised - Token Is Invalid"
      })
    }

    const user = await User.findById(decode.userId).select("-password");

    if (!user) {
      return res.status(400).json({
        message: "Unauthorised - Token is Invalid, User Not Found"
      });
    }

    req.user = user;

    next();
  } catch (e) {
    console.log("error in verifyToken middleware",e.message)
    res.status(500).json({
      message: "Invalid User"
    });
  }
}

export default verifyToken;
