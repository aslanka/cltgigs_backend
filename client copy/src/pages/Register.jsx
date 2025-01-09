// Register.jsx
import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      await axios.post('/auth/register', formData);
      alert('User registered successfully');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error registering');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-2">
        <label className="block font-semibold">Name</label>
        <input
          className="border w-full p-2"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
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
        Register
      </button>
    </div>
  );
}

export default Register;
