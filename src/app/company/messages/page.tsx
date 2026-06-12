'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
 MessageSquare,
 Send,
 Search,
 Plus,
 Phone,
 Video,
 MoreVertical,
 Check,
 CheckCheck,
 Clock,
 Building2,
 Users,
} from 'lucide-react';

interface Conversation {
 id: string;
 name: string;
 avatar: string;
 lastMessage: string;
 lastMessageTime: string;
 unread: number;
 online: boolean;
 type: 'student' | 'company' | 'group';
}

interface Message {
 id: string;
 conversationId: string;
 senderId: string;
 content: string;
 timestamp: string;
 isRead: boolean;
}

const mockConversations: Conversation[] = [
 { id: '1', name: 'Priya Sharma', avatar: 'PS', lastMessage: 'Thank you for the internship offer!', lastMessageTime: '2 min ago', unread: 2, online: true, type: 'student' },
 { id: '2', name: 'Rahul Verma', avatar: 'RV', lastMessage: 'I have submitted the task', lastMessageTime: '15 min ago', unread: 1, online: true, type: 'student' },
 { id: '3', name: 'Ananya Patel', avatar: 'AP', lastMessage: 'When does the internship start?', lastMessageTime: '1 hr ago', unread: 0, online: false, type: 'student' },
 { id: '4', name: 'Interns Group', avatar: 'IG', lastMessage: 'Arjun: I completed the assignment', lastMessageTime: '3 hr ago', unread: 5, online: false, type: 'group' },
 { id: '5', name: 'Sneha Iyer', avatar: 'SI', lastMessage: 'Can we schedule a call?', lastMessageTime: '1 day ago', unread: 0, online: false, type: 'student' },
 { id: '6', name: 'Karthik Nair', avatar: 'KN', lastMessage: 'The project is almost done', lastMessageTime: '2 days ago', unread: 0, online: true, type: 'student' },
];

const mockMessages: Record<string, Message[]> = {
 '1': [
 { id: 'm1', conversationId: '1', senderId: 'student', content: 'Hello! I wanted to discuss the internship opportunity.', timestamp: '10:00 AM', isRead: true },
 { id: 'm2', conversationId: '1', senderId: 'company', content: 'Hi Priya! Glad you\'re interested. We\'d love to have you on board.', timestamp: '10:05 AM', isRead: true },
 { id: 'm3', conversationId: '1', senderId: 'student', content: 'That\'s great! What would be the next steps?', timestamp: '10:10 AM', isRead: true },
 { id: 'm4', conversationId: '1', senderId: 'company', content: 'We\'ll send you the offer letter by end of day. Congratulations! 🎉', timestamp: '10:15 AM', isRead: true },
 { id: 'm5', conversationId: '1', senderId: 'student', content: 'Thank you for the internship offer!', timestamp: '10:20 AM', isRead: false },
 ],
 '2': [
 { id: 'm6', conversationId: '2', senderId: 'company', content: 'Hi Rahul, how\'s the backend project going?', timestamp: '9:00 AM', isRead: true },
 { id: 'm7', conversationId: '2', senderId: 'student', content: 'It\'s going well! I\'m almost done with the API endpoints.', timestamp: '9:30 AM', isRead: true },
 { id: 'm8', conversationId: '2', senderId: 'student', content: 'I have submitted the task', timestamp: '11:45 AM', isRead: false },
 ],
};

export default function CompanyMessagesPage() {
 const { user } = useAppStore();
 const [conversations] = React.useState<Conversation[]>(mockConversations);
 const [selectedConversation, setSelectedConversation] = React.useState<string | null>(null);
 const [messages, setMessages] = React.useState<Record<string, Message[]>>(mockMessages);
 const [newMessage, setNewMessage] = React.useState('');
 const [searchQuery, setSearchQuery] = React.useState('');

 const filteredConversations = React.useMemo(() => {
 if (!searchQuery) return conversations;
 return conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
 }, [conversations, searchQuery]);

 const currentMessages = selectedConversation ? messages[selectedConversation] || [] : [];
 const currentConversation = conversations.find((c) => c.id === selectedConversation);

 const handleSend = () => {
 if (!newMessage.trim() || !selectedConversation) return;
 const msg: Message = {
 id: `m${Date.now()}`,
 conversationId: selectedConversation,
 senderId: 'company',
 content: newMessage.trim(),
 timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
 isRead: false,
 };
 setMessages((prev) => ({
 ...prev,
 [selectedConversation]: [...(prev[selectedConversation] || []), msg],
 }));
 setNewMessage('');
 };

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Messages</h1>
 <p className="text-sm text-text-secondary mt-1">Communicate with students, interns, and team members</p>
 </div>

 <Card className="overflow-hidden">
 <div className="flex h-[600px]">
 {/* Conversations sidebar */}
 <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
 {/* Search */}
 <div className="p-3 border-b border-border">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 placeholder="Search conversations..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10 text-xs"
 />
 </div>
 </div>

 {/* Conversations list */}
 <ScrollArea className="flex-1">
 <div className="space-y-0">
 {filteredConversations.map((conv) => {
 const isSelected = selectedConversation === conv.id;
 return (
 <button
 key={conv.id}
 onClick={() => setSelectedConversation(conv.id)}
 className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${
 isSelected ? 'bg-electric/5 border-l-2 border-electric' : ''
 }`}
 >
 <div className="relative">
 <Avatar className="w-10 h-10">
 <AvatarFallback className={`text-xs font-semibold ${
 conv.type === 'group' ? 'bg-purple/10 text-purple' : 'bg-electric/10 text-electric'
 }`}>
 {conv.avatar}
 </AvatarFallback>
 </Avatar>
 {conv.online && (
 <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between">
 <p className="text-sm font-medium truncate">{conv.name}</p>
 <span className="text-[10px] text-text-secondary">{conv.lastMessageTime}</span>
 </div>
 <div className="flex items-center justify-between mt-0.5">
 <p className="text-xs text-text-secondary truncate">{conv.lastMessage}</p>
 {conv.unread > 0 && (
 <Badge className="bg-electric text-white text-[9px] h-5 w-5 rounded-full flex items-center justify-center p-0">
 {conv.unread}
 </Badge>
 )}
 </div>
 </div>
 </button>
 );
 })}
 </div>
 </ScrollArea>
 </div>

 {/* Chat area */}
 <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
 {selectedConversation && currentConversation ? (
 <>
 {/* Chat header */}
 <div className="flex items-center justify-between p-4 border-b border-border">
 <div className="flex items-center gap-3">
 <button
 onClick={() => setSelectedConversation(null)}
 className="md:hidden text-text-secondary hover:text-foreground"
 >
 ←
 </button>
 <Avatar className="w-9 h-9">
 <AvatarFallback className={`text-xs font-semibold ${
 currentConversation.type === 'group' ? 'bg-purple/10 text-purple' : 'bg-electric/10 text-electric'
 }`}>
 {currentConversation.avatar}
 </AvatarFallback>
 </Avatar>
 <div>
 <p className="text-sm font-semibold">{currentConversation.name}</p>
 <p className="text-[10px] text-text-secondary">
 {currentConversation.online ? '🟢 Online' : '⚪ Offline'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <Phone className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <Video className="w-4 h-4" />
 </Button>
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <MoreVertical className="w-4 h-4" />
 </Button>
 </div>
 </div>

 {/* Messages */}
 <ScrollArea className="flex-1 p-4">
 <div className="space-y-3">
 {currentMessages.map((msg) => {
 const isCompany = msg.senderId === 'company';
 return (
 <div
 key={msg.id}
 className={`flex ${isCompany ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
 isCompany
 ? 'bg-electric text-white rounded-br-sm'
 : 'bg-muted rounded-bl-sm'
 }`}>
 <p>{msg.content}</p>
 <div className={`flex items-center gap-1 mt-1 text-[10px] ${
 isCompany ? 'text-white/60' : 'text-text-secondary'
 }`}>
 <span>{msg.timestamp}</span>
 {isCompany && (
 msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </ScrollArea>

 {/* Message input */}
 <div className="p-3 border-t border-border">
 <div className="flex items-center gap-2">
 <Input
 placeholder="Type a message..."
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
 className="flex-1 text-sm"
 />
 <Button
 onClick={handleSend}
 disabled={!newMessage.trim()}
 className="bg-navy text-white gap-2"
 size="sm"
 >
 <Send className="w-4 h-4" />
 </Button>
 </div>
 </div>
 </>
 ) : (
 <div className="flex-1 flex items-center justify-center">
 <div className="text-center">
 <MessageSquare className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
 <p className="text-sm font-medium text-text-secondary">Select a conversation</p>
 <p className="text-xs text-text-secondary mt-1">Choose from your existing conversations or start a new one</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </Card>
 </div>
 );
}
