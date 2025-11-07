import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Simple admin login endpoint
router.post("/login", (req, res) => {
  const { password } = req.body;

  if (!password)
    return res.status(400).json({ message: "Password required" });

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ message: "ok" });
  }

  return res.status(401).json({ message: "Invalid password" });
});

export default router;
