import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Send, MessageSquare, Star, X, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from 'react-router-dom';

const Messages = () => {
  const { userData } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
    // Set up polling for new messages
    const pollInterval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.conversationId);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get('/messages');
      // Filter out conversations without gigs
      const validConversations = res.data.filter(conv => conv.gigTitle);
      setConversations(validConversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await axios.get(`/messages/${conversationId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    setIsMobileMenuOpen(false);
    try {
      await fetchMessages(conv.conversationId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !replyContent.trim()) return;
    
    const tempId = Date.now(); // Temporary ID for optimistic update
    const newMessage = {
      _id: tempId,
      sender_id: userData?.userId,
      senderName: userData?.name,
      content: replyContent,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setReplyContent('');
    scrollToBottom();

    try {
      await axios.post('/messages', {
        conversationId: selectedConversation.conversationId,
        content: replyContent
      });
      await fetchMessages(selectedConversation.conversationId);
    } catch (err) {
      // Remove the optimistic update on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setError('Failed to send message');
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.gigTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const ConversationsList = () => (
    <div className="space-y-2">
      {isLoading && <div className="p-4 text-center">Loading conversations...</div>}
      {error && <div className="p-4 text-center text-red-500">{error}</div>}
      {!isLoading && filteredConversations.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">No conversations found</div>
      )}
      {filteredConversations.map((conv) => (
        <div key={conv.conversationId} className="px-4">
          <button
            className={`w-full p-4 rounded-lg text-left transition-colors ${
              selectedConversation?.conversationId === conv.conversationId
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'hover:bg-blue-50 dark:hover:bg-blue-800'
            }`}
            onClick={() => selectConversation(conv)}
          >
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={conv.otherUserAvatar} alt={conv.otherUserName} />
                <AvatarFallback>{getInitials(conv.otherUserName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <p className="font-medium">{conv.otherUserName}</p>
                  <div className="flex items-center">
                    {conv.unreadCount > 0 && (
                      <Badge variant="destructive" className="mr-2">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {conv.gigTitle}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{conv.lastMessage?.content?.slice(0, 30)}...</span>
                  <span>{formatDate(conv.lastMessage?.created_at)}</span>
                </div>
              </div>
            </div>
          </button>
          <Separator className="my-2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <div className="h-full flex flex-col">
                <CardHeader className="space-y-4 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle>Messages</CardTitle>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <ConversationsList />
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sidebar - Desktop */}
        <Card className="hidden lg:flex lg:col-span-3 flex-col">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle>Messages</CardTitle>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <ConversationsList />
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-1 lg:col-span-9 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <Link 
                    to={`/profile/${selectedConversation.otherUserId}`}
                    className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.otherUserAvatar} alt={selectedConversation.otherUserName} />
                      <AvatarFallback>{getInitials(selectedConversation.otherUserName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle>{selectedConversation.otherUserName}</CardTitle>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-sm">
                            {selectedConversation.otherUserRating || 0}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {selectedConversation.gigTitle}
                      </Badge>
                    </div>
                  </Link>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender_id === userData?.userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          msg.sender_id === userData?.userId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        } rounded-lg p-4`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium">{msg.senderName}</span>
                          <span className="text-xs opacity-70">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <CardContent className="border-t p-4">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your message..."
                    className="min-h-[100px] resize-none"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!replyContent.trim()}
                      className="space-x-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;