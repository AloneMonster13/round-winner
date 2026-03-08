import express from "express";

const router = express.Router();

const allowedEmails = [
  "admin@cey.lk",
  "judge1@cey.lk",
  "judge2@cey.lk",
  "judge3@cey.lk"
];

router.post("/login", (req, res) => {

  const { email } = req.body;

  if (!allowedEmails.includes(email)) {
    return res.json({
      success: false
    });
  }

  const role = email === "admin@cey.lk" ? "admin" : "voter";

  res.json({
    success: true,
    role
  });

});

export default router;