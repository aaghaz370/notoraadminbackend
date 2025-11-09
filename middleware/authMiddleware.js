import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Protect normal user routes (website users)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normal user token includes user.id
    if (decoded.id) {
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }
      return next();
    }

    // If it's an admin token (no user ID, but role)
    if (decoded.role === "admin") {
      req.admin = { role: "admin" };
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

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("❌ adminProtect error:", err.message);
    res.status(403).json({ message: "Invalid admin token" });
  }
};

// ✅ Default export (for backward compatibility)
export default protect;








