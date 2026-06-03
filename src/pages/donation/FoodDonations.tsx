import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { PhotoUpload } from '@/components/donation/PhotoUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, MapPin, Phone, Mail, Users, UserCheck, X, Brain, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LocationSelect } from '@/components/donation/LocationSelect';
import { computeMatches, MatchResult } from '@/lib/smartMatching';
import { SEO } from '@/components/SEO';

const SAMPLE_ORPHANAGES = [
  { id: 'sample-1', name: 'Sunshine Children\'s Home', location: 'Koramangala, Bangalore', contact_phone: '+91 80 2345 6789', contact_email: 'info@sunshinechildren.org', description: 'A loving home for abandoned and orphaned children providing education and care.', needs_description: 'School supplies, clothing, nutritious food', number_of_people: 85, created_by: 'system' },
  { id: 'sample-2', name: 'Hope Foundation Orphanage', location: 'Indiranagar, Bangalore', contact_phone: '+91 80 9876 5432', contact_email: 'contact@hopefoundation.in', description: 'Providing shelter, education, and vocational training to underprivileged children.', needs_description: 'Books, medicines, winter clothing', number_of_people: 120, created_by: 'system' },
  { id: 'sample-3', name: 'Little Angels Care Center', location: 'Jayanagar, Bangalore', contact_phone: '+91 80 4567 8901', contact_email: 'hello@littleangels.org', description: 'Dedicated to nurturing children with special needs and providing therapeutic support.', needs_description: 'Medical equipment, therapy materials, food supplies', number_of_people: 45, created_by: 'system' },
  { id: 'sample-4', name: 'Rainbow Kids Shelter', location: 'Whitefield, Bangalore', contact_phone: '+91 80 2233 4455', contact_email: 'admin@rainbowkids.org', description: 'Safe haven for street children offering rehabilitation and education programs.', needs_description: 'Beds, blankets, educational toys, hygiene kits', number_of_people: 67, created_by: 'system' },
  { id: 'sample-5', name: 'Blessing Home for Children', location: 'Banashankari, Bangalore', contact_phone: '+91 80 6677 8899', contact_email: 'care@blessinghome.in', description: 'A warm family environment for orphaned and abandoned children since 1998.', needs_description: 'Rice, dal, cooking oil, school uniforms', number_of_people: 92, created_by: 'system' },
];

export default function FoodDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [orphanages, setOrphanages] = useState<any[]>([]);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showAddOrphanage, setShowAddOrphanage] = useState(false);
  const [donationForm, setDonationForm] = useState({ title: '', description: '', food_type: '', quantity: '', quality_rating: 5, image_url: null as string | null, location: '' });
  const [orphanageForm, setOrphanageForm] = useState({ name: '', location: '', contact_phone: '', contact_email: '', description: '', needs_description: '', number_of_people: 0 });

  // Smart matching suggestions
  const suggestedMatches = useMemo(() => {
    if (!donationForm.food_type && !donationForm.title) return [];
    return computeMatches(
      { food_type: donationForm.food_type, title: donationForm.title, donor_location: donationForm.location },
      orphanages
    ).slice(0, 3);
  }, [donationForm.food_type, donationForm.title, donationForm.location, orphanages]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [donRes, orphRes] = await Promise.all([
      supabase.from('donations').select('*, profiles!donations_donor_id_fkey(full_name)').order('created_at', { ascending: false }),
      supabase.from('orphanages').select('*').order('created_at', { ascending: false }),
    ]);
    if (donRes.data) setDonations(donRes.data);
    if (orphRes.data && orphRes.data.length > 0) {
      setOrphanages(orphRes.data);
    } else {
      setOrphanages(SAMPLE_ORPHANAGES);
    }
  };

  const addDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('donations').insert({
      title: donationForm.title,
      description: donationForm.description,
      food_type: donationForm.food_type,
      quantity: donationForm.quantity,
      quality_rating: donationForm.quality_rating,
      image_url: donationForm.image_url,
      donor_id: user.id,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Donation added! 🎉' });
    setShowAddDonation(false);
    setDonationForm({ title: '', description: '', food_type: '', quantity: '', quality_rating: 5, image_url: null as string | null, location: '' });
    fetchData();
  };

  const addOrphanage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('orphanages').insert({ ...orphanageForm, number_of_people: orphanageForm.number_of_people || null, created_by: user.id });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Orphanage added!' });
    setShowAddOrphanage(false);
    setOrphanageForm({ name: '', location: '', contact_phone: '', contact_email: '', description: '', needs_description: '', number_of_people: 0 });
    fetchData();
  };

  return (
    <DonationLayout>
      <SEO
        title="Food Donations — Rescue & Nourish"
        description="Browse available food donations and orphanages in Bangalore. List your surplus food to feed children in need."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Food Donations",
          "description": "Collection of available food donations from donors across Bangalore.",
        }}
      />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-800">Food Donations</h1>
          <p className="text-sm text-emerald-600 mt-1">Browse donations & orphanage details</p>
        </div>

        {/* Action buttons - mobile stacked */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => { setShowAddDonation(!showAddDonation); setShowAddOrphanage(false); }} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> Add Donation
          </Button>
          <Button onClick={() => { setShowAddOrphanage(!showAddOrphanage); setShowAddDonation(false); }} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> Add Orphanage
          </Button>
        </div>

        {/* Add Donation Form */}
        {showAddDonation && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-emerald-800">New Donation</CardTitle>
              <button type="button" aria-label="Close new donation form" onClick={() => setShowAddDonation(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={addDonation} className="space-y-4">
                <div><Label>Title</Label><Input value={donationForm.title} onChange={e => setDonationForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Cooked rice and curry" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Food Type</Label><Input value={donationForm.food_type} onChange={e => setDonationForm(p => ({ ...p, food_type: e.target.value }))} placeholder="e.g. Rice" /></div>
                  <div><Label>Quantity</Label><Input value={donationForm.quantity} onChange={e => setDonationForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 50 kg" /></div>
                </div>
                <LocationSelect value={donationForm.location} onChange={v => setDonationForm(p => ({ ...p, location: v }))} label="Your Location" />
                <div>
                  <Label>Quality (1-5)</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" aria-label={`Rate quality ${n} of 5`} aria-pressed={n <= donationForm.quality_rating} onClick={() => setDonationForm(p => ({ ...p, quality_rating: n }))}>
                        <Star className={`h-7 w-7 ${n <= donationForm.quality_rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <PhotoUpload
                  value={donationForm.image_url}
                  onChange={url => setDonationForm(p => ({ ...p, image_url: url }))}
                />
                <div><Label>Description</Label><Textarea value={donationForm.description} onChange={e => setDonationForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>

                {/* Smart Match Suggestions */}
                {suggestedMatches.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-purple-800 flex items-center gap-1 mb-2">
                      <Brain className="h-3.5 w-3.5" /> Smart Match Suggestions
                    </p>
                    <div className="space-y-2">
                      {suggestedMatches.map(m => (
                        <div key={m.orphanage.id} className="flex items-center justify-between bg-white rounded p-2">
                          <div>
                            <p className="text-xs font-semibold text-emerald-800">{m.orphanage.name}</p>
                            <p className="text-[10px] text-gray-500">{m.orphanage.location}</p>
                          </div>
                          <Badge variant={m.score >= 75 ? 'default' : 'secondary'} className="text-[10px]">
                            <TrendingUp className="h-2.5 w-2.5 mr-0.5" />{m.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full text-base py-3">Submit Donation</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Orphanage Form */}
        {showAddOrphanage && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-orange-800">Add Orphanage</CardTitle>
              <button type="button" aria-label="Close add orphanage form" onClick={() => setShowAddOrphanage(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </CardHeader>
            <CardContent>
              <form onSubmit={addOrphanage} className="space-y-4">
                <div><Label>Name</Label><Input value={orphanageForm.name} onChange={e => setOrphanageForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <LocationSelect value={orphanageForm.location} onChange={v => setOrphanageForm(p => ({ ...p, location: v }))} />
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input value={orphanageForm.contact_phone} onChange={e => setOrphanageForm(p => ({ ...p, contact_phone: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input type="email" value={orphanageForm.contact_email} onChange={e => setOrphanageForm(p => ({ ...p, contact_email: e.target.value }))} /></div>
                </div>
                <div><Label>Number of People</Label><Input type="number" value={orphanageForm.number_of_people || ''} onChange={e => setOrphanageForm(p => ({ ...p, number_of_people: parseInt(e.target.value) || 0 }))} /></div>
                <div><Label>Description</Label><Textarea value={orphanageForm.description} onChange={e => setOrphanageForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
                <div><Label>Needs</Label><Textarea value={orphanageForm.needs_description} onChange={e => setOrphanageForm(p => ({ ...p, needs_description: e.target.value }))} placeholder="What do they need?" rows={2} /></div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 w-full text-base py-3">Add Orphanage</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Donations List */}
        <div>
          <h2 className="text-lg font-bold text-emerald-800 mb-3">Recent Donations</h2>
          {donations.length === 0 ? (
            <Card className="border-dashed border-emerald-300 bg-emerald-50/30"><CardContent className="p-6 text-center text-emerald-600">No donations yet. Be the first to donate!</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {donations.map(d => (
                <Card key={d.id} className="border-emerald-100 hover:shadow-lg transition-shadow overflow-hidden">
                  {d.image_url && (
                    <img src={d.image_url} alt={d.title} className="w-full h-40 object-cover" />
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-emerald-800 text-sm">{d.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {d.status}
                      </span>
                    </div>
                    {d.food_type && <p className="text-xs text-gray-600">🍽️ {d.food_type}</p>}
                    {d.quantity && <p className="text-xs text-gray-600">📦 {d.quantity}</p>}
                    {d.quality_rating && (
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= d.quality_rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    )}
                    {d.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{d.description}</p>}
                    <p className="text-xs text-gray-400 mt-2">By {d.profiles?.full_name || 'Anonymous'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Orphanages List */}
        <div>
          <h2 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" /> Orphanages
          </h2>
          {orphanages.length === 0 ? (
            <Card className="border-dashed border-orange-300 bg-orange-50/30"><CardContent className="p-6 text-center text-orange-600">No orphanages listed yet.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orphanages.map(o => (
                <Card key={o.id} className="border-orange-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-orange-800">{o.name}</h3>
                      {o.number_of_people && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> {o.number_of_people}
                        </span>
                      )}
                    </div>
                    {o.location && <p className="text-xs text-gray-600 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {o.location}</p>}
                    {o.contact_phone && <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="h-3 w-3" /> {o.contact_phone}</p>}
                    {o.contact_email && <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="h-3 w-3" /> {o.contact_email}</p>}
                    {o.description && <p className="text-xs text-gray-500 mt-2">{o.description}</p>}
                    {o.needs_description && (
                      <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs font-semibold text-orange-700">Needs:</p>
                        <p className="text-xs text-orange-600">{o.needs_description}</p>
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
