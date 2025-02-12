// src/components/Settings.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Shield,
  CheckCircle,
  UploadCloud,
  Settings as SettingsIcon,
  Trash,
} from "lucide-react";

function Settings() {
  const { userData } = useContext(AuthContext);
  const userId = userData?._id || userData?.userId;

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    bio: "",
    location: "",
    experience: "",
    skills: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${userId}`);
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        tagline: res.data.tagline || "",
        bio: res.data.bio || "",
        location: res.data.location || "",
        experience: res.data.experience || "",
        skills: res.data.skills ? res.data.skills.join(", ") : "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        tagline: formData.tagline,
        bio: formData.bio,
        location: formData.location,
        experience: parseInt(formData.experience, 10) || 0,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s),
      };
      await axios.put(`/users/${userId}`, payload);
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

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size must be under 2MB.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      const form = new FormData();
      form.append("type", "profile");
      form.append("foreign_key_id", userId);
      form.append("file", selectedFile);

      const { data } = await axios.post("/attachments", form);
      await axios.put(`/users/${userId}`, { profile_pic_url: data.file_url });

      fetchProfile();
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      setUploadError(
        err.response?.data?.error || "Failed to upload photo. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProfilePic = async () => {
    try {
      await axios.delete(`/users/${userId}/profile-pic`);
      fetchProfile();
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadError(null);
    } catch (err) {
      console.error(err);
      setUploadError("Failed to remove profile picture.");
    }
  };

  if (!profile) {
    return <div className="text-center p-8">Loading settings...</div>;
  }

  const displayImage = previewUrl
    ? previewUrl
    : profile.profile_pic_url
    ? `${import.meta.env.VITE_SERVER}${profile.profile_pic_url}`
    : "/default-avatar.png";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-pink-600" />
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Tabs */}
        <div className="bg-white rounded-xl shadow p-4 h-fit sticky top-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-pink-50 to-blue-50 text-pink-600"
                : "hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5" />
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeTab === "security"
                ? "bg-gradient-to-r from-pink-50 to-blue-50 text-pink-600"
                : "hover:bg-gray-50"
            }`}
          >
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-xl shadow p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-50 via-pink-50 to-transparent opacity-30" />
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
                  <User className="w-6 h-6" />
                  Profile Settings
                </h2>
              </div>

              {/* Profile Picture Section */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-pink-400 via-blue-300 to-yellow-200 blur-md opacity-75 group-hover:opacity-100 transition" />
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img
                      crossOrigin="anonymous"
                      src={displayImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <UploadCloud className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.webp"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleUploadProfilePic}
                    disabled={!selectedFile || isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-pink-600 text-white font-semibold hover:bg-pink-700 disabled:opacity-50 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Photo"
                    )}
                  </button>
                  <button
                    onClick={handleDeleteProfilePic}
                    disabled={!profile.profile_pic_url && !selectedFile}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash className="w-4 h-4" />
                    Remove Photo
                  </button>
                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}
                  <p className="text-xs text-gray-500 pt-1">
                    Only JPG, PNG, WebP under 2MB.
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={5}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Skills (comma‑separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 mt-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                {isSaving ? "Saving..." : "Save Changes"}
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative space-y-6"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6 text-gray-800">
                <Lock className="w-6 h-6" />
                Security Settings
              </h2>
              <div className="p-4 bg-white border rounded-lg shadow-sm relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">Email</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {profile.email}
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
