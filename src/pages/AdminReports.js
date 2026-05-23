import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout';
import API from '../services/api';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersRes, coursesRes, submissionsRes, assignmentsRes] = await Promise.all([
        API.get('/users/public'),
        API.get('/courses/public'),
        API.get('/submissions/public').catch(() => ({ data: { data: [] } })),
        API.get('/assignments/public').catch(() => ({ data: { data: [] } }))
      ]);

      setUsers(usersRes.data.data || []);
      setCourses(coursesRes.data.data || []);
      setSubmissions(submissionsRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.error?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const students = users.filter(u => u.role === 'student');
  const lecturers = users.filter(u => u.role === 'lecturer');
  const publishedCourses = courses.filter(c => c.status === 'published');
  const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);
  const pendingSubmissions = submissions.filter(s => s.grade === null || s.grade === undefined);
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
  const avgGrade = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length)
    : 0;

  // Grade distribution
  const gradeDistribution = {
    A: gradedSubmissions.filter(s => s.grade >= 90).length,
    B: gradedSubmissions.filter(s => s.grade >= 80 && s.grade < 90).length,
    C: gradedSubmissions.filter(s => s.grade >= 70 && s.grade < 80).length,
    D: gradedSubmissions.filter(s => s.grade >= 60 && s.grade < 70).length,
    F: gradedSubmissions.filter(s => s.grade < 60).length,
  };

  const handleExportPDF = () => {
    alert('PDF Export feature - Coming soon!');
  };

  const handleExportCSV = (reportType) => {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'users':
        csvContent = [
          ['Name', 'Email', 'Role', 'Status', 'Created At'].join(','),
          ...users.map(u => [
            `"${u.name}"`,
            u.email,
            u.role,
            u.status || 'active',
            new Date(u.createdAt).toLocaleDateString()
          ].join(','))
        ].join('\n');
        filename = 'users_report.csv';
        break;
      case 'courses':
        csvContent = [
          ['Title', 'Code', 'Instructor', 'Status', 'Enrolled Students'].join(','),
          ...courses.map(c => [
            `"${c.title}"`,
            c.code || 'N/A',
            `"${c.instructor?.name || 'Unknown'}"`,
            c.status || 'draft',
            c.enrolledStudents?.length || 0
          ].join(','))
        ].join('\n');
        filename = 'courses_report.csv';
        break;
      case 'grades':
        csvContent = [
          ['Student', 'Assignment', 'Grade', 'Status', 'Submitted At'].join(','),
          ...submissions.map(s => [
            `"${s.student?.name || 'Unknown'}"`,
            `"${s.assignment?.title || 'Unknown'}"`,
            s.grade !== null ? s.grade : 'Pending',
            s.grade !== null ? 'Graded' : 'Pending',
            new Date(s.createdAt).toLocaleDateString()
          ].join(','))
        ].join('\n');
        filename = 'grades_report.csv';
        break;
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reportTypes = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users Report' },
    { id: 'courses', label: 'Courses Report' },
    { id: 'grades', label: 'Grades Report' },
    { id: 'engagement', label: 'Engagement' },
  ];

  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="reports">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm">Generating reports...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="admin" activeMenu="reports">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchReportData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="admin" activeMenu="reports">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-500 text-sm">Comprehensive platform insights</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <button 
              onClick={handleExportPDF}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: 'text-blue-600' },
            { label: 'Active Courses', value: publishedCourses.length, color: 'text-emerald-600' },
            { label: 'Submissions', value: submissions.length, color: 'text-amber-600' },
            { label: 'Avg Grade', value: `${avgGrade}%`, color: 'text-purple-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Report Type Selector */}
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedReport === report.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {report.label}
            </button>
          ))}
        </div>

        {/* Report Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Report Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview Report */}
            {selectedReport === 'overview' && (
              <>
                {/* Key Metrics */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-6">
                    Platform Overview
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{users.length}</div>
                      <div className="text-gray-600 text-sm">Total Users</div>
                      <div className="mt-1 text-xs text-gray-400">
                        {students.length} students · {lecturers.length} lecturers
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">{courses.length}</div>
                      <div className="text-gray-600 text-sm">Total Courses</div>
                      <div className="mt-1 text-xs text-gray-400">
                        {publishedCourses.length} published
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-amber-600 mb-1">{totalEnrollments}</div>
                      <div className="text-gray-600 text-sm">Enrollments</div>
                      <div className="mt-1 text-xs text-gray-400">
                        Across all courses
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-6">
                    Grade Distribution
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(gradeDistribution).map(([grade, count]) => {
                      const percentage = gradedSubmissions.length > 0 ? Math.round((count / gradedSubmissions.length) * 100) : 0;
                      const colors = {
                        A: 'from-emerald-500 to-green-500',
                        B: 'from-blue-500 to-cyan-500',
                        C: 'from-yellow-500 to-amber-500',
                        D: 'from-orange-500 to-red-400',
                        F: 'from-red-500 to-rose-600'
                      };
                      
                      return (
                        <div key={grade} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-lg">
                                {grade}
                              </span>
                              <span className="text-gray-600">
                                {grade === 'A' ? '90-100%' : grade === 'B' ? '80-89%' : grade === 'C' ? '70-79%' : grade === 'D' ? '60-69%' : '0-59%'}
                              </span>
                            </div>
                            <span className="font-bold text-gray-900">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${colors[grade]} rounded-full transition-all duration-700`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Users Report */}
            {selectedReport === 'users' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900">
                    Users Report
                  </h3>
                  <button 
                    onClick={() => handleExportCSV('users')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                
                {/* User Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{students.length}</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{lecturers.length}</div>
                    <div className="text-sm text-gray-600">Lecturers</div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</div>
                    <div className="text-sm text-gray-600">Admins</div>
                  </div>
                </div>

                {/* Recent Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 10).map((user, idx) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm">
                                {user.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'student' ? 'bg-blue-100 text-blue-700' :
                              user.role === 'lecturer' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Courses Report */}
            {selectedReport === 'courses' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900">
                    Courses Report
                  </h3>
                  <button 
                    onClick={() => handleExportCSV('courses')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                
                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{publishedCourses.length}</div>
                    <div className="text-sm text-gray-600">Published</div>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600">{courses.filter(c => c.status === 'draft').length}</div>
                    <div className="text-sm text-gray-600">Drafts</div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{totalEnrollments}</div>
                    <div className="text-sm text-gray-600">Enrollments</div>
                  </div>
                </div>

                {/* Courses List */}
                <div className="space-y-3">
                  {courses.slice(0, 8).map((course, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm">
                        {course.code?.substring(0, 2) || 'CO'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-500">{course.instructor?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{course.enrolledStudents?.length || 0}</p>
                        <p className="text-xs text-gray-500">students</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        course.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {course.status || 'draft'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grades Report */}
            {selectedReport === 'grades' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-900">
                    Grades Report
                  </h3>
                  <button 
                    onClick={() => handleExportCSV('grades')}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                
                {/* Grade Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{gradedSubmissions.length}</div>
                    <div className="text-sm text-gray-600">Graded</div>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600">{pendingSubmissions.length}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{avgGrade}%</div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                </div>

                {/* Recent Submissions */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Student</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Assignment</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-600">Grade</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.slice(0, 10).map((sub, idx) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{sub.student?.name || 'Unknown'}</td>
                          <td className="py-3 px-4 text-gray-600">{sub.assignment?.title || 'Unknown'}</td>
                          <td className="py-3 px-4 text-center">
                            {sub.grade !== null && sub.grade !== undefined ? (
                              <span className={`px-3 py-1 rounded-lg font-bold ${
                                sub.grade >= 90 ? 'bg-emerald-100 text-emerald-700' :
                                sub.grade >= 80 ? 'bg-blue-100 text-blue-700' :
                                sub.grade >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                sub.grade >= 60 ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {sub.grade}%
                              </span>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              sub.grade !== null ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {sub.grade !== null ? 'Graded' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Engagement Report */}
            {selectedReport === 'engagement' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-6">
                  Engagement Metrics
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Submission Rate */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-medium text-gray-900 text-sm mb-4">Submission Completion</h4>
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {assignments.length > 0 ? Math.round((submissions.length / (assignments.length * students.length)) * 100) : 0}%
                      </div>
                      <div className="text-gray-600">Completion Rate</div>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                        style={{ width: `${assignments.length > 0 ? Math.min(100, Math.round((submissions.length / (assignments.length * students.length)) * 100)) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Grading Progress */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-medium text-gray-900 text-sm mb-4">Grading Progress</h4>
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {submissions.length > 0 ? Math.round((gradedSubmissions.length / submissions.length) * 100) : 0}%
                      </div>
                      <div className="text-gray-600">Graded</div>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${submissions.length > 0 ? Math.round((gradedSubmissions.length / submissions.length) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Course Popularity */}
                  <div className="md:col-span-2 bg-gray-50 rounded-xl p-5">
                    <h4 className="font-medium text-gray-900 text-sm mb-4">Most Popular Courses</h4>
                    <div className="space-y-3">
                      {courses
                        .sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))
                        .slice(0, 5)
                        .map((course, idx) => {
                          const maxEnrollment = Math.max(...courses.map(c => c.enrolledStudents?.length || 0));
                          const percentage = maxEnrollment > 0 ? ((course.enrolledStudents?.length || 0) / maxEnrollment) * 100 : 0;
                          
                          return (
                            <div key={idx}>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium text-gray-900">{course.title}</span>
                                <span className="text-blue-600 font-bold">{course.enrolledStudents?.length || 0}</span>
                              </div>
                              <div className="h-2 bg-white rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExportCSV('users')}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <p className="font-medium text-sm text-gray-900">Export Users</p>
                  <p className="text-xs text-gray-500">Download CSV</p>
                </button>
                <button 
                  onClick={() => handleExportCSV('courses')}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <p className="font-medium text-sm text-gray-900">Export Courses</p>
                  <p className="text-xs text-gray-500">Download CSV</p>
                </button>
                <button 
                  onClick={() => handleExportCSV('grades')}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <p className="font-medium text-sm text-gray-900">Export Grades</p>
                  <p className="text-xs text-gray-500">Download CSV</p>
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gray-900 rounded-xl p-5 text-white">
              <h3 className="text-sm font-semibold mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Total Users</span>
                    <span className="font-bold">{users.length}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Total Courses</span>
                    <span className="font-bold">{courses.length}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Total Assignments</span>
                    <span className="font-bold">{assignments.length}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Total Submissions</span>
                    <span className="font-bold">{submissions.length}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Pass Rate (≥60%)</span>
                    <span className="font-bold">
                      {gradedSubmissions.length > 0 
                        ? Math.round((gradedSubmissions.filter(s => s.grade >= 60).length / gradedSubmissions.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {submissions.slice(0, 5).map((sub, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      sub.grade !== null ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sub.grade !== null ? 'G' : 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{sub.student?.name || 'Student'}</p>
                      <p className="text-xs text-gray-500 truncate">{sub.assignment?.title || 'Assignment'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminReports;
