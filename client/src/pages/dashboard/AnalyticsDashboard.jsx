import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  FaUsers, 
  FaUserTie, 
  FaBuilding, 
  FaCalendarAlt, 
  FaClock, 
  FaCalendarCheck 
} from 'react-icons/fa';
import Card from '../../components/common/Card.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { analyticsService } from '../../services/analytics.js';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ icon: Icon, title, value, color }) => (
  <Card className="flex items-center p-4">
    <div className={`p-4 rounded-full mr-4`} style={{ backgroundColor: `${color}20`, color: color }}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </Card>
);

const AnalyticsDashboard = () => {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverviewStats,
  });

  const { data: memberGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ['analytics', 'memberGrowth'],
    queryFn: analyticsService.getMemberGrowth,
  });

  const { data: attendanceStats, isLoading: attendanceLoading } = useQuery({
    queryKey: ['analytics', 'attendanceStats'],
    queryFn: analyticsService.getAttendanceStats,
  });

  const { data: departmentBreakdown, isLoading: deptLoading } = useQuery({
    queryKey: ['analytics', 'departmentBreakdown'],
    queryFn: analyticsService.getDepartmentBreakdown,
  });

  const isLoading = overviewLoading || growthLoading || attendanceLoading || deptLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of platform statistics and metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={FaUsers} 
          title="Total Members" 
          value={overview?.data?.totalMembers || 0} 
          color="#3b82f6" 
        />
        <StatCard 
          icon={FaUserTie} 
          title="Total Coordinators" 
          value={overview?.data?.totalCoordinators || 0} 
          color="#10b981" 
        />
        <StatCard 
          icon={FaBuilding} 
          title="Total Departments" 
          value={overview?.data?.totalDepartments || 0} 
          color="#8b5cf6" 
        />
        <StatCard 
          icon={FaCalendarAlt} 
          title="Total Events" 
          value={overview?.data?.totalEvents || 0} 
          color="#f59e0b" 
        />
        <StatCard 
          icon={FaClock} 
          title="Pending Approvals" 
          value={overview?.data?.pendingApprovals || 0} 
          color="#ef4444" 
        />
        <StatCard 
          icon={FaCalendarCheck} 
          title="Upcoming Events" 
          value={overview?.data?.upcomingEvents || 0} 
          color="#ec4899" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Member Growth (Last 6 Months)</h2>
          <div className="h-80">
            {memberGrowth?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memberGrowth.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="New Members" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </Card>

        {/* Top 5 Events by Attendance Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Events by Attendance</h2>
          <div className="h-80">
            {attendanceStats?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceStats.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" name="Attendees" fill="#10b981">
                    {attendanceStats.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </Card>

        {/* Department Breakdown Chart */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Department Breakdown</h2>
          <div className="h-80">
            {departmentBreakdown?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentBreakdown.data}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentBreakdown.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No data available</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
