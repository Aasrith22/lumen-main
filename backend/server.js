import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
config();
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables


// Connect to MongoDB
connectDB();

const app = express();

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "file://"  // Allow file:// protocol for local HTML files
    ], 
    credentials: true
}));

// Routes
app.use("/api/user", userRoutes);

// Serve login page across common routes (root, login, logout, signin, index)
const loginFilePath = path.join(__dirname, "../src/index.html");
const serveLogin = (_req, res) => res.sendFile(loginFilePath);

// Redirect root to /login for clarity
app.get('/', (_req, res) => res.redirect('/login'));

// Directly serve login for these routes
app.get([
    '/login',
    '/login/',
    '/logout',
    '/logout/',
    '/signout',
    '/signin',
    '/index.html',
    '/src/index.html',
    '/auth/login',
    '/auth/logout',
    '/auth/signin'
], serveLogin);

app.listen(3000, () => {
    console.log(`server is running at port: 3000`);
});