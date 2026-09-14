import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const schema = mongoose.Schema;

const userSchema = schema({
  userName: { type: String, required: true, unique: true },
  password: { type: password, required: true },
  profile: {
    name: String,
    bio: String,
    profilePicture: String
  },
},
  { Timestamp: true },
);

export default mongoose.model("User", userSchema);
