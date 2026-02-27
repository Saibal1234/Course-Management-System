import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseAPI, gradeAPI } from "../services/api";
import Navbar from "../components/Navbar";

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [gradesOverview, setGradesOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollCode, setEnrollCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrolledRes, allCoursesRes, gradesRes] = await Promise.all([
        courseAPI.getEnrolledCourses(),
        courseAPI.getCourses(),
        gradeAPI.getAllMyGrades(),
      ]);
      setEnrolledCourses(enrolledRes.data);
      setAllCourses(allCoursesRes.data);
      setGradesOverview(gradesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await courseAPI.enrollCourse(enrollCode);
      setEnrollCode("");
      setShowEnrollForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll in course");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  // Calculate overall statistics
  const totalCourses = enrolledCourses.length;
  const completedAssignments = gradesOverview.reduce(
    (sum, course) => sum + course.summary.submittedAssignments,
    0
  );
  const avgPercentage =
    gradesOverview.length > 0
      ? (
          gradesOverview.reduce(
            (sum, course) => sum + parseFloat(course.summary.percentage),
            0
          ) / gradesOverview.length
        ).toFixed(1)
      : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's your learning overview
            </p>
          </div>

          {/* Quick Access to Grades */}
          <Link to="/grades">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 hover:shadow-xl transition cursor-pointer">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">📊</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      View Your Grade Book
                    </h3>
                    <p className="text-purple-100">
                      Check your grades, assignments, and academic progress
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{avgPercentage}%</div>
                  <div className="text-sm text-purple-100">Overall Average</div>
                  <div className="mt-2 inline-flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                    Click to view details →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalCourses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Assignments Done</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {completedAssignments}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Average Grade</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {avgPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enroll Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowEnrollForm(!showEnrollForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {showEnrollForm ? "Cancel" : "+ Enroll in Course"}
            </button>
          </div>

          {/* Enroll Form */}
          {showEnrollForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Enroll in a Course</h2>
              <form onSubmit={handleEnroll} className="flex gap-4">
                <input
                  type="text"
                  value={enrollCode}
                  onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
                  placeholder="Enter Course Code (e.g., CS101)"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Enroll
                </button>
              </form>
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Available Courses:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allCourses.map((course) => (
                    <div
                      key={course._id}
                      className="text-sm bg-gray-50 p-2 rounded"
                    >
                      <span className="font-semibold">{course.code}</span> -{" "}
                      {course.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Courses */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              My Courses
            </h2>
            {enrolledCourses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Not enrolled in any courses yet. Use a course code to enroll!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const courseGrade = gradesOverview.find(
                    (g) => g.course._id === course._id
                  );
                  return (
                    <div
                      key={course._id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {course.name}
                        </h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block mb-3">
                          {course.code}
                        </span>
                        <p className="text-gray-600 text-sm mb-4">
                          Instructor: {course.instructor?.name}
                        </p>
                        {courseGrade && (
                          <div className="bg-gray-50 p-3 rounded mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">
                                Current Grade:
                              </span>
                              <span className="font-bold text-gray-800">
                                {courseGrade.summary.letterGrade}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Percentage:</span>
                              <span className="font-semibold">
                                {courseGrade.summary.percentage}%
                              </span>
                            </div>
                          </div>
                        )}
                        <Link
                          to={`/course/${course._id}`}
                          className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
