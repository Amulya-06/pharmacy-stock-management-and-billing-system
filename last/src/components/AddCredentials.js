import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './AddCredentials.css'; // Import your CSS file for styling

const AddCredentials = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/'); // Redirect if not admin
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage('Username and password are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/auth/register`, { username, password, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('User registered successfully!');
      setUsername('');
      setPassword('');
      setRole('user');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register New User</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default AddCredentials;
