import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';
import './ChangeCredentials.css';

const ChangeCredentials = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/users`)
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleUpdate = async () => {
    if (!selectedUser || !newUsername || !newPassword) {
      setMessage('All fields are required');
      return;
    }

    try {
      await axios.put(`${API}/api/users/update-credentials`, {
        id: selectedUser,
        username: newUsername,
        password: newPassword
      });
      setMessage('User credentials updated successfully!');
    } catch (error) {
      setMessage('Failed to update user credentials.');
    }
  };

  return (
    <div className="cred-container">
      <h2 className="title">Modify User Credentials</h2>
      {message && <p className="message">{message}</p>}

      <div className="form-group">
        <label>Select User</label>
        <select onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>New Username</label>
        <input
          type="text"
          placeholder="New Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default ChangeCredentials;
