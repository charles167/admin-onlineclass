import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Icon = ({ name, className = 'w-5 h-5' }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
    courses: <path d="M12 6.253V19.25m0-12.997C10.833 5.477 9.247 5 7.5 5 5.754 5 4.168 5.477 3 6.253V19.25C4.168 18.477 5.754 18 7.5 18c1.747 0 3.333.477 4.5 1.25m0-12.997C13.167 5.477 14.753 5 16.5 5c1.746 0 3.332.477 4.5 1.253V19.25C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.333.477-4.5 1.25"/>,
    assignments: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></>,
    grades: <><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></>,
    grading: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    live: <><path d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14"/><rect x="1" y="6" width="15" height="13" rx="2"/></>,
    materials: <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>,
    timetable: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>,
    attendance: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></>,
    tutor: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    departments: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></>,
    logs: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
    'live-sessions': <><circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z"/></>,
    'student-analytics': <><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></>,
    'lecturer-analytics': <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    reports: <><path d="M18 20V10M12 20V4M6 20v-6"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></>,
    'chevron-left': <path d="M15 19l-7-7 7-7"/>,
    'chevron-right': <path d="M9 5l7 7-7 7"/>,
    'chevron-down': <path d="M6 9l6 6 6-6"/>,
    'chevron-up': <path d="M18 15l-6-6-6 6"/>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || <circle cx="12" cy="12" r="9"/>}
    </svg>
  );
};

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('') || '?';

export const Sidebar = ({ userRole = 'student', activeMenu = 'dashboard', isMobileOpen = false, onMobileClose = () => {} }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const menuItems = {
    student: [
      { icon: 'dashboard', label: 'Dashboard', id: 'dashboard', path: '/student/dashboard' },
      { icon: 'courses', label: 'My Courses', id: 'courses', path: '/student/courses' },
      { icon: 'assignments', label: 'Assignments', id: 'assignments', path: '/student/assignments' },
      { icon: 'grades', label: 'Grades', id: 'grades', path: '/student/grades' },
      { icon: 'live', label: 'Live Classes', id: 'live', path: '/student/live' },
      { icon: 'materials', label: 'Course Materials', id: 'materials', path: '/student/materials' },
      { icon: 'attendance', label: 'Attendance', id: 'attendance', subitems: [
        { label: 'Mark Attendance', path: '/student/attendance/mark' },
        { label: 'Attendance History', path: '/student/attendance/history' }
      ] },
      { icon: 'timetable', label: 'Timetable', id: 'timetable', path: '/student/timetable' },
      { icon: 'tutor', label: 'AI Tutor', id: 'tutor', path: '/student/ai-tutor' },
    ],
    lecturer: [
      { icon: 'dashboard', label: 'Dashboard', id: 'dashboard', path: '/lecturer/dashboard' },
      { icon: 'courses', label: 'My Courses', id: 'courses', path: '/lecturer/courses' },
      { icon: 'assignments', label: 'Assignments', id: 'assignments', path: '/lecturer/assignments' },
      { icon: 'grades', label: 'Student Grades', id: 'grades', path: '/lecturer/grades' },
      { icon: 'grading', label: 'Grading', id: 'grading', path: '/lecturer/grading' },
      { icon: 'live', label: 'Live Classes', id: 'live', path: '/lecturer/live' },
      { icon: 'materials', label: 'Course Materials', id: 'materials', path: '/lecturer/materials' },
      { icon: 'timetable', label: 'Timetable', id: 'timetable', path: '/lecturer/timetable' },
      { icon: 'attendance', label: 'Attendance', id: 'attendance', subitems: [
        { label: 'Create Session', path: '/lecturer/attendance/create' },
        { label: 'View Calendar', path: '/lecturer/attendance/calendar' }
      ] },
    ],
    admin: [
      { icon: 'dashboard', label: 'Dashboard', id: 'dashboard', path: '/admin/dashboard' },
      { icon: 'users', label: 'Users', id: 'users', path: '/admin/users' },
      { icon: 'courses', label: 'Courses', id: 'courses', path: '/admin/courses' },
      { icon: 'departments', label: 'Departments', id: 'departments', path: '/admin/departments' },
      { icon: 'timetable', label: 'Timetables', id: 'timetables', path: '/admin/timetable' },
      { icon: 'logs', label: 'Logs', id: 'logs', path: '/admin/logs' },
      { icon: 'live-sessions', label: 'Live Sessions', id: 'live-sessions', path: '/admin/live-sessions' },
      { icon: 'materials', label: 'Materials', id: 'materials', path: '/admin/materials' },
      { icon: 'student-analytics', label: 'Student Analytics', id: 'student-analytics', path: '/admin/student-analytics' },
      { icon: 'lecturer-analytics', label: 'Lecturer Analytics', id: 'lecturer-analytics', path: '/admin/lecturer-analytics' },
      { icon: 'reports', label: 'System Reports', id: 'reports', path: '/admin/reports' },
    ],
  };

  const items = menuItems[userRole] || menuItems.student;

  const handleLogout = () => {
    ['token', 'adminToken', 'adminId', 'adminEmail', 'adminName', 'isAdminLoggedIn',
     'user', 'isAuthenticated', 'userRole', 'userName'].forEach(key => localStorage.removeItem(key));
    navigate('/login');
  };

  return (
    <aside
      className={`fixed md:relative z-50 md:z-auto h-screen text-white flex flex-col transition-all duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isCollapsed ? 'md:w-[72px] w-60' : 'w-60'}`}
      style={{ background: '#0d0d20', borderRight: '1px solid rgba(124,58,237,0.15)' }}
    >
      {/* Header */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
              <span className="text-white font-bold text-sm leading-none">E</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-white leading-tight truncate">EduPlatform</h1>
                <p className="text-xs leading-tight" style={{ color: '#a78bfa', opacity: 0.75 }}>Admin Portal</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="transition-colors p-1 rounded-md flex-shrink-0"
              style={{ color: 'rgba(167,139,250,0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,139,250,0.5)'}
              title="Collapse sidebar"
            >
              <Icon name="chevron-left" className="w-4 h-4"/>
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-3 w-full flex justify-center transition-colors p-1 rounded-md"
            style={{ color: 'rgba(167,139,250,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,139,250,0.5)'}
            title="Expand sidebar"
          >
            <Icon name="chevron-right" className="w-4 h-4"/>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (item.subitems) {
                  setOpenSubmenu(openSubmenu === item.id ? null : item.id);
                } else {
                  navigate(item.path);
                  onMobileClose();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isCollapsed ? 'justify-center' : ''}`}
              style={
                item.id === activeMenu || (item.subitems && item.subitems.some(sub => sub.path === window.location.pathname))
                  ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(109,40,217,0.25))', color: '#e9d5ff', borderLeft: '2px solid #7c3aed' }
                  : { color: 'rgba(167,139,250,0.65)', borderLeft: '2px solid transparent' }
              }
              onMouseEnter={e => {
                const isActive = item.id === activeMenu || (item.subitems && item.subitems.some(sub => sub.path === window.location.pathname));
                if (!isActive) { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#e9d5ff'; }
              }}
              onMouseLeave={e => {
                const isActive = item.id === activeMenu || (item.subitems && item.subitems.some(sub => sub.path === window.location.pathname));
                if (!isActive) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(167,139,250,0.65)'; }
              }}
              title={isCollapsed ? item.label : ''}
            >
              <Icon name={item.icon} className="w-[18px] h-[18px] flex-shrink-0"/>
              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {item.subitems && (
                    <Icon name={openSubmenu === item.id ? 'chevron-up' : 'chevron-down'} className="w-3.5 h-3.5 opacity-60"/>
                  )}
                </>
              )}
            </button>
            {item.subitems && openSubmenu === item.id && !isCollapsed && (
              <div className="ml-7 mt-0.5 space-y-0.5 border-l border-gray-800 pl-3">
                {item.subitems.map((subitem, idx) => (
                  <button
                    key={idx}
                    onClick={() => { navigate(subitem.path); onMobileClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-medium"
                    style={{
                      color: subitem.path === window.location.pathname ? '#a78bfa' : 'rgba(139,100,210,0.6)',
                      background: subitem.path === window.location.pathname ? 'rgba(124,58,237,0.12)' : '',
                    }}
                  >
                    <span className="w-1 h-1 rounded-full bg-current opacity-70"/>
                    {subitem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(124,58,237,0.15)' }}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
            isCollapsed ? 'justify-center' : ''
          }`}
          style={{ color: 'rgba(167,139,250,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(167,139,250,0.5)'; }}
          title="Logout"
        >
          <Icon name="logout" className="w-[18px] h-[18px] flex-shrink-0"/>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export const Header = ({ userName, userRole = 'student', onMobileToggle = () => {} }) => {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const storedUserName = localStorage.getItem('adminName') || localStorage.getItem('userName');
  const storedUserRole = localStorage.getItem('userRole') || userRole;

  const roleConfig = {
    student: { label: 'Student' },
    lecturer: { label: 'Lecturer' },
    admin: { label: 'Administrator' }
  };

  const currentRole = roleConfig[storedUserRole] || roleConfig.admin;
  const displayName = storedUserName || userName || 'Admin';

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    ['token', 'adminToken', 'adminId', 'adminEmail', 'adminName', 'isAdminLoggedIn',
     'user', 'isAuthenticated', 'userRole', 'userName'].forEach(key => localStorage.removeItem(key));
    navigate('/login');
  };

  const notifications = [
    { title: 'New User Registered', time: '5 min ago', color: 'bg-primary-500' },
    { title: 'Course Submission Received', time: '1 hour ago', color: 'bg-green-500' },
    { title: 'System Report Ready', time: '2 hours ago', color: 'bg-amber-500' }
  ];

  return (
    <header className="bg-white sticky top-0 z-40" style={{ borderBottom: '1px solid #f3f4f6', boxShadow: '0 1px 0 rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3.5">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMobileToggle}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Search */}
        <div className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              type="text"
              placeholder="Search users, courses…"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Notifications"
            >
              <Icon name="bell" className="w-5 h-5"/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full"/>
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-[300px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.color}`}/>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-xs">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                   style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                <span className="text-white font-semibold text-xs">{getInitials(displayName)}</span>
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{displayName}</p>
                <p className="text-xs text-gray-400 leading-tight">{currentRole.label}</p>
              </div>
              <Icon name="chevron-down" className="w-3.5 h-3.5 text-gray-400 hidden md:block"/>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-400">{currentRole.label}</p>
                </div>
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Icon name="user" className="w-4 h-4 text-gray-400"/>
                    <span className="text-sm text-gray-700">Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Icon name="settings" className="w-4 h-4 text-gray-400"/>
                    <span className="text-sm text-gray-700">Settings</span>
                  </button>
                  <div className="my-1 border-t border-gray-100"/>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                  >
                    <Icon name="logout" className="w-4 h-4 text-red-400"/>
                    <span className="text-sm text-red-600 font-medium">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const MainLayout = ({ children, userRole = 'student', activeMenu = 'dashboard' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        userRole={userRole}
        activeMenu={activeMenu}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header userRole={userRole} onMobileToggle={() => setMobileOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
