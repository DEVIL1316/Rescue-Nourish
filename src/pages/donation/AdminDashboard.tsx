import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Package, Trash2, Search, UserCog, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [orphanages, setOrphanages] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ users: 0, donations: 0, ngos: 0, orphanages: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [profilesRes, donationsRes, ngosRes, orphanagesRes, needsRes] = await Promise.all([
      supabase.from('profiles').select('*, user_roles(role)'),
      supabase.from('donations').select('*').order('created_at', { ascending: false }),
      supabase.from('ngos').select('*').order('created_at', { ascending: false }),
      supabase.from('orphanages').select('*').order('created_at', { ascending: false }),
      supabase.from('needs').select('*').order('created_at', { ascending: false }),
    ]);

    if (profilesRes.data) setUsers(profilesRes.data);
    if (donationsRes.data) setDonations(donationsRes.data);
    if (ngosRes.data) setNgos(ngosRes.data);
    if (orphanagesRes.data) setOrphanages(orphanagesRes.data);
    if (needsRes.data) setRequests(needsRes.data);

    setStats({
      users: profilesRes.data?.length || 0,
      donations: donationsRes.data?.length || 0,
      ngos: ngosRes.data?.length || 0,
      orphanages: orphanagesRes.data?.length || 0,
    });
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole as any })
      .eq('user_id', userId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: `Role updated to ${newRole}` });
    fetchAll();
  };

  const deleteDonation = async (id: string) => {
    const { error } = await supabase.from('donations').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Donation deleted' });
    fetchAll();
  };

  const deleteNgo = async (id: string) => {
    const { error } = await supabase.from('ngos').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'NGO deleted' });
    fetchAll();
  };

  const deleteOrphanage = async (id: string) => {
    const { error } = await supabase.from('orphanages').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Orphanage deleted' });
    fetchAll();
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase.from('needs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Request deleted' });
    fetchAll();
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-800">Admin Dashboard</h1>
            <p className="text-sm text-emerald-600 mt-1">Full platform management</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Users', value: stats.users, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Donations', value: stats.donations, icon: Package, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'NGOs', value: stats.ngos, icon: Building2, color: 'text-purple-600 bg-purple-50' },
            { label: 'Orphanages', value: stats.orphanages, icon: Users, color: 'text-orange-600 bg-orange-50' },
          ].map(s => (
            <Card key={s.label} className="border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="bg-emerald-50 w-full sm:w-auto">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="ngos">NGOs</TabsTrigger>
            <TabsTrigger value="orphanages">Orphanages</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredUsers.map(u => (
              <Card key={u.id} className="border-gray-100">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-800">{u.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500">
                      Role: {u.user_roles?.[0]?.role || u.role_type || 'unknown'}
                    </p>
                  </div>
                  <Select
                    defaultValue={u.user_roles?.[0]?.role || u.role_type}
                    onValueChange={(val) => updateUserRole(u.user_id, val)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="donations" className="space-y-3">
            {donations.map(d => (
              <Card key={d.id} className="border-gray-100">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-800">{d.title}</p>
                    <p className="text-xs text-gray-500">
                      {d.food_type && `${d.food_type} • `}{d.status} • {d.tracking_status}
                    </p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteDonation(d.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ngos" className="space-y-3">
            {ngos.map(n => (
              <Card key={n.id} className="border-gray-100">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-800">{n.name}</p>
                    <p className="text-xs text-gray-500">{n.location || 'No location'}</p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteNgo(n.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="orphanages" className="space-y-3">
            {orphanages.map(o => (
              <Card key={o.id} className="border-gray-100">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-800">{o.name}</p>
                    <p className="text-xs text-gray-500">{o.location || 'No location'} • {o.number_of_people || 0} people</p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteOrphanage(o.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3">
            {requests.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">No requests yet.</p>
            )}
            {requests.map(r => (
              <Card key={r.id} className="border-gray-100">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-800">{r.title}</p>
                    <p className="text-xs text-gray-500">
                      {r.category} • {r.urgency} • {r.status}{r.quantity ? ` • ${r.quantity}` : ''}
                    </p>
                    {r.description && (
                      <p className="text-xs text-gray-600 mt-1">{r.description}</p>
                    )}
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => deleteRequest(r.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DonationLayout>
  );
}
