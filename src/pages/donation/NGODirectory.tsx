import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, MapPin, Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LocationSelect } from '@/components/donation/LocationSelect';
import { useNavigate } from 'react-router-dom';

export default function NGODirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ngos, setNgos] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', contact_email: '', contact_phone: '', location: '', website: '' });

  useEffect(() => { fetchNGOs(); }, []);

  const fetchNGOs = async () => {
    const { data } = await supabase.from('ngos').select('*, profiles!ngos_user_id_fkey(full_name)').order('created_at', { ascending: false });
    if (data) setNgos(data);
  };

  const addNGO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('ngos').insert({ ...form, user_id: user.id });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'NGO registered!' });
    setShowAdd(false);
    setForm({ name: '', description: '', contact_email: '', contact_phone: '', location: '', website: '' });
    fetchNGOs();
  };

  const contactNGO = (ngoUserId: string) => {
    navigate('/donate/chat');
  };

  return (
    <DonationLayout>
      <SEO
        title="NGO Directory — Rescue & Nourish"
        description="Find and contact verified NGOs working with orphanages across Bangalore. Coordinate pickups and deliveries directly."
        path="/ngos"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "NGO Directory",
          "description": "Directory of NGOs registered on Rescue & Nourish.",
        }}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-emerald-800">NGO Directory</h1>
            <p className="text-emerald-600 mt-1">Find and connect with NGOs directly</p>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" /> Register NGO
          </Button>
        </div>

        {showAdd && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader><h2 className="text-2xl font-semibold leading-none tracking-tight text-emerald-800">Register Your NGO</h2></CardHeader>
            <CardContent>
              <form onSubmit={addNGO} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>NGO Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <LocationSelect value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} />
                <div><Label>Email</Label><Input value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} type="email" /></div>
                <div><Label>Phone</Label><Input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} /></div>
                <div><Label>Website</Label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://" /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 md:col-span-2">Register NGO</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {ngos.length === 0 ? (
          <Card className="border-dashed border-emerald-300 bg-emerald-50/30"><CardContent className="p-8 text-center text-emerald-600">No NGOs registered yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ngos.map(n => (
              <Card key={n.id} className="border-emerald-100 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-emerald-800">{n.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">By {n.profiles?.full_name || 'Anonymous'}</p>
                      {n.location && <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3" /> {n.location}</p>}
                      {n.contact_phone && <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="h-3 w-3" /> {n.contact_phone}</p>}
                      {n.contact_email && <p className="text-sm text-gray-600 flex items-center gap-1"><Mail className="h-3 w-3" /> {n.contact_email}</p>}
                      {n.website && <p className="text-sm text-emerald-600 flex items-center gap-1"><Globe className="h-3 w-3" /> <a href={n.website} target="_blank" rel="noreferrer" className="hover:underline">{n.website}</a></p>}
                      {n.description && <p className="text-sm text-gray-500 mt-3">{n.description}</p>}
                      <Button
                        size="sm"
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => contactNGO(n.user_id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" /> Contact NGO
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DonationLayout>
  );
}
