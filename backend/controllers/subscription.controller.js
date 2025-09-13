import Subscription from "../models/subscription.model.js";
import Plan from "../models/plan.model.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const listSubscriptions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.user = req.query.userId;
    const subs = await Subscription.find(filter)
      .populate("user", "fullname email")
      .populate("plan");
    res.json({ success: true, data: subs });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to list subscriptions" });
  }
};

export const subscribe = async (req, res) => {
  try {
    let { userId, planId } = req.body;
    if (!planId) return res.status(400).json({ success: false, message: "planId required" });

    // If no userId is provided, fallback to a demo user so users can subscribe without login
    if (!userId) {
      const demoEmail = process.env.DEMO_USER_EMAIL || "user@example.com";
      let demo = await User.findOne({ email: demoEmail });
      if (!demo) {
        const pwd = await bcrypt.hash("password", 10);
        demo = await User.create({
          fullname: "Demo User",
          email: demoEmail,
          phoneNumber: "0000000000",
          password: pwd,
          role: "user",
        });
      }
      userId = demo._id;
    }

    const user = await User.findById(userId);
    const plan = await Plan.findById(planId);
    if (!user || !plan) return res.status(404).json({ success: false, message: "User or Plan not found" });
    const sub = await Subscription.create({ user: userId, plan: planId, status: "active", startDate: new Date() });
    res.status(201).json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const changePlan = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { newPlanId } = req.body;
    const plan = await Plan.findById(newPlanId);
    if (!plan) return res.status(404).json({ success: false, message: "New plan not found" });
    const sub = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { plan: newPlanId },
      { new: true }
    ).populate("plan");
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const sub = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { status: "cancelled", endDate: new Date() },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const renewSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    sub.status = "active";
    sub.endDate = null;
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const adminStats = async (_req, res) => {
  try {
    const [totalUsers, totalSubs, activeSubs, plans] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: "active" }),
      Plan.find({ Status: "Active" }),
    ]);
    
    // Calculate monthly revenue based on active subscriptions
    const activeSubsWithPlans = await Subscription.find({ status: "active" }).populate("plan");
    const monthlyRevenue = activeSubsWithPlans.reduce((sum, s) => sum + (s.plan?.Price || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions: activeSubs,
        totalSubscriptions: totalSubs,
        monthlyRevenue,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to compute stats" });
  }
};
