import Plan from '../models/plan.model.js';

export const listPlans = async (_req, res) => {
  try {
    const plans = await Plan.find({ Status: "Active" }).sort({ Price: 1 });
    res.json({ success: true, data: plans });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to list plans" });
  }
};

export const createPlan = async (req, res) => {
  try {
    // Map frontend fields to database schema
    const planData = {
      Name: req.body.name || req.body.Name,
      Price: req.body.price || req.body.Price,
      "Auto Renewal Allowed": req.body.autoRenewal ? "Yes" : "No",
      Status: req.body.isActive !== false ? "Active" : "Inactive",
      type: req.body.type,
      speed: req.body.speed,
      quota: req.body.quota,
      features: req.body.features,
      description: req.body.description
    };
    
    const plan = await Plan.create(planData);
    res.status(201).json({ success: true, data: plan });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    // Map frontend fields to database schema
    const updateData = {};
    if (req.body.name || req.body.Name) updateData.Name = req.body.name || req.body.Name;
    if (req.body.price || req.body.Price) updateData.Price = req.body.price || req.body.Price;
    if (req.body.autoRenewal !== undefined) updateData["Auto Renewal Allowed"] = req.body.autoRenewal ? "Yes" : "No";
    if (req.body.isActive !== undefined) updateData.Status = req.body.isActive ? "Active" : "Inactive";
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.speed) updateData.speed = req.body.speed;
    if (req.body.quota) updateData.quota = req.body.quota;
    if (req.body.features) updateData.features = req.body.features;
    if (req.body.description) updateData.description = req.body.description;
    
    const plan = await Plan.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: plan });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, message: "Plan deleted" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
