import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout';
import API from '../services/api';

const AdminStudentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersRes, coursesRes, submissionsRes] = await Promise.all([
        API.get('/users/public'),
        API.get('/courses/public'),
        API.get('/submissions/public').catch(() => ({ data: { data: [] } }))
      ]);

      const allUsers = usersRes.data.data || [];
      const studentUsers = allUsers.filter(u => u.role === 'student');
      
      setStudents(studentUsers);
      setCourses(coursesRes.data.data || []);
      setSubmissions(submissionsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active' || !s.status).length;
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);
  const avgGrade = gradedSubmissions.length > 0 
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length)
    : 0;

  // Get top performing students
  const studentPerformance = students.map(student => {
    const studentSubmissions = submissions.filter(s => s.student?._id === student._id || s.student === student._id);
    const graded = studentSubmissions.filter(s => s.grade !== null && s.grade !== undefined);
    const avgScore = graded.length > 0 
      ? Math.round(graded.reduce((sum, s) => sum + s.grade, 0) / graded.length)
      : null;
    
    return {
      ...student,
      submissionCount: studentSubmissions.length,
      avgScore,
      enrolledCourses: student.enrolledCourses?.length || 0
    };
  }).sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

  // Filter students
  const filteredStudents = studentPerformance.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Grade distribution
  const gradeDistribution = {
    A: gradedSubmissions.filter(s => s.grade >= 90).length,
    B: gradedSubmissions.filter(s => s.grade >= 80 && s.grade < 90).length,
    C: gradedSubmissions.filter(s => s.grade >= 70 && s.grade < 80).length,
    D: gradedSubmissions.filter(s => s.grade >= 60 && s.grade < 70).length,
    F: gradedSubmissions.filter(s => s.grade < 60).length,
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-emerald-600 bg-emerald-50';
    if (grade >= 80) return 'text-blue-600 bg-blue-50';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50';
    if (grade >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceBadge = (score) => {
    if (score === null) return { text: 'No Data', color: 'bg-gray-100 text-gray-500' };
    if (score >= 90) return { text: 'Excellent', color: 'bg-emerald-100 text-emerald-700' };
    if (score >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-700' };
    if (score >= 70) return { text: 'Average', color: 'bg-yellow-100 text-yellow-700' };
    if (score >= 60) return { text: 'Below Avg', color: 'bg-orange-100 text-orange-700' };
    return { text: 'At Risk', color: 'bg-red-100 text-red-700' };
  };

  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="student-analytics">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="admin" activeMenu="student-analytics">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchAnalyticsData}
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
    <MainLayout userRole="admin" activeMenu="student-analytics">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Student Analytics</h1>
            <p className="text-gray-500 text-sm">Real-time insights & performance tracking</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: totalStudents, color: 'text-blue-600' },
            { label: 'Active Now', value: activeStudents, color: 'text-emerald-600' },
            { label: 'Enrollments', value: totalEnrollments, color: 'text-amber-600' },
            { label: 'Avg Grade', value: `${avgGrade}%`, color: 'text-purple-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Grade Distribution & Course Stats */}
          <div className="space-y-6">
            
            {/* Grade Distribution Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">
                  Grade Distribution
                </h3>
                <span className="text-xs text-gray-500">{gradedSubmissions.length} graded</span>
              </div>
              
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
                  const bgColors = {
                    A: 'bg-emerald-50',
                    B: 'bg-blue-50',
                    C: 'bg-yellow-50',
                    D: 'bg-orange-50',
                    F: 'bg-red-50'
                  };
                  
                  return (
                    <div key={grade} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-8 h-8 ${bgColors[grade]} rounded-lg flex items-center justify-center font-bold text-sm`}>
                            {grade}
                          </span>
                          <span className="text-sm text-gray-600">{grade === 'A' ? '90-100%' : grade === 'B' ? '80-89%' : grade === 'C' ? '70-79%' : grade === 'D' ? '60-69%' : '0-59%'}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal text-xs">({percentage}%)</span></span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${colors[grade]} rounded-full transition-all duration-500 group-hover:shadow-lg`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Enrollment Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">
                  Course Enrollment
                </h3>
              </div>
              
              <div className="space-y-3">
                {courses.slice(0, 5).map((course, idx) => (
                  <div key={course._id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold text-xs">
                      {course.code?.substring(0, 3) || 'CRS'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.enrolledStudents?.length || 0} students</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-violet-600">{course.enrolledStudents?.length || 0}</div>
                    </div>
                  </div>
                ))}
                
                {courses.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No courses found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Student Performance Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    Student Performance
                  </h3>
                  
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search students..."
                      className="w-full md:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Student</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Courses</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Submissions</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Avg Score</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Status</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.slice(0, 10).map((student, idx) => {
                      const badge = getPerformanceBadge(student.avgScore);
                      return (
                        <tr key={student._id || idx} className="border-t border-gray-100 hover:bg-violet-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm">
                                {student.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{student.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm">
                              {student.enrolledCourses}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-50 text-amber-600 rounded-lg font-semibold text-sm">
                              {student.submissionCount}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {student.avgScore !== null ? (
                              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-sm ${getGradeColor(student.avgScore)}`}>
                                {student.avgScore}%
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">--</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                              {badge.text}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-violet-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <h4 className="font-semibold text-gray-900 mb-1">No students found</h4>
                    <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>

              {/* Table Footer */}
              {filteredStudents.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{Math.min(10, filteredStudents.length)}</span> of <span className="font-semibold">{filteredStudents.length}</span> students
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Previous
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Activity & Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-5">
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission, idx) => (
                <div key={submission._id || idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    submission.grade !== null ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {submission.grade !== null ? 'G' : 'S'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {submission.student?.name || 'Student'} {submission.grade !== null ? 'received grade' : 'submitted assignment'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {submission.assignment?.title || 'Assignment'} 
                      {submission.grade !== null && <span className="text-emerald-600 font-semibold ml-1">({submission.grade}%)</span>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(submission.updatedAt || submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              
              {submissions.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-gray-900 rounded-xl p-5 text-white">
            <h3 className="text-base font-semibold mb-5">
              Performance Insights
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Class Average</p>
                    <p className="text-xs text-white/60">Overall performance score</p>
                  </div>
                  <div className="text-xl font-bold">{avgGrade}%</div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Completion Rate</p>
                    <p className="text-xs text-white/60">Assignments submitted</p>
                  </div>
                  <div className="text-xl font-bold">{totalSubmissions}</div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Top Performers</p>
                    <p className="text-xs text-white/60">Students with A grades</p>
                  </div>
                  <div className="text-xl font-bold">{gradeDistribution.A}</div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Need Support</p>
                    <p className="text-xs text-white/60">Students below 60%</p>
                  </div>
                  <div className="text-xl font-bold">{gradeDistribution.F}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminStudentAnalytics;
