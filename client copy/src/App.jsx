import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyGigs from './pages/MyGigs';
import Messages from './pages/Messages';
import PublicProfile from './pages/PublicProfile';
import GigDetails from './pages/GigDetails';
import CreateGig from './pages/CreateGig';
import EditGig from './pages/EditGig';
import Profile from './pages/Profile';

// Protected
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/gigs/:gigId" element={<GigDetails />} />
          <Route
            path="/gigs/:gigId/edit"
            element={
              <ProtectedRoute>
                <EditGig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-gig"
            element={
              <ProtectedRoute>
                <CreateGig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mygigs"
            element={
              <ProtectedRoute>
                <MyGigs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyGigs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:userId" element={<PublicProfile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
