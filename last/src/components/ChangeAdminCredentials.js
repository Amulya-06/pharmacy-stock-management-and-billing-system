import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "../api";
import './ChangeCredentials.css';

const ChangeAdminCredentials = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/admins`)
      .then(response => {
        setAdmins(response.data);
      })
      .catch(error => console.error('Error fetching admins:', error));
  }, []);

  const handleUpdate = async () => {
    if (!selectedAdmin || !newUsername || !newPassword) {
      setMessage('All fields are required');
      return;
    }

    try {
      await axios.put(`${API}/api/admins/update-credentials`, {
        id: selectedAdmin,
        username: newUsername,
        password: newPassword
      });
      setMessage('Admin credentials updated successfully!');
    } catch (error) {
      setMessage('Failed to update admin credentials.');
    }
  };

  return (
    <div className="cred-container">
      <h2 className="title">Modify Admin Credentials</h2>
      {message && <p className="message">{message}</p>}

      <div className="form-group">
        <label>Select Admin</label>
        <select onChange={(e) => setSelectedAdmin(e.target.value)}>
          <option value="">Select Admin</option>
          {admins.map(admin => (
            <option key={admin._id} value={admin._id}>
              {admin.username}
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

export default ChangeAdminCredentials;
