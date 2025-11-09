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

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Handle normal user token
    if (decoded.id) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user;
      return next();
    }

    // ✅ Allow admin token access (if role present)
    if (decoded.role === "admin") {
      req.admin = { role: "admin" };
      return next();
    }

    return res.status(403).json({ message: "Invalid token type" });
  } catch (err) {
    console.error("❌ protect middleware error:", err.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};




// ✅ Default export (for backward compatibility)
export default protect;













