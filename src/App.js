import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SimpleProtectedRoute from './components/SimpleProtectedRoute';

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';
import AdminDepartments from './pages/AdminDepartments';
import AdminLogs from './pages/AdminLogs';
import AdminStudentAnalytics from './pages/AdminStudentAnalytics';
import AdminLecturerAnalytics from './pages/AdminLecturerAnalytics';
import AdminReports from './pages/AdminReports';
import AdminLiveSessions from './pages/AdminLiveSessions';
import AdminMaterials from './pages/AdminMaterials';
import AdminTimetable from './pages/AdminTimetable';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLoginPage />} />

        {/* Admin Protected Routes */}
        <Route path="/admin/dashboard" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminDashboard /></SimpleProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminUsers /></SimpleProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminCourses /></SimpleProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminDepartments /></SimpleProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminLogs /></SimpleProtectedRoute>
        } />
        <Route path="/admin/student-analytics" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminStudentAnalytics /></SimpleProtectedRoute>
        } />
        <Route path="/admin/lecturer-analytics" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminLecturerAnalytics /></SimpleProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminReports /></SimpleProtectedRoute>
        } />
        <Route path="/admin/live-sessions" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminLiveSessions /></SimpleProtectedRoute>
        } />
        <Route path="/admin/materials" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminMaterials /></SimpleProtectedRoute>
        } />
        <Route path="/admin/timetable" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><AdminTimetable /></SimpleProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <SimpleProtectedRoute allowedRoles={['admin']}><ProfilePage role="admin" /></SimpleProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <a href="/login" className="text-blue-600 hover:underline">Go to login</a>
    </div>
  );
}

export default App;
