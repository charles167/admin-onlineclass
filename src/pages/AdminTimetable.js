import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';

const AdminTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  useEffect(() => {
    fetchAllTimetables();
  }, []);

  const fetchAllTimetables = async () => {
    try {
      setLoading(true);
      const response = await API.get('/timetable/');
      setTimetables(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load timetables');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;

    try {
      await API.delete(`/timetable/${id}`);
      toast.success('Timetable deleted successfully');
      fetchAllTimetables();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete timetable');
    }
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter timetables
  const filteredTimetables = timetables.filter((t) => {
    const matchesSearch = 
      t.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lecturerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = !filterSemester || t.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  if (loading) return <div className="text-center py-12">Loading timetables...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">All Course Timetables</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor all course schedules</p>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by course name or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">All Semesters</option>
              <option value="Harmattan">Harmattan</option>
              <option value="Rain">Rain</option>
            </select>
            <button
              onClick={fetchAllTimetables}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Timetables List */}
        <div className="p-6">
          {filteredTimetables.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No timetables found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTimetables.map((timetable) => (
                <div key={timetable._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                  {/* Timetable Header */}
                  <div className="bg-purple-50 p-4 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Course</p>
                        <p className="text-lg font-bold text-gray-800">{timetable.courseName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Instructor</p>
                        <p className="text-lg font-bold text-gray-800">{timetable.lecturerName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Semester</p>
                        <p className="text-lg font-bold text-gray-800">{timetable.semester} {timetable.year}</p>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => handleDelete(timetable._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Sessions */}
                  <div className="p-4 space-y-2">
                    {timetable.schedule.length > 0 ? (
                      timetable.schedule.map((session, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                          <span className="font-semibold text-gray-700 w-20">{session.day}</span>
                          <span className="text-gray-600">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </span>
                          <span className="text-gray-600">{session.classroom}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No sessions scheduled</p>
                    )}
                  </div>

                  {/* Notes */}
                  {timetable.notes && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-600"><strong>Notes:</strong> {timetable.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTimetable;
