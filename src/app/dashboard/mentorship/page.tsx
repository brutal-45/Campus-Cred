'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Users, Calendar, Clock, Video, MessageSquare, Star, Plus, ChevronRight,
  CheckCircle, XCircle, Filter, Search, BookOpen, Target, ArrowRight,
  Mic, ExternalLink, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store';

interface Mentor { id: string; name: string; role: string; company: string; avatar: string; rating: number; sessions: number; expertise: string[]; available: boolean; }
interface Session { id: string; mentorId: string; mentorName: string; topic: string; date: string; time: string; status: 'upcoming' | 'completed' | 'cancelled'; notes: string; rating?: number; }



export default function MentorshipPage() {
  const { token } = useAppStore();
  const [mentors, setMentors] = React.useState<Mentor[]>([]);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [stats, setStats] = React.useState({ upcoming: 0, completed: 0, avgRating: 0, availableMentors: 0 });
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('mentors');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showBooking, setShowBooking] = React.useState(false);
  const [selectedMentor, setSelectedMentor] = React.useState<Mentor | null>(null);
  const [bookingTopic, setBookingTopic] = React.useState('');
  const [bookingDate, setBookingDate] = React.useState('');
  const [bookingTime, setBookingTime] = React.useState('');
  const [bookingNotes, setBookingNotes] = React.useState('');
  const [isBooking, setIsBooking] = React.useState(false);

  const loadMentorship = React.useCallback(() => {
    fetch('/api/mentorship', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        setMentors(data.mentors || []);
        setSessions(data.sessions || []);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => { loadMentorship(); }, [loadMentorship]);

  const filteredMentors = mentors.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');

  const handleBookSession = async () => {
    if (!selectedMentor || !bookingTopic || !bookingDate || !bookingTime) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!token) {
      toast.error('Please sign in again to book a session');
      return;
    }
    setIsBooking(true);
    try {
      const res = await fetch('/api/mentorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          topic: bookingTopic,
          date: bookingDate,
          time: bookingTime,
          notes: bookingNotes || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to book session');
        setIsBooking(false);
        return;
      }
      if (data.session) setSessions(prev => [data.session, ...prev]);
      toast.success(`Session booked with ${selectedMentor.name}!`);
    } catch {
      toast.error('Failed to book session. Please try again.');
      setIsBooking(false);
      return;
    }
    setShowBooking(false);
    setSelectedMentor(null);
    setBookingTopic('');
    setBookingDate('');
    setBookingTime('');
    setBookingNotes('');
    setIsBooking(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Users className="w-6 h-6 text-purple-500" /> Mentorship</h1>
          <p className="text-sm text-text-secondary">Book 1-on-1 sessions with industry mentors</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 w-fit">
          <BookOpen className="w-3.5 h-3.5 mr-1" />{completedSessions.length} sessions completed
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming', value: upcomingSessions.length, icon: Calendar, color: 'text-electric' },
          { label: 'Completed', value: completedSessions.length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Avg Rating', value: stats.avgRating ? stats.avgRating.toFixed(1) : '—', icon: Star, color: 'text-amber-500' },
          { label: 'Mentors Available', value: mentors.filter(m => m.available).length, icon: Users, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <Card><CardContent className="p-4 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </CardContent></Card>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Find Mentors Tab */}
        <TabsContent value="mentors" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or expertise..." className="pl-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMentors.map((mentor, i) => (
              <div key={mentor.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <Card className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white font-semibold">{mentor.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold truncate">{mentor.name}</h3>
                          {mentor.available && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-text-secondary">{mentor.role} at {mentor.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-medium">{mentor.rating}</span>
                          </div>
                          <span className="text-xs text-text-secondary">({mentor.sessions} sessions)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentor.expertise.map(e => (
                            <Badge key={e} variant="secondary" className="text-[10px] px-1.5 py-0">{e}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => { setSelectedMentor(mentor); setShowBooking(true); }}
                        disabled={!mentor.available}
                        className="gap-1 flex-1 text-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />Book Session
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* My Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          {upcomingSessions.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <p className="text-sm font-semibold">No upcoming sessions</p>
              <p className="text-xs text-text-secondary mt-1">Book a session with a mentor to get started</p>
              <Button className="mt-4 gap-2" onClick={() => setActiveTab('mentors')}><Plus className="w-4 h-4" />Find Mentors</Button>
            </CardContent></Card>
          ) : (
            upcomingSessions.map((session, i) => (
              <div key={session.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-sm">
                          {session.mentorName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{session.topic}</p>
                          <p className="text-xs text-text-secondary">with {session.mentorName}</p>
                        </div>
                      </div>
                      <Badge className="bg-electric/10 text-electric border-electric/20">Upcoming</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{session.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.time}</span>
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" />Video Call</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="gap-1 text-xs"><Video className="w-3.5 h-3.5" />Join Call</Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs"><MessageSquare className="w-3.5 h-3.5" />Message</Button>
                      <Button variant="ghost" size="sm" className="text-danger hover:text-danger text-xs ml-auto">Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {[...completedSessions, ...cancelledSessions].map((session, i) => (
            <div key={session.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <Card className={session.status === 'cancelled' ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{session.topic}</p>
                      <p className="text-xs text-text-secondary">with {session.mentorName} • {session.date}</p>
                    </div>
                    <Badge className={session.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                      {session.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {session.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </Badge>
                  </div>
                  {session.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < session.rating! ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} />
                      ))}
                      <span className="text-xs text-text-secondary ml-1">{session.rating}/5</span>
                    </div>
                  )}
                  {session.notes && <p className="text-xs text-text-secondary mt-2">{session.notes}</p>}
                </CardContent>
              </Card>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Booking Modal */}
      {showBooking && selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBooking(false)}>
          <div className="animate-fade-in bg-card rounded-xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12"><AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white font-semibold">{selectedMentor.avatar}</AvatarFallback></Avatar>
              <div>
                <h3 className="text-sm font-semibold">Book Session with {selectedMentor.name}</h3>
                <p className="text-xs text-text-secondary">{selectedMentor.role} at {selectedMentor.company}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div><label className="text-xs font-medium">Topic *</label><Input value={bookingTopic} onChange={e => setBookingTopic(e.target.value)} placeholder="What do you want to discuss?" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Date *</label><Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} /></div>
                <div><label className="text-xs font-medium">Time *</label><Input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} /></div>
              </div>
              <div><label className="text-xs font-medium">Notes</label><Textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} placeholder="Any specific questions or topics..." className="min-h-[80px]" /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowBooking(false)}>Cancel</Button>
              <Button onClick={handleBookSession} disabled={isBooking} className="bg-navy text-white gap-2">
                {isBooking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Calendar className="w-4 h-4" />}
                Book Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
