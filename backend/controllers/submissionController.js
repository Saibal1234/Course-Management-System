const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const path = require("path");

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private (Student)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "Please provide assignment ID" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if student is enrolled in the course
    const user = await require("../models/User").findById(req.user._id);
    if (!user.enrolledCourses.includes(assignment.course)) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (existingSubmission) {
      return res
        .status(400)
        .json({
          message:
            "Already submitted this assignment. Please delete previous submission first.",
        });
    }

    // Check if late
    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await Submission.create({
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      student: req.user._id,
      assignment: assignmentId,
      isLate,
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("student", "name email")
      .populate("assignment");

    res.status(201).json(populatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Instructor)
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if instructor owns the course
    const course = await Course.findById(assignment.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view these submissions" });
    }

    const submissions = await Submission.find({
      assignment: req.params.assignmentId,
    })
      .populate("student", "name email")
      .populate("assignment")
      .sort("-submittedAt");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's own submissions
// @route   GET /api/submissions/my
// @access  Private (Student)
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate("assignment")
      .populate({
        path: "assignment",
        populate: { path: "course", select: "name code" },
      })
      .sort("-submittedAt");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Instructor)
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    let submission = await Submission.findById(req.params.id).populate(
      "assignment"
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check if instructor owns the course
    const course = await Course.findById(submission.assignment.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to grade this submission" });
    }

    // Validate grade
    if (grade !== null && grade !== undefined) {
      if (grade < 0 || grade > submission.assignment.maxPoints) {
        return res.status(400).json({
          message: `Grade must be between 0 and ${submission.assignment.maxPoints}`,
        });
      }
    }

    submission.grade = grade;
    submission.feedback = feedback || "";
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user._id;

    await submission.save();

    submission = await Submission.findById(submission._id)
      .populate("student", "name email")
      .populate("assignment")
      .populate("gradedBy", "name email");

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Student - own submission)
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check ownership
    if (submission.student.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this submission" });
    }

    // Delete file from filesystem
    const fs = require("fs");
    const filePath = path.join(__dirname, "..", submission.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await submission.deleteOne();

    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("student", "name email")
      .populate("assignment")
      .populate("gradedBy", "name email");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check access
    if (req.user.role === "student") {
      if (submission.student._id.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this submission" });
      }
    } else if (req.user.role === "instructor") {
      const assignment = await Assignment.findById(submission.assignment._id);
      const course = await Course.findById(assignment.course);
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this submission" });
      }
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
