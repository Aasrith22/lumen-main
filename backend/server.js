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
    origin: [
        "http://localhost:3000", 
        "http://127.0.0.1:5500", 
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "file://"  // Allow file:// protocol for local HTML files
    ], 
    credentials: true
}));

// Routes
app.use("/api/user", userRoutes);

app.listen(3000, () => {
    console.log(`server is running at port: 3000`);
});