import express from "express";
import { createPlan, deletePlan, listPlans, updatePlan } from "../controllers/plan.controller.js";

const router = express.Router();

router.get("/", listPlans);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

export default router;
