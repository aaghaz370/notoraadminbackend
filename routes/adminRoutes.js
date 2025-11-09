import express from "express";
import Admin from "../models/Admin.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ✅ Get all admins */
router.get("/", async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
});

/* ✅ Add new admin (by Gmail) */
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Already an admin" });

    const newAdmin = await Admin.create({ email });
    res.status(201).json({ message: "Admin added", admin: newAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ✅ Delete admin */
router.delete("/:id", async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
