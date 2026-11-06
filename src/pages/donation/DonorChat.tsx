import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { AppRole } from '@/hooks/useRole';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { channelAllowsRole, parseChatContent, uniqueChatRows, type ChatRow } from '@/lib/chat';
import { Building2, CircleAlert, HandHeart, MessageCircle, Radio, Send, Utensils, Users } from 'lucide-react';

type ChannelId = 'all' | 'donor-ngo' | 'donor-orphan' | 'ngo-orphan';
type Intent = 'request' | 'donate' | 'help';
type ChatMessage = ChatRow & { receiver_id: string; is_read: boolean };

const channels: { id: ChannelId; label: string; description: string }[] = [
  { id: 'all', label: 'Community room', description: 'Everyone coordinating food support' },
  { id: 'donor-ngo', label: 'Donors & NGOs', description: 'Offers, collection and delivery' },
  { id: 'donor-orphan', label: 'Donors & orphanages', description: 'Food offers and local needs' },
  { id: 'ngo-orphan', label: 'NGOs & orphanages', description: 'Planning support together' },
];

const roleLabels: Record<AppRole, string> = {
  donor: 'Donor',
  ngo: 'NGO',
  orphanage_member: 'Orphanage',
  admin: 'Admin',
};

const intentLabels: Record<Intent, string> = { request: 'Request', donate: 'Donate', help: 'Help' };
const intentIcons = { request: MessageCircle, donate: Utensils, help: HandHeart };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'R';
}

export default function DonorChat() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<ChannelId>('all');
  const [intent, setIntent] = useState<Intent>('help');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endOfMessages = useRef<HTMLDivElement>(null);

  const visibleChannels = useMemo(
    () => role ? channels.filter(channel => channelAllowsRole(channel.id, role)) : [],
    [role],
  );
  const currentChannel = visibleChannels.find(channel => channel.id === activeChannel) ?? visibleChannels[0];

  const refreshMessages = useCallback(async (showError = false) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('messages')
      .select('id,sender_id,receiver_id,content,created_at,is_read')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    if (error) {
      if (showError) toast({ title: 'Could not load conversations', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const rows = uniqueChatRows((data ?? []) as ChatMessage[]);
    setMessages(rows);
    setLoading(false);

    const userIds = [...new Set(rows.map(row => row.sender_id))];
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id,full_name')
        .in('user_id', userIds);
      if (profiles) {
        setNames(previous => ({
          ...previous,
          ...Object.fromEntries(profiles.map(profile => [profile.user_id, profile.full_name || 'Community member'])),
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRoleLoading(false);
      return;
    }

    let mounted = true;
    supabase.from('user_roles').select('role').eq('user_id', user.id).order('id').limit(1).maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data?.role) {
          toast({ title: 'Chat role unavailable', description: 'Your account role could not be loaded.' , variant: 'destructive' });
        } else {
          setRole(data.role as AppRole);
        }
        setRoleLoading(false);
      });

    void refreshMessages(true);
    const channel = supabase
      .channel(`chat-room-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}`,
      }, () => { void refreshMessages(); })
      .subscribe();
    const interval = window.setInterval(() => { void refreshMessages(); }, 15000);
    const onFocus = () => { void refreshMessages(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
      void supabase.removeChannel(channel);
    };
  }, [user, refreshMessages]);

  const roomMessages = useMemo(() => messages.filter(message => {
    const parsed = parseChatContent(message.content);
    return parsed.channelId === (currentChannel?.id ?? activeChannel);
  }), [messages, currentChannel?.id, activeChannel]);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [roomMessages.length, activeChannel]);

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !role || !currentChannel || sending) return;
    setSending(true);
    const { error } = await supabase.rpc('send_chat_message', {
      _content: content,
      _channel: `${currentChannel.id}|${role}|${intent}`,
    });
    setSending(false);
    if (error) {
      toast({ title: 'Message not sent', description: error.message, variant: 'destructive' });
      return;
    }
    setDraft('');
    await refreshMessages();
  };

  const ownName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  return (
    <DonationLayout>
      <SEO title="Community Chat — Rescue & Nourish" description="Coordinate food donations and local support with donors, NGOs, and orphanages." path="/chat" />
      <section className="space-y-5">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase text-muted-foreground">Rescue & Nourish / Community</p>
            <h1 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">The Commons</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">A shared place to offer food, ask for support, and coordinate the next step.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Radio className="h-4 w-4 text-primary" />
            <span>Saved conversations</span>
          </div>
        </header>

        <div className="grid min-h-[560px] overflow-hidden border border-border bg-card md:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="border-b border-border md:border-b-0 md:border-r">
            <div className="flex items-center gap-2 px-4 py-4">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Conversations</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:overflow-visible">
              {visibleChannels.map(channel => {
                const selected = channel.id === (currentChannel?.id ?? activeChannel);
                return (
                  <Button
                    key={channel.id}
                    type="button"
                    variant={selected ? 'secondary' : 'ghost'}
                    className="h-auto min-w-[190px] justify-start whitespace-normal px-3 py-3 text-left md:w-full"
                    onClick={() => setActiveChannel(channel.id)}
                  >
                    <span className="block">
                      <span className="block text-sm font-semibold">{channel.label}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">{channel.description}</span>
                    </span>
                  </Button>
                );
              })}
            </div>
            <div className="hidden border-t border-border p-4 text-xs text-muted-foreground md:block">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-accent" />
                {role ? roleLabels[role] : 'Loading role'}
              </div>
              <p className="mt-2">Messages stay in the selected room and are saved for the people involved.</p>
            </div>
          </aside>

          <div className="flex min-h-[560px] min-w-0 flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
              <div>
                <h2 className="font-bold">{currentChannel?.label ?? 'Community room'}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{currentChannel?.description ?? 'Messages from your community'}</p>
              </div>
              <Badge variant="outline" className="shrink-0">{roomMessages.length} messages</Badge>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite" aria-label="Conversation messages">
              {loading || roleLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Opening the conversation…</p>
              ) : !role ? (
                <div className="mx-auto flex max-w-md items-center gap-3 py-10 text-sm text-muted-foreground">
                  <CircleAlert className="h-5 w-5 shrink-0" /> Chat is unavailable until your account role is set.
                </div>
              ) : roomMessages.length === 0 ? (
                <div className="mx-auto max-w-sm py-16 text-center">
                  <MessageCircle className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-4 font-semibold">Start the conversation</p>
                  <p className="mt-1 text-sm text-muted-foreground">Share a food offer, a need, or a way you can help.</p>
                </div>
              ) : roomMessages.map(message => {
                const parsed = parseChatContent(message.content);
                const isOwn = message.sender_id === user?.id;
                const senderName = isOwn ? ownName : names[message.sender_id] || roleLabels[parsed.role as AppRole] || 'Community member';
                const messageIntent = parsed.intent as Intent | null;
                const IntentIcon = messageIntent ? intentIcons[messageIntent] : null;
                return (
                  <article key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center text-xs font-bold ${isOwn ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-foreground'}`} aria-hidden="true">
                      {initials(senderName)}
                    </div>
                    <div className={`min-w-0 max-w-[min(82%,38rem)] ${isOwn ? 'text-right' : ''}`}>
                      <div className={`mb-1 flex items-center gap-2 text-xs text-muted-foreground ${isOwn ? 'justify-end' : ''}`}>
                        <span className="font-semibold text-foreground">{senderName}</span>
                        {parsed.role && <span>{roleLabels[parsed.role as AppRole] ?? parsed.role}</span>}
                        <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                      </div>
                      <div className={`inline-block break-words px-3 py-2 text-left text-sm ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                        {messageIntent && IntentIcon && (
                          <span className={`mb-1 flex items-center gap-1 text-[11px] font-semibold ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            <IntentIcon className="h-3 w-3" /> {intentLabels[messageIntent]}
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">{parsed.text}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
              <div ref={endOfMessages} />
            </div>

            <form onSubmit={submitMessage} className="border-t border-border p-3 sm:p-4">
              <div className="mb-3 flex items-center gap-1 overflow-x-auto" aria-label="Message type">
                {(['request', 'donate', 'help'] as Intent[]).map(value => {
                  const Icon = intentIcons[value];
                  return (
                    <Button key={value} type="button" size="sm" variant={intent === value ? 'secondary' : 'ghost'} onClick={() => setIntent(value)}>
                      <Icon className="mr-1.5 h-4 w-4" /> {intentLabels[value]}
                    </Button>
                  );
                })}
              </div>
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={event => setDraft(event.target.value.slice(0, 1000))}
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Write a message to the room…"
                  aria-label="Write a message"
                  maxLength={1000}
                  rows={2}
                  disabled={!role || sending}
                  className="min-h-[52px] resize-none"
                />
                <Button type="submit" size="icon" aria-label="Send message" disabled={!draft.trim() || !role || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Enter to send · Shift+Enter for a new line</span>
                <span>{draft.length}/1000</span>
              </div>
            </form>
          </div>
        </div>
      </section>
    </DonationLayout>
  );
}