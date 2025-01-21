// frontend/src/pages/Messages.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
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

// Custom hook for socket management
const useSocket = (token, userId, activeConversation, handlers) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_SERVER, {
      auth: { token },
      withCredentials: true,
    });

    const { onTyping, onNewMessage, onMessageDeleted } = handlers;
    
    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    socketRef.current.on('typing', onTyping);
    socketRef.current.on('newMessage', onNewMessage);
    socketRef.current.on('messageDeleted', onMessageDeleted);

    return () => {
      socketRef.current?.off('typing', onTyping);
      socketRef.current?.off('newMessage', onNewMessage);
      socketRef.current?.off('messageDeleted', onMessageDeleted);
      socketRef.current?.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (activeConversation?._id) {
      socketRef.current?.emit('joinConversation', activeConversation._id);
    }
  }, [activeConversation]);

  return socketRef;
};

// Custom hook for conversations management
const useConversations = (token, urlConversationId, navigate) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get('/messages');
        const filtered = res.data.filter(conv => conv.gigTitle?.trim());
        setConversations(filtered);
        
        const initialConv = filtered.find(c => c._id === urlConversationId);
        if (urlConversationId && initialConv) {
          setActiveConversation(initialConv);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    fetchConversations();
  }, [token, urlConversationId]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    navigate(`/messages/${conv._id}`);
  };

  return {
    conversations,
    activeConversation,
    searchTerm,
    setSearchTerm,
    handleSelectConversation,
    setActiveConversation
  };
};

// MessageBubble component with updated theme
const MessageBubble = React.memo(({ message, isSelf }) => (
  <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`p-3 rounded-2xl max-w-[75%] ${
      isSelf 
        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
        : 'bg-gray-50 shadow-sm'
    }`}>
      {message.content && <p className="mb-2">{message.content}</p>}
      {message.file_url && <Attachment fileUrl={message.file_url} />}
      <span className={`text-xs ${isSelf ? 'text-blue-100' : 'text-gray-500'}`}>
        {moment(message.created_at).format('LT')}
      </span>
    </div>
  </div>
));

// ConversationItem component with clickable elements
const ConversationItem = React.memo(({ conv, onSelect, onClose }) => (
  <div onClick={() => onSelect(conv)} className="p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link 
          to={`/profile/${conv.otherUserId}`} 
          onClick={(e) => e.stopPropagation()}
          className="hover:opacity-80 transition-opacity"
        >
          <ProfilePicture profilePicUrl={conv.otherUserPic} name={conv.otherUserName} size="10" />
        </Link>
        <div>
          <Link
            to={`/profile/${conv.otherUserId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold hover:text-blue-600 transition-colors"
          >
            {conv.otherUserName}
          </Link>
          <Link
            to={`/gigs/${conv.gigId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-500 truncate hover:text-blue-600 block transition-colors"
          >
            {conv.gigTitle}
          </Link>
        </div>
      </div>
      <button 
        onClick={(e) => onClose(conv._id, e)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
));

// TypingIndicator component with updated style
const TypingIndicator = () => (
  <div className="flex space-x-1 items-center text-gray-500">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
  </div>
);

// AttachmentPreview component with updated style
const AttachmentPreview = ({ attachment, onRemove }) => (
  <div className="mb-4 relative group">
    <img
      src={URL.createObjectURL(attachment)}
      alt="Attachment"
      className="h-24 w-24 object-cover rounded-lg border"
    />
    <button 
      onClick={onRemove}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

export default function Messages() {
  const { token, userData } = useContext(AuthContext);
  const userId = userData?.userId;
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();
  const [notFoundModal, setNotFoundModal] = useState(false);

  const {
    conversations,
    activeConversation,
    searchTerm,
    setSearchTerm,
    handleSelectConversation,
    setActiveConversation
  } = useConversations(token, urlConversationId, navigate);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Socket handlers with real-time optimization
  const socketHandlers = {
    onTyping: ({ userId: typingId }) => {
      if (typingId !== userId && activeConversation) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    },
    onNewMessage: (msgData) => {
      if (msgData.conversation_id === activeConversation?._id) {
        setMessages(prev => [...prev, msgData]);
        scrollToBottom();
      }
    },
    onMessageDeleted: ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    }
  };

  const socketRef = useSocket(token, userId, activeConversation, socketHandlers);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/messages/${activeConversation._id}`);
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Handle URL conversation not found
  useEffect(() => {
    if (urlConversationId && conversations.length > 0) {
      const exists = conversations.some(c => c._id === urlConversationId);
      setNotFoundModal(!exists);
    }
  }, [urlConversationId, conversations]);

  // Optimistic updates for messages
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !activeConversation) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      content: newMessage,
      sender_id: userId,
      created_at: new Date().toISOString(),
      file_url: attachment ? URL.createObjectURL(attachment) : null
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setAttachment(null);
    scrollToBottom();

    try {
      let file_url = null;
      if (attachment) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', attachment);
        const res = await axios.post('/attachments', formData);
        file_url = res.data.file_url;
        setIsUploading(false);
      }

      const { data: sentMessage } = await axios.post('/messages', {
        conversationId: activeConversation._id,
        content: newMessage,
        file_url,
      });

      // Replace temporary message with server response
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...sentMessage, file_url } : m
      ));
      
      // Manually emit newMessage event for other clients
      socketRef.current?.emit('newMessage', sentMessage);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setIsUploading(false);
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

  const handleBlockUser = async () => {
    if (!activeConversation) return;
    
    try {
      await axios.post(`/messages/${activeConversation._id}/block`);
      setActiveConversation(prev => ({ ...prev, isBlocked: true }));
    } catch (err) {
      console.error('Error blocking user:', err);
    }
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, 50);
  };

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex pt-16 h-full bg-white">
      {/* Not Found Modal */}
      {notFoundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Conversation Not Found</h2>
            <button
              onClick={() => {
                navigate('/messages');
                setNotFoundModal(false);
              }}
              className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Return to Messages
            </button>
          </div>
        </div>
      )}

      {/* Updated Sidebar */}
      <aside className={`w-full md:w-96 border-r bg-gray-50 ${showSidebar ? 'block' : 'hidden'} md:block`}>
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
            <ConversationItem
              key={conv._id}
              conv={conv}
              onSelect={handleSelectConversation}
              onClose={handleCloseConversation}
            />
          ))}
        </div>
      </aside>

      {/* Updated Main Chat */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {activeConversation ? (
          <>
            <ChatHeader
              activeConversation={activeConversation}
              onShowSidebar={() => setShowSidebar(true)}
              onBlockUser={handleBlockUser}
            />

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <MessageBubble 
                  key={message._id}
                  message={message}
                  isSelf={message.sender_id === userId}
                />
              ))}
              {isTyping && (
                <div className="pl-4">
                  <TypingIndicator />
                </div>
              )}
            </div>

            {!activeConversation.isBlocked ? (
              <MessageInput
                newMessage={newMessage}
                attachment={attachment}
                isUploading={isUploading}
                activeConversation={activeConversation}
                onMessageChange={setNewMessage}
                onAttachmentChange={setAttachment}
                onSend={handleSendMessage}
                fileInputRef={fileInputRef}
                socket={socketRef.current}
              />
            ) : (
              <div className="p-4 bg-red-100 text-red-600 text-center">
                This conversation is blocked
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </main>
    </div>
  );
}

// Updated ChatHeader component
const ChatHeader = ({ activeConversation, onShowSidebar, onBlockUser }) => (
  <div className="p-4 border-b bg-white flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button 
        className="md:hidden p-2 hover:bg-gray-100 rounded-full"
        onClick={onShowSidebar}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <Link 
        to={`/profile/${activeConversation.otherUserId}`}
        className="hover:opacity-80 transition-opacity"
      >
        <ProfilePicture 
          profilePicUrl={activeConversation.otherUserPic} 
          name={activeConversation.otherUserName}
          size="10"
        />
      </Link>
      <div>
        <Link
          to={`/profile/${activeConversation.otherUserId}`}
          className="font-semibold hover:text-blue-600 transition-colors"
        >
          {activeConversation.otherUserName}
        </Link>
        <Link
          to={`/gigs/${activeConversation.gigId}`}
          className="text-sm text-gray-500 hover:text-blue-600 block transition-colors"
        >
          {activeConversation.gigTitle}
        </Link>
      </div>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full">
        <MoreVertical className="w-6 h-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[160px]">
        <DropdownMenuItem onSelect={onBlockUser}>
          {activeConversation.isBlocked ? 'Unblock User' : 'Block User'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

// Updated MessageInput component
const MessageInput = React.memo(({
  newMessage,
  attachment,
  isUploading,
  activeConversation,
  onMessageChange,
  onAttachmentChange,
  onSend,
  fileInputRef,
  socket
}) => (
  <div className="p-4 border-t bg-white">
    {attachment && (
      <AttachmentPreview
        attachment={attachment}
        onRemove={() => onAttachmentChange(null)}
      />
    )}
    <div className="flex space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => onAttachmentChange(e.target.files?.[0])}
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
          onMessageChange(e.target.value);
          socket?.emit('typing', { conversationId: activeConversation._id });
        }}
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        className="flex-1 p-2 px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
      />
      <button
        onClick={onSend}
        disabled={isUploading}
        className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full hover:opacity-90 transition-opacity"
      >
        <Send className="w-6 h-6" />
      </button>
    </div>
  </div>
));