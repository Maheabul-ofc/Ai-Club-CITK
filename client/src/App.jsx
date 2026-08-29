import React from 'react';
import { Routes, Route, Outlet } from 'react-router';

// Layouts
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import DashboardShell from './components/layout/DashboardShell.jsx';

// Common/Auth
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// Public Pages
import LandingPage from './pages/public/LandingPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import SignupMemberPage from './pages/public/SignupMemberPage.jsx';
import SignupCoordinatorPage from './pages/public/SignupCoordinatorPage.jsx';
import UnauthorizedPage from './pages/public/UnauthorizedPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

// Layout component for public pages
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 flex flex-col">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Dashboard Pages
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard.jsx';
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
import MemberDashboard from './pages/dashboard/MemberDashboard.jsx';
import AsstChiefDashboard from './pages/dashboard/AsstChiefDashboard.jsx';
import DeptConvenorDashboard from './pages/dashboard/DeptConvenorDashboard.jsx';
import CoordinatorDashboard from './pages/dashboard/CoordinatorDashboard.jsx';
import EventListPage from './pages/dashboard/events/EventListPage.jsx';
import LiveScannerPage from './pages/dashboard/events/LiveScannerPage.jsx';
import AnalyticsDashboard from './pages/dashboard/AnalyticsDashboard.jsx';
import AuditLogPage from './pages/dashboard/AuditLogPage.jsx';
import ProfileEditPage from './pages/dashboard/ProfileEditPage.jsx';
import LeadershipManagementPage from './pages/dashboard/LeadershipManagementPage.jsx';
import DepartmentDetailsPage from './pages/dashboard/DepartmentDetailsPage.jsx';

const App = () => {
  return (
    <Routes>
      {/* Public Routes with Navbar and Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup/member" element={<SignupMemberPage />} />
        <Route path="/signup/coordinator" element={<SignupCoordinatorPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="super-admin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="asst-chief" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ASST_CHIEF_CONVENOR']}>
              <AsstChiefDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="dept-convenor" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DEPT_CONVENOR', 'DEPT_ASST_CONVENOR']}>
              <DeptConvenorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="coordinator" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COORDINATOR']}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="member" element={
            <ProtectedRoute allowedRoles={['MEMBER']}>
              <MemberDashboard />
            </ProtectedRoute>
          } />

          {/* Events Routes */}
          <Route path="events" element={<EventListPage />} />
          <Route path="events/:id/scanner" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ASST_CHIEF_CONVENOR', 'DEPT_CONVENOR', 'DEPT_ASST_CONVENOR', 'COORDINATOR']}>
              <LiveScannerPage />
            </ProtectedRoute>
          } />

          {/* Analytics & Audit Routes */}
          <Route path="analytics" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ASST_CHIEF_CONVENOR']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="audit" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AuditLogPage />
            </ProtectedRoute>
          } />

          <Route path="leadership" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <LeadershipManagementPage />
            </ProtectedRoute>
          } />

          <Route path="departments/:id" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <DepartmentDetailsPage />
            </ProtectedRoute>
          } />

          {/* Profile Route */}
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          } />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
