import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

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
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <span className="brand-text">CODE MONK</span>
          </Link>

          <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
            <div className="navbar-nav">
              <Link 
                to="/" 
                className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/team" 
                className={`nav-link ${isActiveLink('/team') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Team
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`nav-link ${isActiveLink('/dashboard') ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className={`nav-link ${isActiveLink('/admin') ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="nav-user">
                    <span className="user-name">Hi, {user?.fullName}</span>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="btn btn-primary btn-sm"
                  onClick={closeMenu}
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>

          <button 
            className={`navbar-burger ${isMenuOpen ? 'is-active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
