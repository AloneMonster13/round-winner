import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ADMIN LOGIN
    if (cleanEmail === "admin@cey.lk") {
      return res.json({
        success: true,
        role: "admin",
        email: cleanEmail,
      });
    }

    // FIND USER
    let user = await User.findOne({ email: cleanEmail });

    // IF USER NOT EXIST → CREATE
    if (!user) {
      user = new User({
        email: cleanEmail,
        role: "user",
      });

      await user.save();
      console.log("New user saved:", cleanEmail);
    }

    return res.json({
      success: true,
      role: "user",
      email: cleanEmail,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;