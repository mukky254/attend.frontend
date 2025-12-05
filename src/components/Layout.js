import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <Link to="/" className="logo">
              QR Attendance System
            </Link>
          </div>
          
          <div className="navbar-menu">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            
            {user?.role === 'student' && (
              <>
                <Link to="/scan" className="nav-link">Scan QR</Link>
                <Link to="/attendance" className="nav-link">My Attendance</Link>
              </>
            )}
            
            {user?.role === 'lecturer' && (
              <>
                <Link to="/generate-qr" className="nav-link">Generate QR</Link>
                <Link to="/courses" className="nav-link">My Courses</Link>
              </>
            )}
            
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} School Attendance System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
