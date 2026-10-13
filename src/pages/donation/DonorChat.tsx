import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/hooks/useRole';
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
import { channelAllowsRole, uniqueChatRows } from '@/lib/chat';

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
  { id: 'request', label: 'Request',  icon: HelpCircle,  cls: 'bg-secondary text-secondary-foreground border-border' },
  { id: 'donate',  label: 'Donate',   icon: Package,     cls: 'bg-primary/10 text-primary border-border' },
  { id: 'help',    label: 'Help',     icon: HandHeart,   cls: 'bg-accent/10 text-accent border-border' },
];

const roleLabel: Record<AppRole, string> = {
  donor: 'Donor',
  ngo: 'NGO',
  orphanage_member: 'Orphanage',
  admin: 'Admin',
};

const roleColor: Record<AppRole, string> = {
  donor: 'text-primary bg-primary/10 border-border',
  ngo: 'text-secondary-foreground bg-secondary border-border',
  orphanage_member: 'text-foreground bg-muted border-border',
  admin: 'text-destructive bg-destructive/10 border-border',
};

export default function DonorChat() {
  const { user } = useAuth();
  const [myRole, setMyRole] = useState<AppRole | null>(null);
  const [senderName, setSenderName] = useState('You');
  const availableChannels = CHANNELS.filter(c => myRole && channelAllowsRole(c.id, myRole));
  const [activeChannel, setActiveChannel] = useState('all');

  useEffect(() => {
    setMyRole(null);
    if (!user?.id) return;
    let cancelled = false;
    void (async () => {
      const [roles, profile] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id).order('id').limit(1).maybeSingle(),
        supabase.from('profiles').select('full_name').eq('user_id', user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      if (roles.error || !roles.data) {
        toast({ title: 'Could not load your chat account', description: 'Please sign in again.', variant: 'destructive' });
        return;
      }
      setMyRole(roles.data.role);
      setIntent(roles.data.role === 'donor' ? 'donate' : 'request');
      setSenderName(profile.data?.full_name?.trim() || 'You');
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [intent, setIntent] = useState<Intent>('help');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = allMessages.filter(message => message.channel === activeChannel);

  const refreshMessages = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) {
      toast({ title: 'Could not load chat messages', description: error.message, variant: 'destructive' });
      return;
    }
    const next: ChatMessage[] = [];
    for (const row of uniqueChatRows(data ?? [])) {
      const tagged = row.content.match(/^\[([a-z-]+)\|([a-z_]+)\|([a-z]+)\]\s*([\s\S]*)$/);
      const channelId = tagged?.[1] ?? 'all';
      const messageRole = tagged?.[2] as AppRole | undefined;
      if (!CHANNELS.some(channel => channel.id === channelId)) continue;
      next.push({
        id: row.id,
        senderId: row.sender_id,
        channel: channelId,
        senderRole: messageRole && messageRole in roleLabel ? messageRole : 'donor',
        senderName: row.sender_id === user.id ? senderName : (messageRole && messageRole in roleLabel ? roleLabel[messageRole] : 'Community member'),
        intent: INTENTS.some(option => option.id === tagged?.[3]) ? tagged?.[3] as Intent : 'help',
        content: tagged?.[4] ?? row.content,
        createdAt: Date.parse(row.created_at),
      });
    }
    setAllMessages(next);
  }, [user?.id, senderName]);

  useEffect(() => {
    if (!user?.id) { setAllMessages([]); return; }
    let timer: number | undefined;
    const refresh = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => { void refreshMessages(); }, 120);
    };
    void refreshMessages();
    const channel = supabase.channel(`chat-messages-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${user.id}` }, refresh)
      .subscribe(status => { if (status === 'SUBSCRIBED') refresh(); });
    // Recover missed events after reconnects and when realtime is unavailable.
    const poll = window.setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 3000);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.clearInterval(poll);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      void supabase.removeChannel(channel);
    };
  }, [user?.id, refreshMessages]);

  useEffect(() => {
    if (myRole && !channelAllowsRole(activeChannel, myRole)) setActiveChannel('all');
  }, [myRole, activeChannel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }, [activeChannel, allMessages.length]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !user?.id || !myRole || sending) return;
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
    await refreshMessages();
  };

  const activeChannelMeta = CHANNELS.find(c => c.id === activeChannel) ?? CHANNELS[0];

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-primary">Donors, NGOs & Orphanages Chat</h1>
          <p className="text-primary mt-1">
            Request supplies, offer donations, or ask for help — in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-260px)]">
          {/* Channels */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="bg-primary/5 py-3">
              <CardTitle className="text-sm text-primary">Channels</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[500px]">
              {availableChannels.map(c => {
                const active = c.id === activeChannel;
                return (
                  <Button variant="ghost"
                    key={c.id}
                    onClick={() => setActiveChannel(c.id)}
                    className={`w-full flex items-start gap-3 p-3 text-left hover:bg-primary/5 transition-colors border-b border-border ${
                      active ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm">{c.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.description}</p>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className="md:col-span-2 border-border flex flex-col overflow-hidden">
            <CardHeader className="bg-primary/5 py-3 flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <activeChannelMeta.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm text-primary">{activeChannelMeta.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{activeChannelMeta.description}</p>
                </div>
              </div>
              <Badge variant="outline" className={myRole ? roleColor[myRole] : ''}>
                You: {myRole ? roleLabel[myRole] : 'Loading…'}
              </Badge>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px]">
              {messages.map(m => {
                const mine = m.senderId === user?.id;
                const intentMeta = INTENTS.find(i => i.id === m.intent) ?? INTENTS[2];
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`min-w-0 max-w-[90%] sm:max-w-[80%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full border ${roleColor[m.senderRole]}`}>
                          {roleLabel[m.senderRole]}
                        </span>
                        <span className="font-semibold text-foreground">{m.senderName}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${intentMeta.cls}`}>
                          <intentMeta.icon className="h-3 w-3" />
                          {intentMeta.label}
                        </span>
                      </div>
                      <div className={`px-4 py-2 rounded-md text-sm whitespace-pre-wrap break-words ${
                        mine
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm mt-12">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </CardContent>

            <div className="p-3 border-t border-border space-y-2">
              <div className="flex gap-2 flex-wrap">
                {INTENTS.map(i => (
                  <Button variant="ghost"
                    key={i.id}
                    type="button"
                    onClick={() => setIntent(i.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium transition ${
                      intent === i.id ? i.cls + ' ring-2 ring-offset-1 ring-ring' : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    <i.icon className="h-3 w-3" />
                    {i.label}
                  </Button>
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
                <Button type="submit" size="icon" aria-label="Send message" title="Send message" disabled={sending || !myRole || !draft.trim()} className="bg-primary hover:bg-primary/90">
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
