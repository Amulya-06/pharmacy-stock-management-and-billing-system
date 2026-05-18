import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    // process.exit(1); // Removed to allow server to keep running
  }
};

export default connectDB; // ✅ Use "export default" for ES Modules