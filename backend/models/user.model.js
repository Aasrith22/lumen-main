import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: { 
        type: String, 
        required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true },
    phoneNumber: { 
        type: String, 
        required: true },
    password: { 
        type: String, 
        required: true },
    role:
        { 
            type: String, 
            required: true, 
            default: "user" },
    profile: {
        profilePhoto: { type: String, default: "" }
    },
    preferences: {
        preferredQuota: { type: Number, default: 0 },
        preferredPriceRange: { type: Number, default: 0 }
    },
    notifications: {
        renewalAlerts: { type: Boolean, default: true },
        offerAlerts: { type: Boolean, default: true }
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
