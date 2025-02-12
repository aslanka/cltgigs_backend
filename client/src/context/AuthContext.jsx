// src/context/AuthContext.jsx  (Introducing a delay)

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosInstance'; // Import axios instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true); // Start loading
      try {
        // Introduce a small delay before making the /users/me request
        setTimeout(async () => {
          try {
            const res = await axiosInstance.get('/users/me');
            console.log('User data response (delayed):', res.data);
            setUserData(res.data);
          } catch (error) {
            console.error('Auth check failed (delayed):', error.response?.data || error.message);
            setUserData(null);
          } finally {
            setLoading(false); // End loading
          }
        }, 200); // 200ms delay (adjust if needed)
      } catch (error) {
        console.error('Error setting up delayed auth check:', error); // Error during setTimeout setup
        setLoading(false); // Ensure loading is set to false even if setTimeout fails
      }
    };
    checkAuth();
  }, []);

  const login = async () => {
    // No need to do anything here, the server sets the cookie
    try {
      const res = await axiosInstance.get('/users/me'); // Get user information
      setUserData(res.data);
    } catch (error) {
      console.error("Error fetching user data after login:", error);
      setUserData(null);  // Ensure userData is cleared on error
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout'); // Call the logout endpoint
    } catch (error) {
      console.error("Error logging out:", error);
    }
    setUserData(null);
  };

  if (loading) {
    return <div>Loading...</div>; // Or any other loading indicator
  }

  return (
    <AuthContext.Provider value={{ userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};