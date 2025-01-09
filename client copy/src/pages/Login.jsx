// Login.jsx
import React, { useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/auth/login', formData);
      if (res.data.token) {
        login(res.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error logging in');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-2">
        <label className="block font-semibold">Email</label>
        <input
          type="email"
          className="border w-full p-2"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Password</label>
        <input
          type="password"
          className="border w-full p-2"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}

export default Login;
