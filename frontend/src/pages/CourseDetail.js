import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  courseAPI,
  materialAPI,
  assignmentAPI,
  submissionAPI,
  BASE_URL,
} from "../services/api";
import Navbar from "../components/Navbar";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("materials");
  const [loading, setLoading] = useState(true);

  // Material upload
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
    tags: "",
    file: null,
  });

  // Assignment creation
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxPoints: "",
  });

  // Submission viewing
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, materialsRes, assignmentsRes] = await Promise.all([
        courseAPI.getCourse(id),
        materialAPI.getMaterialsByCourse(id),
        assignmentAPI.getAssignmentsByCourse(id),
      ]);
      setCourse(courseRes.data);
      setMaterials(materialsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", materialForm.title);
    formData.append("description", materialForm.description);
    formData.append("courseId", id);
    formData.append(
      "tags",
      JSON.stringify(
        materialForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
    formData.append("file", materialForm.file);

    try {
      await materialAPI.uploadMaterial(formData);
      setMaterialForm({ title: "", description: "", tags: "", file: null });
      setShowMaterialForm(false);
      fetchCourseData();
    } catch (error) {
      alert("Failed to upload material");
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.createAssignment({ ...assignmentForm, courseId: id });
      setAssignmentForm({
        title: "",
        description: "",
        dueDate: "",
        maxPoints: "",
      });
      setShowAssignmentForm(false);
      fetchCourseData();
    } catch (error) {
      alert("Failed to create assignment");
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await materialAPI.deleteMaterial(materialId);
        fetchCourseData();
      } catch (error) {
        alert("Failed to delete material");
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await assignmentAPI.deleteAssignment(assignmentId);
        fetchCourseData();
      } catch (error) {
        alert("Failed to delete assignment");
      }
    }
  };

  const handleSubmitAssignment = async (assignmentId, file) => {
    // Confirmation dialog before submitting
    const confirmSubmit = window.confirm(
      `Submit the document?\n\nFile: ${file.name}\n\nOnce submitted, you cannot undo this action.`
    );

    if (!confirmSubmit) {
      return; // User cancelled the submission
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignmentId);

    try {
      await submissionAPI.submitAssignment(formData);
      alert("Assignment submitted successfully!");
      fetchCourseData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit assignment");
    }
  };

  // Fetch submissions for an assignment
  const handleViewSubmissions = async (assignment) => {
    try {
      const response = await submissionAPI.getSubmissionsByAssignment(
        assignment._id
      );
      setSelectedAssignment(assignment);
      setSubmissions(response.data);
      setShowSubmissionsModal(true);
    } catch (error) {
      alert("Failed to load submissions");
      console.error(error);
    }
  };

  // Grade a submission
  const handleGradeSubmission = async (submissionId) => {
    try {
      await submissionAPI.gradeSubmission(submissionId, {
        grade: parseFloat(gradeForm.grade),
        feedback: gradeForm.feedback,
      });
      alert("Grade submitted successfully!");
      setGradingSubmission(null);
      setGradeForm({ grade: "", feedback: "" });
      // Refresh submissions
      handleViewSubmissions(selectedAssignment);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit grade");
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

  const isInstructor = user.role === "instructor";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-blue-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">{course.name}</h1>
            <p className="text-blue-100 text-lg">{course.code}</p>
            <p className="text-blue-100 mt-2">{course.description}</p>
            {!isInstructor && (
              <p className="text-blue-100 mt-4">
                Instructor: {course.instructor?.name}
              </p>
            )}
            {isInstructor && (
              <p className="text-blue-100 mt-4">
                {course.students?.length} students enrolled
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b">
            <button
              onClick={() => setActiveTab("materials")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "materials"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Materials
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "assignments"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Assignments
            </button>
            {isInstructor && (
              <button
                onClick={() => setActiveTab("gradebook")}
                className={`px-6 py-3 font-semibold transition ${
                  activeTab === "gradebook"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Grade Book
              </button>
            )}
          </div>

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div>
              {isInstructor && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowMaterialForm(!showMaterialForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    {showMaterialForm ? "Cancel" : "+ Upload Material"}
                  </button>
                </div>
              )}

              {showMaterialForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-bold mb-4">
                    Upload New Material
                  </h2>
                  <form onSubmit={handleMaterialUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={materialForm.title}
                        onChange={(e) =>
                          setMaterialForm({
                            ...materialForm,
                            title: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={materialForm.description}
                        onChange={(e) =>
                          setMaterialForm({
                            ...materialForm,
                            description: e.target.value,
                          })
                        }
                        required
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={materialForm.tags}
                        onChange={(e) =>
                          setMaterialForm({
                            ...materialForm,
                            tags: e.target.value,
                          })
                        }
                        placeholder="lecture, week1, important"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setMaterialForm({
                            ...materialForm,
                            file: e.target.files[0],
                          })
                        }
                        required
                        className="w-full"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Upload
                    </button>
                  </form>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {materials.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-500 py-12">
                    No materials uploaded yet
                  </p>
                ) : (
                  materials.map((material) => (
                    <div
                      key={material._id}
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-800">
                          {material.title}
                        </h3>
                        {isInstructor && (
                          <button
                            onClick={() => handleDeleteMaterial(material._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {material.description}
                      </p>
                      {material.tags && material.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {material.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <a
                        href={`${BASE_URL}${material.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition text-sm"
                      >
                        Download {material.fileName}
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div>
              {isInstructor && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    {showAssignmentForm ? "Cancel" : "+ Create Assignment"}
                  </button>
                </div>
              )}

              {showAssignmentForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-bold mb-4">
                    Create New Assignment
                  </h2>
                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={assignmentForm.title}
                        onChange={(e) =>
                          setAssignmentForm({
                            ...assignmentForm,
                            title: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={assignmentForm.description}
                        onChange={(e) =>
                          setAssignmentForm({
                            ...assignmentForm,
                            description: e.target.value,
                          })
                        }
                        required
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <input
                          type="datetime-local"
                          value={assignmentForm.dueDate}
                          onChange={(e) =>
                            setAssignmentForm({
                              ...assignmentForm,
                              dueDate: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Points
                        </label>
                        <input
                          type="number"
                          value={assignmentForm.maxPoints}
                          onChange={(e) =>
                            setAssignmentForm({
                              ...assignmentForm,
                              maxPoints: e.target.value,
                            })
                          }
                          required
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Create Assignment
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-6">
                {assignments.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">
                    No assignments yet
                  </p>
                ) : (
                  assignments.map((assignment) => {
                    const dueDate = new Date(assignment.dueDate);
                    const isPastDue = dueDate < new Date();
                    const hasSubmitted = assignment.hasSubmitted;

                    return (
                      <div
                        key={assignment._id}
                        className="bg-white rounded-lg shadow-md p-6"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">
                              {assignment.title}
                            </h3>
                            <p className="text-gray-600 mt-2">
                              {assignment.description}
                            </p>
                          </div>
                          {isInstructor && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() =>
                                  handleViewSubmissions(assignment)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition"
                              >
                                View Submissions
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteAssignment(assignment._id)
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded ${
                              isPastDue
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            Due: {dueDate.toLocaleDateString()}{" "}
                            {dueDate.toLocaleTimeString()}
                          </span>
                          <span className="px-3 py-1 rounded bg-blue-100 text-blue-800">
                            Max Points: {assignment.maxPoints}
                          </span>
                          {!isInstructor && hasSubmitted && (
                            <span className="px-3 py-1 rounded bg-green-100 text-green-800">
                              ✓ Submitted
                              {assignment.submission?.grade !== null &&
                                assignment.submission?.grade !== undefined && (
                                  <span className="ml-2 font-bold">
                                    Grade: {assignment.submission.grade}/
                                    {assignment.maxPoints}
                                  </span>
                                )}
                            </span>
                          )}
                        </div>
                        {!isInstructor && !hasSubmitted && (
                          <div className="mt-4">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                              📎 Submit Your Assignment:
                            </label>
                            <input
                              type="file"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleSubmitAssignment(
                                    assignment._id,
                                    e.target.files[0]
                                  );
                                  // Reset the input so the same file can be selected again if needed
                                  e.target.value = "";
                                }
                              }}
                              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                              💡 You will be asked to confirm before submitting
                            </p>
                          </div>
                        )}
                        {assignment.submission?.feedback && (
                          <div className="mt-4 bg-blue-50 p-4 rounded">
                            <p className="text-sm font-semibold text-blue-800">
                              Instructor Feedback:
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              {assignment.submission.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Grade Book Tab (Instructor only) */}
          {activeTab === "gradebook" && isInstructor && (
            <div>
              <p className="text-center text-gray-500 py-12">
                Grade book view - Navigate to assignments to grade submissions
              </p>
            </div>
          )}
        </div>

        {/* Submissions Modal */}
        {showSubmissionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Submissions for "{selectedAssignment?.title}"
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {submissions.length} submission(s)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSubmissionsModal(false);
                      setGradingSubmission(null);
                      setGradeForm({ grade: "", feedback: "" });
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {submissions.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">
                    No submissions yet
                  </p>
                ) : (
                  <div className="space-y-6">
                    {submissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="bg-gray-50 rounded-lg p-6 border"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {submission.student?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {submission.student?.email}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Submitted:{" "}
                              {new Date(
                                submission.submittedAt
                              ).toLocaleDateString()}{" "}
                              {new Date(
                                submission.submittedAt
                              ).toLocaleTimeString()}
                            </p>
                            {submission.isLate && (
                              <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                Late Submission
                              </span>
                            )}
                          </div>
                          {submission.grade !== null &&
                          submission.grade !== undefined ? (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                {submission.grade}/
                                {selectedAssignment.maxPoints}
                              </div>
                              <button
                                onClick={() => {
                                  setGradingSubmission(submission._id);
                                  setGradeForm({
                                    grade: submission.grade,
                                    feedback: submission.feedback || "",
                                  });
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                              >
                                Edit Grade
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setGradingSubmission(submission._id);
                                setGradeForm({ grade: "", feedback: "" });
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
                            >
                              Grade
                            </button>
                          )}
                        </div>

                        {/* Download submission */}
                        <a
                          href={`${BASE_URL}${submission.fileUrl}`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm mb-4"
                        >
                          📥 Download Submission
                        </a>

                        {/* Show feedback if exists */}
                        {submission.feedback && (
                          <div className="mt-4 bg-blue-50 p-4 rounded">
                            <p className="text-sm font-semibold text-blue-800">
                              Feedback:
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              {submission.feedback}
                            </p>
                          </div>
                        )}

                        {/* Grading form */}
                        {gradingSubmission === submission._id && (
                          <div className="mt-4 bg-white p-4 rounded border-2 border-green-500">
                            <h4 className="font-bold text-gray-800 mb-3">
                              Grade Submission
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Grade (out of {selectedAssignment.maxPoints})
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={selectedAssignment.maxPoints}
                                  step="0.5"
                                  value={gradeForm.grade}
                                  onChange={(e) =>
                                    setGradeForm({
                                      ...gradeForm,
                                      grade: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Feedback (optional)
                                </label>
                                <textarea
                                  value={gradeForm.feedback}
                                  onChange={(e) =>
                                    setGradeForm({
                                      ...gradeForm,
                                      feedback: e.target.value,
                                    })
                                  }
                                  rows="3"
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                  placeholder="Enter feedback for the student..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleGradeSubmission(submission._id)
                                  }
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
                                >
                                  Submit Grade
                                </button>
                                <button
                                  onClick={() => {
                                    setGradingSubmission(null);
                                    setGradeForm({ grade: "", feedback: "" });
                                  }}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseDetail;
