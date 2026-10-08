import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRole, AppRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send, MessageCircle, Heart, Users, Home, Globe,
  HandHeart, HelpCircle, Package,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Intent = 'request' | 'donate' | 'help';

type ChatMessage = {
  id: string;
  senderId: string;
  channel: string;
  senderRole: AppRole;
  senderName: string;
  intent: Intent;
  content: string;
  createdAt: number;
};

const CHANNELS: { id: string; label: string; icon: typeof Heart; description: string }[] = [
  { id: 'all',            label: 'Community',         icon: Globe, description: 'Everyone — donors, NGOs & orphanages' },
  { id: 'donor-ngo',      label: 'Donors ↔ NGOs',     icon: Users, description: 'Coordinate donations with NGOs' },
  { id: 'donor-orphan',   label: 'Donors ↔ Orphanages', icon: Home, description: 'Talk directly to orphanages' },
  { id: 'ngo-orphan',     label: 'NGOs ↔ Orphanages', icon: HandHeart, description: 'NGOs supporting orphanages' },
];

const INTENTS: { id: Intent; label: string; icon: typeof Heart; cls: string }[] = [
  { id: 'request', label: 'Request',  icon: HelpCircle,  cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'donate',  label: 'Donate',   icon: Package,     cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'help',    label: 'Help',     icon: HandHeart,   cls: 'bg-orange-100 text-orange-800 border-orange-300' },
];

const roleLabel: Record<AppRole, string> = {
  donor: 'Donor',
  ngo: 'NGO',
  orphanage_member: 'Orphanage',
  admin: 'Admin',
};

const roleColor: Record<AppRole, string> = {
  donor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  ngo: 'text-orange-700 bg-orange-50 border-orange-200',
  orphanage_member: 'text-blue-700 bg-blue-50 border-blue-200',
  admin: 'text-red-700 bg-red-50 border-red-200',
};

function channelAllowsRole(channelId: string, role: AppRole): boolean {
  if (role === 'admin' || channelId === 'all') return true;
  if (channelId === 'donor-ngo') return role === 'donor' || role === 'ngo';
  if (channelId === 'donor-orphan') return role === 'donor' || role === 'orphanage_member';
  if (channelId === 'ngo-orphan') return role === 'ngo' || role === 'orphanage_member';
  return false;
}

export default function DonorChat() {
  const { role } = useRole();
  const { user } = useAuth();
  const profile = useMemo(() => {
    try {
      const raw = localStorage.getItem('user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);
  const senderName: string =
    (profile?.full_name && String(profile.full_name).trim()) ||
    (role ? `Anonymous ${roleLabel[role]}` : 'Anonymous');

  const myRole: AppRole = role ?? 'donor';
  const availableChannels = CHANNELS.filter(c => channelAllowsRole(c.id, myRole));

  const [activeChannel, setActiveChannel] = useState<string>(availableChannels[0]?.id ?? 'all');
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [intent, setIntent] = useState<Intent>(myRole === 'donor' ? 'donate' : 'request');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = allMessages.filter(message => message.channel === activeChannel);

  // Load messages visible to this account; chat history is shared across devices.
  useEffect(() => {
    if (!user?.id) {
      setAllMessages([]);
      return;
    }

    let refreshTimer: number | undefined;
    let cancelled = false;
    const refreshMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })
        .limit(1000);

      if (cancelled) return;
      if (error) {
        toast({ title: 'Could not load chat messages', description: error.message, variant: 'destructive' });
        return;
      }

      const uniqueMessages = new Map<string, ChatMessage>();
      for (const row of data ?? []) {
        const tagged = row.content.match(/^\[([a-z-]+)\|([a-z_]+)\|([a-z]+)\]\s*([\s\S]*)$/);
        const channelId = tagged?.[1] ?? 'all';
        const messageRole = tagged?.[2] as AppRole | undefined;
        if (!CHANNELS.some(channel => channel.id === channelId)) continue;

        const key = `${row.sender_id}:${row.created_at}:${row.content}`;
        if (uniqueMessages.has(key)) continue;

        const isMine = row.sender_id === user.id;
        uniqueMessages.set(key, {
          id: row.id,
          senderId: row.sender_id,
          channel: channelId,
          senderRole: messageRole && messageRole in roleLabel ? messageRole : (isMine ? myRole : 'donor'),
          senderName: isMine ? senderName : 'Community member',
          intent: tagged?.[3] && INTENTS.some(option => option.id === tagged[3]) ? tagged[3] as Intent : 'help',
          content: tagged?.[4] ?? row.content,
          createdAt: new Date(row.created_at).getTime(),
        });
      }
      setAllMessages([...uniqueMessages.values()]);
    };

    void refreshMessages();
    const channel = supabase
      .channel(`chat-messages-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => { void refreshMessages(); }, 120);
      })
      .subscribe();

    return () => {
      cancelled = true;
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [user?.id, myRole, senderName]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !user?.id || sending) return;
    if (text.length > 1000) {
      toast({ title: 'Message too long', description: 'Keep it under 1000 characters.', variant: 'destructive' });
      return;
    }

    setSending(true);
    let error: { message: string } | null = null;
    try {
      const result = await supabase.rpc('send_chat_message', {
        _content: text,
        _channel: `${activeChannel}|${myRole}|${intent}`,
      });
      error = result.error;
    } catch {
      error = { message: 'Please check your connection and try again.' };
    } finally {
      setSending(false);
    }
    if (error) {
      toast({ title: 'Message not sent', description: error.message, variant: 'destructive' });
      return;
    }
    setDraft('');
  };

  const activeChannelMeta = CHANNELS.find(c => c.id === activeChannel) ?? CHANNELS[0];

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-emerald-800">Donors, NGOs & Orphanages Chat</h1>
          <p className="text-emerald-600 mt-1">
            Request supplies, offer donations, or ask for help — in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-260px)]">
          {/* Channels */}
          <Card className="border-emerald-100 overflow-hidden">
            <CardHeader className="bg-emerald-50 py-3">
              <CardTitle className="text-sm text-emerald-800">Channels</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[500px]">
              {availableChannels.map(c => {
                const active = c.id === activeChannel;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChannel(c.id)}
                    className={`w-full flex items-start gap-3 p-3 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 ${
                      active ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
                      <p className="text-xs text-gray-500 truncate">{c.description}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className="md:col-span-2 border-emerald-100 flex flex-col overflow-hidden">
            <CardHeader className="bg-emerald-50 py-3 flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <activeChannelMeta.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-sm text-emerald-800">{activeChannelMeta.label}</CardTitle>
                  <p className="text-xs text-gray-500">{activeChannelMeta.description}</p>
                </div>
              </div>
              <Badge variant="outline" className={roleColor[myRole]}>
                You: {roleLabel[myRole]}
              </Badge>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px]">
              {messages.map(m => {
                const mine = m.senderId === user?.id;
                const intentMeta = INTENTS.find(i => i.id === m.intent) ?? INTENTS[2];
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full border ${roleColor[m.senderRole]}`}>
                          {roleLabel[m.senderRole]}
                        </span>
                        <span className="font-semibold text-gray-700">{m.senderName}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${intentMeta.cls}`}>
                          <intentMeta.icon className="h-3 w-3" />
                          {intentMeta.label}
                        </span>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl text-sm ${
                        mine
                          ? 'bg-emerald-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-12">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </CardContent>

            <div className="p-3 border-t border-gray-100 space-y-2">
              <div className="flex gap-2 flex-wrap">
                {INTENTS.map(i => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setIntent(i.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium transition ${
                      intent === i.id ? i.cls + ' ring-2 ring-offset-1 ring-emerald-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <i.icon className="h-3 w-3" />
                    {i.label}
                  </button>
                ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder={
                    intent === 'request' ? 'Describe what you need…' :
                    intent === 'donate'  ? 'Describe what you can donate…' :
                                           'Ask for help or coordination…'
                  }
                  maxLength={1000}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !draft.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </DonationLayout>
  );
}
