const express = require("express");
const router = express.Router();
const {
  getMyGrades,
  getCourseGradeBook,
  getAllMyGrades,
} = require("../controllers/gradeController");
const { protect, authorize } = require("../middleware/auth");

router.get("/my", protect, authorize("student"), getAllMyGrades);
router.get("/my/:courseId", protect, authorize("student"), getMyGrades);
router.get(
  "/course/:courseId",
  protect,
  authorize("instructor"),
  getCourseGradeBook
);

module.exports = router;
