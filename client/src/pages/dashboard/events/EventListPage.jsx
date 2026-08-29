import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { eventsService } from '../../../services/events.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import Button from '../../../components/common/Button.jsx';
import { FaEdit, FaTrash, FaCheck, FaDownload, FaCamera } from 'react-icons/fa';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });
  const [editEvent, setEditEvent] = useState({ id: '', title: '', date: '', time: '' });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Coordinators, Dept Convenors, Asst Chief, Admin, Super Admin can manage events
  const canManageEvents = ['SUPER_ADMIN', 'ADMIN', 'ASST_CHIEF_CONVENOR', 'DEPT_CONVENOR', 'DEPT_ASST_CONVENOR', 'COORDINATOR'].includes(user?.role);
  const canScan = ['SUPER_ADMIN', 'ADMIN', 'ASST_CHIEF_CONVENOR', 'DEPT_CONVENOR', 'DEPT_ASST_CONVENOR', 'COORDINATOR'].includes(user?.role);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsService.getEvents();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventsService.createEvent(newEvent);
      setIsModalOpen(false);
      setNewEvent({ title: '', date: '', time: '' });
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleEditEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await eventsService.updateEvent(editEvent.id, {
        title: editEvent.title,
        date: editEvent.date,
        time: editEvent.time
      });
      setIsEditModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event details.');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the event "${title}"? This cannot be undone.`)) {
      try {
        await eventsService.deleteEvent(id);
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event.');
      }
    }
  };

  const handleMarkComplete = async (id) => {
    if (window.confirm('Mark this event as COMPLETED?')) {
      try {
        await eventsService.updateEventStatus(id, 'COMPLETED');
        fetchEvents();
      } catch (error) {
        console.error('Failed to mark event complete:', error);
        alert('Failed to update event status.');
      }
    }
  };

  const handleExportCSV = async (eventId) => {
    try {
      const blob = await eventsService.exportAttendance(eventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const openEditModal = (event) => {
    // Convert ISO date to YYYY-MM-DD for the date input
    const dateFormatted = new Date(event.date).toISOString().split('T')[0];
    setEditEvent({
      id: event.id,
      title: event.title,
      date: dateFormatted,
      time: event.time
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        {canManageEvents && (
          <Button onClick={() => setIsModalOpen(true)}>Create Event</Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.status || 'SCHEDULED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canManageEvents && (
                      <>
                        {event.status !== 'COMPLETED' && (
                          <button 
                            title="Mark as Complete"
                            onClick={() => handleMarkComplete(event.id)}
                            className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded"
                          >
                            <FaCheck size={14} />
                          </button>
                        )}
                        <button 
                          title="Edit Event"
                          onClick={() => openEditModal(event)}
                          className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          title="Delete Event"
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded"
                        >
                          <FaTrash size={14} />
                        </button>
                        
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => navigate(`/dashboard/events/${event.id}/scanner`)}
                          className="ml-2 px-2 py-1"
                        >
                          <FaCamera className="mr-1 inline-block" size={12} /> Scanner
                        </Button>
                      </>
                    )}
                    
                    {event.status === 'COMPLETED' && (
                      <button 
                        title="Export CSV"
                        onClick={() => handleExportCSV(event.id)}
                        className="text-gray-600 hover:text-gray-900 p-1 bg-gray-100 rounded ml-2"
                      >
                        <FaDownload size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Event</h2>
            <form onSubmit={handleEditEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  value={editEvent.title}
                  onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  value={editEvent.date}
                  onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  value={editEvent.time}
                  onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventListPage;
