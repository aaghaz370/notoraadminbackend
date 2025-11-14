import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * ✅ Protect middleware for website users (not admin)
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🧩 No token case
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 🧩 Verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧩 Find user in DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Website Auth Error:", error.message);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};


export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin)
    return res.status(403).json({ message: "Admin only" });
  next();
};
