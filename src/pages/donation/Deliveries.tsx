import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationSelect } from '@/components/donation/LocationSelect';
import { Truck, MapPin, Clock, Route, Plus, X, PackageCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { estimateRoute, formatEta } from '@/lib/distance';

const STATUS_FLOW = ['assigned', 'picked_up', 'in_transit', 'delivered'] as const;

const STATUS_LABEL: Record<string, string> = {
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusClasses = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700';
    case 'in_transit':
      return 'bg-blue-100 text-blue-700';
    case 'picked_up':
      return 'bg-amber-100 text-amber-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-orange-100 text-orange-700';
  }
};

export default function Deliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    donation_id: '',
    recipient_name: '',
    pickup_location: '',
    destination_location: '',
    assigned_name: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [delRes, donRes] = await Promise.all([
      supabase.from('deliveries').select('*, donations(title, food_type, quantity)').order('created_at', { ascending: false }),
      supabase.from('donations').select('id, title, location').order('created_at', { ascending: false }).limit(50),
    ]);
    if (delRes.data) setDeliveries(delRes.data);
    if (donRes.data) setDonations(donRes.data);
  };

  const estimate = estimateRoute(form.pickup_location, form.destination_location);

  const createDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('deliveries').insert({
      donation_id: form.donation_id,
      assigned_to: user.id,
      assigned_name: form.assigned_name || null,
      recipient_name: form.recipient_name || null,
      pickup_location: form.pickup_location || null,
      destination_location: form.destination_location || null,
      distance_km: estimate.distanceKm,
      eta_minutes: estimate.etaMinutes,
      status: 'assigned',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Delivery created 🚚' });
    setShowAdd(false);
    setForm({ donation_id: '', recipient_name: '', pickup_location: '', destination_location: '', assigned_name: '' });
    fetchData();
  };

  const advance = async (delivery: any) => {
    const idx = STATUS_FLOW.indexOf(delivery.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    const stamps: Record<string, string> = {
      picked_up: 'picked_up_at',
      in_transit: 'in_transit_at',
      delivered: 'delivered_at',
    };
    const patch: Record<string, any> = { status: next };
    if (stamps[next]) patch[stamps[next]] = new Date().toISOString();

    const { error } = await supabase.from('deliveries').update(patch).eq('id', delivery.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    // Keep the donation's own tracking columns in sync.
    if (next === 'picked_up') {
      await supabase.from('donations').update({ tracking_status: 'picked_up', picked_up_at: new Date().toISOString() }).eq('id', delivery.donation_id);
    } else if (next === 'delivered') {
      await supabase.from('donations').update({ tracking_status: 'delivered', delivered_at: new Date().toISOString(), status: 'delivered' }).eq('id', delivery.donation_id);
    }
    fetchData();
  };

  const cancel = async (delivery: any) => {
    const { error } = await supabase.from('deliveries').update({ status: 'cancelled' }).eq('id', delivery.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    fetchData();
  };

  const active = deliveries.filter(d => d.status !== 'delivered' && d.status !== 'cancelled');
  const completed = deliveries.filter(d => d.status === 'delivered' || d.status === 'cancelled');

  const DeliveryCard = ({ d }: { d: any }) => (
    <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm text-emerald-800">{d.donations?.title || 'Donation'}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusClasses(d.status)}`}>
            {STATUS_LABEL[d.status] || d.status}
          </span>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-600" /> From: {d.pickup_location || 'Not set'}</p>
          <p className="flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-600" /> To: {d.destination_location || d.recipient_name || 'Not set'}</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Route className="h-2.5 w-2.5" /> ~{Number(d.distance_km)} km (est.)
          </Badge>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Clock className="h-2.5 w-2.5" /> ~{formatEta(d.eta_minutes)} (est.)
          </Badge>
        </div>

        {d.assigned_name && <p className="text-[11px] text-gray-500">Carried by {d.assigned_name}</p>}

        {d.status !== 'delivered' && d.status !== 'cancelled' && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => advance(d)}>
              Mark {STATUS_LABEL[STATUS_FLOW[STATUS_FLOW.indexOf(d.status) + 1]]}
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => cancel(d)}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DonationLayout>
      <SEO
        title="Deliveries — Rescue & Nourish"
        description="Track food pickups and deliveries across Bangalore with estimated distance and arrival times."
        path="/deliveries"
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-800 flex items-center gap-2">
              <Truck className="h-7 w-7" /> Deliveries
            </h1>
            <p className="text-sm text-emerald-600 mt-1">Pickup, destination, estimated distance and arrival time</p>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" /> New Delivery
          </Button>
        </div>

        {showAdd && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-emerald-800 text-lg">Create Delivery</CardTitle>
              <button type="button" aria-label="Close delivery form" onClick={() => setShowAdd(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={createDelivery} className="space-y-4">
                <div>
                  <Label>Donation</Label>
                  <Select value={form.donation_id} onValueChange={v => {
                    const don = donations.find(d => d.id === v);
                    setForm(p => ({ ...p, donation_id: v, pickup_location: don?.location || p.pickup_location }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select a donation" /></SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {donations.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <LocationSelect value={form.pickup_location} onChange={v => setForm(p => ({ ...p, pickup_location: v }))} label="Pickup Location" />
                <LocationSelect value={form.destination_location} onChange={v => setForm(p => ({ ...p, destination_location: v }))} label="Destination" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Recipient Name</Label><Input value={form.recipient_name} onChange={e => setForm(p => ({ ...p, recipient_name: e.target.value }))} placeholder="Orphanage or NGO" /></div>
                  <div><Label>Carried By</Label><Input value={form.assigned_name} onChange={e => setForm(p => ({ ...p, assigned_name: e.target.value }))} placeholder="Volunteer or NGO name" /></div>
                </div>

                {form.pickup_location && form.destination_location && (
                  <div className="rounded-lg border border-emerald-200 bg-white p-3 text-xs text-emerald-800">
                    <p className="font-semibold flex items-center gap-1"><Route className="h-3.5 w-3.5" /> Estimated route</p>
                    <p className="text-emerald-600 mt-1">
                      {estimate.label} · ~{estimate.distanceKm} km · ~{formatEta(estimate.etaMinutes)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Estimates based on city zones and average traffic speed.</p>
                  </div>
                )}

                <Button type="submit" disabled={!form.donation_id} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                  Create Delivery
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-bold text-emerald-800 mb-3">Active ({active.length})</h2>
          {active.length === 0 ? (
            <Card className="border-dashed border-emerald-300 bg-emerald-50/30">
              <CardContent className="p-6 text-center text-emerald-600 text-sm">No active deliveries right now.</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {active.map(d => <DeliveryCard key={d.id} d={d} />)}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <PackageCheck className="h-5 w-5" /> Completed ({completed.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completed.map(d => <DeliveryCard key={d.id} d={d} />)}
            </div>
          </div>
        )}
      </div>
    </DonationLayout>
  );
}
