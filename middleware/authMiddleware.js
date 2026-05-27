import { verifyToken } from "../config/jwt.js";

/**
 * Protect routes — verifies JWT and attaches admin to req
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please login again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    return res.status(401).json({ success: false, message: "Authentication failed." });
  }
};

/**
 * Optional auth — attaches admin if token present, but doesn't block
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.admin = verifyToken(token);
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};
