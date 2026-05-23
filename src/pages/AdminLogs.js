import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout';
import API from '../services/api';

const AdminLogs = () => {
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data and generate activity logs
  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users, courses, and submissions in parallel
      const [usersRes, coursesRes, submissionsRes] = await Promise.all([
        API.get('/users/public'),
        API.get('/courses/public'),
        API.get('/submissions/public').catch(() => ({ data: { data: [] } }))
      ]);

      const users = usersRes.data.data || [];
      const courses = coursesRes.data.data || [];
      const submissions = submissionsRes.data.data || [];

      // Generate activity logs from real data
      const activityLogs = [];
      let logId = 1;

      // Add user registration logs
      users.forEach(user => {
        activityLogs.push({
          id: logId++,
          timestamp: new Date(user.createdAt).toLocaleString(),
          action: 'USER_CREATED',
          user: user.email,
          userRole: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User',
          targetType: 'User',
          description: `New ${user.role} account created: ${user.name}`,
          status: 'success',
          ipAddress: '192.168.1.x',
          rawDate: new Date(user.createdAt)
        });
      });

      // Add course creation logs
      courses.forEach(course => {
        activityLogs.push({
          id: logId++,
          timestamp: new Date(course.createdAt).toLocaleString(),
          action: 'COURSE_CREATED',
          user: course.instructor?.email || 'system@platform.edu',
          userRole: 'Lecturer',
          targetType: 'Course',
          description: `Created course: ${course.title} (${course.code || 'No Code'})`,
          status: 'success',
          ipAddress: '192.168.1.x',
          rawDate: new Date(course.createdAt)
        });

        // Add enrollment logs
        if (course.enrolledStudents?.length > 0) {
          course.enrolledStudents.forEach(studentId => {
            activityLogs.push({
              id: logId++,
              timestamp: new Date(course.updatedAt).toLocaleString(),
              action: 'ENROLLMENT',
              user: `student_${studentId}`,
              userRole: 'Student',
              targetType: 'Enrollment',
              description: `Enrolled in course: ${course.title}`,
              status: 'success',
              ipAddress: '192.168.1.x',
              rawDate: new Date(course.updatedAt)
            });
          });
        }
      });

      // Add submission logs
      submissions.forEach(submission => {
        activityLogs.push({
          id: logId++,
          timestamp: new Date(submission.submittedAt || submission.createdAt).toLocaleString(),
          action: 'ASSIGNMENT_SUBMITTED',
          user: submission.student?.email || 'unknown@student.edu',
          userRole: 'Student',
          targetType: 'Assignment',
          description: `Submitted assignment: ${submission.assignment?.title || 'Unknown Assignment'}`,
          status: 'success',
          ipAddress: '192.168.1.x',
          rawDate: new Date(submission.submittedAt || submission.createdAt)
        });

        // Add grading logs if graded
        if (submission.grade !== null && submission.grade !== undefined) {
          activityLogs.push({
            id: logId++,
            timestamp: new Date(submission.updatedAt).toLocaleString(),
            action: 'GRADE_SUBMITTED',
            user: submission.assignment?.course?.instructor?.email || 'lecturer@platform.edu',
            userRole: 'Lecturer',
            targetType: 'Grading',
            description: `Graded submission: ${submission.grade}% for ${submission.student?.name || 'Student'}`,
            status: 'success',
            ipAddress: '192.168.1.x',
            rawDate: new Date(submission.updatedAt)
          });
        }
      });

      // Sort by date descending (most recent first)
      activityLogs.sort((a, b) => b.rawDate - a.rawDate);

      setLogs(activityLogs);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err.response?.data?.error?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesType = filterType === 'all' || log.targetType === filterType;
    return matchesSearch && matchesAction && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 border-green-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '+';
      case 'error': return '!';
      case 'warning': return '~';
      default: return 'i';
    }
  };

  const totalLogs = logs.length;
  const successLogs = logs.filter(l => l.status === 'success').length;
  const errorLogs = logs.filter(l => l.status === 'error').length;
  const warningLogs = logs.filter(l => l.status === 'warning').length;

  const handleExport = () => {
    // Export to CSV
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Role', 'Type', 'Description', 'Status'].join(','),
      ...filteredLogs.map(log => [
        `"${log.timestamp}"`,
        log.action,
        log.user,
        log.userRole,
        log.targetType,
        `"${log.description}"`,
        log.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="logs">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activity logs...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout userRole="admin" activeMenu="logs">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 text-red-700 p-6 rounded-xl text-center">
            <p className="text-lg font-semibold mb-2">Error Loading Logs</p>
            <p>{error}</p>
            <button
              onClick={fetchActivityLogs}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="admin" activeMenu="logs">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">System Logs</h1>
            <p className="text-gray-500 text-sm mt-0.5">Monitor system activity and audit trails</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalLogs}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Success</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{successLogs}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Errors</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{errorLogs}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Warnings</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{warningLogs}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-soft-lg border border-gray-100 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            {/* Action Filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="all">All Actions</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="USER_CREATED">User Created</option>
              <option value="COURSE_CREATED">Course Created</option>
              <option value="ASSIGNMENT_SUBMITTED">Assignment Submitted</option>
              <option value="GRADE_SUBMITTED">Grade Submitted</option>
              <option value="SYSTEM_ERROR">System Error</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="all">All Types</option>
              <option value="Authentication">Authentication</option>
              <option value="Course">Course</option>
              <option value="Assignment">Assignment</option>
              <option value="User">User</option>
              <option value="System">System</option>
              <option value="Grading">Grading</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl shadow-soft-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="text-sm font-mono text-gray-900">{log.timestamp}</div>
                    </td>
                    <td className="py-4 px-6">
                      <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                        {log.action}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{log.user}</div>
                      <div className="text-xs text-gray-500">{log.userRole}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                        {log.targetType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700 max-w-md">{log.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)} {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono text-gray-600">{log.ipAddress}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-base font-semibold text-gray-900 mb-1">No Logs Found</h3>
              <p className="text-gray-600">
                {searchQuery || filterAction !== 'all' || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No system logs available'}
              </p>
            </div>
          )}
        </div>

        {/* Showing results */}
        {filteredLogs.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredLogs.length} of {totalLogs} logs
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminLogs;
