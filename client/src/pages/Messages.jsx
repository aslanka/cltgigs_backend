import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import moment from 'moment';
import { Menu, X, Send, Paperclip, ChevronLeft, MoreVertical } from 'lucide-react';
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
  const [showSidebar, setShowSidebar] = useState(true);

  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

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
    setShowSidebar(false); // Hide sidebar on mobile when a conversation is selected
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

  const MessageActions = ({ message, isSelf }) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isSelf && (
          <DropdownMenuItem onClick={() => handleDeleteMessage(message._id)}>
            Delete Message
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleReportMessage(message._id)}>
          Report Message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ConversationHeader = () => (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden"
            onClick={() => {
              setShowSidebar(true);
              setActiveConversation(null); // Reset active conversation to show the sidebar
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
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
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="w-6 h-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleViewGig}>View Gig</DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewProfile}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={
              activeConversation.isBlocked ? handleUnblockConversation : handleBlockConversation
            }>
              {activeConversation.isBlocked ? 'Unblock' : 'Block'} User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white pt-16">
      {/* Container for sidebar and main chat area, space reserved for navbar above */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            w-full md:w-80 border-r border-gray-200 flex flex-col
            ${showSidebar ? 'block' : 'hidden'} md:block
          `}
        >
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Scrollable chat list with mac-style scrollbar */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500">
            {filteredConversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => {
                  handleSelectConversation(conv);
                  setShowSidebar(false);
                }}
                className={`
                  p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer
                  ${activeConversation?._id === conv._id ? 'bg-blue-50' : ''}
                `}
              >
                <div className="flex items-start space-x-3">
                  <ProfilePicture
                    profilePicUrl={conv.otherUserPic}
                    name={conv.otherUserName}
                    size="12"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold truncate">{conv.otherUserName}</h3>
                      <span className="text-xs text-gray-500">
                        {moment(conv.lastMessageTime).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.gigTitle}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
    
        {/* Main Chat Area */}
        <main 
          className="flex-1 flex flex-col"
          style={{ height: 'calc(100vh - 4rem)' }}  // Adjust height to fit below reserved navbar space
        >
          {activeConversation ? (
            <>
              <ConversationHeader />
              {/* Scrollable messages container with mac-style scrollbar */}
              <div 
                ref={messagesContainerRef}
                className="relative flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-500"
              >
                {messages.map((message) => {
                  const isSelf = message.sender_id === userId;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`
                        max-w-[70%] rounded-lg p-3 group relative
                        ${isSelf ? 'bg-blue-600 text-white' : 'bg-gray-100'}
                      `}>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                          <MessageActions message={message} isSelf={isSelf} />
                        </div>
                        <p className="break-words">{message.content}</p>
                        {message.file_url && (
                          <Attachment fileUrl={message.file_url} />
                        )}
                        <span className={`
                          text-xs mt-1 block
                          ${isSelf ? 'text-blue-200' : 'text-gray-500'}
                        `}>
                          {moment(message.created_at).format('LT')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="text-sm text-gray-500">
                    {activeConversation.otherUserName} is typing...
                  </div>
                )}
    
                {/* Jump to Latest Message Button */}
                {showNewChatButton && (
                  <button 
                    onClick={scrollToBottom}
                    className="absolute left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-md"
                  >
                    Jump to Latest Message
                  </button>
                )}
              </div>
    
              <div className="border-t border-gray-200 p-4 bg-white">
                {attachment && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={URL.createObjectURL(attachment)}
                      alt="Attachment preview"
                      className="h-20 w-20 object-cover rounded"
                    />
                    <button
                      onClick={() => setAttachment(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={activeConversation.isBlocked}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size <= 25 * 1024 * 1024) {
                        setAttachment(file);
                      } else {
                        alert('File size must be less than 25MB');
                      }
                    }}
                    accept="image/*,video/*,application/pdf"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    disabled={activeConversation.isBlocked}
                  >
                    <Paperclip className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && !attachment) || isUploading || activeConversation.isBlocked}
                    className={`
                      p-2 rounded-lg flex items-center justify-center
                      ${(!newMessage.trim() && !attachment) || isUploading || activeConversation.isBlocked
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700'}
                    `}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </main>
      </div>
    </div>
  );
}  