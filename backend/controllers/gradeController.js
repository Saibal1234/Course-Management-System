const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const User = require("../models/User");

// @desc    Get grades for a course (Student view - own grades)
// @route   GET /api/grades/my/:courseId
// @access  Private (Student)
exports.getMyGrades = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if enrolled
    const user = await User.findById(req.user._id);
    if (!user.enrolledCourses.includes(course._id)) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // Get all assignments for this course
    const assignments = await Assignment.find({
      course: req.params.courseId,
    }).sort("dueDate");

    // Get all submissions for this student in this course
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: req.user._id,
    }).populate("assignment");

    // Calculate grades
    let totalPoints = 0;
    let earnedPoints = 0;
    let gradedAssignments = 0;

    const gradesData = assignments.map((assignment) => {
      const submission = submissions.find(
        (s) => s.assignment._id.toString() === assignment._id.toString()
      );

      totalPoints += assignment.maxPoints;

      if (
        submission &&
        submission.grade !== null &&
        submission.grade !== undefined
      ) {
        earnedPoints += submission.grade;
        gradedAssignments++;
      }

      return {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          maxPoints: assignment.maxPoints,
          dueDate: assignment.dueDate,
        },
        submission: submission
          ? {
              _id: submission._id,
              grade: submission.grade,
              feedback: submission.feedback,
              submittedAt: submission.submittedAt,
              isLate: submission.isLate,
              gradedAt: submission.gradedAt,
            }
          : null,
      };
    });

    // Calculate letter grade
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    let letterGrade = "N/A";

    if (gradedAssignments > 0) {
      if (percentage >= 90) letterGrade = "A";
      else if (percentage >= 80) letterGrade = "B";
      else if (percentage >= 70) letterGrade = "C";
      else if (percentage >= 60) letterGrade = "D";
      else letterGrade = "F";
    }

    res.json({
      course: {
        _id: course._id,
        name: course.name,
        code: course.code,
      },
      summary: {
        totalPoints,
        earnedPoints,
        percentage: percentage.toFixed(2),
        letterGrade,
        totalAssignments: assignments.length,
        submittedAssignments: submissions.length,
        gradedAssignments,
      },
      grades: gradesData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get grade book for a course (Instructor view - all students)
// @route   GET /api/grades/course/:courseId
// @access  Private (Instructor)
exports.getCourseGradeBook = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate(
      "students",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this grade book" });
    }

    // Get all assignments for this course
    const assignments = await Assignment.find({
      course: req.params.courseId,
    }).sort("dueDate");

    // Get all submissions for this course
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
    }).populate("student", "name email");

    // Organize data by student
    const gradeBook = course.students.map((student) => {
      let totalPoints = 0;
      let earnedPoints = 0;
      let gradedAssignments = 0;

      const studentGrades = assignments.map((assignment) => {
        const submission = submissions.find(
          (s) =>
            s.assignment.toString() === assignment._id.toString() &&
            s.student._id.toString() === student._id.toString()
        );

        totalPoints += assignment.maxPoints;

        if (
          submission &&
          submission.grade !== null &&
          submission.grade !== undefined
        ) {
          earnedPoints += submission.grade;
          gradedAssignments++;
        }

        return {
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          maxPoints: assignment.maxPoints,
          grade: submission?.grade || null,
          submitted: !!submission,
          isLate: submission?.isLate || false,
        };
      });

      const percentage =
        totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      let letterGrade = "N/A";

      if (gradedAssignments > 0) {
        if (percentage >= 90) letterGrade = "A";
        else if (percentage >= 80) letterGrade = "B";
        else if (percentage >= 70) letterGrade = "C";
        else if (percentage >= 60) letterGrade = "D";
        else letterGrade = "F";
      }

      return {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
        },
        grades: studentGrades,
        summary: {
          totalPoints,
          earnedPoints,
          percentage: percentage.toFixed(2),
          letterGrade,
          gradedAssignments,
        },
      };
    });

    res.json({
      course: {
        _id: course._id,
        name: course.name,
        code: course.code,
      },
      assignments: assignments.map((a) => ({
        _id: a._id,
        title: a.title,
        maxPoints: a.maxPoints,
        dueDate: a.dueDate,
      })),
      gradeBook,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all grades overview for student
// @route   GET /api/grades/my
// @access  Private (Student)
exports.getAllMyGrades = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("enrolledCourses");

    const gradesOverview = await Promise.all(
      user.enrolledCourses.map(async (course) => {
        const assignments = await Assignment.find({ course: course._id });
        const assignmentIds = assignments.map((a) => a._id);
        const submissions = await Submission.find({
          assignment: { $in: assignmentIds },
          student: req.user._id,
        });

        let totalPoints = 0;
        let earnedPoints = 0;
        let gradedAssignments = 0;

        assignments.forEach((assignment) => {
          totalPoints += assignment.maxPoints;
          const submission = submissions.find(
            (s) => s.assignment.toString() === assignment._id.toString()
          );
          if (
            submission &&
            submission.grade !== null &&
            submission.grade !== undefined
          ) {
            earnedPoints += submission.grade;
            gradedAssignments++;
          }
        });

        const percentage =
          totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        let letterGrade = "N/A";

        if (gradedAssignments > 0) {
          if (percentage >= 90) letterGrade = "A";
          else if (percentage >= 80) letterGrade = "B";
          else if (percentage >= 70) letterGrade = "C";
          else if (percentage >= 60) letterGrade = "D";
          else letterGrade = "F";
        }

        return {
          course: {
            _id: course._id,
            name: course.name,
            code: course.code,
          },
          summary: {
            totalPoints,
            earnedPoints,
            percentage: percentage.toFixed(2),
            letterGrade,
            totalAssignments: assignments.length,
            submittedAssignments: submissions.length,
            gradedAssignments,
          },
        };
      })
    );

    res.json(gradesOverview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
