const Material = require("../models/Material");
const Course = require("../models/Course");
const path = require("path");

// @desc    Get all materials for a course
// @route   GET /api/materials/course/:courseId
// @access  Private
exports.getMaterialsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check access
    if (req.user.role === "student") {
      const user = await require("../models/User").findById(req.user._id);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }
    } else if (req.user.role === "instructor") {
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to access this course" });
      }
    }

    const materials = await Material.find({ course: req.params.courseId })
      .populate("uploadedBy", "name email")
      .sort("-uploadedAt");

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload new material
// @route   POST /api/materials
// @access  Private (Instructor)
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, description, courseId, tags } = req.body;

    if (!title || !description || !courseId) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to upload materials to this course" });
    }

    const material = await Material.create({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
      course: courseId,
      tags: tags ? JSON.parse(tags) : [],
    });

    const populatedMaterial = await Material.findById(material._id).populate(
      "uploadedBy",
      "name email"
    );

    res.status(201).json(populatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Instructor - own material)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Check ownership
    if (material.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this material" });
    }

    // Delete file from filesystem
    const fs = require("fs");
    const filePath = path.join(__dirname, "..", material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await material.deleteOne();

    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Instructor - own material)
exports.updateMaterial = async (req, res) => {
  try {
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Check ownership
    if (material.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this material" });
    }

    const { title, description, tags } = req.body;

    material = await Material.findByIdAndUpdate(
      req.params.id,
      { title, description, tags: tags ? JSON.parse(tags) : material.tags },
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email");

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
