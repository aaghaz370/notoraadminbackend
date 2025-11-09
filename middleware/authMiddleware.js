import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Protect normal user routes (for website users)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧩 Case 1: Normal user token (has id)
    if (decoded.id) {
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }
      return next();
    }

    // 🧩 Case 2: Admin token (role-based)
    if (decoded.role === "admin") {
      req.user = { isAdmin: true, role: "admin", email: "admin@notora" };
      return next();
    }

    return res.status(403).json({ message: "Invalid token type" });
  } catch (err) {
    console.error("❌ protect middleware error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ✅ Admin-only middleware (for /api/donations etc)
export const adminProtect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Allow if token is admin type
    if (decoded.role === "admin") {
      req.admin = { role: "admin" };
      return next();
    }

    // ✅ Also allow if logged-in user is marked admin
    if (req.user && req.user.isAdmin) {
      return next();
    }

    res.status(403).json({ message: "Access denied: Admins only" });
  } catch (err) {
    console.error("❌ adminProtect error:", err.message);
    res.status(403).json({ message: "Invalid admin token" });
  }
};

// ✅ Default export (for backward compatibility)
export default protect;










