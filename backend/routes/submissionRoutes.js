const express = require("express");
const router = express.Router();
const {
  submitAssignment,
  getSubmissionsByAssignment,
  getMySubmissions,
  gradeSubmission,
  deleteSubmission,
  getSubmission,
} = require("../controllers/submissionController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post(
  "/",
  protect,
  authorize("student"),
  upload.single("file"),
  submitAssignment
);
router.get("/my", protect, authorize("student"), getMySubmissions);
router.get(
  "/assignment/:assignmentId",
  protect,
  authorize("instructor"),
  getSubmissionsByAssignment
);

router
  .route("/:id")
  .get(protect, getSubmission)
  .delete(protect, authorize("student"), deleteSubmission);

router.put("/:id/grade", protect, authorize("instructor"), gradeSubmission);

module.exports = router;
