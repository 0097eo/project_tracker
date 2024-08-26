import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Utils/AuthContext';
import '../App.css'

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
        <li><NavLink to="/" activeClassName="active">Home</NavLink></li>
        {!user && (
          <>
            <li className="auth-link"><NavLink to="/login" activeClassName="active">Login</NavLink></li>
            <li className="auth-link"><NavLink to="/signup" activeClassName="active">Signup</NavLink></li>
          </>
        )}
        {user && user.is_admin && (
          <li><NavLink to="/admin-dashboard" activeClassName="active">Admin Dashboard</NavLink></li>
        )}
        {user && !user.is_admin && (
          <li><NavLink to="/student-dashboard" activeClassName="active">Student Dashboard</NavLink></li>
        )}
        {user && (
          <>
            <li><NavLink to="/projects" activeClassName="active">Projects</NavLink></li>
            <li className="auth-link"><button className="logout-button" onClick={handleLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
