import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
config();
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";

// Load environment variables


// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000", // adjust to your frontend URL if needed
    credentials: true
}));

// Routes
app.use("/api/user", userRoutes);

app.listen(3000, () => {
    console.log(`server is running at port: 3000`);
});