import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { 
  FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt, 
  FaUsers, FaCalendarAlt, FaBuilding, FaClipboardList, FaChartBar, FaUserEdit 
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../common/Button.jsx';

const DashboardShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const roleColors = {
    SUPER_ADMIN: 'bg-red-100 text-red-800',
    ADMIN: 'bg-orange-100 text-orange-800',
    ASST_CHIEF_CONVENOR: 'bg-purple-100 text-purple-800',
    DEPT_CONVENOR: 'bg-blue-100 text-blue-800',
    DEPT_ASST_CONVENOR: 'bg-cyan-100 text-cyan-800',
    COORDINATOR: 'bg-green-100 text-green-800',
    MEMBER: 'bg-gray-100 text-gray-800'
  };

  const navLinks = {
    SUPER_ADMIN: [
      { path: '/dashboard/super-admin', label: 'Overview', icon: FaTachometerAlt },
      { path: '/dashboard/analytics', label: 'Analytics', icon: FaChartBar },
      { path: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
      { path: '/dashboard/admin', label: 'Team & Departments', icon: FaUsers },
      { path: '/dashboard/leadership', label: 'Leadership', icon: FaUsers },
      { path: '/dashboard/audit', label: 'Audit Log', icon: FaClipboardList },
      { path: '/dashboard/profile', label: 'My Profile', icon: FaUserEdit },
    ],
    ADMIN: [
      { path: '/dashboard/admin', label: 'Overview', icon: FaTachometerAlt },
      { path: '/dashboard/analytics', label: 'Analytics', icon: FaChartBar },
      { path: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
      { path: '/dashboard/leadership', label: 'Leadership', icon: FaUsers },
      { path: '/dashboard/profile', label: 'My Profile', icon: FaUserEdit },
    ],
    ASST_CHIEF_CONVENOR: [
      { path: '/dashboard/asst-chief', label: 'Overview', icon: FaTachometerAlt },
      { path: '/dashboard/analytics', label: 'Analytics', icon: FaChartBar },
      { path: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
      { path: '/dashboard/profile', label: 'My Profile', icon: FaUserEdit },
    ],
    DEPT_CONVENOR: [
      { path: '/dashboard/dept-convenor', label: 'Overview', icon: FaTachometerAlt },
      { path: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
      { path: '/dashboard/profile', label: 'My Profile', icon: FaUserEdit },
    ],
    DEPT_ASST_CONVENOR: [
      { path: '/dashboard/dept-convenor', label: 'Overview', icon: FaTachometerAlt },
      { path: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
      { path: '/dashboard/profile', label: 'My Profile', icon: FaUserEdit },
    ],
    COORDINATOR: [
      { path: '/dashboard/coordinator', label: 'Overview', icon: FaTachometerAlt },
      { path: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
      { path: '/dashboard/profile', label: 'My Profile', icon: FaUserEdit },
    ],
    MEMBER: [
      { path: '/dashboard/member', label: 'Overview', icon: FaTachometerAlt },
      { path: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
      { path: '/dashboard/profile', label: 'My Profile', icon: FaUserEdit },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-brand-950 text-white">
          <div className="flex items-center gap-2 font-bold text-lg cursor-pointer" onClick={() => navigate('/')}>
            AI Club
          </div>
          <button className="md:hidden text-white" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <div className="font-medium text-gray-900">{user?.name}</div>
          <div className={`inline-block px-2 py-0.5 mt-1 text-xs font-semibold rounded-full ${roleColors[user?.role] || 'bg-gray-100'}`}>
            {user?.role?.replace(/_/g, ' ')}
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
            <FaBars className="w-6 h-6" />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600">
              <FaSignOutAlt className="mr-2" /> Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
