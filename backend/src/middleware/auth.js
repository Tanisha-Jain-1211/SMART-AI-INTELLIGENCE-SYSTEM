// Provides role-aware JWT authentication middleware for protected routes.
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prismaClient");

const ROLES = {
  CITIZEN: "CITIZEN",
  OFFICER: "OFFICER",
  ADMIN: "ADMIN"
};

const protect = (roles = []) =>
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication token is required"
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token"
        });
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden"
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };

module.exports = { protect, ROLES };
