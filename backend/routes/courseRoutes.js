const express = require("express");
const router = express.Router();
const {
  getCourses,
  getEnrolledCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getCourses)
  .post(protect, authorize("instructor"), createCourse);

router.get("/enrolled", protect, authorize("student"), getEnrolledCourses);
router.post("/enroll", protect, authorize("student"), enrollCourse);

router
  .route("/:id")
  .get(protect, getCourse)
  .put(protect, authorize("instructor"), updateCourse)
  .delete(protect, authorize("instructor"), deleteCourse);

router.post("/:id/unenroll", protect, authorize("student"), unenrollCourse);

module.exports = router;
