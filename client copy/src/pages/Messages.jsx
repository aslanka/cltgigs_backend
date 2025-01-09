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
import { Search, Send, MessageSquare } from "lucide-react";

const Messages = () => {
  const { userData } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/messages');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const res = await axios.get(`/messages/${conv.conversationId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !replyContent.trim()) return;
    try {
      await axios.post('/messages', {
        conversationId: selectedConversation.conversationId,
        content: replyContent
      });
      setReplyContent('');
      const res = await axios.get(`/messages/${selectedConversation.conversationId}`);
      setMessages(res.data);
    } catch (err) {
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

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-12 gap-6 p-6">
      {/* Sidebar */}
      <Card className="col-span-3 flex flex-col">
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
          {filteredConversations.map((conv) => (
            <div key={conv.conversationId} className="px-4">
              <button
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedConversation?.conversationId === conv.conversationId
                    ? 'bg-secondary'
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => selectConversation(conv)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(conv.otherUserName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{conv.otherUserName}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {conv.gigTitle}
                    </p>
                  </div>
                </div>
              </button>
              <Separator className="my-2" />
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-9 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(selectedConversation.otherUserName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedConversation.otherUserName}</CardTitle>
                    <Badge variant="secondary">{selectedConversation.gigTitle}</Badge>
                  </div>
                </div>
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
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">{msg.senderName}</span>
                        <span className="text-xs opacity-70">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
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
                  className="min-h-[100px]"
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
                    className="space-x-2"
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
  );
};

export default Messages;