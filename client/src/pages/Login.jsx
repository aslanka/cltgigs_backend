// Login.jsx - Simplified for HttpOnly cookies
import React, { useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/login', formData); // No need to handle the token here
      console.log('Cookie set after successful login'); // Console log to indicate cookie set
      await login(); // Call login to update the AuthContext
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.error || 'Error logging in');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleAppleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple`;
  };

  const handleFacebookLogin = () => {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow-lg flex flex-col items-center space-y-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="w-full">
        <button onClick={handleGoogleLogin} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Sign in with Google
        </button>
      </div>
      <div className="w-full">
            <button onClick={handleFacebookLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
              Sign in with Facebook
            </button>
          </div>
      <div className="w-full">
        <button onClick={handleAppleLogin} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
          Sign in with Apple
        </button>
      </div>

      <div className="border-b border-gray-300 w-full my-6">
        <span className="flex justify-center text-gray-500 bg-white relative top-3">OR</span>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="w-full mb-6">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Sign in
        </button>
      </form>
    </div>
  );
}

export default Login;