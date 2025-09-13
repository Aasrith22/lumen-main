import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending"],
      default: "pending",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "Subscriptions", // Match collection from image
  }
);

// When a new subscription is created, set an end date based on a monthly cycle
subscriptionSchema.pre("save", function (next) {
  if (this.isNew && this.status === "active") {
    this.startDate = new Date();
    // Set end date to 1 month from start date
    this.endDate = new Date(
      this.startDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
  }
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
