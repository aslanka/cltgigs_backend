// frontend/src/pages/Messages.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        
        // Set active conversation from URL if valid
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

// MessageBubble component
const MessageBubble = React.memo(({ message, isSelf }) => (
  <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`p-3 rounded-lg max-w-[75%] ${isSelf ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
      {message.content && <p className="mb-2">{message.content}</p>}
      {message.file_url && <Attachment fileUrl={message.file_url} />}
      <span className={`text-xs ${isSelf ? 'text-blue-200' : 'text-gray-500'}`}>
        {moment(message.created_at).format('LT')}
      </span>
    </div>
  </div>
));

// ConversationItem component
const ConversationItem = React.memo(({ conv, onSelect, onClose }) => (
  <div onClick={() => onSelect(conv)} className="p-4 hover:bg-gray-50 cursor-pointer border-b">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <ProfilePicture profilePicUrl={conv.otherUserPic} name={conv.otherUserName} size="10" />
        <div>
          <h3 className="font-semibold">{conv.otherUserName}</h3>
          <p className="text-sm text-gray-500 truncate">{conv.gigTitle}</p>
        </div>
      </div>
      <button 
        onClick={(e) => onClose(conv._id, e)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
));

// TypingIndicator component
const TypingIndicator = () => (
  <div className="text-gray-500">Typing...</div>
);

// AttachmentPreview component
const AttachmentPreview = ({ attachment, onRemove }) => (
  <div className="mb-4 relative">
    <img
      src={URL.createObjectURL(attachment)}
      alt="Attachment"
      className="h-24 w-24 object-cover rounded"
    />
    <button 
      onClick={onRemove}
      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
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

  // Socket handlers
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

  // Message handling functions
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !activeConversation) return;

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
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Conversation Not Found</h2>
            <button
              onClick={() => {
                navigate('/messages');
                setNotFoundModal(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Return to Messages
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`w-full md:w-96 border-r ${showSidebar ? 'block' : 'hidden'} md:block`}>
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full p-2 border rounded"
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

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <ChatHeader
              activeConversation={activeConversation}
              onShowSidebar={() => setShowSidebar(true)}
              onBlockUser={handleBlockUser}
            />

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <MessageBubble 
                  key={message._id}
                  message={message}
                  isSelf={message.sender_id === userId}
                />
              ))}
              {isTyping && <TypingIndicator />}
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

// Extracted ChatHeader component
const ChatHeader = ({ activeConversation, onShowSidebar, onBlockUser }) => (
  <div className="p-4 border-b flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button className="md:hidden" onClick={onShowSidebar}>
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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical className="w-6 h-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onBlockUser}>
          {activeConversation.isBlocked ? 'Unblock User' : 'Block User'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

// Extracted MessageInput component
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
  <div className="p-4 border-t">
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
        className="p-2 hover:bg-gray-100 rounded"
      >
        <Paperclip className="w-6 h-6" />
      </button>
      <input
        value={newMessage}
        onChange={(e) => {
          onMessageChange(e.target.value);
          socket?.emit('typing', { conversationId: activeConversation._id });
        }}
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        className="flex-1 p-2 border rounded"
        placeholder="Type a message..."
      />
      <button
        onClick={onSend}
        disabled={isUploading}
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Send className="w-6 h-6" />
      </button>
    </div>
  </div>
));