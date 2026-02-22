import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = ['Rice', 'Vegetables', 'Fruits', 'Cooked Food', 'Bread', 'Dairy', 'Snacks', 'Beverages', 'Other'];

export default function Watchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
      fetchRecentMatches();

      // Realtime for new donations matching watchlist
      const channel = supabase
        .channel('watchlist-donations')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, (payload) => {
          const newDonation = payload.new as any;
          const matched = watchlist.some(w =>
            newDonation.food_type?.toLowerCase().includes(w.category.toLowerCase())
          );
          if (matched) {
            toast({
              title: '🔔 New donation matches your watchlist!',
              description: `"${newDonation.title}" (${newDonation.food_type}) was just posted.`,
            });
            // Create notification
            supabase.from('notifications').insert({
              user_id: user.id,
              title: 'Watchlist Match!',
              message: `New donation "${newDonation.title}" matches your watched category "${newDonation.food_type}".`,
              type: 'info',
              related_id: newDonation.id,
            });
            setRecentMatches(prev => [newDonation, ...prev]);
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user, watchlist.length]);

  const fetchWatchlist = async () => {
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setWatchlist(data);
  };

  const fetchRecentMatches = async () => {
    // Get the user's watched categories
    const { data: wl } = await supabase
      .from('watchlist')
      .select('category')
      .eq('user_id', user!.id);

    if (wl && wl.length > 0) {
      const categories = wl.map(w => w.category);
      // Fetch recent donations matching any watched category
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (donations) {
        const matches = donations.filter(d =>
          categories.some(c => d.food_type?.toLowerCase().includes(c.toLowerCase()))
        );
        setRecentMatches(matches);
      }
    }
  };

  const addToWatchlist = async (category: string) => {
    if (!user) return;
    const exists = watchlist.some(w => w.category === category);
    if (exists) {
      toast({ title: 'Already watching this category' });
      return;
    }
    const { error } = await supabase.from('watchlist').insert({
      user_id: user.id,
      category,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: `Now watching "${category}" 👀` });
    fetchWatchlist();
  };

  const removeFromWatchlist = async (id: string) => {
    await supabase.from('watchlist').delete().eq('id', id);
    setWatchlist(prev => prev.filter(w => w.id !== id));
    toast({ title: 'Removed from watchlist' });
  };

  const watchedCategories = watchlist.map(w => w.category);
  const availableCategories = CATEGORIES.filter(c => !watchedCategories.includes(c));

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-800">Watchlist</h1>
          <p className="text-sm text-emerald-600 mt-1">Get notified when new donations match your interests</p>
        </div>

        {/* Currently Watching */}
        <div>
          <h2 className="text-lg font-bold text-emerald-800 mb-3">Watching</h2>
          {watchlist.length === 0 ? (
            <Card className="border-dashed border-emerald-300">
              <CardContent className="p-6 text-center text-emerald-600">
                <EyeOff className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No categories watched yet. Add some below!
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-wrap gap-2">
              {watchlist.map(w => (
                <span
                  key={w.id}
                  className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {w.category}
                  <button onClick={() => removeFromWatchlist(w.id)} className="ml-1 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Add Categories */}
        {availableCategories.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-emerald-800 mb-3">Add Categories</h2>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(c => (
                <Button
                  key={c}
                  variant="outline"
                  size="sm"
                  onClick={() => addToWatchlist(c)}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {c}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Matches */}
        <div>
          <h2 className="text-lg font-bold text-emerald-800 mb-3">Recent Matches</h2>
          {recentMatches.length === 0 ? (
            <Card className="border-dashed border-emerald-300">
              <CardContent className="p-6 text-center text-emerald-600">
                No matching donations yet. They'll appear here when found!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentMatches.map(d => (
                <Card key={d.id} className="border-emerald-100">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-emerald-800 text-sm">{d.title}</h3>
                        <p className="text-xs text-gray-500">
                          {d.food_type && `🍽️ ${d.food_type}`} {d.quantity && `• 📦 ${d.quantity}`}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(d.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DonationLayout>
  );
}
