// Messages.jsx
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback,
  useReducer,
} from 'react';
import {
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';
import { io } from 'socket.io-client';
import moment from 'moment';
import {
  X,
  Send,
  Paperclip,
  ChevronLeft,
  MoreVertical,
} from 'lucide-react';
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

// Constants for animations
const CHAT_LIST_VARIANTS = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

const CHAT_WINDOW_VARIANTS = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

// Reducer for managing message state
const messageReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return action.payload;
    case 'ADD_MESSAGE':
      if (state.some((msg) => msg._id === action.payload._id)) {
        return state;
      }
      return [...state, action.payload];
    case 'UPDATE_MESSAGE':
      return state.map((msg) =>
        msg._id === action.payload._id ? { ...msg, ...action.payload } : msg
      );
    case 'DELETE_MESSAGE':
      return state.filter((msg) => msg._id !== action.payload);
    default:
      return state;
  }
};

// Hook to initialize and manage socket connection
const useSocket = (handlers) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('https://cltgigsbackend.golockedin.com', {
      withCredentials: true,
    });

    socketRef.current = socket;

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Register event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.disconnect();
    };
  }, [handlers]);

  return socketRef;
};

// Hook to fetch and manage conversations
const useConversations = (userData) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!userData) return;

    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/messages');
        setConversations(data.filter((conv) => conv.gigTitle?.trim()));
      } catch (error) {
        console.error('Error fetching conversations:', error);
        // Optionally, set an error state here
      }
    };

    fetchConversations();
  }, [userData]);

  return [conversations, setConversations];
};

// Hook to fetch and manage messages for an active conversation
const useMessages = (activeConversation, userData) => {
  const [messages, dispatch] = useReducer(messageReducer, []);

  useEffect(() => {
    if (!activeConversation || !userData) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `/messages/${activeConversation._id}`
        );
        dispatch({ type: 'SET_MESSAGES', payload: data });
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Optionally, set an error state here
      }
    };

    fetchMessages();
  }, [activeConversation, userData]);

  return [messages, dispatch];
};

// Message Bubble Component
const MessageBubble = React.memo(({ message, isSelf }) => {
  if (!message.content && !message.file_url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${
        isSelf ? 'justify-end' : 'justify-start'
      } mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-xl p-3 relative group ${
          isSelf ? 'bg-blue-600 text-white' : 'bg-gray-50 border'
        }`}
      >
        {message.status === 'failed' && (
          <div className="text-red-200 text-xs">Failed to send</div>
        )}

        {message.content && (
          <p className="break-words text-sm">{message.content}</p>
        )}
        {message.file_url && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mt-2 max-w-[200px]"
          >
            <Attachment fileUrl={message.file_url} />
          </motion.div>
        )}

        <span
          className={`text-xs mt-1 block ${
            isSelf ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          {moment(message.created_at).format('LT')}
          {message.status === 'sending' && ' · Sending...'}
        </span>
      </div>
    </motion.div>
  );
});

// Chat List Component
const ChatList = React.memo(
  ({
    conversations,
    activeConversation,
    onSelectConversation,
    onCloseConversation,
    isMobile,
    isVisible,
  }) => (
    <AnimatePresence>
      {(isMobile && isVisible) || !isMobile ? (
        <motion.aside
          key="chatlist"
          initial={isMobile ? 'hidden' : undefined}
          animate={isMobile ? 'visible' : undefined}
          exit={isMobile ? 'exit' : undefined}
          variants={isMobile ? CHAT_LIST_VARIANTS : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`${
            isMobile ? 'w-full h-full absolute z-10 bg-white border-r' : 'w-80 border-r'
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={onSelectConversation}
            onCloseConversation={onCloseConversation}
          />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
);

// Conversation List Component
const ConversationList = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCloseConversation,
}) => (
  <div className="overflow-y-auto h-full">
    {conversations.map((conv) => (
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

// Conversation Item Component
const ConversationItem = React.memo(
  ({ conversation, isActive, onSelect, onClose }) => (
    <div
      onClick={() => onSelect(conversation)}
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
        isActive ? 'bg-blue-50' : ''
      }`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') onSelect(conversation);
      }}
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
          aria-label="Close Conversation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
);

// Main Messages Component
export default function Messages() {
  const { userData } = useContext(AuthContext);
  const userId = userData?._id;
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useConversations(userData);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, dispatchMessages] = useMessages(activeConversation, userData);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatListVisible, setIsChatListVisible] = useState(!isMobile);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeConversationRef = useRef(activeConversation);
  const userIdRef = useRef(userId);

  // WebSocket handlers
  const handleTypingIndicator = useCallback(
    ({ userId: typingId }) => {
      if (typingId !== userIdRef.current && activeConversationRef.current) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    },
    []
  );

  const handleNewMessage = useCallback(
    (msgData) => {
      dispatchMessages({ type: 'ADD_MESSAGE', payload: msgData });
      scrollToBottom();
    },
    [dispatchMessages]
  );

  const handleMessageDeleted = useCallback(
    ({ messageId }) => {
      dispatchMessages({ type: 'DELETE_MESSAGE', payload: messageId });
    },
    [dispatchMessages]
  );

  const socketHandlers = useMemo(
    () => ({
      typing: handleTypingIndicator,
      newMessage: handleNewMessage,
      messageDeleted: handleMessageDeleted,
    }),
    [handleTypingIndicator, handleNewMessage, handleMessageDeleted]
  );
  
  const socketRef = useSocket(socketHandlers);

  // Effects
  useEffect(() => {
    activeConversationRef.current = activeConversation;
    userIdRef.current = userId;
  }, [activeConversation, userId]);

  useEffect(() => {
    if (activeConversation?._id && socketRef.current) {
      socketRef.current.emit('joinConversation', activeConversation._id);
      scrollToBottom();
    }
  }, [activeConversation, socketRef]);

  useEffect(() => {
    if (urlConversationId && conversations.length) {
      const initialConv = conversations.find(
        (c) => c._id === urlConversationId
      );
      if (initialConv) {
        setActiveConversation(initialConv);
        if (isMobile) setIsChatListVisible(false);
      }
    }
  }, [urlConversationId, conversations, isMobile]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  }, []);

  // Send Message Handler
  // Send Message Handler (in Messages.jsx)
const handleSendMessage = async () => {
  // Return if there’s nothing to send or no active conversation.
  if ((!newMessage.trim() && !attachment) || !activeConversation) return;

  // Capture the content before clearing state
  const messageContent = newMessage.trim();

  // Create a temporary (optimistic) message with a temp ID.
  const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const tempMessage = {
    _id: tempId,
    content: messageContent,
    sender_id: userId,
    created_at: new Date().toISOString(),
    file_url: attachment ? URL.createObjectURL(attachment) : null,
    conversation_id: activeConversation._id,
    status: 'sending',
  };

  // Optimistically add the message
  dispatchMessages({ type: 'ADD_MESSAGE', payload: tempMessage });
  scrollToBottom();

  // Clear the input state
  setNewMessage('');
  setAttachment(null);

  try {
    // Upload any attachment (if present)
    const file_url = await uploadAttachment();

    // Send the message to the server—pass in the captured content!
    const sentMessage = await sendMessage(file_url, messageContent);

    // Remove the temporary message and add the real message
    dispatchMessages({ type: 'DELETE_MESSAGE', payload: tempId });
    dispatchMessages({
      type: 'ADD_MESSAGE',
      payload: { ...sentMessage, status: 'sent' },
    });

    // Emit the new message via socket so the other user sees it
    socketRef.current?.emit('newMessage', sentMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    // Mark the temporary message as failed
    dispatchMessages({
      type: 'UPDATE_MESSAGE',
      payload: { _id: tempId, status: 'failed' },
    });
  } finally {
    setIsUploading(false);
  }
};


  // Create a temporary message for optimistic UI
  const createTempMessage = (tempId) => ({
    _id: tempId,
    content: newMessage.trim(),
    sender_id: userId,
    created_at: new Date().toISOString(),
    file_url: attachment ? URL.createObjectURL(attachment) : null,
    conversation_id: activeConversation._id,
    status: 'sending',
  });

  // Upload Attachment
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

  // Send Message to Server
  const sendMessage = async (file_url, content) => {
    const { data } = await axios.post('/messages', {
      conversationId: activeConversation._id,
      content, // use the content variable instead of newMessage (which is now cleared)
      file_url,
    });
    // Return the new message from the server response
    return data.newMsg;
  };

  // Close Conversation Handler
  const handleCloseConversation = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/messages/conversation/${conversationId}`);
      setConversations((prev) =>
        prev.filter((c) => c._id !== conversationId)
      );
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
      // Optionally, notify the user of the error
    }
  };

  // Block Conversation Handler
  const handleBlockConversation = async () => {
    if (!activeConversation) return;
    try {
      await axios.post(`/messages/${activeConversation._id}/block`);
      setActiveConversation((prev) => ({
        ...prev,
        isBlocked: true,
      }));
    } catch (error) {
      console.error('Error blocking conversation:', error);
      // Optionally, notify the user of the error
    }
  };

  // Handle Conversation Selection
  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    navigate(`/messages/${conv._id}`);
    if (isMobile) setIsChatListVisible(false);
  };

  return (
    <div className="h-screen overflow-hidden flex pt-16 flex-col bg-white">
      <div className="flex flex-1 overflow-hidden relative">
        <ChatList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onCloseConversation={handleCloseConversation}
          isMobile={isMobile}
          isVisible={isChatListVisible}
        />

        <AnimatePresence>
          <motion.main
            key={activeConversation?._id || 'empty'}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={isMobile ? CHAT_WINDOW_VARIANTS : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex-1 flex flex-col ${
              !isMobile ? 'block' : 'absolute w-full h-full bg-white'
            }`}
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
                socketRef={socketRef}
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

// Custom Hook to detect mobile view
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

// Chat Window Component
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
  isMobile,
  socketRef,
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
        socketRef={socketRef}
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

// Chat Header Component
const ChatHeader = ({ activeConversation, onBack, onBlock, isMobile }) => (
  <div className="p-4 border-b flex items-center justify-between bg-white">
    <div className="flex items-center space-x-4">
      {isMobile && (
        <button
          onClick={onBack}
          className="hover:opacity-80 focus:outline-none"
          aria-label="Back to conversations"
        >
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

// Conversation Menu Component
const ConversationMenu = ({ onBlock }) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full focus:outline-none">
      <MoreVertical className="w-5 h-5 text-gray-600" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={onBlock}>
        Block User
      </DropdownMenuItem>
      {/* Additional menu items can be added here */}
    </DropdownMenuContent>
  </DropdownMenu>
);

// Message Input Component
const MessageInput = ({
  socketRef,
  newMessage,
  attachment,
  isUploading,
  fileInputRef,
  onSendMessage,
  onSetNewMessage,
  onSetAttachment,
  activeConversation,
}) => (
  <motion.div
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    className="border-t border-gray-200 p-4 bg-white"
  >
    {attachment && (
      <AttachmentPreview
        attachment={attachment}
        onRemove={() => onSetAttachment(null)}
      />
    )}

    <div className="flex space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onSetAttachment(file);
          }
        }}
        aria-label="Attach a file"
      />
      <FileUploadButton onClick={() => fileInputRef.current.click()} />

      <textarea
        value={newMessage}
        onChange={(e) => {
          onSetNewMessage(e.target.value);
          if (socketRef.current?.emit) {
            socketRef.current.emit('typing', {
              conversationId: activeConversation._id,
            });
          }
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
        className="flex-1 p-2 px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
        placeholder="Type a message..."
        rows={1}
        aria-label="Type a message"
      />

      <SendButton onClick={onSendMessage} disabled={isUploading} />
    </div>
  </motion.div>
);

// Attachment Preview Component
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
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none"
      aria-label="Remove attachment"
    >
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// File Upload Button Component
const FileUploadButton = ({ onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="p-2 hover:bg-gray-100 rounded-full focus:outline-none"
    aria-label="Upload a file"
  >
    <Paperclip className="w-6 h-6 text-gray-500" />
  </motion.button>
);

// Send Button Component
const SendButton = ({ onClick, disabled }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 ${
      disabled
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90'
    } rounded-full focus:outline-none`}
    aria-label="Send message"
  >
    <Send className="w-6 h-6" />
  </motion.button>
);

// Typing Indicator Component
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

// Blocked Indicator Component
const BlockedIndicator = () => (
  <div className="p-4 bg-red-100 text-red-600 text-center">
    This conversation is blocked
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="flex-1 flex items-center justify-center text-gray-400">
    Select a conversation to start messaging
  </div>
);