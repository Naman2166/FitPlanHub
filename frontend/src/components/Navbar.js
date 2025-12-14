import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FiUser, FiLogOut, FiSettings, FiMenu, FiX, FiHome, FiGrid, FiHeart } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setShowMobileMenu(false)}>
          <h2>💪 FitPlanHub</h2>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="navbar-links desktop-nav">
          {user ? (
            <>
              {user.role === 'trainer' ? (
                <Link to="/trainer/dashboard" className="nav-link">
                  <FiGrid className="nav-icon" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/feed" className="nav-link">
                    <FiHeart className="nav-icon" />
                    My Feed
                  </Link>
                  <Link to="/" className="nav-link">
                    <FiHome className="nav-icon" />
                    Browse Plans
                  </Link>
                </>
              )}
              <div className="user-menu-wrapper" ref={menuRef}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    <FiUser />
                  </div>
                  <span className="user-name">{user.name}</span>
                  <span className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>▼</span>
                </button>
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <div className="user-avatar-large">
                        <FiUser />
                      </div>
                      <div>
                        <div className="user-menu-name">{user.name}</div>
                        <div className="user-menu-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="user-menu-divider"></div>
                    {user.role === 'user' && (
                      <Link
                        to="/profile"
                        className="user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiUser className="menu-icon" />
                        My Profile
                      </Link>
                    )}
                    <Link
                      to={user.role === 'trainer' ? '/trainer/dashboard' : '/feed'}
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiSettings className="menu-icon" />
                      {user.role === 'trainer' ? 'Dashboard' : 'My Feed'}
                    </Link>
                    <div className="user-menu-divider"></div>
                    <button className="user-menu-item logout" onClick={handleLogout}>
                      <FiLogOut className="menu-icon" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="mobile-nav">
          {user ? (
            <>
              <div className="mobile-user-info">
                <div className="user-avatar">
                  <FiUser />
                </div>
                <div>
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
              </div>
              {user.role === 'trainer' ? (
                <Link
                  to="/trainer/dashboard"
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FiGrid className="nav-icon" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/feed"
                    className="mobile-nav-link"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FiHeart className="nav-icon" />
                    My Feed
                  </Link>
                  <Link
                    to="/profile"
                    className="mobile-nav-link"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FiUser className="nav-icon" />
                    My Profile
                  </Link>
                </>
              )}
              <Link
                to="/"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                <FiHome className="nav-icon" />
                Browse Plans
              </Link>
              <button className="mobile-nav-link logout" onClick={handleLogout}>
                <FiLogOut className="nav-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

