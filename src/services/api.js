import axios from 'axios';
import { getBackendApiRoot } from './env';

const baseURL = getBackendApiRoot();

const API = axios.create({
  baseURL,
});

// Add authentication token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear all admin auth data and redirect to login
      ['token', 'adminToken', 'adminId', 'adminEmail', 'adminName', 'isAdminLoggedIn',
       'user', 'isAuthenticated', 'userRole', 'userName'].forEach(key => localStorage.removeItem(key));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const getCurrentUser = () => API.get('/auth/me');
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// User endpoints
export const getAllUsers = () => API.get('/users');
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getUserStats = () => API.get('/users/stats');

// Course endpoints
export const getAllCourses = () => API.get('/courses');
export const getMyCourses = () => API.get('/courses/my');
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const enrollInCourse = (id) => API.post(`/courses/${id}/enroll`);

// Assignment endpoints
export const getAllAssignments = () => API.get('/assignments');
export const getAssignmentById = (id) => API.get(`/assignments/${id}`);
export const createAssignment = (data) => API.post('/assignments', data);
export const updateAssignment = (id, data) => API.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);

// Submission endpoints
export const getAllSubmissions = () => API.get('/submissions');
export const createSubmission = (data) => API.post('/submissions', data);
export const gradeSubmission = (id, data) => API.put(`/submissions/${id}/grade`, data);

// Live class endpoints
export const getAllLiveClasses = () => API.get('/live-classes');
export const getLiveClassById = (id) => API.get(`/live-classes/${id}`);
export const createLiveClass = (data) => API.post('/live-classes', data);
export const updateLiveClass = (id, data) => API.put(`/live-classes/${id}`, data);
export const deleteLiveClass = (id) => API.delete(`/live-classes/${id}`);

// Attendance endpoints
export const createAttendanceSession = (data) => API.post('/attendance', data);
export const listSessionsByCourse = (courseId) => API.get(`/attendance/course/${courseId}`);
export const getSession = (sessionId) => API.get(`/attendance/session/${sessionId}`);
export const signAttendance = (sessionId) => API.post(`/attendance/${sessionId}/sign`);
export const getStudentAttendance = () => API.get('/attendance/student');
export const getCourseSummary = (courseId) => API.get(`/attendance/summary/course/${courseId}`);
export const downloadSession = (sessionId, format = 'csv') => API.get(`/attendance/session/${sessionId}/download?format=${format}`, { responseType: 'blob' });

// Materials endpoints
export const deleteMaterial = (id) => API.delete(`/materials/${id}`);

// Live Sessions endpoints
export const deleteSession = (sessionId) => API.delete(`/live-sessions/admin/${sessionId}`);

export default API;
