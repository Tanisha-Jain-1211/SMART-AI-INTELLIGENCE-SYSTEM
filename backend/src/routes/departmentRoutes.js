// Defines department creation and listing routes.
const express = require("express");
const departmentController = require("../controllers/departmentController");
const { protect, ROLES } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect([ROLES.ADMIN]), departmentController.createDepartment);
router.get("/", departmentController.getDepartments);

module.exports = router;
