import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Package, Trash2, Search, UserCog, Building2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ConfirmDestructive } from '@/components/donation/ConfirmDestructive';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [orphanages, setOrphanages] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ users: 0, donations: 0, ngos: 0, orphanages: 0 });
  const [pendingRole, setPendingRole] = useState<
    { userId: string; role: string; name: string; previous: string } | null
  >(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleSelectKey, setRoleSelectKey] = useState(0);

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

    if (needsRes.data) {
      const enriched = needsRes.data.map((n: any) => {
        const profile = profilesRes.data?.find((p: any) => p.user_id === n.posted_by);
        return {
          ...n,
          poster_name: profile?.full_name || 'Unknown',
          poster_role: (Array.isArray(profile?.user_roles) ? profile?.user_roles?.[0]?.role : (profile?.user_roles as any)?.role) || profile?.role_type || 'unknown',
          poster_phone: profile?.phone || null,
        };
      });
      setRequests(enriched);
    }

    setStats({
      users: profilesRes.data?.length || 0,
      donations: donationsRes.data?.length || 0,
      ngos: ngosRes.data?.length || 0,
      orphanages: orphanagesRes.data?.length || 0,
    });
  };

  const confirmRoleChange = async () => {
    if (!pendingRole) return;
    setRoleSaving(true);
    const { error } = await supabase
      .from('user_roles')
      .update({ role: pendingRole.role as any })
      .eq('user_id', pendingRole.userId);
    setRoleSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setRoleSelectKey(k => k + 1);
      setPendingRole(null);
      return;
    }
    toast({ title: `Role updated to ${pendingRole.role}` });
    setPendingRole(null);
    fetchAll();
  };

  const cancelRoleChange = () => {
    setPendingRole(null);
    setRoleSelectKey(k => k + 1); // reset the select back to the stored role
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
                    key={`${u.user_id}-${roleSelectKey}`}
                    defaultValue={u.user_roles?.[0]?.role || u.role_type}
                    onValueChange={(val) => {
                      const previous = u.user_roles?.[0]?.role || u.role_type || 'unknown';
                      if (val === previous) return;
                      setPendingRole({
                        userId: u.user_id,
                        role: val,
                        name: u.full_name || 'this user',
                        previous,
                      });
                    }}
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
                  <ConfirmDestructive
                    title="Delete this donation?"
                    itemLabel={d.title}
                    description="The donation listing, its tracking history and any linked messages will no longer be visible to donors or NGOs. This cannot be undone."
                    onConfirm={() => deleteDonation(d.id)}
                    trigger={
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    }
                  />
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
                  <ConfirmDestructive
                    title="Delete this NGO?"
                    itemLabel={n.name}
                    requireTyping
                    description="Removing an NGO also removes it from the directory and from smart-matching suggestions. This cannot be undone."
                    onConfirm={() => deleteNgo(n.id)}
                    trigger={
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    }
                  />
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
            {requests.map(r => {
              const urgencyColor =
                r.urgency === 'high' ? 'bg-red-100 text-red-700' :
                r.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700';
              const roleColor =
                r.poster_role === 'ngo' ? 'bg-purple-100 text-purple-700' :
                r.poster_role === 'orphanage_member' ? 'bg-orange-100 text-orange-700' :
                r.poster_role === 'donor' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700';
              return (
                <Card key={r.id} className="border-gray-100">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-emerald-800">{r.title}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${urgencyColor}`}>
                            {r.urgency}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700 uppercase">
                            {r.status}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 uppercase">
                            {r.category}
                          </span>
                        </div>
                        {r.description && (
                          <p className="text-xs text-gray-700">{r.description}</p>
                        )}
                        {r.quantity && (
                          <p className="text-xs text-gray-500">Quantity: <span className="font-medium text-gray-700">{r.quantity}</span></p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">From:</span>
                          <span className="text-xs font-semibold text-emerald-800">{r.poster_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${roleColor}`}>
                            {r.poster_role}
                          </span>
                          {r.poster_phone && (
                            <span className="text-xs text-gray-500">• {r.poster_phone}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Posted: {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteRequest(r.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </DonationLayout>
  );
}
