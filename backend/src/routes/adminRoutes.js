// Defines admin-only analytics and user-management routes.
const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, ROLES } = require("../middleware/auth");

const router = express.Router();

router.use(protect([ROLES.ADMIN]));
router.get("/stats", adminController.getStats);
router.get("/trends", adminController.getTrends);
router.get("/heatmap", adminController.getHeatmap);
router.get("/users", adminController.getUsers);
router.patch("/users/:id/role", adminController.updateUserRole);

module.exports = router;
