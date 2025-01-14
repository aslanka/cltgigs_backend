import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyGigs from './pages/MyGigs';
import Messages from './pages/Messages';
import CommunityCard from './pages/CommunityCard';
import GigDetails from './pages/GigDetails';
import CreateGig from './pages/CreateGig';
import EditGig from './pages/EditGig';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import MyBids from './pages/MyBids';

// Protected
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="bg-gray-100">
      <Navbar />
      {/* 
        Add top padding equal to the navbar height (16 * 4px = 64px for h-16)
        so that Routes content starts below the fixed navbar.
      */}
      <div className="pt-16">
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
            path="/mybids"
            element={
              <ProtectedRoute>
                <MyBids />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communitycard/:userId"
            element={<CommunityCard />}
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:userId" element={<CommunityCard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;