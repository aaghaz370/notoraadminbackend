import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware for protecting user routes
const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user)
        return res.status(404).json({ message: "User not found" });

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res
        .status(401)
        .json({ message: "Not authorized, token verification failed" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

// ✅ Export default (so admin and user imports stay consistent)
export default authMiddleware;

// ✅ (Optional) Named export if you want to use { protect } style
export { authMiddleware as protect };




// ✅ Admin protect middleware
export const adminProtect = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admin only" });
  }
};






