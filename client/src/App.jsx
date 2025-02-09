import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import SearchResults from './pages/SearchResults';
import Leaderboard from './pages/Leaderboard'; // Add this import
import ViewRewards from './pages/ViewRewards';
import GamificationGuide from './pages/GamificationGuide';
import WaitingListLandingPage from './pages/WaitingListLandingPage';

// Protected
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className="bg-gray-100 min-h-screen overflow-hidden">
      <Navbar />
      <div className={`h-full ${isMessagesPage ? '' : 'pt-16'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public Routes */}
          <Route path="/gigs/:gigId" element={<GigDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/waitinglist" element={<WaitingListLandingPage />} />
          <Route path="/communitycard/:userId" element={<CommunityCard />} />
          <Route path="/profile/:userId" element={<CommunityCard />} />

          {/* Protected Routes */}
          <Route
            path="/edit-gig/:gigId"
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
            path="/bids"
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
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route path="/game-guide" element={<GamificationGuide />} />
          <Route
  path="/rewards"
  element={
      <ViewRewards />
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
        </Routes>
      </div>
    </div>
  );
}

export default App;