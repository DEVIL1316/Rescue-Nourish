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
import { Plus, Stethoscope, Shirt, AlertTriangle, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const categories = [
  { value: 'medical', label: 'Medical', icon: Stethoscope, color: 'text-red-600' },
  { value: 'clothing', label: 'Clothing', icon: Shirt, color: 'text-blue-600' },
  { value: 'education', label: 'Education', icon: Package, color: 'text-purple-600' },
  { value: 'other', label: 'Other', icon: Package, color: 'text-gray-600' },
];

const urgencyColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

export default function MedicalNeeds() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'medical', description: '', quantity: '', urgency: 'medium' });
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNeeds(); }, []);

  const fetchNeeds = async () => {
    const { data } = await supabase.from('needs').select('*, profiles!needs_posted_by_fkey(full_name)').order('created_at', { ascending: false });
    if (data) setNeeds(data);
  };

  const addNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('needs').insert({ ...form, posted_by: user.id });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Need posted!' });
    setShowAdd(false);
    setForm({ title: '', category: 'medical', description: '', quantity: '', urgency: 'medium' });
    fetchNeeds();
  };

  const filtered = filter === 'all' ? needs : needs.filter(n => n.category === filter);

  return (
    <DonationLayout>
      <SEO
        title="Medical & Supply Needs — Rescue & Nourish"
        description="Orphanage needs across Bangalore: medical supplies, clothing, education, and more. Help by donating what's most urgent."
        path="/needs"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-emerald-800">Medical & Requirements</h1>
            <p className="text-emerald-600 mt-1">Medical supplies, clothing, and other needs</p>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" /> Post Need
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-emerald-600' : ''}
          >
            All
          </Button>
          {categories.map(c => (
            <Button
              key={c.value}
              size="sm"
              variant={filter === c.value ? 'default' : 'outline'}
              onClick={() => setFilter(c.value)}
              className={filter === c.value ? 'bg-emerald-600' : ''}
            >
              <c.icon className="h-4 w-4 mr-1" /> {c.label}
            </Button>
          ))}
        </div>

        {/* Add Form */}
        {showAdd && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader><CardTitle asChild><h2 className="text-2xl font-semibold leading-none tracking-tight text-emerald-800">Post a New Need</h2></CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addNeed} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full mt-1 border border-emerald-200 rounded-md p-2 text-sm"
                  >
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div><Label>Quantity</Label><Input value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 100 units" /></div>
                <div>
                  <Label>Urgency</Label>
                  <select
                    value={form.urgency}
                    onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))}
                    className="w-full mt-1 border border-emerald-200 rounded-md p-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 md:col-span-2">Post Need</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Needs List */}
        {filtered.length === 0 ? (
          <Card className="border-dashed border-emerald-300 bg-emerald-50/30"><CardContent className="p-8 text-center text-emerald-600">No needs posted yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(n => {
              const cat = categories.find(c => c.value === n.category) || categories[3];
              const CatIcon = cat.icon;
              return (
                <Card key={n.id} className="border-emerald-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <CatIcon className={`h-5 w-5 ${cat.color}`} />
                        <h3 className="font-bold text-gray-800">{n.title}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${urgencyColors[n.urgency] || urgencyColors.medium}`}>
                        {n.urgency === 'high' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                        {n.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{cat.label} • {n.quantity || 'Qty not specified'}</p>
                    {n.description && <p className="text-sm text-gray-600 line-clamp-3">{n.description}</p>}
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-gray-400">By {n.profiles?.full_name || 'Anonymous'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${n.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{n.status}</span>
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
