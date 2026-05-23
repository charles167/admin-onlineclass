import React, { useEffect, useState } from 'react';
import MainLayout from '../components/Layout';

const ProfilePage = ({ role = 'student' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    department: '',
    studentId: '',
    matricNo: '',
    employeeId: ''
  });
  const [userData, setUserData] = useState(null);

  // Mock user data based on role
  const getUserData = () => {
    if (role === 'student') {
      return {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@student.edu',
        phone: '+1 (555) 123-4567',
        bio: 'Computer Science student passionate about web development and AI.',
        department: 'Computer Science',
        studentId: 'CS2023001',
        matricNo: 'MAT/CS/23/001',
        level: '300',
        enrolledCourses: 5,
        completedAssignments: 32,
        averageGrade: 85
      };
    } else if (role === 'lecturer') {
      return {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@lecturer.edu',
        phone: '+1 (555) 234-5678',
        bio: 'Senior lecturer specializing in Web Development and Software Engineering with 10 years of teaching experience.',
        department: 'Computer Science',
        employeeId: 'LEC2020015',
        courses: 4,
        students: 156,
        yearsExperience: 10
      };
    } else {
      return {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@platform.edu',
        phone: '+1 (555) 345-6789',
        bio: 'System administrator managing the educational platform.',
        department: 'IT Administration',
        employeeId: 'ADM2019001',
        totalUsers: 892,
        totalCourses: 45,
        systemUptime: '99.9%'
      };
    }
  };

  useEffect(() => {
    const base = getUserData();
    try {
      const stored = localStorage.getItem(`profile-data-${role}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserData({ ...base, ...parsed });
        return;
      }
    } catch (err) {
      console.warn('Could not load saved profile data:', err.message);
    }
    setUserData(base);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleEdit = () => {
    if (!userData) return;
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      bio: userData.bio,
      department: userData.department,
      studentId: userData.studentId || '',
      matricNo: userData.matricNo || userData.studentId || '',
      employeeId: userData.employeeId || ''
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const next = { ...userData, ...formData };
      setUserData(next);
      localStorage.setItem(`profile-data-${role}`, JSON.stringify(next));
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Could not save profile locally.');
    }
    setIsEditing(false);
    // TODO: Replace with API call when backend profile endpoint is available
  };

  const getRoleDisplay = () => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!userData) return null;

  return (
    <MainLayout userRole={role} activeMenu="profile">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
              {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl font-semibold text-gray-900">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-gray-500 text-sm">{userData.email}</p>
              <div className="flex gap-2 items-center justify-center md:justify-start mt-2">
                <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                  {getRoleDisplay()}
                </span>
                <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                  {userData.department}
                </span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {role === 'student' && (
            <>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.enrolledCourses}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Completed Assignments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.completedAssignments}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.averageGrade}%</p>
              </div>
            </>
          )}
          {role === 'lecturer' && (
            <>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.courses}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.students}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Years Experience</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.yearsExperience}</p>
              </div>
            </>
          )}
          {role === 'admin' && (
            <>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.totalCourses}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500 text-sm">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userData.systemUptime}</p>
              </div>
            </>
          )}
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl p-8 shadow-soft-lg border border-gray-100">
          {isEditing ? (
            <form onSubmit={handleSave}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {role === 'student' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Matric Number
                      </label>
                      <input
                        type="text"
                        value={formData.matricNo}
                        onChange={(e) => setFormData({ ...formData, matricNo: e.target.value })}
                        placeholder="e.g., MAT/CS/23/001"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData.firstName} {userData.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.email}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.department}</p>
                  </div>
                </div>

                {role === 'student' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Matric Number</p>
                      <p className="text-lg font-semibold text-gray-900">{userData.matricNo || userData.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Student ID</p>
                      <p className="text-lg font-semibold text-gray-900">{userData.studentId}</p>
                    </div>
                  </div>
                )}

                {role === 'student' && userData.studentId && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Student ID</p>
                      <p className="text-lg font-semibold text-gray-900">{userData.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Level</p>
                      <p className="text-lg font-semibold text-gray-900">{userData.level}</p>
                    </div>
                  </div>
                )}

                {(role === 'lecturer' || role === 'admin') && userData.employeeId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Employee ID</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.employeeId}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Bio</p>
                  <p className="text-gray-700">{userData.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl p-8 shadow-soft-lg border border-gray-100 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
          <div className="space-y-4">
            <button className="w-full md:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              Change Password
            </button>
            <button className="w-full md:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors ml-0 md:ml-3">
              Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
