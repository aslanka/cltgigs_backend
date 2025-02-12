// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // Add success message state

  const handleSubmit = async (e) => {  // Add event parameter
    e.preventDefault(); // Prevent default form submission
    try {
      await axios.post('/auth/register', formData);
      setSuccessMessage('Registration successful! You can now log in.'); // Set success message
      setError(null); // Clear any previous errors
       setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError(err.response?.data?.error || 'Error registering');
      setSuccessMessage(''); // Clear any previous success message
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Register</h2>
       {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>} {/* Display success message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4"> {/* Wrap inputs in a form */}
        <div>
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required // Add required attribute
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required // Add required attribute
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required // Add required attribute
            minLength={6}
          />
        </div>
        <button
          type="submit" // Change to type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;