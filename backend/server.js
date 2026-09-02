import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json);
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server running on: ${PORT}`);
        });
    } catch (error) {
        console.error("DB connection failed: ", error);
    }
}

connectDB();


app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});