import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { token, userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 mb-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Charlotte Gigs
        </Link>
        <div className="flex items-center space-x-4">
          {!token && (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
          {token && (
            <>
              <Link to="/mygigs" className="hover:underline">
                My Gigs
              </Link>
              <Link to="/messages" className="hover:underline">
                Messages
              </Link>
              <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
