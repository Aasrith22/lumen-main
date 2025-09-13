import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
config();
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";
import planRoutes from "./routes/plan.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
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
        "http://127.0.0.1:5174", // Added for frontend_user
        "http://localhost:5174", // Added for frontend_user
        "http://127.0.0.1:5175",
        "http://localhost:5175",
        "file://"  // Allow file:// protocol for local HTML files
    ], 
    credentials: true
}));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Optional: quick seed endpoint for demo (no auth)
app.post("/api/dev/seed-min", async (_req, res) => {
    try {
        const Plan = (await import("./models/plan.model.js")).default;
        const { User } = await import("./models/user.model.js");
        const bcrypt = (await import("bcryptjs")).default;
        
        const planCount = await Plan.countDocuments();
        if (planCount === 0) {
            await Plan.insertMany([
                { 
                    Name: "Fibernet Basic", 
                    Price: 39.99, 
                    "Auto Renewal Allowed": "Yes", 
                    Status: "Active", 
                    type: "Fibernet", 
                    speed: "50 Mbps", 
                    quota: 100, 
                    features: ["50 Mbps Speed", "100GB Data"], 
                    description: "Basic Fibernet plan" 
                },
                { 
                    Name: "Fibernet Pro", 
                    Price: 59.99, 
                    "Auto Renewal Allowed": "Yes", 
                    Status: "Active", 
                    type: "Fibernet", 
                    speed: "100 Mbps", 
                    quota: 200, 
                    features: ["100 Mbps Speed", "200GB Data", "Priority Support"], 
                    description: "Pro Fibernet plan" 
                },
                { 
                    Name: "Broadband Copper", 
                    Price: 24.99, 
                    "Auto Renewal Allowed": "No", 
                    Status: "Active", 
                    type: "Broadband Copper", 
                    speed: "25 Mbps", 
                    quota: 50, 
                    features: ["25 Mbps Speed", "50GB Data"], 
                    description: "Basic Broadband plan" 
                },
            ]);
        }
        
        // Seed demo users if missing
        const demoUserEmail = "user@example.com";
        const demoAdminEmail = "admin@example.com";
        const pwd = await bcrypt.hash("password", 10);
        
        if (!(await User.findOne({ email: demoUserEmail }))) {
            await User.create({ fullname: "Demo User", email: demoUserEmail, phoneNumber: "0000000000", password: pwd, role: "user" });
        }
        if (!(await User.findOne({ email: demoAdminEmail }))) {
            await User.create({ fullname: "Admin", email: demoAdminEmail, phoneNumber: "9999999999", password: pwd, role: "admin" });
        }
        
        res.json({ success: true, message: "Seeded minimal plans and demo users (password: password)" });
    } catch (e) {
        console.error("Seed failed:", e);
        res.status(500).json({ success: false, message: "Seed failed" });
    }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running at port: ${PORT}`);
});