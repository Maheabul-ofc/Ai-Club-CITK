import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUser, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { getMyApprovalStatus } from '../../services/approvals.js';
import { eventsService } from '../../services/events.js';

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['myApprovalStatus'],
    queryFn: getMyApprovalStatus,
    enabled: user?.approvalStatus !== 'ACTIVE'
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', { status: 'SCHEDULED', limit: 3 }],
    queryFn: () => eventsService.getEvents({ status: 'SCHEDULED', limit: 3 }),
    enabled: user?.approvalStatus === 'ACTIVE'
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['myAttendance'],
    queryFn: () => eventsService.getMyAttendance(),
    enabled: user?.approvalStatus === 'ACTIVE'
  });

  const upcomingEvents = eventsData?.data || [];
  const attendanceHistory = attendanceData?.data || [];

  const renderStatusStepper = (currentStatus) => {
    const steps = [
      { id: 'PENDING_DEPT_REVIEW', label: 'Department Review' },
      { id: 'PENDING_ASST_CHIEF_REVIEW', label: 'Asst Chief Review' },
      { id: 'ACTIVE', label: 'Approved' }
    ];

    let currentIndex = 0;
    if (currentStatus === 'PENDING_ASST_CHIEF_REVIEW') currentIndex = 1;
    if (currentStatus === 'ACTIVE') currentIndex = 2;

    return (
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto my-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
        <div 
          className="absolute left-0 top-1/2 h-1 bg-blue-600 -z-10 transform -translate-y-1/2 transition-all duration-300" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-white ${
                isCompleted ? 'border-green-500 text-green-500' : 
                isCurrent ? 'border-blue-600 text-blue-600' : 
                'border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? <FaCheckCircle /> : index + 1}
              </div>
              <span className={`text-xs sm:text-sm mt-2 font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading && user?.approvalStatus !== 'ACTIVE') {
    return <LoadingSpinner />;
  }

  // Handle PENDING states
  if (user?.approvalStatus === 'PENDING_DEPT_REVIEW' || user?.approvalStatus === 'PENDING_ASST_CHIEF_REVIEW') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="p-8 text-center">
            <FaClock className="text-5xl text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h1>
            <p className="text-gray-600 mb-8">
              Your application is currently being reviewed. You'll have full access once approved.
            </p>
            
            {renderStatusStepper(user.approvalStatus)}
            
            {statusData?.remarks && (
              <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-left inline-block max-w-2xl w-full">
                <span className="font-semibold block mb-1">Feedback from Reviewer:</span>
                <p className="italic">{statusData.remarks}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Handle REJECTED state
  if (user?.approvalStatus === 'REJECTED') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="p-8 text-center">
            <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Rejected</h1>
            <p className="text-gray-600 mb-6">
              Unfortunately, your application to become a coordinator has been rejected.
            </p>
            
            {statusData?.remarks && (
              <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg text-left inline-block max-w-2xl w-full border border-red-100">
                <span className="font-semibold block mb-1">Reason for Rejection:</span>
                <p className="italic">{statusData.remarks}</p>
              </div>
            )}
            
            <div>
              <Button onClick={() => window.location.href = 'mailto:admin@aiclub.com'}>
                Contact Admin
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Handle ACTIVE state (Approved)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Coordinator Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <div className="p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl mb-4">
                <FaUser />
              </div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-blue-600 font-medium">{user?.role}</p>
            </div>
            <div className="pt-6 space-y-4 text-sm">
              <div className="flex items-center text-gray-600">
                <FaBuilding className="mr-3 text-gray-400" />
                <span>{user?.department?.name || 'Department Not Set'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-semibold mr-2 w-16">Email:</span>
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-semibold mr-2 w-16">Roll No:</span>
                <span>{user?.rollNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Upcoming Events</h2>
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
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">My Attendance</h2>
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
