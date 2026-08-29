import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaBars, FaTimes, FaBrain } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../common/Button.jsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'SUPER_ADMIN': return '/dashboard/super-admin';
      case 'ADMIN': return '/dashboard/admin';
      case 'ASST_CHIEF_CONVENOR': return '/dashboard/asst-chief';
      case 'DEPT_CONVENOR': return '/dashboard/dept-convenor';
      case 'COORDINATOR': return '/dashboard/coordinator';
      case 'MEMBER': return '/dashboard/member';
      default: return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-950/90 backdrop-blur-md border-b border-brand-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-brand-300 transition-colors">
              <FaBrain className="text-brand-400" />
              <span>AI Club</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#home" className="hover:text-brand-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
              <a href="#about" className="hover:text-brand-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
              <a href="#events" className="hover:text-brand-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Events</a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate(getDashboardRoute())} variant="primary">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="ghost" className="text-white hover:text-brand-600 hover:bg-white">
                  Login
                </Button>
                <Button onClick={() => navigate('/signup/member')} variant="primary">
                  Join Us
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-brand-800 focus:outline-none"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-brand-900 border-t border-brand-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-800">Home</a>
            <a href="#about" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-800">About</a>
            <a href="#events" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-800">Events</a>
            
            <div className="mt-4 pt-4 border-t border-brand-800 flex flex-col gap-2 px-3">
              {isAuthenticated ? (
                <Button onClick={() => { toggleMenu(); navigate(getDashboardRoute()); }} className="w-full">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => { toggleMenu(); navigate('/login'); }} variant="secondary" className="w-full bg-white text-brand-900">
                    Login
                  </Button>
                  <Button onClick={() => { toggleMenu(); navigate('/signup/member'); }} className="w-full">
                    Join Us
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
