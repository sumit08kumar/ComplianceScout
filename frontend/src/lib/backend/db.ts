import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/compliancescout";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "compliancescout";

// Cache the connection promise so we don't reconnect on every serverless invocation
let cached = (global as any).__mongooseConn as { promise: Promise<typeof mongoose> | null };
if (!cached) {
  cached = (global as any).__mongooseConn = { promise: null };
}

export async function connectDB() {
  if (cached.promise) return cached.promise;
  cached.promise = mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME }).then((m) => {
    console.log(`MongoDB connected (db: ${MONGODB_DB_NAME})`);
    return m;
  });
  return cached.promise;
}

export default mongoose;
