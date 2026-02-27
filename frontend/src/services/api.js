import axios from "axios";

export const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

// Course APIs
export const courseAPI = {
  getCourses: () => api.get("/courses"),
  getEnrolledCourses: () => api.get("/courses/enrolled"),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post("/courses", courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (code) => api.post("/courses/enroll", { code }),
  unenrollCourse: (id) => api.post(`/courses/${id}/unenroll`),
};

// Material APIs
export const materialAPI = {
  getMaterialsByCourse: (courseId) =>
    api.get(`/materials/course/${courseId}`),
  uploadMaterial: (formData) =>
    api.post("/materials", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateMaterial: (id, materialData) =>
    api.put(`/materials/${id}`, materialData),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
};

// Assignment APIs
export const assignmentAPI = {
  getAssignmentsByCourse: (courseId) =>
    api.get(`/assignments/course/${courseId}`),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (assignmentData) =>
    api.post("/assignments", assignmentData),
  updateAssignment: (id, assignmentData) =>
    api.put(`/assignments/${id}`, assignmentData),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
};

// Submission APIs
export const submissionAPI = {
  submitAssignment: (formData) =>
    api.post("/submissions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMySubmissions: () => api.get("/submissions/my"),
  getSubmissionsByAssignment: (assignmentId) =>
    api.get(`/submissions/assignment/${assignmentId}`),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  gradeSubmission: (id, gradeData) =>
    api.put(`/submissions/${id}/grade`, gradeData),
  deleteSubmission: (id) => api.delete(`/submissions/${id}`),
};

// Grade APIs
export const gradeAPI = {
  getAllMyGrades: () => api.get("/grades/my"),
  getMyGrades: (courseId) => api.get(`/grades/my/${courseId}`),
  getCourseGradeBook: (courseId) =>
    api.get(`/grades/course/${courseId}`),
};

export default api;