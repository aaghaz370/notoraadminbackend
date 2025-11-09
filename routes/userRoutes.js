router.get("/check-name", async (req, res) => {
  try {
    const { name } = req.query;
    const existing = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) return res.status(400).json({ message: "Username already taken" });
    res.json({ message: "Username available" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
