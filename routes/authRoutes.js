import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
// Update user name or password
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
