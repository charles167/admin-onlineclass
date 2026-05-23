import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout';
import API from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    users: 0, 
    courses: 0, 
    students: 0, 
    lecturers: 0,
    assignments: 0,
    submissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {      
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [usersRes, coursesRes, assignmentsRes, submissionsRes] = await Promise.all([
          API.get('/users/public'),
          API.get('/courses/public'),
          API.get('/assignments/public').catch(() => ({ data: { data: [] } })),
          API.get('/submissions/public').catch(() => ({ data: { data: [] } }))
        ]);
        
        const users = usersRes.data.data || [];
        const courses = coursesRes.data.data || [];
        const assignments = assignmentsRes.data.data || [];
        const submissions = submissionsRes.data.data || [];
        
        const totalStudents = users.filter(u => u.role === 'student').length;
        const totalLecturers = users.filter(u => u.role === 'lecturer').length;
        
        setStats({
          users: users.length,
          courses: courses.length,
          students: totalStudents,
          lecturers: totalLecturers,
          assignments: assignments.length,
          submissions: submissions.length
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.error?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="admin" activeMenu="dashboard">
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <h3 className="text-red-800 font-semibold text-base mb-3">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Users', value: stats.users,
      gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
      iconBg: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
      valueColor: '#6d28d9',
      icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>,
    },
    {
      label: 'Total Courses', value: stats.courses,
      gradient: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      iconBg: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      valueColor: '#1d4ed8',
      icon: <path d="M12 6.253V19.25m0-12.997C10.833 5.477 9.247 5 7.5 5 5.754 5 4.168 5.477 3 6.253V19.25C4.168 18.477 5.754 18 7.5 18c1.747 0 3.333.477 4.5 1.25m0-12.997C13.167 5.477 14.753 5 16.5 5c1.746 0 3.332.477 4.5 1.253V19.25C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.333.477-4.5 1.25"/>,
    },
    {
      label: 'Students', value: stats.students,
      gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      iconBg: 'linear-gradient(135deg, #059669, #34d399)',
      valueColor: '#047857',
      icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></>,
    },
    {
      label: 'Lecturers', value: stats.lecturers,
      gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      iconBg: 'linear-gradient(135deg, #d97706, #fbbf24)',
      valueColor: '#b45309',
      icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    },
  ];

  return (
    <MainLayout userRole="admin" activeMenu="dashboard">
      <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fadeIn">

        {/* Page header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">System overview and management</p>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-5 border border-gray-100 hover:shadow-soft-md transition-all duration-200 relative overflow-hidden"
              style={{ background: stat.gradient }}
            >
              {/* Decorative circle */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
                   style={{ background: stat.iconBg }} />
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                     style={{ background: stat.iconBg }}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    {stat.icon}
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: stat.valueColor }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                href: '/admin/users', title: 'Manage Users', desc: 'View and edit all users',
                iconBg: 'rgba(124,58,237,0.1)', iconColor: '#7c3aed', hoverBorder: '#7c3aed',
                icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
              },
              {
                href: '/admin/courses', title: 'Manage Courses', desc: 'Oversee all courses',
                iconBg: 'rgba(37,99,235,0.1)', iconColor: '#2563eb', hoverBorder: '#2563eb',
                icon: <path d="M12 6.253V19.25m0-12.997C10.833 5.477 9.247 5 7.5 5 5.754 5 4.168 5.477 3 6.253V19.25C4.168 18.477 5.754 18 7.5 18c1.747 0 3.333.477 4.5 1.25m0-12.997C13.167 5.477 14.753 5 16.5 5c1.746 0 3.332.477 4.5 1.253V19.25C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.333.477-4.5 1.25"/>,
              },
              {
                href: '/admin/logs', title: 'System Logs', desc: 'Audit trail & activity',
                iconBg: 'rgba(5,150,105,0.1)', iconColor: '#059669', hoverBorder: '#059669',
                icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
              },
            ].map((action, i) => (
              <a
                key={i}
                href={action.href}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-soft-md transition-all text-left block group"
                style={{ '--hover-border': action.hoverBorder }}
                onMouseEnter={e => e.currentTarget.style.borderColor = action.hoverBorder}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#f3f4f6'}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all"
                     style={{ background: action.iconBg }}>
                  <svg className="w-5 h-5" style={{ color: action.iconColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    {action.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{action.title}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{action.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold transition-colors"
                     style={{ color: action.iconColor }}>
                  Open
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* System Status + Platform Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* System Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Status
            </h2>
            <div className="space-y-3">
              {[
                { name: 'API Server', status: 'Online', color: 'emerald' },
                { name: 'Database', status: 'Connected', color: 'emerald' },
                { name: 'Clerk Auth', status: 'Active', color: 'emerald' },
                { name: 'Firebase', status: 'Initialized', color: 'emerald' },
              ].map((svc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-700">{svc.name}</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Platform Information</h2>
            <div className="space-y-3">
              {[
                { label: 'Version',        value: '1.0.0' },
                { label: 'Environment',    value: process.env.NODE_ENV || 'production' },
                { label: 'Last Updated',   value: new Date().toLocaleDateString() },
                { label: 'Total Platform Users', value: stats.users },
              ].map((info, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{info.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
