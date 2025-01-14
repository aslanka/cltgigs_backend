import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, X, User, MessageSquare, Settings, LogOut, Home, Briefcase } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import ProfilePicture from '../components/ProfilePicture';
import Notifications from '../components/Notifications';
import { io } from 'socket.io-client';

const Navbar = () => {
  const { token, userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const mobileMenuRef = useRef();
  const profileDropdownRef = useRef();

  // Fetch profile and notifications
  useEffect(() => {
    if (token && userData?.userId) {
      axios.get(`/users/${userData.userId}`)
        .then((res) => setProfile(res.data))
        .catch((err) => console.error(err));

      fetchNotifications();

      const socket = io(import.meta.env.VITE_SERVER, {
        auth: { token },
      });

      socket.on('newNotification', (notification) => {
        if (notification.user_id === userData.userId) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      return () => socket.disconnect();
    }
  }, [token, userData]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setUnreadCount(response.data.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  // NavLink component
  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
    >
      <Icon size={20} />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600 hidden sm:block">CharlotteGigs</span>
            <span className="text-2xl font-bold text-blue-600 sm:hidden">CltGigs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                <NavLink to="/mygigs" icon={Briefcase}>My Gigs</NavLink>
                <NavLink to="/messages" icon={MessageSquare}>Messages</NavLink>
                
                {/* Notifications */}
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    fetchNotifications(); // Refresh notifications when opening
                  }}
                  className="relative p-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative ml-3" ref={profileDropdownRef}>
  <button
    onMouseEnter={() => setIsProfileDropdownOpen(true)}
    className="flex items-center space-x-2"
  >
    <ProfilePicture
      profilePicUrl={profile?.profile_pic_url}
      name={profile?.name}
      size="8"
    />
  </button>

  {/* Dropdown Menu */}
  {isProfileDropdownOpen && (
    <div
      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
      onMouseEnter={() => setIsProfileDropdownOpen(true)}
      onMouseLeave={() => setIsProfileDropdownOpen(false)}
    >
      <NavLink to="/settings" icon={Settings} onClick={() => setIsProfileDropdownOpen(false)}>
        Settings
      </NavLink>
      <NavLink to={`/profile/${profile?._id}`} icon={User} onClick={() => setIsProfileDropdownOpen(false)}>
        Profile
      </NavLink>
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 w-full px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  )}
</div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {token && (
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  fetchNotifications(); // Refresh notifications when opening
                }}
                className="relative p-2 mr-2 text-gray-700 hover:bg-blue-50 rounded-lg"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-blue-50 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {token ? (
              <>
                <NavLink to="/" icon={Home} onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
                <NavLink to="/mygigs" icon={Briefcase} onClick={() => setMobileMenuOpen(false)}>My Gigs</NavLink>
                <NavLink to="/messages" icon={MessageSquare} onClick={() => setMobileMenuOpen(false)}>Messages</NavLink>
                <NavLink to="/settings" icon={Settings} onClick={() => setMobileMenuOpen(false)}>Settings</NavLink>
                <NavLink to={`/profile/${profile?._id}`} icon={User} onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 p-2">
                <Link to="/login" className="block w-full text-center py-2 text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      <Notifications
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        refreshNotifications={fetchNotifications} // Pass the refresh function
      />
    </nav>
  );
};

export default Navbar;