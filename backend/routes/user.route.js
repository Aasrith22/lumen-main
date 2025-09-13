import express from "express";
import { login, logout, register} from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
const router = express.Router();
// Health check endpoint used by static login page
router.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(isAuthenticated, logout);
export default router;