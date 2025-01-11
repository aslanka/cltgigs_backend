import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { token, userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (token && userData?.userId) {
      // Fetch the latest user profile from server
      axios.get(`/users/${userData.userId}`)
        .then((res) => setProfile(res.data))
        .catch((err) => console.error(err));
    }
  }, [token, userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="bg-blue-600 text-white p-4 mb-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Charlotte Gigs</Link>
        <div className="flex items-center space-x-4 relative">
          {!token && (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          )}
          {token && (
            <>
              <Link to="/mygigs" className="hover:underline">My Gigs</Link>
              <Link to="/messages" className="hover:underline">Messages</Link>
              <Link to={`/communitycard/${userData?.userId}`} className="hover:underline">My Community Card</Link>

              {/* Profile Picture & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="focus:outline-none"
                >
                  {profile?.profile_pic_url ? (
                    <img
                      crossOrigin='anonymous'
                      src={profile.profile_pic_url}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-700">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    {profile && profile._id && (
                      <Link 
                        to={`/profile/${profile._id}`} 
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Public Profile
                      </Link>
                    )}
                    <button 
                      onClick={() => { setDropdownOpen(false); handleLogout(); }} 
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
