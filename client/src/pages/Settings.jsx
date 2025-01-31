import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Shield,
  CheckCircle,
  UploadCloud,
  Star,
  Award,
  Settings as SettingsIcon,
  MailCheck
} from "lucide-react";

function Settings() {
  const { userData } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    portfolio: "",
    email: "",
    notifications: true,
    twoFactor: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [progress, setProgress] = useState(75);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (userData) fetchProfile();
  }, [userData]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${userData.userId}`);
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        bio: res.data.bio || "",
        location: res.data.location || "",
        portfolio: res.data.portfolio || "",
        email: res.data.email || "",
        notifications: res.data.notification_preferences || true,
        twoFactor: res.data.two_factor_enabled || false
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/users/${userData.userId}`, formData);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError(null);
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB');
      return;
    }

    // Generate preview
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
  
      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("foreign_key_id", userData.userId);
      formData.append("file", selectedFile);

      // Upload the file
      const { data } = await axios.post("/attachments", formData);
      

      // Update user profile with new URL
      await axios.put(`/users/${userData.userId}`, { 
        profile_pic_url: data.file_url 
      });
    
      // Force refresh in Navbar
      if (window.navbarRef) {
        window.navbarRef.setRefreshKey(Date.now());
      }
      
      fetchProfile();
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(
        err.response?.data?.error || "Failed to upload profile picture. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!profile) return <div className="text-center p-8">Loading settings...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2 h-fit sticky top-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${
              activeTab === "profile" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5" />
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${
              activeTab === "security" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
            }`}
          >
            <Shield className="w-5 h-5" />
            Security
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${
              activeTab === "notifications" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Profile Settings
                </h2>
                <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span>Profile Strength: {progress}%</span>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <img
                    crossOrigin="anonymous"
                    src={
                      previewUrl || 
                      (profile.profile_pic_url 
                        ? `${import.meta.env.VITE_SERVER}${profile.profile_pic_url}`
                        : "/default-avatar.png")
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.webp"
                    />
                  </label>
                </div>
                <div>
                  <button
                    onClick={handleUploadProfilePic}
                    disabled={!selectedFile || isUploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Update Photo'
                    )}
                  </button>
                  {uploadError && (
                    <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Supported formats: JPEG, PNG, WebP (Max 2MB)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Portfolio Link</label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Changes"}
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6" />
                Security Settings
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <MailCheck className="w-5 h-5 text-green-600" />
                        Email Verification
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {profile.email_verified
                          ? "Your email is verified"
                          : "Please verify your email address"}
                      </p>
                    </div>
                    {profile.email_verified ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg">
                        Resend Verification
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Lock className="w-5 h-5 text-purple-600" />
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.twoFactor}
                        onChange={(e) => setFormData({ ...formData, twoFactor: e.target.checked })}
                        className="sr-only"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors">
                        <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                <Bell className="w-6 h-6" />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive important updates via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications}
                        onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                        className="sr-only"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors">
                        <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get real-time updates on your device
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors">
                        <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Achievements Sidebar */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-yellow-600" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">25</div>
            <div className="text-sm">Completed Gigs</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <div className="text-sm">Average Rating</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm">Badges Earned</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">89%</div>
            <div className="text-sm">Response Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;