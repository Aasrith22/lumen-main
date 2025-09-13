import express from "express";
import { listSubscriptions, subscribe, changePlan, cancelSubscription, renewSubscription, adminStats } from "../controllers/subscription.controller.js";

const router = express.Router();

router.get("/", listSubscriptions);
router.post("/", subscribe);
router.put("/:subscriptionId/change-plan", changePlan);
router.put("/:subscriptionId/cancel", cancelSubscription);
router.put("/:subscriptionId/renew", renewSubscription);
router.get("/admin/stats", adminStats);

export default router;
