import mongoose from "mongoose";

const competitorSchema = new mongoose.Schema({
  name: String,
  round_id: String,
  photo: String // NEW FIELD
});

export default mongoose.model("Competitor", competitorSchema);