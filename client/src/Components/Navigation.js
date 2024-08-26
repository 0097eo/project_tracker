import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Utils/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        {!user && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
        {user && user.is_admin && (
          <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
        )}
        {user && !user.is_admin && (
          <li><Link to="/student-dashboard">Student Dashboard</Link></li>
        )}
        {user && (
          <li><button onClick={handleLogout}>Logout</button></li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;