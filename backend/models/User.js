import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "user" }, // always 'user' for now
});

export default mongoose.model("User", UserSchema);