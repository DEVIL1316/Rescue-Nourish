import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Package, CheckCircle2, Users, MapPin, Clock } from 'lucide-react';
import { urgencyClasses } from '@/lib/donationConstants';

export default function DonationHistory() {
  const { user } = useAuth();
  const [mine, setMine] = useState<any[]>([]);
  const [delivered, setDelivered] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [mineRes, delRes] = await Promise.all([
        user
          ? supabase.from('donations').select('*').eq('donor_id', user.id).order('created_at', { ascending: false })
          : Promise.resolve({ data: [] as any[] }),
        supabase
          .from('donations')
          .select('*')
          .eq('tracking_status', 'delivered')
          .order('delivered_at', { ascending: false })
          .limit(200),
      ]);
      setMine(mineRes.data || []);
      setDelivered(delRes.data || []);
    };
    load();
  }, [user]);

  const totals = useMemo(() => {
    const deliveredMine = mine.filter(d => d.tracking_status === 'delivered');
    return {
      count: mine.length,
      deliveredCount: deliveredMine.length,
      inProgress: mine.filter(d => d.tracking_status !== 'delivered').length,
      recipients: new Set(mine.map(d => d.recipient_name).filter(Boolean)).size,
    };
  }, [mine]);

  const byRecipient = useMemo(() => {
    const map = new Map<string, any[]>();
    delivered.forEach(d => {
      const key = d.recipient_name || 'Unassigned recipient';
      map.set(key, [...(map.get(key) || []), d]);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [delivered]);

  const Row = ({ d }: { d: any }) => (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-100 bg-white p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-emerald-800 truncate">{d.title}</p>
        <p className="text-xs text-gray-500">
          {[d.food_type, d.quantity].filter(Boolean).join(' · ') || 'No details'}
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
          {d.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-600" />{d.location}</span>}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-orange-500" />
            {new Date(d.delivered_at || d.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant="secondary" className="text-[10px] capitalize">{String(d.tracking_status).replace('_', ' ')}</Badge>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${urgencyClasses(d.urgency)}`}>
          {d.urgency}
        </span>
      </div>
    </div>
  );

  const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <Card className="border-emerald-100">
      <CardContent className="p-4">
        <Icon className="h-5 w-5 text-emerald-600" />
        <p className="mt-2 text-2xl font-black text-emerald-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );

  return (
    <DonationLayout>
      <SEO
        title="Donation History — Rescue & Nourish"
        description="Review your past food donations, delivery outcomes and the recipients you have supported."
        path="/history"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-800 flex items-center gap-2">
            <History className="h-7 w-7" /> Donation History
          </h1>
          <p className="text-sm text-emerald-600 mt-1">Your past donations and what each recipient has accepted</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Package} label="Total donations" value={totals.count} />
          <Stat icon={CheckCircle2} label="Delivered" value={totals.deliveredCount} />
          <Stat icon={Clock} label="In progress" value={totals.inProgress} />
          <Stat icon={Users} label="Recipients helped" value={totals.recipients} />
        </div>

        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">My donations</TabsTrigger>
            <TabsTrigger value="recipients">Previous accepted</TabsTrigger>
          </TabsList>

          <TabsContent value="mine" className="space-y-2 pt-3">
            {mine.length === 0 ? (
              <Card className="border-dashed border-emerald-300 bg-emerald-50/30">
                <CardContent className="p-6 text-center text-emerald-600 text-sm">No donations recorded yet.</CardContent>
              </Card>
            ) : (
              mine.map(d => <Row key={d.id} d={d} />)
            )}
          </TabsContent>

          <TabsContent value="recipients" className="space-y-4 pt-3">
            {byRecipient.length === 0 ? (
              <Card className="border-dashed border-emerald-300 bg-emerald-50/30">
                <CardContent className="p-6 text-center text-emerald-600 text-sm">No delivered donations yet.</CardContent>
              </Card>
            ) : (
              byRecipient.map(([name, items]) => (
                <Card key={name} className="border-emerald-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-emerald-800 flex items-center justify-between">
                      <span className="truncate">{name}</span>
                      <Badge variant="secondary" className="text-[10px]">{items.length} accepted</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.slice(0, 6).map(d => <Row key={d.id} d={d} />)}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DonationLayout>
  );
}
