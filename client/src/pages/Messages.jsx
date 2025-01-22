import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import moment from 'moment';
import { X, Send, Paperclip, ChevronLeft, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import ProfilePicture from '../components/ProfilePicture';
import Attachment from '../components/Attachment';
import StarRating from '../components/StarRating';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Constants and utilities
const CHAT_LIST_VARIANTS = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' }
};

const CHAT_WINDOW_VARIANTS = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' }
};

const useSocket = (token, handlers) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_SERVER, {
      auth: { token },
      withCredentials: true,
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    Object.entries(handlers).forEach(([event, handler]) => {
      socketRef.current.on(event, handler);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, handlers]);

  return socketRef;
};

const useConversations = (token) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!token) return;
    
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/messages');
        setConversations(data.filter(conv => conv.gigTitle?.trim()));
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [token]);

  return [conversations, setConversations];
};

const useMessages = (activeConversation, token) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!activeConversation || !token) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/messages/${activeConversation._id}`);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [activeConversation, token]);

  return [messages, setMessages];
};

const MessageBubble = React.memo(({ message, isSelf }) => {
  if (!message.content && !message.file_url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`max-w-[85%] rounded-xl p-3 relative group ${
        isSelf ? 'bg-blue-600 text-white' : 'bg-gray-50 border'
      }`}>
        {message.status === 'failed' && (
          <div className="text-red-200 text-xs">Failed to send</div>
        )}
        
        {message.content && <p className="break-words text-sm">{message.content}</p>}
        {message.file_url && (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-2 max-w-[200px]"
          >
            <Attachment fileUrl={message.file_url} />
          </motion.div>
        )}
        
        <span className={`text-xs mt-1 block ${
          isSelf ? 'text-blue-200' : 'text-gray-500'
        }`}>
          {moment(message.created_at).format('LT')}
          {message.status === 'sending' && ' · Sending...'}
        </span>
      </div>
    </motion.div>
  );
});

const ChatList = React.memo(({ 
  conversations, 
  activeConversation, 
  onSelectConversation,
  onCloseConversation,
  isMobile
}) => (
  <AnimatePresence>
    {isMobile && (
      <motion.aside
        key="mobile-chatlist"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={CHAT_LIST_VARIANTS}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full h-full absolute z-10 bg-white border-r"
      >
        <ConversationList 
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={onSelectConversation}
          onCloseConversation={onCloseConversation}
          isMobile={isMobile}
        />
      </motion.aside>
    )}

    {!isMobile && (
      <aside className="w-80 border-r">
        <ConversationList 
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={onSelectConversation}
          onCloseConversation={onCloseConversation}
        />
      </aside>
    )}
  </AnimatePresence>
));

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation,
  onCloseConversation 
}) => (
  <div className="overflow-y-auto h-full">
    {conversations.map(conv => (
      <ConversationItem
        key={conv._id}
        conversation={conv}
        isActive={activeConversation?._id === conv._id}
        onSelect={onSelectConversation}
        onClose={onCloseConversation}
      />
    ))}
  </div>
);

const ConversationItem = React.memo(({ conversation, isActive, onSelect, onClose }) => (
  <div
    onClick={() => onSelect(conversation)}
    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${isActive ? 'bg-blue-50' : ''}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link 
          to={`/profile/${conversation.otherUserId}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:opacity-80"
        >
          <ProfilePicture 
            profilePicUrl={conversation.otherUserPic} 
            name={conversation.otherUserName}
            size="10"
          />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <Link
              to={`/profile/${conversation.otherUserId}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-gray-900 truncate hover:text-blue-600"
            >
              {conversation.otherUserName}
            </Link>
            <StarRating rating={conversation.rating} />
          </div>
          <Link
            to={`/gigs/${conversation.gigId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-500 hover:text-blue-600 truncate block"
          >
            {conversation.gigTitle}
          </Link>
        </div>
      </div>
      <button 
        onClick={(e) => onClose(conversation._id, e)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
));

export default function Messages() {
  const { token, userData } = useContext(AuthContext);
  const userId = userData?.userId;
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();
  const isMobile = window.innerWidth < 768;

  const [conversations, setConversations] = useConversations(token);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useMessages(activeConversation, token);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatListVisible, setIsChatListVisible] = useState(true);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeConversationRef = useRef(activeConversation);
  const userIdRef = useRef(userId);

  // WebSocket handlers
  const handleTypingIndicator = useCallback(({ userId: typingId }) => {
    if (typingId !== userIdRef.current && activeConversationRef.current) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  }, []);

  const handleNewMessage = useCallback((msgData) => {
    setMessages(prev => prev.some(m => m._id === msgData._id) ? prev : [...prev, msgData]);
  }, [setMessages]);

  const handleMessageDeleted = useCallback(({ messageId }) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  }, [setMessages]);

  const socketRef = useSocket(token, {
    typing: handleTypingIndicator,
    newMessage: handleNewMessage,
    messageDeleted: handleMessageDeleted
  });

  // Effects
  useEffect(() => {
    activeConversationRef.current = activeConversation;
    userIdRef.current = userId;
  }, [activeConversation, userId]);

  useEffect(() => {
    if (activeConversation?._id) {
      socketRef.current?.emit('joinConversation', activeConversation._id);
      scrollToBottom();
    }
  }, [activeConversation, socketRef]);

  useEffect(() => {
    if (urlConversationId && conversations.length) {
      const initialConv = conversations.find(c => c._id === urlConversationId);
      if (initialConv) {
        setActiveConversation(initialConv);
        if (isMobile) setIsChatListVisible(false);
      }
    }
  }, [urlConversationId, conversations, isMobile]);

  // Handlers
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

    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const tempMessage = createTempMessage(tempId);
    
    setNewMessage('');
    setAttachment(null);
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const file_url = await uploadAttachment();
      const sentMessage = await sendMessage(file_url);
      
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...sentMessage, status: 'sent' } : m
      ));
      socketRef.current?.emit('newMessage', sentMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, status: 'failed' } : m
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const createTempMessage = (tempId) => ({
    _id: tempId,
    content: newMessage.trim(),
    sender_id: userId,
    created_at: new Date().toISOString(),
    file_url: attachment ? URL.createObjectURL(attachment) : null,
    conversation_id: activeConversation._id,
    status: 'sending'
  });

  const uploadAttachment = async () => {
    if (!attachment) return null;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', attachment);
    formData.append('type', 'message');
    formData.append('foreign_key_id', activeConversation._id);
    
    const { data } = await axios.post('/attachments', formData);
    return data.file_url;
  };

  const sendMessage = async (file_url) => {
    const { data } = await axios.post('/messages', {
      conversationId: activeConversation._id,
      content: newMessage.trim(),
      file_url,
    });
    return data;
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
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  const handleBlockConversation = async () => {
    if (!activeConversation) return;
    try {
      await axios.post(`/messages/${activeConversation._id}/block`);
      setActiveConversation(prev => ({ ...prev, isBlocked: true }));
    } catch (error) {
      console.error('Error blocking conversation:', error);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex pt-16 flex-col bg-white">
      <div className="flex flex-1 overflow-hidden relative">
        <ChatList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={(conv) => {
            setActiveConversation(conv);
            navigate(`/messages/${conv._id}`);
            setIsChatListVisible(false);
          }}
          onCloseConversation={handleCloseConversation}
          isMobile={isMobile && isChatListVisible}
        />

        <AnimatePresence>
          <motion.main
            key={activeConversation?._id || 'empty'}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={isMobile ? CHAT_WINDOW_VARIANTS : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex-1 flex flex-col ${!isMobile ? 'block' : 'absolute w-full h-full bg-white'}`}
          >
            {activeConversation ? (
              <ChatWindow
                activeConversation={activeConversation}
                messages={messages}
                userId={userId}
                isTyping={isTyping}
                isUploading={isUploading}
                newMessage={newMessage}
                attachment={attachment}
                messagesContainerRef={messagesContainerRef}
                fileInputRef={fileInputRef}
                onBack={() => setIsChatListVisible(true)}
                onSendMessage={handleSendMessage}
                onBlock={handleBlockConversation}
                onSetNewMessage={setNewMessage}
                onSetAttachment={setAttachment}
                isMobile={isMobile}
              />
            ) : (
              <EmptyState />
            )}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

const ChatWindow = ({
  activeConversation,
  messages,
  userId,
  isTyping,
  isUploading,
  newMessage,
  attachment,
  messagesContainerRef,
  fileInputRef,
  onBack,
  onSendMessage,
  onBlock,
  onSetNewMessage,
  onSetAttachment,
  isMobile
}) => (
  <>
    <ChatHeader
      activeConversation={activeConversation}
      onBack={onBack}
      onBlock={onBlock}
      isMobile={isMobile}
    />

    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 bg-gray-50"
    >
      <div className="max-w-3xl mx-auto space-y-2">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isSelf={String(message.sender_id) === String(userId)}
            />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
      </div>
    </div>

    {!activeConversation.isBlocked ? (
      <MessageInput
        newMessage={newMessage}
        attachment={attachment}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onSendMessage={onSendMessage}
        onSetNewMessage={onSetNewMessage}
        onSetAttachment={onSetAttachment}
        activeConversation={activeConversation}
      />
    ) : (
      <BlockedIndicator />
    )}
  </>
);

const ChatHeader = ({ activeConversation, onBack, onBlock, isMobile }) => (
  <div className="p-4 border-b flex items-center justify-between bg-white">
    <div className="flex items-center space-x-4">
      {isMobile && (
        <button onClick={onBack} className="hover:opacity-80">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <Link 
        to={`/profile/${activeConversation.otherUserId}`}
        className="hover:opacity-80"
      >
        <ProfilePicture
          profilePicUrl={activeConversation.otherUserPic}
          name={activeConversation.otherUserName}
          size="10"
        />
      </Link>
      <div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/profile/${activeConversation.otherUserId}`}
            className="font-semibold text-gray-900 hover:text-blue-600"
          >
            {activeConversation.otherUserName}
          </Link>
          <StarRating rating={activeConversation.rating} />
        </div>
        <Link
          to={`/gigs/${activeConversation.gigId}`}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          {activeConversation.gigTitle}
        </Link>
      </div>
    </div>
    <ConversationMenu onBlock={onBlock} />
  </div>
);

const ConversationMenu = ({ onBlock }) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full">
      <MoreVertical className="w-5 h-5 text-gray-600" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={onBlock}>
        Block User
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const MessageInput = ({
  newMessage,
  attachment,
  isUploading,
  fileInputRef,
  onSendMessage,
  onSetNewMessage,
  onSetAttachment,
  activeConversation
}) => (
  <motion.div
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    className="border-t border-gray-200 p-4 bg-white"
  >
    {attachment && <AttachmentPreview attachment={attachment} onRemove={() => onSetAttachment(null)} />}
    
    <div className="flex space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => onSetAttachment(e.target.files?.[0])}
      />
      <FileUploadButton onClick={() => fileInputRef.current.click()} />
      
      <input
        value={newMessage}
        onChange={(e) => {
          onSetNewMessage(e.target.value);
          socketRef.current?.emit('typing', { conversationId: activeConversation._id });
        }}
        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
        className="flex-1 p-2 px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        placeholder="Type a message..."
      />
      
      <SendButton onClick={onSendMessage} disabled={isUploading} />
    </div>
  </motion.div>
);

const AttachmentPreview = ({ attachment, onRemove }) => (
  <motion.div
    initial={{ scale: 0.9 }}
    animate={{ scale: 1 }}
    className="mb-4 relative group"
  >
    <img
      src={URL.createObjectURL(attachment)}
      alt="Attachment preview"
      className="h-24 w-24 object-cover rounded-lg border"
    />
    <button 
      onClick={onRemove}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
    >
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

const FileUploadButton = ({ onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="p-2 hover:bg-gray-100 rounded-full"
  >
    <Paperclip className="w-6 h-6 text-gray-500" />
  </motion.button>
);

const SendButton = ({ onClick, disabled }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full hover:opacity-90"
  >
    <Send className="w-6 h-6" />
  </motion.button>
);

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pl-4 text-gray-500"
  >
    <div className="flex space-x-1 items-center">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
    </div>
  </motion.div>
);

const BlockedIndicator = () => (
  <div className="p-4 bg-red-100 text-red-600 text-center">
    This conversation is blocked
  </div>
);

const EmptyState = () => (
  <div className="flex-1 flex items-center justify-center text-gray-400">
    Select a conversation to start messaging
  </div>
);