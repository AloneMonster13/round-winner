import mongoose from "mongoose";

const competitorSchema = new mongoose.Schema({
  name: String,
  round_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Round"
  }
});

export default mongoose.model("Competitor", competitorSchema);