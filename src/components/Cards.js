import React from 'react';

/* Course Card Component */
export const CourseCard = ({ 
  title = 'Introduction to React',
  instructor = 'John Smith',
  students = 234,
  progress = 65,
  thumbnail = '📚',
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
    >
      <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform">
        {thumbnail}
      </div>
      
      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">by {instructor}</p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-semibold text-primary-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span className="flex items-center gap-1">👥 {students} students</span>
        <button className="text-primary-600 hover:text-primary-700 font-semibold">
          View →
        </button>
      </div>
    </div>
  );
};

/* Stat Card Component */
export const StatCard = ({ 
  icon = '📊',
  label = 'Total Students',
  value = '1,234',
  change = '+12%',
  isPositive = true,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-soft-md hover:shadow-soft-lg transition-all border border-gray-100 group hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
            isPositive 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
    </div>
  );
};

/* Assignment Card Component */
export const AssignmentCard = ({ 
  title = 'React Hooks Assignment',
  course = 'Advanced React',
  dueDate = 'Dec 15, 2024',
  status = 'pending',
  daysLeft = 5,
  onClick
}) => {
  const statusConfig = {
    pending: { icon: '⏳', label: 'Pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
    submitted: { icon: '✓', label: 'Submitted', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    graded: { icon: '✅', label: 'Graded', bgColor: 'bg-green-100', textColor: 'text-green-700' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div 
      onClick={onClick}
      className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
          {config.icon} {config.label}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{course}</p>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span>📅</span>
          <span>Due: {dueDate}</span>
        </div>
        {status === 'pending' && (
          <span className={`font-semibold ${
            daysLeft <= 3 ? 'text-red-600' : 'text-gray-700'
          }`}>
            {daysLeft} days left
          </span>
        )}
      </div>

      {status === 'pending' && (
        <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
          Submit Assignment
        </button>
      )}
    </div>
  );
};

/* Lecture Card Component */
export const LectureCard = ({ 
  title = 'Introduction to Variables',
  instructor = 'Sarah Johnson',
  scheduled = 'Today at 2:00 PM',
  students = 45,
  isLive = false,
  thumbnail = '🎥',
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden ${
        isLive 
          ? 'border-red-300 bg-red-50/30' 
          : 'border-gray-200 hover:border-primary-300'
      }`}
    >
      {isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          LIVE
        </div>
      )}
      
      <div className="w-full h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform">
        {thumbnail}
      </div>
      
      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
      <p className="text-gray-600 text-sm mb-3">with {instructor}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="flex items-center gap-1">⏰ {scheduled}</span>
        <span className="flex items-center gap-1">👥 {students}</span>
      </div>

      {isLive && (
        <button className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-500 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all">
          Join Now
        </button>
      )}
    </div>
  );
};

/* File Card Component */
export const FileCard = ({ 
  fileName = 'lecture_notes.pdf',
  type = 'pdf',
  size = '2.4 MB',
  uploadDate = 'Dec 10, 2024',
  onClick,
  onDownload
}) => {
  const typeIcons = {
    pdf: '📄',
    doc: '📝',
    video: '🎥',
    image: '🖼️'
  };

  return (
    <div 
      onClick={onClick}
      className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
        {typeIcons[type] || '📄'}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{fileName}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span>{size}</span>
          <span>•</span>
          <span>{uploadDate}</span>
        </div>
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDownload?.();
        }}
        className="w-10 h-10 bg-primary-100 hover:bg-primary-600 text-primary-600 hover:text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
        title="Download"
      >
        ⬇️
      </button>
    </div>
  );
};

/* User Card Component */
export const UserCard = ({ 
  name = 'John Doe',
  email = 'john@example.com',
  avatar = '👤',
  role = 'Student',
  status = 'active',
  joinDate = 'Oct 15, 2024',
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
          {avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-primary-600 transition-colors">{name}</h3>
          <p className="text-gray-600 text-sm truncate mb-2">{email}</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {status === 'active' ? '🟢' : '⚪'} {status}
            </span>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
              {role}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-2">Joined {joinDate}</p>
        </div>
      </div>
    </div>
  );
};

const Cards = { CourseCard, StatCard, AssignmentCard, LectureCard, FileCard, UserCard };
export default Cards;
