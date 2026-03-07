import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  round_name: String,
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Round", roundSchema);