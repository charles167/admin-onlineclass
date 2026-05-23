import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminLiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'ended'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    try {
      // Fetch sessions
      const sessionsRes = await api.get(`/live-sessions/admin${filter !== 'all' ? `?status=${filter}` : ''}`);
      setSessions(sessionsRes.data.data || []);
      
      // Fetch stats
      const statsRes = await api.get('/live-sessions/stats');
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      // Fallback to public endpoint
      try {
        const publicRes = await api.get('/live-sessions/public');
        setSessions(publicRes.data.data || []);
      } catch (e) {
        console.error('Error fetching public sessions:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to force end this live session?')) return;

    try {
      const response = await api.delete(`/live-sessions/admin/${sessionId}`);
      if (response.data.success) {
        toast.success('Live session ended successfully');
        fetchData();
      }
    } catch (err) {
      console.error('Error ending session:', err);
      toast.error('Failed to end session');
    }
  };

  const formatDuration = (startTime, endTime = null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = Math.floor((end - start) / 1000 / 60);
    if (diff < 60) return `${diff} min`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  const getLecturerName = (session) => {
    if (session.lecturerId?.name) return session.lecturerId.name;
    if (session.lecturerId?.firstName && session.lecturerId?.lastName) {
      return `${session.lecturerId.firstName} ${session.lecturerId.lastName}`;
    }
    return 'Unknown';
  };

  const filteredSessions = sessions.filter(session => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.courseId?.title?.toLowerCase().includes(searchLower) ||
      session.courseId?.code?.toLowerCase().includes(searchLower) ||
      getLecturerName(session).toLowerCase().includes(searchLower) ||
      session.lecturerId?.email?.toLowerCase().includes(searchLower)
    );
  });

  const activeSessions = filteredSessions.filter(s => s.status === 'active');
  const endedSessions = filteredSessions.filter(s => s.status === 'ended');

  if (loading) {
    return (
      <MainLayout userRole="admin" activeMenu="live-sessions">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading live sessions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="admin" activeMenu="live-sessions">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Live Sessions Monitor</h1>
            <p className="text-gray-500 text-sm mt-0.5">Monitor and manage all live streaming sessions</p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-gray-500 text-sm">Active Now</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats?.activeSessions || activeSessions.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm mb-1">Lecturers Live</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.activeLecturers || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm mb-1">Courses Live</p>
            <p className="text-2xl font-bold text-purple-600">{stats?.activeCourses || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-500 text-sm mb-1">Ended Today</p>
            <p className="text-2xl font-bold text-gray-700">{stats?.endedToday || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row gap-3">
          <div className="flex gap-2">
            {['all', 'active', 'ended'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status} ({status === 'active' ? activeSessions.length : status === 'ended' ? endedSessions.length : sessions.length})
              </button>
            ))}
          </div>
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course, lecturer..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-1">No Sessions Found</h3>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'No sessions match your search criteria' : 'No live sessions to display'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-1">Status</div>
              <div className="col-span-3">Course</div>
              <div className="col-span-2">Lecturer</div>
              <div className="col-span-2">Started</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredSessions.map(session => (
                <div
                  key={session._id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1">
                    {session.status === 'active' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-green-600 text-xs font-medium hidden sm:inline">Live</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span className="text-gray-400 text-xs font-medium hidden sm:inline">Ended</span>
                      </span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className="text-gray-900 text-sm font-medium truncate">{session.courseId?.title || session.title}</p>
                    <p className="text-gray-400 text-xs">{session.courseId?.code}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                        {getLecturerName(session).charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 text-sm truncate">{getLecturerName(session)}</p>
                        <p className="text-gray-400 text-xs truncate">{session.lecturerId?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-700 text-sm">{new Date(session.startedAt).toLocaleDateString()}</p>
                    <p className="text-gray-400 text-xs">{new Date(session.startedAt).toLocaleTimeString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-700 text-sm">{formatDuration(session.startedAt, session.endedAt)}</p>
                    {session.endedAt && (
                      <p className="text-gray-400 text-xs">Ended {new Date(session.endedAt).toLocaleTimeString()}</p>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <a
                      href={session.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Open YouTube"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    {session.status === 'active' && (
                      <button
                        onClick={() => handleEndSession(session._id)}
                        className="px-2 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 transition-colors"
                        title="End Session"
                      >
                        End
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currently Live - Detailed View */}
        {activeSessions.length > 0 && filter !== 'ended' && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Currently Live Streams
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(session => (
                <div
                  key={session._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="aspect-video bg-gray-900 relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${session.liveUrl?.split('v=')[1]?.split('&')[0] || session.liveUrl?.split('live/')[1]?.split('?')[0] || ''}`}
                      title={session.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 font-semibold text-sm mb-0.5">{session.courseId?.title || session.title}</h3>
                    <p className="text-gray-400 text-xs mb-3">
                      {getLecturerName(session)} · {formatDuration(session.startedAt)} ago
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={session.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border border-gray-200 text-gray-700 text-center py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                      >
                        Open in YouTube
                      </a>
                      <button
                        onClick={() => handleEndSession(session._id)}
                        className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50 transition-colors"
                      >
                        End
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pb-4">
          <p className="text-gray-400 text-xs">Auto-refreshing every 30 seconds</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminLiveSessions;
