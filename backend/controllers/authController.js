import User from "../models/User.js";

export const login = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ success: false, message: "Email required" });

  const cleanEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: cleanEmail });

  if (!user) return res.json({ success: false, message: "Email not authorized" });

  return res.json({ success: true, role: user.role });
};