import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout';
import API from '../services/api';
import { toast } from 'react-toastify';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', head: '', description: '' });

  // Fetch data and derive departments from courses/users
  useEffect(() => {
    fetchDepartments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch courses and users in parallel
      const [coursesRes] = await Promise.all([
        API.get('/courses/public')
      ]);

      const courses = coursesRes.data.data || [];

      // Group courses by category to create "departments"
      const deptMap = {};
      
      courses.forEach(course => {
        const category = course.category || 'General';
        const code = getCategoryCode(category);
        
        if (!deptMap[category]) {
          deptMap[category] = {
            id: code,
            name: category,
            code: code,
            courses: 0,
            students: 0,
            lecturers: new Set(),
            head: 'Not Assigned',
            status: 'active'
          };
        }
        
        deptMap[category].courses += 1;
        deptMap[category].students += course.enrolledStudents?.length || 0;
        if (course.instructor?._id) {
          deptMap[category].lecturers.add(course.instructor._id);
        }
      });

      // Convert to array and count lecturers
      const departmentsList = Object.values(deptMap).map(dept => ({
        ...dept,
        lecturers: dept.lecturers.size
      }));

      // Sort by number of courses
      departmentsList.sort((a, b) => b.courses - a.courses);

      setDepartments(departmentsList);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err.response?.data?.error?.message || 'Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate code from category
  const getCategoryCode = (category) => {
    const codeMap = {
      'Computer Science': 'CS',
      'Programming': 'PROG',
      'Development': 'DEV',
      'Data Science': 'DATA',
      'AI & ML': 'AIML',
      'Design': 'DES',
      'Business': 'BUS',
      'Mathematics': 'MATH',
      'Science': 'SCI',
      'Engineering': 'ENG',
      'General': 'GEN'
    };
    return codeMap[category] || category.substring(0, 4).toUpperCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDept) {
      setDepartments(departments.map(d => 
        d.id === editingDept.id 
          ? { ...d, ...formData }
          : d
      ));
      toast.success('Department updated successfully');
    } else {
      const newDept = {
        id: formData.code,
        ...formData,
        lecturers: 0,
        students: 0,
        courses: 0,
        status: 'active'
      };
      setDepartments([...departments, newDept]);
      toast.success('Department created successfully');
    }
    setShowModal(false);
    setEditingDept(null);
    setFormData({ name: '', code: '', head: '', description: '' });
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code, head: dept.head, description: dept.description || '' });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Note: Departments are derived from courses. Are you sure you want to delete this department? This will not delete the courses, only remove the department from the list.')) {
      setDepartments(departments.filter(d => d.id !== id));
      toast.info('Department removed from view (courses still exist)');
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.head && dept.head.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalLecturers = departments.reduce((sum, d) => sum + d.lecturers, 0);
  const totalStudents = departments.reduce((sum, d) => sum + d.students, 0);
  const totalCourses = departments.reduce((sum, d) => sum + d.courses, 0);

  // Loading state
  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="departments">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading departments...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout userRole="admin" activeMenu="departments">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 text-red-700 p-6 rounded-xl text-center">
            <p className="text-lg font-semibold mb-2">Error Loading Departments</p>
            <p>{error}</p>
            <button
              onClick={fetchDepartments}
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
    <MainLayout userRole="admin" activeMenu="departments">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Departments</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage academic departments and their resources</p>
          </div>
          <button
            onClick={() => {
              setEditingDept(null);
              setFormData({ name: '', code: '', head: '', description: '' });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            + Create Department
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Departments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{departments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Lecturers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalLecturers}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Students</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm">Courses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCourses}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-soft-lg border border-gray-100 mb-6">
          <input
            type="text"
            placeholder="Search departments by name, code, or head..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Departments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map(dept => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-6 shadow-soft-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Department Head</p>
                <p className="font-semibold text-gray-900">{dept.head}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">👨‍🏫</div>
                  <div className="text-lg font-bold text-blue-700">{dept.lecturers}</div>
                  <div className="text-xs text-blue-600">Lecturers</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-lg font-bold text-green-700">{dept.students}</div>
                  <div className="text-xs text-green-600">Students</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-lg font-bold text-purple-700">{dept.courses}</div>
                  <div className="text-xs text-purple-600">Courses</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDepartments.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-2">No Departments Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first department'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  setEditingDept(null);
                  setFormData({ name: '', code: '', head: '', description: '' });
                  setShowModal(true);
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all"
              >
                Create Department
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingDept ? 'Edit Department' : 'Create New Department'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-8 py-6 space-y-6">
                  {/* Department Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Computer Science"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Department Code */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="e.g., CS"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                    />
                  </div>

                  {/* Department Head */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department Head *
                    </label>
                    <input
                      type="text"
                      value={formData.head}
                      onChange={(e) => setFormData({...formData, head: e.target.value})}
                      placeholder="e.g., Dr. Sarah Johnson"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of the department..."
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-3xl border-t border-gray-200 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingDept ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDepartments;
