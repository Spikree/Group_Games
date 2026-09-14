import jwt from 'jsonwebtoken';
import User from '../models/user.mode';

const verifyToken = async (req, res, next) => {
  try {
    const token = await req.cookie.token;


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
    console.log("error in verifyToken middleware",error)
    res.status(500).json({
      message: "Invalid User"
    });
  }
}

export default verifyToken;
