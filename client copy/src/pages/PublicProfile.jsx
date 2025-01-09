import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';

function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl mx-auto">
      <div className="text-center mb-6">
        <img
          src={profile.profile_pic_url || 'https://via.placeholder.com/150'}
          alt="profile"
          className="w-32 h-32 rounded-full mx-auto mb-2"
        />
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        <p className="text-gray-600">{profile.location || 'Charlotte, NC'}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Bio</h3>
        <p className="text-gray-700">{profile.bio || 'No bio available.'}</p>
      </div>
    </div>
  );
}

export default PublicProfile;
