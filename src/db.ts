import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/compliancescout";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "compliancescout";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log(`MongoDB connected (db: ${MONGODB_DB_NAME})`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export default mongoose;
