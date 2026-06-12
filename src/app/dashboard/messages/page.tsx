'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare, Send, Search, Plus, Phone, Video, MoreVertical,
  Check, CheckCheck, Clock, Paperclip, Smile, ArrowLeft, User,
  Users as UsersIcon, Circle, Image, FileText, Mic,
} from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  id: string; name: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean; type: 'direct' | 'group';
}
interface Message { id: string; conversationId: string; senderId: string; senderName: string; content: string; time: string; read: boolean; }

const mockConversations: Conversation[] = [
  { id: '1', name: 'Priya Sharma', avatar: 'PS', lastMessage: 'Great work on the latest submission! Keep it up 🎉', time: '2m ago', unread: 2, online: true, type: 'direct' },
  { id: '2', name: 'CSE Batch 2025', avatar: 'CSE', lastMessage: 'Anyone working on the API challenge?', time: '15m ago', unread: 5, online: false, type: 'group' },
  { id: '3', name: 'Rahul Verma', avatar: 'RV', lastMessage: 'Can we schedule a mock interview?', time: '1h ago', unread: 1, online: true, type: 'direct' },
  { id: '4', name: 'CampusCred Support', avatar: 'CC', lastMessage: 'Your certificate is ready for download', time: '3h ago', unread: 0, online: true, type: 'direct' },
  { id: '5', name: 'Design Team', avatar: 'DT', lastMessage: 'Check the new Figma updates', time: '5h ago', unread: 0, online: false, type: 'group' },
  { id: '6', name: 'Arjun Reddy', avatar: 'AR', lastMessage: 'Thanks for the ML resources!', time: '1d ago', unread: 0, online: false, type: 'direct' },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', conversationId: '1', senderId: 'mentor', senderName: 'Priya Sharma', content: 'Hi! I reviewed your latest submission.', time: '10:00 AM', read: true },
    { id: '2', conversationId: '1', senderId: 'mentor', senderName: 'Priya Sharma', content: 'The code quality has improved significantly since last time. Your error handling is much more robust now.', time: '10:01 AM', read: true },
    { id: '3', conversationId: '1', senderId: 'me', senderName: 'You', content: 'Thank you! I spent extra time on the edge cases this time.', time: '10:05 AM', read: true },
    { id: '4', conversationId: '1', senderId: 'mentor', senderName: 'Priya Sharma', content: 'That shows! One suggestion - consider adding retry logic for the API calls.', time: '10:10 AM', read: true },
    { id: '5', conversationId: '1', senderId: 'me', senderName: 'You', content: 'Good idea! I\'ll implement exponential backoff. Should I submit again after the changes?', time: '10:15 AM', read: true },
    { id: '6', conversationId: '1', senderId: 'mentor', senderName: 'Priya Sharma', content: 'Great work on the latest submission! Keep it up 🎉', time: '10:20 AM', read: false },
  ],
  '2': [
    { id: '1', conversationId: '2', senderId: 'other', senderName: 'Amit Kumar', content: 'Has anyone started the React challenge?', time: '9:00 AM', read: true },
    { id: '2', conversationId: '2', senderId: 'other2', senderName: 'Sneha Das', content: 'I just completed it! The state management part was tricky.', time: '9:15 AM', read: true },
    { id: '3', conversationId: '2', senderId: 'me', senderName: 'You', content: 'I\'m planning to start tonight. Any tips?', time: '9:30 AM', read: true },
    { id: '4', conversationId: '2', senderId: 'other', senderName: 'Amit Kumar', content: 'Anyone working on the API challenge?', time: '9:45 AM', read: false },
  ],
};

export default function MessagesPage() {
  const [conversations, setConversations] = React.useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    if (selectedConversation) {
      const msgs = mockMessages[selectedConversation.id] || [];
      setMessages(msgs);
      setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, unread: 0 } : c));
    }
  }, [selectedConversation]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setIsSending(true);
    const msg: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      senderId: 'me',
      senderName: 'You',
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: false,
    };
    setMessages(prev => [...prev, msg]);
    setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, lastMessage: msg.content, time: 'Just now' } : c));
    setNewMessage('');
    setIsSending(false);
  };

  return (
    <div className="space-y-0 -m-4 md:-m-6 lg:-m-8">
      <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] border rounded-xl overflow-hidden bg-card" style={{ borderColor: '#E2E8F0' }}>
        {/* Conversation List */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r`} style={{ borderColor: '#E2E8F0' }}>
          {/* Search header */}
          <div className="p-4 border-b" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold font-heading">Messages</h2>
              <Button size="sm" variant="ghost" className="gap-1"><Plus className="w-4 h-4" />New</Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            {filteredConversations.map((conv, i) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`animate-fade-in w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50 ${
                  selectedConversation?.id === conv.id ? 'bg-muted' : ''
                }`}
                style={{ animationDelay: `${i * 30}ms`, borderColor: '#E2E8F0' }}
              >
                <div className="relative">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className={`${conv.type === 'group' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-navy'} text-white text-sm font-semibold`}>
                      {conv.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{conv.name}</p>
                    <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-secondary truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-electric text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: '#E2E8F0' }}>
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-navy text-white text-xs font-semibold">{selectedConversation.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{selectedConversation.name}</p>
                  <p className="text-[10px] text-text-secondary flex items-center gap-1">
                    {selectedConversation.online ? (
                      <><Circle className="w-2 h-2 fill-green-500 text-green-500" />Online</>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><Video className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === 'me';
                    return (
                      <div
                        key={msg.id}
                        className={`animate-fade-in flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                          {!isMe && selectedConversation.type === 'group' && (
                            <p className="text-[10px] text-text-secondary mb-1 ml-1">{msg.senderName}</p>
                          )}
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            isMe
                              ? 'bg-electric text-white rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-text-secondary">{msg.time}</span>
                            {isMe && (
                              msg.read ? <CheckCheck className="w-3 h-3 text-electric" /> : <Check className="w-3 h-3 text-text-secondary" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="p-4 border-t" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex-shrink-0"><Paperclip className="w-4 h-4" /></Button>
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  />
                  <Button variant="ghost" size="sm" className="flex-shrink-0"><Smile className="w-4 h-4" /></Button>
                  <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()} size="sm" className="bg-navy text-white gap-1 flex-shrink-0">
                    {isSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                <p className="text-lg font-semibold text-text-secondary">Select a conversation</p>
                <p className="text-sm text-text-secondary/60 mt-1">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
