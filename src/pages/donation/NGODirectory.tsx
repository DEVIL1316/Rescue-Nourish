import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Plus, Building2, MapPin, Phone, Mail, Globe, MessageCircle, CalendarDays, CheckCircle2, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LocationSelect } from '@/components/donation/LocationSelect';
import { useNavigate } from 'react-router-dom';

export default function NGODirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ngos, setNgos] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', contact_email: '', contact_phone: '', location: '', website: '' });
  const [selectedNgo, setSelectedNgo] = useState<any | null>(null);
  const [relatedNeeds, setRelatedNeeds] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const contactNGO = (_ngoUserId: string) => {
    navigate('/chat');
  };

  const openDetails = async (ngo: any) => {
    setSelectedNgo(ngo);
    setLoadingDetails(true);
    setRelatedNeeds([]);
    const { data } = await supabase
      .from('needs')
      .select('*')
      .eq('posted_by', ngo.user_id)
      .order('created_at', { ascending: false })
      .limit(8);
    setRelatedNeeds(data || []);
    setLoadingDetails(false);
  };

  const urgencyColor = (u: string) =>
    u === 'high' ? 'bg-red-100 text-red-700' : u === 'low' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

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
                      {n.description && <p className="text-sm text-gray-500 mt-3 line-clamp-2">{n.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => openDetails(n)}>
                          <Info className="h-4 w-4 mr-1" /> View Details
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => contactNGO(n.user_id)}>
                          <MessageCircle className="h-4 w-4 mr-1" /> Contact NGO
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!selectedNgo} onOpenChange={(open) => !open && setSelectedNgo(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedNgo && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-emerald-800">{selectedNgo.name}</SheetTitle>
                    <SheetDescription>
                      By {selectedNgo.profiles?.full_name || 'Anonymous'}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Registered {new Date(selectedNgo.created_at).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-emerald-800">Contact Information</h4>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 space-y-2 text-sm">
                    {selectedNgo.location && <p className="flex items-center gap-2 text-gray-700"><MapPin className="h-4 w-4 text-emerald-600" /> {selectedNgo.location}</p>}
                    {selectedNgo.contact_phone && <p className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4 text-emerald-600" /> {selectedNgo.contact_phone}</p>}
                    {selectedNgo.contact_email && <p className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4 text-emerald-600" /> {selectedNgo.contact_email}</p>}
                    {selectedNgo.website && (
                      <p className="flex items-center gap-2 text-emerald-700">
                        <Globe className="h-4 w-4" />
                        <a href={selectedNgo.website} target="_blank" rel="noreferrer" className="hover:underline truncate">{selectedNgo.website}</a>
                      </p>
                    )}
                    {!selectedNgo.location && !selectedNgo.contact_phone && !selectedNgo.contact_email && !selectedNgo.website && (
                      <p className="text-gray-500 italic">No contact details provided.</p>
                    )}
                  </div>
                </div>

                {selectedNgo.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-emerald-800">About</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedNgo.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-emerald-800">Recent Related Requests</h4>
                    {!loadingDetails && <span className="text-xs text-gray-500">{relatedNeeds.length} total</span>}
                  </div>
                  {loadingDetails ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                  ) : relatedNeeds.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-emerald-200 p-4 text-center text-sm text-emerald-600">
                      No requests posted by this NGO yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {relatedNeeds.map(req => (
                        <div key={req.id} className="rounded-lg border border-emerald-100 p-3 bg-white">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm text-emerald-800">{req.title}</p>
                            <Badge className={`text-[10px] ${urgencyColor(req.urgency)} hover:opacity-100`}>{req.urgency}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">{req.category}</Badge>
                            <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-600">{req.status}</Badge>
                          </div>
                          {req.description && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{req.description}</p>}
                          <p className="text-[10px] text-gray-400 mt-2">{new Date(req.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => contactNGO(selectedNgo.user_id)}>
                  <MessageCircle className="h-4 w-4 mr-1" /> Contact NGO
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DonationLayout>
  );
}
