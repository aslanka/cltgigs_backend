import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import moment from 'moment';
import { X, Send, Paperclip, ChevronLeft, MoreVertical } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import ProfilePicture from '../components/ProfilePicture';
import Attachment from '../components/Attachment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Messages() {
  const { token, userData } = useContext(AuthContext);
  const userId = userData?.userId;
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const activeConversationRef = useRef(activeConversation);
  const userIdRef = useRef(userId);

  // Update refs when state changes
  useEffect(() => {
    activeConversationRef.current = activeConversation;
    userIdRef.current = userId;
  }, [activeConversation, userId]);

  // Socket handlers with ref-based state
  const handleTypingIndicator = useCallback(({ userId: typingId }) => {
    if (typingId !== userIdRef.current && activeConversationRef.current) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  }, []);

  const handleNewMessage = useCallback((msgData) => {
    setMessages(prev => {
      const exists = prev.some(m => m._id === msgData._id);
      return exists ? prev : [...prev, msgData];
    });
    scrollToBottom();
  }, []);

  const handleMessageDeleted = useCallback(({ messageId }) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  }, []);

  // Socket setup
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_SERVER, {
      auth: { token },
      withCredentials: true,
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    socketRef.current.on('typing', handleTypingIndicator);
    socketRef.current.on('newMessage', handleNewMessage);
    socketRef.current.on('messageDeleted', handleMessageDeleted);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  // Join conversation room
  useEffect(() => {
    if (activeConversation?._id) {
      socketRef.current?.emit('joinConversation', activeConversation._id);
    }
  }, [activeConversation]);

  // Fetch conversations
  useEffect(() => {
    if (!token) return;
    axios.get('/messages')
      .then(res => setConversations(res.data.filter(conv => conv.gigTitle?.trim())))
      .catch(err => console.error('Error fetching conversations:', err));
  }, [token]);

  // Set active conversation from URL
  useEffect(() => {
    if (urlConversationId && conversations.length) {
      const initialConv = conversations.find(c => c._id === urlConversationId);
      if (initialConv) setActiveConversation(initialConv);
    }
  }, [urlConversationId, conversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    axios.get(`/messages/${activeConversation._id}`)
      .then(res => {
        setMessages(res.data);
        scrollToBottom();
      })
      .catch(err => console.error('Error fetching messages:', err));
  }, [activeConversation]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, 50);
  }, []);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !activeConversation) return;
  
    // Generate temporary message with loading state
    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const tempMessage = {
      _id: tempId,
      content: newMessage.trim(),
      sender_id: userId,
      created_at: new Date().toISOString(),
      file_url: attachment ? URL.createObjectURL(attachment) : null,
      conversation_id: activeConversation._id,
      status: 'sending' // Add status flag
    };
  
    // Immediately clear input but keep values for message
    const messageContent = newMessage;
    const messageAttachment = attachment;
    setNewMessage('');
    setAttachment(null);
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
  
    try {
      let file_url = null;
      if (messageAttachment) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', messageAttachment);
        formData.append('type', 'message');
        formData.append('foreign_key_id', activeConversation._id);
        const res = await axios.post('/attachments', formData);
        file_url = res.data.file_url;
      }
  
      const { data: sentMessage } = await axios.post('/messages', {
        conversationId: activeConversation._id,
        content: messageContent.trim(),
        file_url,
      });
  
      // Replace temp message with actual message
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...sentMessage, status: 'sent' } : m
      ));
  
      socketRef.current?.emit('newMessage', sentMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      // Update temp message to show error state
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, status: 'failed' } : m
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleReportMessage = async (messageId) => {
    try {
      await axios.post(`/messages/${messageId}/report`);
      alert('Message reported to administrators');
    } catch (err) {
      console.error('Error reporting message:', err);
    }
  };

  const handleBlockConversation = async () => {
    if (!activeConversation) return;
    try {
      await axios.post(`/messages/${activeConversation._id}/block`);
      setActiveConversation(prev => ({ ...prev, isBlocked: true }));
    } catch (err) {
      console.error('Error blocking conversation:', err);
    }
  };

  const handleCloseConversation = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/messages/conversation/${conversationId}`);
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
        navigate('/messages');
      }
    } catch (err) {
      console.error('Error closing conversation:', err);
    }
  };

  const MessageBubble = ({ message, isSelf }) => {
    if (!message.content && !message.file_url) return null; // Skip empty messages
  
    return (
      <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] rounded-lg p-3 relative group ${
          isSelf ? 'bg-blue-600 text-white' : 'bg-gray-100'
        }`}>
          {message.status === 'failed' && (
            <div className="text-red-200 text-xs">Failed to send</div>
          )}
          
          {message.content && <p className="break-words">{message.content}</p>}
          {message.file_url && <Attachment fileUrl={message.file_url} />}
          
          <span className={`text-xs mt-1 block ${
            isSelf ? 'text-blue-200' : 'text-gray-500'
          }`}>
            {moment(message.created_at).format('LT')}
            {message.status === 'sending' && ' · Sending...'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white pt-16">
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <aside className={`w-full md:w-80 border-r ${showSidebar ? 'block' : 'hidden'} md:block`}>
          <div className="p-4 border-b bg-white">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full p-2 px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto h-[calc(100vh-140px)]">
            {conversations.map(conv => (
              <div
                key={conv._id}
                onClick={() => {
                  setActiveConversation(conv);
                  navigate(`/messages/${conv._id}`);
                  setShowSidebar(false);
                }}
                className={`p-4 border-b hover:bg-gray-100 cursor-pointer ${
                  activeConversation?._id === conv._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link 
                      to={`/profile/${conv.otherUserId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:opacity-80"
                    >
                      <ProfilePicture 
                        profilePicUrl={conv.otherUserPic} 
                        name={conv.otherUserName}
                        size="10"
                      />
                    </Link>
                    <div>
                      <Link
                        to={`/profile/${conv.otherUserId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold hover:text-blue-600"
                      >
                        {conv.otherUserName}
                      </Link>
                      <Link
                        to={`/gigs/${conv.gigId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-gray-500 hover:text-blue-600 block"
                      >
                        {conv.gigTitle}
                      </Link>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleCloseConversation(conv._id, e)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Mobile Header */}
              <div className="md:hidden p-4 border-b flex items-center space-x-4 bg-white">
                <button 
                  onClick={() => {
                    navigate('/messages');
                    setActiveConversation(null);
                    setShowSidebar(true);
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <ProfilePicture
                  profilePicUrl={activeConversation.otherUserPic}
                  name={activeConversation.otherUserName}
                  size="10"
                />
                <div>
                  <h2 className="font-semibold">{activeConversation.otherUserName}</h2>
                  <p className="text-sm text-gray-500">{activeConversation.gigTitle}</p>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
  {messages.map((message) => (
    <MessageBubble
      key={message._id}
      message={message}
      isSelf={String(message.sender_id) === String(userId)}
    />
  ))}
                {isTyping && (
                  <div className="pl-4 text-gray-500">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              {!activeConversation.isBlocked ? (
                <div className="border-t border-gray-200 p-4 bg-white">
                  {attachment && (
                    <div className="mb-4 relative group">
                      <img
                        src={URL.createObjectURL(attachment)}
                        alt="Attachment preview"
                        className="h-24 w-24 object-cover rounded-lg border"
                      />
                      <button 
                        onClick={() => setAttachment(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => setAttachment(e.target.files?.[0])}
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Paperclip className="w-6 h-6 text-gray-500" />
                    </button>
                    <input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        socketRef.current?.emit('typing', { conversationId: activeConversation._id });
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 p-2 px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type a message..."
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isUploading}
                      className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full hover:opacity-90"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-100 text-red-600 text-center">
                  This conversation is blocked
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              {window.innerWidth < 768 ? 'Select a conversation' : 'Select a conversation to start messaging'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}