const express = require("express");
const router = express.Router();
const {
  getMaterialsByCourse,
  uploadMaterial,
  deleteMaterial,
  updateMaterial,
} = require("../controllers/materialController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post(
  "/",
  protect,
  authorize("instructor"),
  upload.single("file"),
  uploadMaterial
);
router.get("/course/:courseId", protect, getMaterialsByCourse);

router
  .route("/:id")
  .put(protect, authorize("instructor"), updateMaterial)
  .delete(protect, authorize("instructor"), deleteMaterial);

module.exports = router;
