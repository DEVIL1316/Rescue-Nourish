import { useState } from 'react';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '@/hooks/useRole';
import { LocationSelect } from '@/components/donation/LocationSelect';
import { User, Phone, Mail, MapPin, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const { role } = useRole();

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved
      ? JSON.parse(saved)
      : { full_name: '', phone: '', email: '', location: '', bio: '' };
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    localStorage.setItem('user_profile', JSON.stringify(form));
    toast({ title: 'Profile saved!' });
  };

  return (
    <DonationLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-emerald-800">Profile & Settings</h1>
          <p className="text-emerald-600 mt-1">Manage your personal details</p>
        </div>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <User className="h-5 w-5" /> Your Information
            </CardTitle>
            <CardDescription>
              Current role: <span className="font-semibold capitalize text-emerald-700">{role?.replace('_', ' ')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    <User className="h-3 w-3" /> Full Name
                  </Label>
                  <Input
                    value={form.full_name}
                    onChange={e => setForm((p: any) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone Number
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm((p: any) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    maxLength={255}
                  />
                </div>
                <LocationSelect
                  value={form.location}
                  onChange={v => setForm((p: any) => ({ ...p, location: v }))}
                />
                  />
                </div>
              </div>
              <div>
                <Label>About / Bio</Label>
                <Textarea
                  value={form.bio}
                  onChange={e => setForm((p: any) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us a bit about yourself..."
                  maxLength={500}
                  rows={3}
                />
              </div>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full">
                <Save className="h-4 w-4 mr-1" /> Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DonationLayout>
  );
}
