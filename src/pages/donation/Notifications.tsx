import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, CheckCheck, Trash2, Info, Truck, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const typeIcons: Record<string, typeof Bell> = {
  info: Info,
  tracking: Truck,
  message: MessageCircle,
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Realtime subscription
      const channel = supabase
        .channel('notifications-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
          setNotifications(prev => [payload.new as any, ...prev]);
          toast({ title: (payload.new as any).title, description: (payload.new as any).message });
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast({ title: 'All notifications marked as read' });
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-800">Notifications</h1>
            <p className="text-sm text-emerald-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} size="sm" variant="outline" className="border-emerald-300 text-emerald-700">
              <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="border-dashed border-emerald-300">
            <CardContent className="p-8 text-center text-emerald-600">
              <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
              No notifications yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <Card
                  key={n.id}
                  className={`transition-all ${n.is_read ? 'border-gray-100 opacity-70' : 'border-emerald-200 bg-emerald-50/30 shadow-sm'}`}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`p-2 rounded-full ${n.is_read ? 'bg-gray-100' : 'bg-emerald-100'}`}>
                      <Icon className={`h-5 w-5 ${n.is_read ? 'text-gray-400' : 'text-emerald-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${n.is_read ? 'text-gray-500' : 'text-emerald-800'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      {!n.is_read && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)} className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteNotification(n.id)} className="h-8 w-8 p-0 text-red-400 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DonationLayout>
  );
}
