import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';

export default function Messages() {
  const { token, userData } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGigFilter, setSelectedGigFilter] = useState('All Gigs');
  const [selectedMsgFilter, setSelectedMsgFilter] = useState('All Messages');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [activeGig, setActiveGig] = useState({
    title: 'House Painting Project',
    budget: 2500,
    bid: 2200,
    status: 'In Discussion'
  });
  const [otherUserRating, setOtherUserRating] = useState(4.2);
  const [otherUserReviewsCount, setOtherUserReviewsCount] = useState(48);
  const [otherUserMemberSince, setOtherUserMemberSince] = useState('2023');
  const [otherUserGigsCompleted, setOtherUserGigsCompleted] = useState(89);

  useEffect(() => {
    if (!token) return;
    axios.get('/messages')
      .then((res) => {
        const data = res.data.map((c) => ({ ...c }));
        setConversations(data);
      })
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    axios.get(`/messages/${activeConversation.conversationId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, [activeConversation]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setNewMessage('');
    setAttachment(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    try {
      let attachmentId = null;
      if (attachment) {
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('type', 'message');
        formData.append('foreign_key_id', activeConversation.conversationId);
        const uploadRes = await axios.post('/attachments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        attachmentId = uploadRes.data.attachmentId;
      }
      await axios.post('/messages', {
        conversationId: activeConversation.conversationId,
        content: newMessage
      });
      setNewMessage('');
      setAttachment(null);
      const updated = await axios.get(`/messages/${activeConversation.conversationId}`);
      setMessages(updated.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleReportUser = () => {
    alert('User reported.');
  };

  const handleBlockUser = () => {
    alert('User blocked.');
  };

  const handleViewProfile = () => {
    alert('Navigate to user profile.');
  };

  const handleAcceptBid = () => {
    alert('Bid accepted.');
  };

  const handleViewGig = () => {
    alert('Navigate to gig details.');
  };

  const filteredConversations = conversations.filter((conv) => {
    return conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderStarRating = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<span key={i}>★</span>);
      else if (i === full && half) stars.push(<span key={i}>★</span>);
      else stars.push(<span key={i} className="text-gray-300">★</span>);
    }
    return <div className="flex text-yellow-400">{stars}</div>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 flex-grow flex flex-col sm:flex-row h-[calc(100vh-2rem)] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="sm:w-1/3 flex flex-col border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 space-y-2">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full p-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex space-x-2">
              <select
                className="p-2 border rounded-lg flex-1"
                value={selectedGigFilter}
                onChange={(e) => setSelectedGigFilter(e.target.value)}
              >
                <option>All Gigs</option>
                <option>House Painting</option>
                <option>Lawn Care</option>
                <option>Web Development</option>
              </select>
              <select
                className="p-2 border rounded-lg flex-1"
                value={selectedMsgFilter}
                onChange={(e) => setSelectedMsgFilter(e.target.value)}
              >
                <option>All Messages</option>
                <option>Unread</option>
                <option>Archived</option>
              </select>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredConversations.length === 0 && (
              <div className="p-4 text-gray-500">No conversations found.</div>
            )}
            {filteredConversations.map((conv) => (
              <div
                key={conv.conversationId}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                  activeConversation?.conversationId === conv.conversationId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{conv.otherUserName}</h3>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Gig: {conv.gigTitle || 'Unknown Gig'}</p>
              </div>
            ))}
          </div>
        </div>

        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation
          </div>
        ) : (
          <div className="sm:w-2/3 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-start space-x-4">
                  {activeConversation.otherUserPic ? (
                    <img
                      crossOrigin="anonymous"
                      src={`http://localhost:4000${activeConversation.otherUserPic}`}
                      alt="Profile"
                      className="rounded-full w-12 h-12 object-cover"
                    />
                  ) : (
                    <div className="rounded-full w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xl">
                      {activeConversation.otherUserName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold">{activeConversation.otherUserName}</h2>
                      <span className="bg-green-500 rounded-full w-2 h-2" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStarRating(otherUserRating)}
                      <span className="text-sm text-gray-600">
                        ({otherUserRating.toFixed(1)} • {otherUserReviewsCount} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Member since {otherUserMemberSince} • {otherUserGigsCompleted} gigs completed
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 flex space-x-2">
                  <button onClick={handleReportUser} className="text-gray-600 hover:text-gray-800 px-3 py-1">
                    Report
                  </button>
                  <button onClick={handleBlockUser} className="text-red-600 hover:text-red-800 px-3 py-1">
                    Block
                  </button>
                  <button
                    onClick={handleViewProfile}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-2 sm:mb-0">
                {/* Display gig title and details statically using activeConversation or related state */}
                <h3 className="text-lg font-bold">{activeConversation.gigTitle}</h3>
                {/* Additional gig details like bid amount can be displayed here if available */}
              </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAcceptBid}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Accept Bid
                  </button>
                  <button
                    onClick={handleViewGig}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Gig
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="text-gray-500">No messages yet. Say hello!</div>
              )}
              {messages.map((msg) => {
                const isSelf = msg.sender_id === userData?.userId;
                return (
                  <div key={msg._id} className={`mb-4 flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-lg">
                      {!isSelf && (
                        <div className="text-xs text-gray-500 mb-1">{activeGig.title}</div>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isSelf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isSelf ? 'text-blue-200' : 'text-gray-500'}`}>
                          {moment(msg.created_at).format('h:mm A')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <label className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-300 cursor-pointer">
                    📎
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentChange}
                    />
                  </label>
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
                {attachment && (
                  <div className="text-sm text-gray-500">
                    Selected file: {attachment.name}
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Drag & drop or click the attachment button. Max size: 25MB.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
