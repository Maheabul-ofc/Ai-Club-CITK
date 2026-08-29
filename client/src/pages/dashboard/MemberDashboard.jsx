import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card.jsx';
import Table from '../../components/common/Table.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { eventsService } from '../../services/events.js';
import { FaUser, FaIdCard, FaEnvelope, FaGraduationCap, FaPhone } from 'react-icons/fa';

const MemberDashboard = () => {
  const { user } = useAuth();

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', { status: 'SCHEDULED', limit: 3 }],
    queryFn: () => eventsService.getEvents({ status: 'SCHEDULED', limit: 3 })
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['myAttendance'],
    queryFn: () => eventsService.getMyAttendance()
  });

  const upcomingEvents = eventsData?.data || [];
  const attendanceHistory = attendanceData?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="col-span-1 md:col-span-1">
          <div className="flex flex-col items-center pb-6 border-b border-gray-100">
            <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-4">
              <FaUser size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <span className="px-3 py-1 mt-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          
          <div className="pt-6 space-y-4">
            <div className="flex items-center text-gray-600">
              <FaEnvelope className="mr-3 text-gray-400" />
              <span className="text-sm">{user?.email}</span>
            </div>
            {user?.rollNumber && (
              <div className="flex items-center text-gray-600">
                <FaIdCard className="mr-3 text-gray-400" />
                <span className="text-sm">{user.rollNumber}</span>
              </div>
            )}
            {user?.branch && (
              <div className="flex items-center text-gray-600">
                <FaGraduationCap className="mr-3 text-gray-400" />
                <span className="text-sm">{user.branch} {user.semester ? `(Sem ${user.semester})` : ''}</span>
              </div>
            )}
            {user?.contactNumber && (
              <div className="flex items-center text-gray-600">
                <FaPhone className="mr-3 text-gray-400" />
                <span className="text-sm">{user.contactNumber}</span>
              </div>
            )}
          </div>
        </Card>

        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
            {eventsLoading ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50">
                    <div>
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center text-gray-500">
                No upcoming events scheduled at the moment.
              </div>
            )}
          </Card>

          {/* Attendance */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">My Attendance</h2>
            {attendanceLoading ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : (
              <Table 
                columns={[
                  { label: 'Event', key: 'eventTitle' },
                  { label: 'Date', key: 'eventDate' },
                  { label: 'Timestamp', key: 'timestamp' }
                ]} 
                data={attendanceHistory.map(record => ({
                  id: record.id,
                  eventTitle: record.event?.title || 'Unknown Event',
                  eventDate: record.event?.date ? new Date(record.event.date).toLocaleDateString() : 'N/A',
                  timestamp: new Date(record.timestamp).toLocaleString()
                }))}
                emptyMessage="No attendance records found."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
