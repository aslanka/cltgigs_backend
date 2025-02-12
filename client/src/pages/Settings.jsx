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
} from "lucide-react";
import ProfilePicture from "../components/ProfilePicture";

function Settings() {
  // Use the new user id field (prefer _id, fallback to userId)
  const { userData } = useContext(AuthContext);
  const userId = userData._id || userData.userId;
  
  // Local state for profile info and form fields (only fields that updateProfile supports)
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    bio: "",
    location: "",
    experience: "",
    skills: "", // as a comma‑separated string
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Fetch profile on mount (or when userData becomes available)
  useEffect(() => {
    if (userData) fetchProfile();
  }, [userData]);

  // Revoke object URL on cleanup
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

  // Update profile using the server's update endpoint.
  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      // Prepare payload: convert skills string into an array and experience to a number.
      const payload = {
        name: formData.name,
        tagline: formData.tagline,
        bio: formData.bio,
        location: formData.location,
        experience: parseInt(formData.experience, 10) || 0,
        skills: formData.skills.split(",").map((s) => s.trim()).filter((s) => s),
      };
      await axios.put(`/users/${userId}`, payload);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  // Handle file input changes for profile picture upload.
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError(null);
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and WebP images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size must be less than 2MB");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  // Upload profile picture via the /attachments endpoint and then update the user.
  const handleUploadProfilePic = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setUploadError(null);
      const uploadForm = new FormData();
      uploadForm.append("type", "profile");
      uploadForm.append("foreign_key_id", userId);
      uploadForm.append("file", selectedFile);

      // Post the file upload (axiosInstance is already set to send credentials/csrf token)
      const { data } = await axios.post("/attachments", uploadForm);
      // Update the user profile with the new picture URL
      await axios.put(`/users/${userId}`, { profile_pic_url: data.file_url });
      // Optionally, trigger a refresh in your Navbar here if needed.
      fetchProfile();
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(
        err.response?.data?.error ||
          "Failed to upload profile picture. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!profile)
    return <div className="text-center p-8">Loading settings...</div>;

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
              activeTab === "profile"
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5" />
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${
              activeTab === "security"
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-50"
            }`}
          >
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
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
                      "Update Photo"
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
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
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

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                <Lock className="w-6 h-6" />
                Security Settings
              </h2>
              <div className="p-4 bg-white border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-600 mt-1">{profile.email}</p>
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
