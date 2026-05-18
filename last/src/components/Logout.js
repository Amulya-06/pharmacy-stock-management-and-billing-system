import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Optional: Call backend logout endpoint if you're using token invalidation
        await axios.post(`${API}/api/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear all auth-related data from storage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        
        // Redirect to login page
        navigate('/login');
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="logout-container">
      <h2>Logging out...</h2>
      <p>Please wait while we securely log you out.</p>
    </div>
  );
};

export default Logout;