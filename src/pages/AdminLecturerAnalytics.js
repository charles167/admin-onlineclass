import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout';
import API from '../services/api';

const AdminLecturerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('courses');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersRes, coursesRes, assignmentsRes, submissionsRes] = await Promise.all([
        API.get('/users/public'),
        API.get('/courses/public'),
        API.get('/assignments/public').catch(() => ({ data: { data: [] } })),
        API.get('/submissions/public').catch(() => ({ data: { data: [] } }))
      ]);

      const allUsers = usersRes.data.data || [];
      const lecturerUsers = allUsers.filter(u => u.role === 'lecturer');
      
      setLecturers(lecturerUsers);
      setCourses(coursesRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
      setSubmissions(submissionsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate lecturer performance
  const lecturerPerformance = lecturers.map(lecturer => {
    const lecturerCourses = courses.filter(c => 
      c.instructor?._id === lecturer._id || c.instructor === lecturer._id
    );
    const lecturerAssignments = assignments.filter(a => 
      lecturerCourses.some(c => c._id === a.course?._id || c._id === a.course)
    );
    const lecturerSubmissions = submissions.filter(s =>
      lecturerAssignments.some(a => a._id === s.assignment?._id || a._id === s.assignment)
    );
    const gradedSubmissions = lecturerSubmissions.filter(s => s.grade !== null && s.grade !== undefined);
    const totalStudents = lecturerCourses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
    const avgGrade = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length)
      : null;
    const gradingRate = lecturerSubmissions.length > 0
      ? Math.round((gradedSubmissions.length / lecturerSubmissions.length) * 100)
      : 0;

    return {
      ...lecturer,
      courseCount: lecturerCourses.length,
      assignmentCount: lecturerAssignments.length,
      studentCount: totalStudents,
      submissionCount: lecturerSubmissions.length,
      gradedCount: gradedSubmissions.length,
      avgGrade,
      gradingRate,
      courses: lecturerCourses
    };
  });

  // Sort lecturers
  const sortedLecturers = [...lecturerPerformance].sort((a, b) => {
    switch (sortBy) {
      case 'courses': return b.courseCount - a.courseCount;
      case 'students': return b.studentCount - a.studentCount;
      case 'grading': return b.gradingRate - a.gradingRate;
      case 'name': return a.name?.localeCompare(b.name);
      default: return 0;
    }
  });

  // Filter lecturers
  const filteredLecturers = sortedLecturers.filter(lecturer =>
    lecturer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecturer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Overall stats
  const totalLecturers = lecturers.length;
  const totalCourses = courses.length;
  const activeLecturers = lecturerPerformance.filter(l => l.courseCount > 0).length;
  const avgCoursesPerLecturer = totalLecturers > 0 ? (totalCourses / totalLecturers).toFixed(1) : 0;
  const totalAssignments = assignments.length;
  const avgGradingRate = lecturerPerformance.length > 0
    ? Math.round(lecturerPerformance.reduce((sum, l) => sum + l.gradingRate, 0) / lecturerPerformance.length)
    : 0;

  const getGradingBadge = (rate) => {
    if (rate >= 90) return { text: 'Excellent', color: 'bg-emerald-100 text-emerald-700', icon: '🌟' };
    if (rate >= 70) return { text: 'Good', color: 'bg-blue-100 text-blue-700', icon: '👍' };
    if (rate >= 50) return { text: 'Average', color: 'bg-yellow-100 text-yellow-700', icon: '📊' };
    return { text: 'Needs Attention', color: 'bg-red-100 text-red-700', icon: '⚠️' };
  };

  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="lecturer-analytics">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-teal-200 rounded-full animate-spin border-t-teal-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading lecturer analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="admin" activeMenu="lecturer-analytics">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-3xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Analytics</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={fetchAnalyticsData}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="admin" activeMenu="lecturer-analytics">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Lecturer Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">Monitor teaching performance &amp; engagement</p>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="courses">Sort by Courses</option>
              <option value="students">Sort by Students</option>
              <option value="grading">Sort by Grading Rate</option>
              <option value="name">Sort by Name</option>
            </select>
            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Lecturers', value: totalLecturers },
            { label: 'Active Teaching', value: activeLecturers },
            { label: 'Total Courses', value: totalCourses },
            { label: 'Avg Courses/Lecturer', value: avgCoursesPerLecturer },
            { label: 'Assignments Created', value: totalAssignments },
            { label: 'Avg Grading Rate', value: `${avgGradingRate}%` },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lecturers by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Lecturer Cards Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLecturers.map((lecturer, idx) => {
            const gradingBadge = getGradingBadge(lecturer.gradingRate);
            return (
              <div key={lecturer._id || idx} className="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                {/* Card Header */}
                <div className="relative h-24 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold text-teal-600 border-4 border-white">
                      {lecturer.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${gradingBadge.color}`}>
                      {gradingBadge.icon} {gradingBadge.text}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="pt-14 px-6 pb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{lecturer.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500 mb-4">{lecturer.email}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-teal-600">{lecturer.courseCount}</div>
                      <div className="text-xs text-gray-600">Courses</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{lecturer.studentCount}</div>
                      <div className="text-xs text-gray-600">Students</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">{lecturer.assignmentCount}</div>
                      <div className="text-xs text-gray-600">Assignments</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">{lecturer.gradedCount}</div>
                      <div className="text-xs text-gray-600">Graded</div>
                    </div>
                  </div>

                  {/* Grading Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Grading Progress</span>
                      <span className="font-semibold text-teal-600">{lecturer.gradingRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${lecturer.gradingRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Courses List */}
                  {lecturer.courses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teaching</p>
                      <div className="flex flex-wrap gap-2">
                        {lecturer.courses.slice(0, 3).map((course, cidx) => (
                          <span key={cidx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                            {course.code || course.title?.substring(0, 15)}
                          </span>
                        ))}
                        {lecturer.courses.length > 3 && (
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-medium">
                            +{lecturer.courses.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="mt-4 w-full py-2 border border-primary-200 text-primary-600 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-50">
                    View Full Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLecturers.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-2">No Lecturers Found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search' : 'No lecturers registered in the system'}
            </p>
          </div>
        )}

        {/* Bottom Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center text-amber-600 text-xs font-bold">#</span>
              Top Performers
            </h3>
            <div className="space-y-3">
              {lecturerPerformance
                .filter(l => l.gradingRate > 0)
                .sort((a, b) => b.gradingRate - a.gradingRate)
                .slice(0, 5)
                .map((lecturer, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-amber-100 text-amber-600' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{lecturer.name}</p>
                      <p className="text-xs text-gray-500">{lecturer.courseCount} courses</p>
                    </div>
                    <span className="font-bold text-teal-600">{lecturer.gradingRate}%</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Most Active */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">#</span>
              Most Active
            </h3>
            <div className="space-y-3">
              {lecturerPerformance
                .sort((a, b) => b.courseCount - a.courseCount)
                .slice(0, 5)
                .map((lecturer, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{lecturer.name}</p>
                      <p className="text-xs text-gray-500">{lecturer.studentCount} students</p>
                    </div>
                    <span className="font-bold text-blue-600">{lecturer.courseCount}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">Quick Insights</h3>
            <div className="space-y-3">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lecturers with no courses</span>
                  <span className="font-bold">{lecturerPerformance.filter(l => l.courseCount === 0).length}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">100% Grading Rate</span>
                  <span className="font-bold">{lecturerPerformance.filter(l => l.gradingRate === 100).length}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Grading</span>
                  <span className="font-bold">{submissions.filter(s => s.grade === null || s.grade === undefined).length}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Students/Lecturer</span>
                  <span className="font-bold">
                    {totalLecturers > 0 ? Math.round(lecturerPerformance.reduce((sum, l) => sum + l.studentCount, 0) / totalLecturers) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminLecturerAnalytics;
