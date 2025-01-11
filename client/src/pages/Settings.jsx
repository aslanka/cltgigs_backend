import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

function Settings() {
  const { userData } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (userData) {
      fetchProfile();
    }
    // eslint-disable-next-line
  }, [userData]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${userData.userId}`);
      setProfile(res.data);
      setName(res.data.name || "");
      setBio(res.data.bio || "");
      setLocation(res.data.location || "");
      setPortfolio(res.data.portfolio || "");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`/users/${userData.userId}`, {
        name,
        bio,
        location,
        portfolio,
      });
      alert("Profile updated!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) return;
    try {
      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("foreign_key_id", userData.userId);
      formData.append("file", selectedFile);

      const res = await axios.post("/attachments", formData);
      const attachmentRes = await axios.get(`/attachments/${res.data.attachmentId}`);
      const profilePicUrl = attachmentRes.data.attachment.file_url;

      await axios.put(`/users/${userData.userId}`, { profile_pic_url: profilePicUrl });

      alert("Profile pic uploaded!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Error uploading profile pic");
    }
  };

  if (!profile) return <div>Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Your Community Card Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Community Card</h2>
        <div>
          <label className="block">Name</label>
          <input
            className="border w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block">Bio</label>
          <textarea
            className="border w-full p-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div>
          <label className="block">Location</label>
          <input
            className="border w-full p-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block">Portfolio</label>
          <input
            className="border w-full p-2"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
          />
        </div>

        <button
          onClick={handleUpdateProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>

        <div>
          <label className="block">Upload Profile Pic</label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button
            onClick={handleUploadProfilePic}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Upload
          </button>
        </div>
      </section>

      {/* Placeholder for other settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Account Settings</h2>
        <p>Manage your account preferences, privacy settings, and more.</p>
        {/* Add additional fields or links as needed */}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
        <p>Set your email and in-app notification preferences here.</p>
        {/* Add notification preference fields */}
      </section>
    </div>
  );
}

export default Settings;
