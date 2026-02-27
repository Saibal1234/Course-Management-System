import React, { useState, useEffect } from "react";
import { gradeAPI, BASE_URL } from "../services/api";
import Navbar from "../components/Navbar";

const Grades = () => {
  const [gradesData, setGradesData] = useState([]);
  const [detailedGrades, setDetailedGrades] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await gradeAPI.getAllMyGrades();
      setGradesData(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedGrades = async (courseId) => {
    try {
      const response = await gradeAPI.getMyGrades(courseId);
      setDetailedGrades(response.data);
    } catch (error) {
      console.error("Error fetching detailed grades:", error);
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

  // Calculate overall GPA
  const calculateOverallGPA = () => {
    if (gradesData.length === 0) return 0;
    const gradePoints = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0.0,
    };
    const total = gradesData.reduce((sum, course) => {
      return sum + (gradePoints[course.summary.letterGrade] || 0);
    }, 0);
    return (total / gradesData.length).toFixed(2);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">📊 My Grade Book</h1>
            <p className="text-blue-100">
              Track your academic performance across all courses
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {gradesData.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg mb-2">
                No grades available yet
              </p>
              <p className="text-gray-400 text-sm">
                Grades will appear here once your instructor posts them
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Overall GPA Card */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Overall GPA</h2>
                    <p className="text-sm text-green-100">
                      Based on {gradesData.length} course
                      {gradesData.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold">
                      {calculateOverallGPA()}
                    </div>
                    <div className="text-sm text-green-100">out of 4.0</div>
                  </div>
                </div>
              </div>

              {/* Overview Cards */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  📚 Course Grades
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gradesData.map((courseData) => {
                    const percentage = courseData.summary.percentage;
                    const getGradeColor = (pct) => {
                      if (pct >= 90)
                        return "text-green-600 bg-green-50 border-green-200";
                      if (pct >= 80)
                        return "text-blue-600 bg-blue-50 border-blue-200";
                      if (pct >= 70)
                        return "text-yellow-600 bg-yellow-50 border-yellow-200";
                      if (pct >= 60)
                        return "text-orange-600 bg-orange-50 border-orange-200";
                      return "text-red-600 bg-red-50 border-red-200";
                    };

                    return (
                      <div
                        key={courseData.course._id}
                        onClick={() =>
                          fetchDetailedGrades(courseData.course._id)
                        }
                        className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition border-2 ${getGradeColor(
                          percentage
                        )}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1 text-lg">
                              {courseData.course.name}
                            </h3>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {courseData.course.code}
                            </span>
                          </div>
                          <div
                            className={`text-3xl font-bold ${
                              getGradeColor(percentage).split(" ")[0]
                            }`}
                          >
                            {courseData.summary.letterGrade}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 90
                                  ? "bg-green-500"
                                  : percentage >= 80
                                  ? "bg-blue-500"
                                  : percentage >= 70
                                  ? "bg-yellow-500"
                                  : percentage >= 60
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>📝 Points Earned:</span>
                            <span className="font-semibold">
                              {courseData.summary.earnedPoints}/
                              {courseData.summary.totalPoints}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>✅ Graded:</span>
                            <span className="font-semibold">
                              {courseData.summary.gradedAssignments}/
                              {courseData.summary.totalAssignments}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t text-center">
                          <span className="text-xs text-blue-600 font-semibold">
                            👆 Click to view detailed grades
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Grades */}
              {detailedGrades && (
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b-2">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                        📖 {detailedGrades.course.name}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {detailedGrades.course.code} - Detailed Grade Report
                      </p>
                    </div>
                    <button
                      onClick={() => setDetailedGrades(null)}
                      className="text-gray-500 hover:text-red-600 text-3xl font-bold transition"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
                      <p className="text-sm opacity-90 mb-1">Letter Grade</p>
                      <p className="text-4xl font-bold">
                        {detailedGrades.summary.letterGrade}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md">
                      <p className="text-sm opacity-90 mb-1">Percentage</p>
                      <p className="text-4xl font-bold">
                        {detailedGrades.summary.percentage}%
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-md">
                      <p className="text-sm opacity-90 mb-1">Points Earned</p>
                      <p className="text-3xl font-bold">
                        {detailedGrades.summary.earnedPoints}
                        <span className="text-xl">
                          /{detailedGrades.summary.totalPoints}
                        </span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-md">
                      <p className="text-sm opacity-90 mb-1">Assignments</p>
                      <p className="text-3xl font-bold">
                        {detailedGrades.summary.gradedAssignments}
                        <span className="text-xl">
                          /{detailedGrades.summary.totalAssignments}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Assignment Grades Table */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      📝 Assignment Breakdown
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Assignment
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Due Date
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Grade
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Percentage
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Submission
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {detailedGrades.grades.map((grade, index) => {
                            const percentage = grade.submission?.grade
                              ? (
                                  (grade.submission.grade /
                                    grade.assignment.maxPoints) *
                                  100
                                ).toFixed(1)
                              : null;

                            return (
                              <tr
                                key={grade.assignment._id}
                                className={`border-b hover:bg-gray-50 transition ${
                                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                              >
                                <td className="px-4 py-4">
                                  <div className="font-semibold text-gray-800">
                                    {grade.assignment.title}
                                  </div>
                                  {grade.submission?.feedback && (
                                    <div className="text-xs text-gray-600 mt-1 italic">
                                      💬 "{grade.submission.feedback}"
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600">
                                  {new Date(
                                    grade.assignment.dueDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </td>
                                <td className="px-4 py-4">
                                  {grade.submission ? (
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        grade.submission.isLate
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {grade.submission.isLate
                                        ? "⚠️ Late"
                                        : "✓ On Time"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                      ✗ Not Submitted
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  {grade.submission?.grade !== null &&
                                  grade.submission?.grade !== undefined ? (
                                    <span className="font-bold text-lg text-gray-800">
                                      {grade.submission.grade}
                                      <span className="text-sm text-gray-500">
                                        /{grade.assignment.maxPoints}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 font-semibold">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  {percentage ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            percentage >= 90
                                              ? "bg-green-500"
                                              : percentage >= 80
                                              ? "bg-blue-500"
                                              : percentage >= 70
                                              ? "bg-yellow-500"
                                              : percentage >= 60
                                              ? "bg-orange-500"
                                              : "bg-red-500"
                                          }`}
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-700">
                                        {percentage}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  {grade.submission?.fileUrl ? (
                                    <a
                                      href={`${BASE_URL}${grade.submission.fileUrl}`}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold"
                                    >
                                      📥 Download
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      —
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Grades;
