import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Star, MapPin, Phone, Mail, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function FoodDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [orphanages, setOrphanages] = useState<any[]>([]);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showAddOrphanage, setShowAddOrphanage] = useState(false);
  const [donationForm, setDonationForm] = useState({ title: '', description: '', food_type: '', quantity: '', quality_rating: 5 });
  const [orphanageForm, setOrphanageForm] = useState({ name: '', location: '', contact_phone: '', contact_email: '', description: '', needs_description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [donRes, orphRes] = await Promise.all([
      supabase.from('donations').select('*, profiles!donations_donor_id_fkey(full_name)').order('created_at', { ascending: false }),
      supabase.from('orphanages').select('*').order('created_at', { ascending: false }),
    ]);
    if (donRes.data) setDonations(donRes.data);
    if (orphRes.data) setOrphanages(orphRes.data);
  };

  const addDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('donations').insert({
      ...donationForm,
      quality_rating: donationForm.quality_rating,
      donor_id: user.id,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Donation added!' });
    setShowAddDonation(false);
    setDonationForm({ title: '', description: '', food_type: '', quantity: '', quality_rating: 5 });
    fetchData();
  };

  const addOrphanage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('orphanages').insert({ ...orphanageForm, created_by: user.id });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Orphanage added!' });
    setShowAddOrphanage(false);
    setOrphanageForm({ name: '', location: '', contact_phone: '', contact_email: '', description: '', needs_description: '' });
    fetchData();
  };

  return (
    <DonationLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-emerald-800">Food Donations & Orphanages</h1>
            <p className="text-emerald-600 mt-1">Browse donations, food quality, and orphanage details</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDonation(!showAddDonation)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1" /> Add Donation
            </Button>
            <Button onClick={() => setShowAddOrphanage(!showAddOrphanage)} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              <Plus className="h-4 w-4 mr-1" /> Add Orphanage
            </Button>
          </div>
        </div>

        {/* Add Donation Form */}
        {showAddDonation && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader><CardTitle className="text-emerald-800">New Donation</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addDonation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={donationForm.title} onChange={e => setDonationForm(p => ({ ...p, title: e.target.value }))} required /></div>
                <div><Label>Food Type</Label><Input value={donationForm.food_type} onChange={e => setDonationForm(p => ({ ...p, food_type: e.target.value }))} placeholder="e.g. Rice, Vegetables" /></div>
                <div><Label>Quantity</Label><Input value={donationForm.quantity} onChange={e => setDonationForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 50 kg" /></div>
                <div>
                  <Label>Quality (1-5)</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setDonationForm(p => ({ ...p, quality_rating: n }))}>
                        <Star className={`h-6 w-6 ${n <= donationForm.quality_rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={donationForm.description} onChange={e => setDonationForm(p => ({ ...p, description: e.target.value }))} /></div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 md:col-span-2">Submit Donation</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Orphanage Form */}
        {showAddOrphanage && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader><CardTitle className="text-orange-800">Add Orphanage</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addOrphanage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Name</Label><Input value={orphanageForm.name} onChange={e => setOrphanageForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div><Label>Location</Label><Input value={orphanageForm.location} onChange={e => setOrphanageForm(p => ({ ...p, location: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={orphanageForm.contact_phone} onChange={e => setOrphanageForm(p => ({ ...p, contact_phone: e.target.value }))} /></div>
                <div><Label>Email</Label><Input value={orphanageForm.contact_email} onChange={e => setOrphanageForm(p => ({ ...p, contact_email: e.target.value }))} /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={orphanageForm.description} onChange={e => setOrphanageForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="md:col-span-2"><Label>Needs</Label><Textarea value={orphanageForm.needs_description} onChange={e => setOrphanageForm(p => ({ ...p, needs_description: e.target.value }))} placeholder="What do they need?" /></div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 md:col-span-2">Add Orphanage</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Donations List */}
        <div>
          <h2 className="text-xl font-bold text-emerald-800 mb-4">Recent Donations</h2>
          {donations.length === 0 ? (
            <Card className="border-dashed border-emerald-300 bg-emerald-50/30"><CardContent className="p-8 text-center text-emerald-600">No donations yet. Be the first to donate!</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.map(d => (
                <Card key={d.id} className="border-emerald-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-emerald-800">{d.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${d.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {d.status}
                      </span>
                    </div>
                    {d.food_type && <p className="text-sm text-gray-600">🍽️ {d.food_type}</p>}
                    {d.quantity && <p className="text-sm text-gray-600">📦 {d.quantity}</p>}
                    {d.quality_rating && (
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`h-4 w-4 ${n <= d.quality_rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    )}
                    {d.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{d.description}</p>}
                    <p className="text-xs text-gray-400 mt-3">By {d.profiles?.full_name || 'Anonymous'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Orphanages List */}
        <div>
          <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" /> Orphanages
          </h2>
          {orphanages.length === 0 ? (
            <Card className="border-dashed border-orange-300 bg-orange-50/30"><CardContent className="p-8 text-center text-orange-600">No orphanages listed yet.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orphanages.map(o => (
                <Card key={o.id} className="border-orange-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-orange-800 text-lg">{o.name}</h3>
                    {o.location && <p className="text-sm text-gray-600 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {o.location}</p>}
                    {o.contact_phone && <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="h-3 w-3" /> {o.contact_phone}</p>}
                    {o.contact_email && <p className="text-sm text-gray-600 flex items-center gap-1"><Mail className="h-3 w-3" /> {o.contact_email}</p>}
                    {o.description && <p className="text-sm text-gray-500 mt-2">{o.description}</p>}
                    {o.needs_description && (
                      <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs font-semibold text-orange-700">Needs:</p>
                        <p className="text-sm text-orange-600">{o.needs_description}</p>
                      </div>
                    )}
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
