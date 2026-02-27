const express = require("express");
const router = express.Router();
const {
  getAssignmentsByCourse,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("instructor"), createAssignment);
router.get("/course/:courseId", protect, getAssignmentsByCourse);

router
  .route("/:id")
  .get(protect, getAssignment)
  .put(protect, authorize("instructor"), updateAssignment)
  .delete(protect, authorize("instructor"), deleteAssignment);

module.exports = router;
