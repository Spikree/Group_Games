import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT_STRING);
    console.log("Connected to MongoDb");
  } catch (e) {
    console.log("COULDNT CONNECT TO MONGODB", e);
  }
}

export default connectDb;
