import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    // Fields from user's schema
    "Product Id": {
      type: Number,
      required: true,
      unique: true,
      default: () => Math.floor(1000 + Math.random() * 9000),
    },
    Name: { type: String, required: true, trim: true },
    Price: { type: Number, required: true },
    "Auto Renewal Allowed": { type: String, enum: ["Yes", "No"], default: "Yes" },
    Status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // Additional fields from previous implementation that might be useful
    type: { type: String, default: "Fibernet" }, // e.g., Fibernet, 5G, Copper
    speed: { type: String, default: "100 Mbps" },
    quota: { type: Number, default: 100 }, // in GB
    features: [{ type: String }],
    description: { type: String },
  },
  {
    timestamps: true,
    collection: "plans",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for isActive to maintain compatibility with other parts of the code
planSchema.virtual("isActive").get(function () {
  return this.Status === "Active";
});

// Virtual for name, price to maintain compatibility
planSchema.virtual("name").get(function () {
  return this.Name;
});
planSchema.virtual("price").get(function () {
  return this.Price;
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
