// Defines complaint CRUD, status, and assignment routes.
const express = require("express");
const complaintController = require("../controllers/complaintController");
const { protect, ROLES } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

const router = express.Router();

router.post(
  "/",
  protect([ROLES.CITIZEN]),
  uploadImage,
  complaintController.createComplaint
);
router.get("/", complaintController.getComplaints);
router.get("/:id", complaintController.getComplaintById);
router.patch(
  "/:id/status",
  protect([ROLES.OFFICER, ROLES.ADMIN]),
  complaintController.updateComplaintStatus
);
router.patch(
  "/:id/assign",
  protect([ROLES.ADMIN]),
  complaintController.assignComplaint
);
router.delete(
  "/:id",
  protect([ROLES.ADMIN, ROLES.CITIZEN]),
  complaintController.deleteComplaint
);

module.exports = router;
