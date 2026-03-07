import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  user_email: String,
  round_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Round"
  },
  competitor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competitor"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Vote", voteSchema);