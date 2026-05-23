import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout';
import { CourseCard } from '../components/Cards';
import API, { deleteCourse } from '../services/api';
import { toast } from 'react-toastify';

const AdminCourses = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: '',
    description: '',
    status: 'draft',
    thumbnail: '',
  });

  // Real data from API
  const [courses, setCourses] = useState([]);

  // Fetch courses from API
  useEffect(() => {
    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await API.get('/courses/public');
      
      if (response.data.success) {
        // Transform API data
        const transformedCourses = response.data.data.map(course => ({
          _id: course._id,
          title: course.title,
          code: course.code || '',
          instructor: course.instructor?.name || 'Unknown Instructor',
          instructorAvatar: '👨‍🏫',
          category: course.category || 'General',
          status: course.status || 'draft',
          enrolledStudents: course.enrolledStudents?.length || 0,
          totalStudents: course.maxStudents || 100,
          rating: 0,
          reviews: 0,
          duration: course.duration || 'N/A',
          lessons: course.materials?.length || 0,
          thumbnail: getCourseEmoji(course.category),
          description: course.description || 'No description available',
          price: 'Free',
          createdAt: course.createdAt,
        }));
        
        setCourses(transformedCourses);
      } else {
        setError('Failed to load courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.error?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get emoji based on category
  const getCourseEmoji = (category) => {
    const emojiMap = {
      'Programming': '💻',
      'Development': '🌐',
      'Data Science': '📊',
      'AI & ML': '🤖',
      'Design': '🎨',
      'Business': '💼',
      'Computer Science': '🖥️',
      'Mathematics': '📐',
      'Science': '🔬',
    };
    return emojiMap[category] || '📚';
  };

  // Filtering logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const publishedCount = courses.filter(c => c.status === 'published').length;
  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents, 0);
  const ratedCourses = courses.filter(c => c.rating > 0);
  const avgRating = ratedCourses.length > 0 
    ? (ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length).toFixed(1)
    : 'N/A';
  const publishedPercent = courses.length > 0 
    ? Math.round((publishedCount / courses.length) * 100)
    : 0;

  const stats = [
    {
      icon: '📚',
      label: 'Total Courses',
      value: courses.length.toString(),
      change: 'From database',
      isPositive: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '✅',
      label: 'Published',
      value: publishedCount.toString(),
      change: `${publishedPercent}% of total`,
      isPositive: true,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: '👨‍🎓',
      label: 'Total Students',
      value: totalStudents.toString(),
      change: 'Enrolled',
      isPositive: true,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '⭐',
      label: 'Avg Rating',
      value: avgRating,
      change: 'Overall',
      isPositive: true,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  // Get unique categories
  const categories = ['all', ...new Set(courses.map(c => c.category))];

  // Handlers
  const handleAddCourse = (e) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(courses.map(c => c._id === editingCourse._id ? { ...c, ...formData } : c));
    } else {
      const newCourse = {
        _id: Date.now().toString(),
        ...formData,
        enrolledStudents: 0,
        totalStudents: 0,
        rating: 0,
        reviews: 0,
        duration: '8 weeks',
        lessons: 0,
        progress: 0,
        createdAt: new Date().toISOString().split('T')[0],
        instructorAvatar: '👤',
        price: 'Free',
      };
      setCourses([...courses, newCourse]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', instructor: '', category: '', description: '', status: 'draft', thumbnail: '📚' });
    setEditingCourse(null);
    setShowModal(false);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      description: course.description,
      status: course.status,
      thumbnail: course.thumbnail,
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
        toast.success('Course deleted successfully');
        setCourses(courses.filter(c => c._id !== courseId));
      } catch (err) {
        console.error('Error deleting course:', err);
        toast.error('Failed to delete course');
      }
    }
  };

  const handlePublish = (courseId) => {
    setCourses(courses.map(c => c._id === courseId ? { ...c, status: 'published' } : c));
  };

  const handleArchive = (courseId) => {
    setCourses(courses.map(c => c._id === courseId ? { ...c, status: 'archived' } : c));
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="courses">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout userRole="admin" activeMenu="courses">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 text-red-700 p-6 rounded-xl text-center">
            <p className="text-lg font-semibold mb-2">Error Loading Courses</p>
            <p>{error}</p>
            <button
              onClick={fetchCourses}
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
    <MainLayout userRole="admin" activeMenu="courses">
      <div className="max-w-[1600px] mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Course Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Create, manage, and publish educational content</p>
          </div>
          <button
            onClick={() => {
              setEditingCourse(null);
              setFormData({ title: '', instructor: '', category: '', description: '', status: 'draft', thumbnail: '' });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            + Create Course
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 shadow-soft-md border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, instructors, descriptions..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <div className="flex gap-2 border-l border-gray-200 pl-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === 'grid'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Grid View"
                >
                  <span className="text-xl">▦</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === 'table'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Table View"
                >
                  <span className="text-xl">☰</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{courses.length}</span> courses
            </p>
          </div>
        </div>

        {/* Courses Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course._id} className="relative group">
                <CourseCard {...course} />
                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {course.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(course._id)}
                      className="w-10 h-10 bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-xl shadow-lg transition-all flex items-center justify-center"
                      title="Publish Course"
                    >
                      ✅
                    </button>
                  )}
                  {course.status === 'published' && (
                    <button
                      onClick={() => handleArchive(course._id)}
                      className="w-10 h-10 bg-white hover:bg-yellow-600 text-yellow-600 hover:text-white rounded-xl shadow-lg transition-all flex items-center justify-center"
                      title="Archive Course"
                    >
                      📦
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(course)}
                    className="w-10 h-10 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl shadow-lg transition-all flex items-center justify-center"
                    title="Edit Course"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="w-10 h-10 bg-white hover:bg-red-600 text-red-600 hover:text-white rounded-xl shadow-lg transition-all flex items-center justify-center"
                    title="Delete Course"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl shadow-soft-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Course</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Instructor</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Students</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Rating</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {course.thumbnail}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.lessons} lessons • {course.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{course.instructorAvatar}</span>
                          <span className="text-gray-700">{course.instructor}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : course.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {course.status === 'published' ? '🟢' : course.status === 'draft' ? '🟡' : '⚪'} {course.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">{course.enrolledStudents}</p>
                          {course.totalStudents > 0 && (
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-indigo-600 h-1.5 rounded-full" 
                                style={{ width: `${(course.enrolledStudents / course.totalStudents) * 100}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {course.rating > 0 ? (
                          <div>
                            <p className="font-semibold text-gray-900">⭐ {course.rating}</p>
                            <p className="text-xs text-gray-500">{course.reviews} reviews</p>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No ratings</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          {course.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(course._id)}
                              className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-all"
                              title="Publish"
                            >
                              ✅
                            </button>
                          )}
                          {course.status === 'published' && (
                            <button
                              onClick={() => handleArchive(course._id)}
                              className="p-2 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-all"
                              title="Archive"
                            >
                              📦
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(course)}
                            className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters, or create a new course</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button
                  onClick={resetForm}
                  className="w-10 h-10 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleAddCourse} className="p-8 space-y-6">
              {/* Thumbnail Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['📚', '🐍', '🌐', '📊', '🤖', '🎨', '📱', '💻', '🔬', '🎓', '📈', '🎯'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, thumbnail: emoji })}
                      className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                        formData.thumbnail === emoji
                          ? 'bg-indigo-100 ring-2 ring-indigo-500'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Python Programming"
                />
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instructor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Dr. Jane Smith"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    <option value="Programming">Programming</option>
                    <option value="Development">Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Describe what students will learn in this course..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminCourses;
