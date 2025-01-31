import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, X, User, MessageSquare, Settings, LogOut, Home, Briefcase, Trophy, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import ProfilePicture from '../components/ProfilePicture';
import Notifications from '../components/Notifications';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (token && userData?.userId) {
      axios.get(`/users/${userData.userId}?refresh=${refreshKey}`)
        .then((res) => setProfile(res.data))
        .catch(console.error);

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
  }, [token, userData, refreshKey]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setUnreadCount(response.data.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

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

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all"
    >
      <Icon className="w-5 h-5 text-blue-600" />
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CharlotteGigs
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {token ? (
              <>
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/leaderboard" 
                    className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-700">Top 5</span>
                  </Link>
                  
                  <button
                    onClick={() => navigate('/create-gig')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Post Gig</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    fetchNotifications();
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="group"
                  >
                    <ProfilePicture
                      profilePicUrl={profile?.profile_pic_url}
                      name={profile?.name}
                      size="10"
                      className="hover:ring-2 ring-blue-500 transition-all"
                    />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                          <div className="flex items-center space-x-3">
                            <ProfilePicture
                              profilePicUrl={profile?.profile_pic_url}
                              name={profile?.name}
                              size="12"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{profile?.name}</p>
                              <p className="text-sm text-blue-600">{profile?.xp || 0} XP</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <NavLink to="/mygigs" icon={Briefcase}>Activity</NavLink>
                          <NavLink to="/messages" icon={MessageSquare}>Messages</NavLink>
                          <NavLink to="/settings" icon={Settings}>Settings</NavLink>
                          <NavLink to={`/profile/${profile?._id}`} icon={User}>Profile</NavLink>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-5 h-5 text-red-600" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-3">
            {token && (
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  fetchNotifications();
                }}
                className="relative p-2 text-gray-600"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
      {mobileMenuOpen && (
    <div ref={mobileMenuRef} className="md:hidden fixed inset-0 bg-white z-50">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-xl font-bold text-gray-900">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {token ? (
          <>
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <ProfilePicture
                  profilePicUrl={profile?.profile_pic_url}
                  name={profile?.name}
                  size="12"
                />
                <div>
                  <p className="font-medium text-gray-900">{profile?.name}</p>
                  <p className="text-sm text-blue-600">{profile?.xp || 0} XP</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <NavLink to="/" icon={Home} onClick={() => setMobileMenuOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/mygigs" icon={Briefcase} onClick={() => setMobileMenuOpen(false)}>
                My Gigs
              </NavLink>
              <NavLink to="/messages" icon={MessageSquare} onClick={() => setMobileMenuOpen(false)}>
                Messages
              </NavLink>
              <NavLink to="/leaderboard" icon={Trophy} onClick={() => setMobileMenuOpen(false)}>
                Leaderboard
              </NavLink>
              <NavLink to="/settings" icon={Settings} onClick={() => setMobileMenuOpen(false)}>
                Settings
              </NavLink>
              <NavLink to={`/profile/${profile?._id}`} icon={User} onClick={() => setMobileMenuOpen(false)}>
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 space-y-4">
            <Link
              to="/login"
              className="block w-full px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full px-4 py-3 text-center bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  )}
      </AnimatePresence>

      <Notifications
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        refreshNotifications={fetchNotifications}
      />
    </nav>
  );
};

export default Navbar;