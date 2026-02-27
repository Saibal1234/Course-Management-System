const Course = require("../models/Course");
const User = require("../models/User");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    let courses;

    if (req.user.role === "instructor") {
      // Instructors see only their courses
      courses = await Course.find({ instructor: req.user._id })
        .populate("instructor", "name email")
        .populate("students", "name email");
    } else {
      // Students see all available courses
      courses = await Course.find()
        .populate("instructor", "name email")
        .select("-students");
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get enrolled courses for student
// @route   GET /api/courses/enrolled
// @access  Private (Student)
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "enrolledCourses",
      populate: { path: "instructor", select: "name email" },
    });

    res.json(user.enrolledCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("students", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check access
    if (req.user.role === "student") {
      const isEnrolled = course.students.some(
        (student) => student._id.toString() === req.user._id.toString()
      );
      if (!isEnrolled) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }
    } else if (req.user.role === "instructor") {
      if (course.instructor._id.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to access this course" });
      }
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor)
exports.createCourse = async (req, res) => {
  try {
    const { name, description, code } = req.body;

    if (!name || !description || !code) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if code already exists
    const codeExists = await Course.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({ message: "Course code already exists" });
    }

    const course = await Course.create({
      name,
      description,
      code: code.toUpperCase(),
      instructor: req.user._id,
    });

    const populatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name email"
    );

    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor - own course)
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    const { name, description, code } = req.body;

    // If code is being changed, check uniqueness
    if (code && code.toUpperCase() !== course.code) {
      const codeExists = await Course.findOne({ code: code.toUpperCase() });
      if (codeExists) {
        return res.status(400).json({ message: "Course code already exists" });
      }
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, description, code: code?.toUpperCase() },
      { new: true, runValidators: true }
    ).populate("instructor", "name email");

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor - own course)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    // Remove course from enrolled students
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    await course.deleteOne();

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/enroll
// @access  Private (Student)
exports.enrollCourse = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Please provide course code" });
    }

    const course = await Course.findOne({ code: code.toUpperCase() });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found with that code" });
    }

    // Check if already enrolled
    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(course._id)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Add student to course
    course.students.push(req.user._id);
    await course.save();

    // Add course to student's enrolled courses
    user.enrolledCourses.push(course._id);
    await user.save();

    const populatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name email"
    );

    res.json({ message: "Enrolled successfully", course: populatedCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unenroll from course
// @route   POST /api/courses/:id/unenroll
// @access  Private (Student)
exports.unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Remove student from course
    course.students = course.students.filter(
      (student) => student.toString() !== req.user._id.toString()
    );
    await course.save();

    // Remove course from student's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: course._id },
    });

    res.json({ message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
