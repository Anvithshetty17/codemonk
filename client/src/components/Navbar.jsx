import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/CodeMonk.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
            <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-blue-600 hover:text-blue-800 transition-colors tracking-wide" onClick={closeMenu}>
              <img src={logo} alt="CodeMonk Logo" className="h-[71px] w-[45px] object-contain" />
              <span>CODE MONK</span>
            </Link>

          <div className={`absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg p-4 transition-all duration-300 md:static md:bg-transparent md:shadow-none md:rounded-none md:p-0 md:flex md:items-center ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 md:opacity-100 md:visible md:translate-y-0'}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-8">
              <Link 
                to="/" 
                className={`py-4 md:py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors border-b border-gray-200 md:border-b-0 relative ${isActiveLink('/') ? 'text-blue-600 md:after:absolute md:after:bottom-[-0.5rem] md:after:left-0 md:after:right-0 md:after:h-0.5 md:after:bg-blue-600 md:after:rounded' : ''}`}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/team" 
                className={`py-4 md:py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors border-b border-gray-200 md:border-b-0 relative ${isActiveLink('/team') ? 'text-blue-600 md:after:absolute md:after:bottom-[-0.5rem] md:after:left-0 md:after:right-0 md:after:h-0.5 md:after:bg-blue-600 md:after:rounded' : ''}`}
                onClick={closeMenu}
              >
                Team
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`py-4 md:py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors border-b border-gray-200 md:border-b-0 relative ${isActiveLink('/dashboard') ? 'text-blue-600 md:after:absolute md:after:bottom-[-0.5rem] md:after:left-0 md:after:right-0 md:after:h-0.5 md:after:bg-blue-600 md:after:rounded' : ''}`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/teams" 
                    className={`py-4 md:py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors border-b border-gray-200 md:border-b-0 relative ${isActiveLink('/teams') ? 'text-blue-600 md:after:absolute md:after:bottom-[-0.5rem] md:after:left-0 md:after:right-0 md:after:h-0.5 md:after:bg-blue-600 md:after:rounded' : ''}`}
                    onClick={closeMenu}
                  >
                    Teams
                  </Link>
                  <Link 
                    to="/tasks" 
                    className={`py-4 md:py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors border-b border-gray-200 md:border-b-0 relative ${isActiveLink('/tasks') ? 'text-blue-600 md:after:absolute md:after:bottom-[-0.5rem] md:after:left-0 md:after:right-0 md:after:h-0.5 md:after:bg-blue-600 md:after:rounded' : ''}`}
                    onClick={closeMenu}
                  >
                    Tasks
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className={`py-4 md:py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors border-b border-gray-200 md:border-b-0 relative ${isActiveLink('/admin') ? 'text-blue-600 md:after:absolute md:after:bottom-[-0.5rem] md:after:left-0 md:after:right-0 md:after:h-0.5 md:after:bg-blue-600 md:after:rounded' : ''}`}
                      onClick={closeMenu}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 md:pt-0 border-t border-gray-200 md:border-t-0">
                    <span className="text-gray-700 font-medium text-sm text-center md:text-left">Hi, {user?.fullName}</span>
                    <button onClick={handleLogout} className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded font-medium transition-colors">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          <button 
            className={`md:hidden flex flex-col gap-1 bg-transparent border-none cursor-pointer p-2 w-8 h-8 items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded ${isMenuOpen ? 'is-active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span className={`w-5 h-0.5 bg-gray-700 rounded transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-gray-700 rounded transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-gray-700 rounded transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
