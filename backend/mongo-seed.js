require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Course = require("./models/Course");
const Material = require("./models/Material");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Material.deleteMany();
    await Assignment.deleteMany();
    await Submission.deleteMany();

    console.log("Cleared existing data");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Create Instructors
    const instructors = await User.insertMany([
      {
        name: "Dr. John Smith",
        email: "john.smith@university.edu",
        password: hashedPassword,
        role: "instructor",
      },
      {
        name: "Prof. Sarah Johnson",
        email: "sarah.johnson@university.edu",
        password: hashedPassword,
        role: "instructor",
      },
    ]);

    console.log("Created instructors");

    // Create Students
    const students = await User.insertMany([
      {
        name: "Alice Brown",
        email: "alice.brown@student.edu",
        password: hashedPassword,
        role: "student",
      },
      {
        name: "Bob Wilson",
        email: "bob.wilson@student.edu",
        password: hashedPassword,
        role: "student",
      },
      {
        name: "Charlie Davis",
        email: "charlie.davis@student.edu",
        password: hashedPassword,
        role: "student",
      },
      {
        name: "Diana Martinez",
        email: "diana.martinez@student.edu",
        password: hashedPassword,
        role: "student",
      },
    ]);

    console.log("Created students");

    // Create Courses
    const courses = await Course.insertMany([
      {
        name: "Introduction to Computer Science",
        description:
          "Fundamental concepts of computer science including algorithms, data structures, and programming.",
        code: "CS101",
        instructor: instructors[0]._id,
        students: [students[0]._id, students[1]._id, students[2]._id],
      },
      {
        name: "Web Development Fundamentals",
        description:
          "Learn HTML, CSS, JavaScript, and modern web frameworks to build interactive web applications.",
        code: "WEB201",
        instructor: instructors[1]._id,
        students: [students[1]._id, students[2]._id, students[3]._id],
      },
      {
        name: "Database Systems",
        description:
          "Comprehensive study of database design, SQL, NoSQL, and database management systems.",
        code: "DB301",
        instructor: instructors[0]._id,
        students: [students[0]._id, students[3]._id],
      },
    ]);

    console.log("Created courses");

    // Update students' enrolledCourses
    await User.findByIdAndUpdate(students[0]._id, {
      enrolledCourses: [courses[0]._id, courses[2]._id],
    });
    await User.findByIdAndUpdate(students[1]._id, {
      enrolledCourses: [courses[0]._id, courses[1]._id],
    });
    await User.findByIdAndUpdate(students[2]._id, {
      enrolledCourses: [courses[0]._id, courses[1]._id],
    });
    await User.findByIdAndUpdate(students[3]._id, {
      enrolledCourses: [courses[1]._id, courses[2]._id],
    });

    console.log("Updated student enrollments");

    // Create Materials
    const materials = await Material.insertMany([
      {
        title: "Course Syllabus",
        description:
          "Complete syllabus for CS101 including topics, grading policy, and schedule.",
        fileUrl: "/uploads/sample-syllabus.pdf",
        fileType: "application/pdf",
        fileName: "CS101-Syllabus.pdf",
        uploadedBy: instructors[0]._id,
        course: courses[0]._id,
        tags: ["syllabus", "introduction"],
      },
      {
        title: "Week 1 Lecture Notes",
        description:
          "Introduction to programming concepts and computational thinking.",
        fileUrl: "/uploads/week1-notes.pdf",
        fileType: "application/pdf",
        fileName: "Week1-Lecture.pdf",
        uploadedBy: instructors[0]._id,
        course: courses[0]._id,
        tags: ["lecture", "week1"],
      },
      {
        title: "HTML & CSS Basics",
        description: "Comprehensive guide to HTML5 and CSS3 fundamentals.",
        fileUrl: "/uploads/html-css-guide.pdf",
        fileType: "application/pdf",
        fileName: "HTML-CSS-Guide.pdf",
        uploadedBy: instructors[1]._id,
        course: courses[1]._id,
        tags: ["html", "css", "tutorial"],
      },
      {
        title: "JavaScript Introduction",
        description: "Getting started with JavaScript programming language.",
        fileUrl: "/uploads/js-intro.pdf",
        fileType: "application/pdf",
        fileName: "JavaScript-Intro.pdf",
        uploadedBy: instructors[1]._id,
        course: courses[1]._id,
        tags: ["javascript", "programming"],
      },
      {
        title: "SQL Fundamentals",
        description: "Introduction to SQL queries and database operations.",
        fileUrl: "/uploads/sql-fundamentals.pdf",
        fileType: "application/pdf",
        fileName: "SQL-Fundamentals.pdf",
        uploadedBy: instructors[0]._id,
        course: courses[2]._id,
        tags: ["sql", "database"],
      },
    ]);

    console.log("Created materials");

    // Create Assignments
    const now = new Date();
    const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const farFutureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    const assignments = await Assignment.insertMany([
      {
        title: "Programming Assignment 1",
        description:
          "Write a program to implement basic sorting algorithms (bubble sort, selection sort).",
        dueDate: pastDate,
        maxPoints: 100,
        course: courses[0]._id,
        createdBy: instructors[0]._id,
      },
      {
        title: "Data Structures Quiz",
        description: "Complete the quiz on arrays, linked lists, and stacks.",
        dueDate: futureDate,
        maxPoints: 50,
        course: courses[0]._id,
        createdBy: instructors[0]._id,
      },
      {
        title: "Build a Portfolio Website",
        description:
          "Create a personal portfolio website using HTML, CSS, and JavaScript.",
        dueDate: futureDate,
        maxPoints: 150,
        course: courses[1]._id,
        createdBy: instructors[1]._id,
      },
      {
        title: "JavaScript Functions Exercise",
        description:
          "Complete the exercises on functions, closures, and callbacks.",
        dueDate: farFutureDate,
        maxPoints: 75,
        course: courses[1]._id,
        createdBy: instructors[1]._id,
      },
      {
        title: "Database Design Project",
        description:
          "Design and implement a database schema for a library management system.",
        dueDate: farFutureDate,
        maxPoints: 200,
        course: courses[2]._id,
        createdBy: instructors[0]._id,
      },
    ]);

    console.log("Created assignments");

    // Create Submissions
    const submissions = await Submission.insertMany([
      {
        fileUrl: "/uploads/alice-assignment1.pdf",
        fileName: "alice-sorting-algorithms.pdf",
        submittedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        isLate: false,
        student: students[0]._id,
        assignment: assignments[0]._id,
        grade: 95,
        feedback: "Excellent work! Your implementation is clean and efficient.",
        gradedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        gradedBy: instructors[0]._id,
      },
      {
        fileUrl: "/uploads/bob-assignment1.pdf",
        fileName: "bob-sorting-algorithms.pdf",
        submittedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        isLate: true,
        student: students[1]._id,
        assignment: assignments[0]._id,
        grade: 75,
        feedback:
          "Good effort, but submitted late. Please review the time complexity analysis.",
        gradedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        gradedBy: instructors[0]._id,
      },
      {
        fileUrl: "/uploads/charlie-assignment1.pdf",
        fileName: "charlie-sorting-algorithms.pdf",
        submittedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        isLate: false,
        student: students[2]._id,
        assignment: assignments[0]._id,
        grade: 88,
        feedback: "Well done! Minor improvements needed in documentation.",
        gradedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        gradedBy: instructors[0]._id,
      },
      {
        fileUrl: "/uploads/bob-portfolio.zip",
        fileName: "bob-portfolio-website.zip",
        submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        isLate: false,
        student: students[1]._id,
        assignment: assignments[2]._id,
        grade: 140,
        feedback:
          "Great design and functionality! Creative use of CSS animations.",
        gradedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        gradedBy: instructors[1]._id,
      },
      {
        fileUrl: "/uploads/charlie-portfolio.zip",
        fileName: "charlie-portfolio-website.zip",
        submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        isLate: false,
        student: students[2]._id,
        assignment: assignments[2]._id,
        feedback: null,
        grade: null,
      },
      {
        fileUrl: "/uploads/diana-portfolio.zip",
        fileName: "diana-portfolio-website.zip",
        submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        isLate: false,
        student: students[3]._id,
        assignment: assignments[2]._id,
        grade: 145,
        feedback: "Outstanding work! Very professional and responsive design.",
        gradedAt: now,
        gradedBy: instructors[1]._id,
      },
    ]);

    console.log("Created submissions");

    console.log("\n========================================");
    console.log("SEED DATA CREATED SUCCESSFULLY!");
    console.log("========================================");
    console.log("\nLogin Credentials (password for all: password123):");
    console.log("\nINSTRUCTORS:");
    console.log("1. Email: john.smith@university.edu");
    console.log("2. Email: sarah.johnson@university.edu");
    console.log("\nSTUDENTS:");
    console.log("1. Email: alice.brown@student.edu");
    console.log("2. Email: bob.wilson@student.edu");
    console.log("3. Email: charlie.davis@student.edu");
    console.log("4. Email: diana.martinez@student.edu");
    console.log("\nCOURSES:");
    console.log("1. CS101 - Introduction to Computer Science");
    console.log("2. WEB201 - Web Development Fundamentals");
    console.log("3. DB301 - Database Systems");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

connectDB().then(seedData);
