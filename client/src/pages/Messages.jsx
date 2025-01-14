import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import moment from 'moment';
import ProfilePicture from '../components/ProfilePicture';
import Attachment from '../components/Attachment';

export default function Messages() {
  const { token, userData } = useContext(AuthContext);
  const userId = userData?.userId || null;
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatButton, setShowNewChatButton] = useState(false);

  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(import.meta.env.VITE_SERVER, {
      auth: { token },
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    socketRef.current.on('typing', ({ userId: typingId }) => {
      if (typingId !== userId) {
        setTypingUser(typingId);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    socketRef.current.on('newMessage', (msgData) => {
      if (msgData.conversation_id === activeConversation?._id) {
        setMessages((prev) => [...prev, msgData]);
      }
    });

    socketRef.current.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token, userId, activeConversation]);

  useEffect(() => {
    if (!token) return;
    axios
      .get('/messages')
      .then((res) => {
        const validConversations = res.data.filter((conv) => conv.gigTitle && conv.gigTitle.trim() !== '');
        setConversations(validConversations);
      })
      .catch((err) => console.error('Error fetching conversations:', err));
  }, [token]);

  useEffect(() => {
    if (!urlConversationId || !conversations.length) return;
    const found = conversations.find(
      (c) => c._id === urlConversationId || c.conversationId === urlConversationId
    );
    if (found) handleSelectConversation(found);
  }, [urlConversationId, conversations]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    socketRef.current.emit('joinConversation', activeConversation._id);

    axios
      .get(`/messages/${activeConversation._id}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error('Error fetching messages:', err));
  }, [activeConversation]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - clientHeight - scrollTop < 50;
      if (isAtBottom) {
        messagesContainerRef.current.scrollTop = scrollHeight;
        setShowNewChatButton(false);
      } else {
        setShowNewChatButton(true);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setShowNewChatButton(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setNewMessage('');
    setAttachment(null);
    navigate(`/messages/${conv._id}`);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    try {
      let file_url = null;
      if (attachment) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('type', 'message');
        formData.append('foreign_key_id', activeConversation._id);
        const response = await axios.post('/attachments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        file_url = response.data.file_url;
        setIsUploading(false);
      }

      await axios.post('/messages', {
        conversationId: activeConversation._id,
        content: newMessage,
        file_url,
      });

      setNewMessage('');
      setAttachment(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await axios.delete(`/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleReportMessage = async (msgId) => {
    try {
      await axios.post(`/messages/${msgId}/report`);
      alert('Message reported.');
    } catch (err) {
      console.error('Error reporting message:', err);
    }
  };

  const handleBlockConversation = async () => {
    try {
      await axios.post(`/messages/${activeConversation._id}/block`);
      alert('Conversation blocked.');
      setActiveConversation((prev) => ({ ...prev, isBlocked: true }));
    } catch (err) {
      console.error('Error blocking conversation:', err);
    }
  };

  const handleUnblockConversation = async () => {
    try {
      await axios.post(`/messages/${activeConversation._id}/unblock`);
      alert('Conversation unblocked.');
      setActiveConversation((prev) => ({ ...prev, isBlocked: false }));
    } catch (err) {
      console.error('Error unblocking conversation:', err);
    }
  };

  const handleViewGig = () => {
    if (activeConversation?.gigId) {
      navigate(`/gig/${activeConversation.gigId}`);
    }
  };

  const handleViewProfile = () => {
    if (activeConversation?.otherUserId) {
      navigate(`/communitycard/${activeConversation.otherUserId}`);
    }
  };

  const handleTyping = () => {
    if (!activeConversation) return;
    socketRef.current.emit('typing', {
      conversationId: activeConversation._id,
    });
  };

  const filteredConversations = conversations.filter((c) =>
    (c.otherUserName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Header for Mobile */}
      <header className="md:hidden bg-white shadow p-4 flex items-center">
        {activeConversation && (
          <button onClick={() => setActiveConversation(null)} className="mr-4">
            ←
          </button>
        )}
        <h1 className="text-lg font-semibold">
          {activeConversation ? activeConversation.otherUserName : 'Messages'}
        </h1>
      </header>

      <div className="flex-1 container mx-auto p-0 md:p-4 flex flex-col md:flex-row bg-white">
        {/* Conversations List */}
        <aside className={`md:w-1/3 border-r border-gray-200 ${activeConversation ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full p-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto h-[calc(100vh-8rem)]">
            {filteredConversations.map((conv) => {
              const activeClass = conv._id === activeConversation?._id ? 'bg-blue-50' : '';
              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${activeClass}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{conv.otherUserName}</h3>
                      {conv.online && (
                        <span className="bg-green-500 rounded-full w-2 h-2"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {moment(conv.lastMessageTime).fromNow()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {conv.gigTitle}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conv.lastMessage}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Message Area */}
        <main className="flex-1 flex flex-col">
          {activeConversation && (
            <>
              {/* Profile Header for Desktop */}
              <div
                className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer"
                onClick={handleViewProfile}
              >
                <div className="flex items-start space-x-4">
                  <ProfilePicture
                    profilePicUrl={activeConversation.otherUserPic}
                    name={activeConversation.otherUserName}
                    size="10"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold">
                        {activeConversation.otherUserName}
                      </h2>
                      <span className="bg-green-500 rounded-full w-2 h-2"></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        ★★★★<span className="text-gray-300">★</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        (4.2 • 48 reviews)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Member since 2023 • 89 gigs completed
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {activeConversation.isBlocked ? (
                    <button onClick={handleUnblockConversation} title="Unblock Conversation">
                      {/* Example icon - replace with actual icon */}
                      🚫
                    </button>
                  ) : (
                    <button onClick={handleBlockConversation} title="Block Conversation">
                      {/* Example icon - replace with actual icon */}
                      ❌
                    </button>
                  )}
                  <button onClick={handleViewGig} title="View Gig">
                    {/* Example icon - replace with actual icon */}
                    🔍
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={messagesContainerRef}
                className={`flex-1 overflow-y-auto p-4 ${activeConversation.isBlocked ? 'opacity-50' : ''}`}
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {messages.map((msg) => {
                  const isSelf = msg.sender_id === userId;
                  return (
                    <div
                      key={msg._id}
                      className={`mb-4 flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[80%] md:max-w-lg">
                        {!isSelf && (
                          <div className="text-xs text-gray-500 mb-1">
                            Re: {activeConversation.gigTitle}
                          </div>
                        )}
                        <div className={`${isSelf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-lg px-4 py-2`}>
                          <p className="text-sm break-words">{msg.content}</p>
                          <Attachment fileUrl={msg.file_url} />
                          <p className={`text-xs mt-1 ${isSelf ? 'text-blue-200' : 'text-gray-500'}`}>
                            {moment(msg.created_at).format('LT')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && typingUser && typingUser !== userId && (
                  <div className="text-sm text-gray-500 mt-2">
                    {`User ${typingUser} is typing...`}
                  </div>
                )}
              </div>

              {/* New Chat Popup Button */}
              {showNewChatButton && (
                <button
                  onClick={scrollToBottom}
                  className="fixed bottom-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
                >
                  New Chat
                </button>
              )}

              {/* Message Input */}
              <div className={`p-4 border-t border-gray-200 ${activeConversation.isBlocked ? 'opacity-50' : ''} bg-white md:static fixed bottom-0 left-0 right-0`}>
                <div className="flex flex-col space-y-2">
                  {attachment && (
                    <div className="relative p-2 bg-gray-100 rounded-lg">
                      <img
                        src={URL.createObjectURL(attachment)}
                        alt="Attachment"
                        className="max-w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={handleRemoveAttachment}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  {isUploading && (
                    <div className="flex items-center justify-center p-2 bg-gray-100 rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Uploading...
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 p-2 border rounded-lg"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      disabled={activeConversation.isBlocked}
                    />
                    <label className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-300 cursor-pointer flex items-center justify-center min-w-[48px] min-h-[48px]">
                      📎
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) setAttachment(e.target.files[0]);
                        }}
                        disabled={activeConversation.isBlocked}
                      />
                    </label>
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center min-w-[48px] min-h-[48px]"
                      disabled={activeConversation.isBlocked || isUploading}
                    >
                      Send
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <p>
                      Drag & drop files or click the attachment button. Max size: 25MB
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          {!activeConversation && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
