import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Phone, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DonorChat() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages();
      // Realtime subscription
      const channel = supabase
        .channel('chat-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, (payload) => {
          const msg = payload.new as any;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedUser.user_id) ||
            (msg.sender_id === selectedUser.user_id && msg.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, msg]);
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    if (data) setProfiles(data.filter(p => p.user_id !== user?.id));
  };

  const fetchMessages = async () => {
    if (!user || !selectedUser) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.user_id}),and(sender_id.eq.${selectedUser.user_id},receiver_id.eq.${user.id})`)
      .order('created_at');
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser || !newMessage.trim()) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedUser.user_id,
      content: newMessage.trim(),
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setNewMessage('');
  };

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-emerald-800">Donors & Chat</h1>
          <p className="text-emerald-600 mt-1">Connect with donors and NGOs directly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Users List */}
          <Card className="border-emerald-100 overflow-hidden">
            <CardHeader className="bg-emerald-50 py-3">
              <CardTitle className="text-sm text-emerald-800">People</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[500px]">
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedUser(p)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 ${
                    selectedUser?.id === p.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500 capitalize">{p.role_type}</p>
                  </div>
                </button>
              ))}
              {profiles.length === 0 && (
                <p className="p-4 text-sm text-gray-500 text-center">No users found</p>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 border-emerald-100 flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <CardHeader className="bg-emerald-50 py-3 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-emerald-800">{selectedUser.full_name || 'Anonymous'}</CardTitle>
                      <p className="text-xs text-gray-500 capitalize">{selectedUser.role_type}</p>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <a href={`tel:${selectedUser.phone}`}>
                      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700">
                        <Phone className="h-4 w-4 mr-1" /> Call
                      </Button>
                    </a>
                  )}
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                        m.sender_id === user?.id
                          ? 'bg-emerald-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm mt-8">Start a conversation!</p>
                  )}
                </CardContent>
                <div className="p-3 border-t border-gray-100">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a person to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DonationLayout>
  );
}
