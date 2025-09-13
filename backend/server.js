// Basic Express server setup
const cors = require("cors");
app.use(cors());
const express = require("express");
const app = express();
app.use(express.json());

// In-memory data models (simulate database)
let plans = [
  {
    id: 1,
    name: "Fibernet Basic",
    price: 59.99,
    autoRenewal: true,
    status: "Active",
    subscribers: 234,
    revenue: 14037.66,
    description: "High-speed internet with unlimited data",
    features: ["Unlimited data", "24/7 support", "Free installation"],
    discounts: [],
  },
  {
    id: 2,
    name: "Fibernet Premium",
    price: 89.99,
    autoRenewal: true,
    status: "Active",
    subscribers: 189,
    revenue: 17007.11,
    description: "Premium high-speed internet for heavy users",
    features: ["Unlimited data", "Priority support", "Free installation"],
    discounts: [],
  },
  {
    id: 3,
    name: "Broadband Copper",
    price: 39.99,
    autoRenewal: false,
    status: "Active",
    subscribers: 156,
    revenue: 6238.44,
    description: "Affordable copper broadband for basic needs",
    features: ["Limited data", "Standard support"],
    discounts: [],
  },
  {
    id: 4,
    name: "Fibernet Pro",
    price: 129.99,
    autoRenewal: true,
    status: "Active",
    subscribers: 89,
    revenue: 11569.11,
    description: "Professional-grade internet for businesses",
    features: ["Unlimited data", "Business support", "Free installation"],
    discounts: [],
  },
  {
    id: 5,
    name: "Business Basic",
    price: 199.99,
    autoRenewal: true,
    status: "Inactive",
    subscribers: 45,
    revenue: 8999.55,
    description: "Basic business plan for small offices",
    features: ["Unlimited data", "Business support"],
    discounts: [],
  },
];

let users = [
  {
    id: 1,
    username: "johnsmith",
    role: "user",
    status: "active",
    subscriptions: [
      { planId: 2, status: "active", usage: 50, autoRenew: true },
    ],
    totalSpent: 980.89,
  },
  {
    id: 2,
    username: "sarahj",
    role: "user",
    status: "active",
    subscriptions: [
      { planId: 1, status: "active", usage: 30, autoRenew: true },
    ],
    totalSpent: 599.99,
  },
  {
    id: 3,
    username: "admin1",
    role: "admin",
    status: "active",
    subscriptions: [],
    totalSpent: 0,
  },
];

// Start server
// --- Plans API ---
// Get all plans
app.get("/api/plans", (req, res) => {
  res.json(plans);
});

// Get a single plan by id
app.get("/api/plans/:id", (req, res) => {
  const plan = plans.find((p) => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: "Plan not found" });
  res.json(plan);
});

// Create a new plan
app.post("/api/plans", (req, res) => {
  const { name, price, autoRenewal, status, description, features } = req.body;
  const newPlan = {
    id: plans.length ? plans[plans.length - 1].id + 1 : 1,
    name,
    price: parseFloat(price),
    autoRenewal: !!autoRenewal,
    status: status || "Active",
    subscribers: 0,
    revenue: 0,
    description: description || "",
    features: Array.isArray(features)
      ? features
      : features
      ? features.split("\n")
      : [],
    discounts: [],
  };
  plans.push(newPlan);
  res.status(201).json(newPlan);
});

// Update a plan
app.put("/api/plans/:id", (req, res) => {
  const plan = plans.find((p) => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: "Plan not found" });
  const { name, price, autoRenewal, status, description, features } = req.body;
  plan.name = name ?? plan.name;
  plan.price = price !== undefined ? parseFloat(price) : plan.price;
  plan.autoRenewal =
    autoRenewal !== undefined ? !!autoRenewal : plan.autoRenewal;
  plan.status = status ?? plan.status;
  plan.description = description ?? plan.description;
  plan.features = Array.isArray(features)
    ? features
    : features
    ? features.split("\n")
    : plan.features;
  res.json(plan);
});

// Delete a plan
app.delete("/api/plans/:id", (req, res) => {
  const idx = plans.findIndex((p) => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Plan not found" });
  const removed = plans.splice(idx, 1);
  res.json(removed[0]);
});

// --- Users API ---
// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Get a single user by id
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Create a new user
app.post("/api/users", (req, res) => {
  const { username, role } = req.body;
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username,
    role: role || "user",
    subscriptions: [],
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update a user
app.put("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  const { username, role } = req.body;
  user.username = username ?? user.username;
  user.role = role ?? user.role;
  res.json(user);
});

// Delete a user
app.delete("/api/users/:id", (req, res) => {
  const idx = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  const removed = users.splice(idx, 1);
  res.json(removed[0]);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
