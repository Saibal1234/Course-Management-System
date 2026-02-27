const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Submission = require("../models/Submission");

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getAssignmentsByCourse = async (req, res) => {
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

    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate("createdBy", "name email")
      .sort("-createdAt");

    // If student, include their submission status
    if (req.user.role === "student") {
      const assignmentsWithStatus = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await Submission.findOne({
            assignment: assignment._id,
            student: req.user._id,
          });
          return {
            ...assignment.toObject(),
            hasSubmitted: !!submission,
            submission: submission || null,
          };
        })
      );
      return res.json(assignmentsWithStatus);
    }

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("course");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Instructor)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, maxPoints, courseId } = req.body;

    if (!title || !description || !dueDate || !maxPoints || !courseId) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: "Not authorized to create assignments for this course",
        });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      maxPoints,
      course: courseId,
      createdBy: req.user._id,
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("createdBy", "name email")
      .populate("course");

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Instructor - own assignment)
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this assignment" });
    }

    const { title, description, dueDate, maxPoints } = req.body;

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, maxPoints },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("course");

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Instructor - own assignment)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check ownership
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this assignment" });
    }

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignment: assignment._id });

    await assignment.deleteOne();

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
