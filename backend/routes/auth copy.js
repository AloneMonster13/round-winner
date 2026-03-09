import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email required" });

  const cleanEmail = email.trim().toLowerCase();

  if (cleanEmail === "admin@cey.lk")
    return res.json({ success: true, role: "admin" });

  const user = await User.findOne({ email: cleanEmail });
  if (user) return res.json({ success: true, role: "user" });

  return res.json({ success: false, message: "Email not allowed" });
});

export default router;