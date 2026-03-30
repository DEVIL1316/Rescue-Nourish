import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, MapPin, Users, Utensils, TrendingUp, Zap } from 'lucide-react';
import { computeMatches, MatchResult } from '@/lib/smartMatching';

export default function SmartMatching() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [orphanages, setOrphanages] = useState<any[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<string>('');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [profileLocation, setProfileLocation] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [donRes, orphRes] = await Promise.all([
      supabase.from('donations').select('*').eq('status', 'available').order('created_at', { ascending: false }),
      supabase.from('orphanages').select('*'),
    ]);
    if (donRes.data) setDonations(donRes.data);
    if (orphRes.data) setOrphanages(orphRes.data);

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (profile && (profile as any).location) setProfileLocation((profile as any).location);
    }
  };

  useEffect(() => {
    if (selectedDonation && orphanages.length > 0) {
      const donation = donations.find(d => d.id === selectedDonation);
      if (donation) {
        const results = computeMatches(donation, orphanages, profileLocation);
        setMatches(results);
      }
    } else if (!selectedDonation && donations.length > 0 && orphanages.length > 0) {
      // Show all matches for latest donation by default
      const latest = donations[0];
      const results = computeMatches(latest, orphanages, profileLocation);
      setMatches(results);
      setSelectedDonation(latest.id);
    }
  }, [selectedDonation, donations, orphanages, profileLocation]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 55) return 'bg-amber-500';
    if (score >= 35) return 'bg-orange-500';
    return 'bg-red-400';
  };

  const getLabelVariant = (label: string) => {
    if (label === 'Excellent Match') return 'default';
    if (label === 'Good Match') return 'secondary';
    return 'outline';
  };

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-800 flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-600" /> Smart Matching
          </h1>
          <p className="text-sm text-emerald-600 mt-1">
            AI-powered matching of donations to orphanages by location, needs & capacity
          </p>
        </div>

        {/* Algorithm Info */}
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <MapPin className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <p className="text-xs font-bold text-purple-800">Location</p>
                <p className="text-[10px] text-purple-600">40% weight</p>
              </div>
              <div>
                <Utensils className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <p className="text-xs font-bold text-purple-800">Needs Match</p>
                <p className="text-[10px] text-purple-600">40% weight</p>
              </div>
              <div>
                <Users className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <p className="text-xs font-bold text-purple-800">Capacity</p>
                <p className="text-[10px] text-purple-600">20% weight</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Select Donation */}
        <div>
          <label className="text-sm font-bold text-emerald-800 mb-2 block">Select a Donation</label>
          <Select value={selectedDonation} onValueChange={setSelectedDonation}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a donation to match" />
            </SelectTrigger>
            <SelectContent>
              {donations.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title} {d.food_type ? `(${d.food_type})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Match Results */}
        {matches.length === 0 ? (
          <Card className="border-dashed border-emerald-300">
            <CardContent className="p-6 text-center text-emerald-600">
              {orphanages.length === 0
                ? 'No orphanages registered yet. Add orphanages to see matches.'
                : donations.length === 0
                ? 'No available donations. Create a donation first.'
                : 'Select a donation to see matching orphanages.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Ranked Matches
            </h2>
            {matches.map((m, i) => (
              <Card key={m.orphanage.id} className={`border-l-4 ${i === 0 ? 'border-l-emerald-500 shadow-lg' : 'border-l-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-emerald-800">#{i + 1}</span>
                        <h3 className="font-bold text-emerald-800">{m.orphanage.name}</h3>
                      </div>
                      <Badge variant={getLabelVariant(m.matchLabel) as any} className="mb-2">
                        {m.matchLabel}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white font-bold text-sm ${getScoreColor(m.score)}`}>
                        <TrendingUp className="h-3.5 w-3.5" />
                        {m.score}%
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-blue-50 rounded p-2 text-center">
                      <p className="text-[10px] text-blue-600 font-semibold">Location</p>
                      <p className="text-sm font-bold text-blue-800">{m.locationScore}%</p>
                    </div>
                    <div className="bg-green-50 rounded p-2 text-center">
                      <p className="text-[10px] text-green-600 font-semibold">Needs</p>
                      <p className="text-sm font-bold text-green-800">{m.needsScore}%</p>
                    </div>
                    <div className="bg-orange-50 rounded p-2 text-center">
                      <p className="text-[10px] text-orange-600 font-semibold">Capacity</p>
                      <p className="text-sm font-bold text-orange-800">{m.sizeScore}%</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-0.5">
                    {m.orphanage.location && (
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.orphanage.location}</p>
                    )}
                    {m.orphanage.number_of_people && (
                      <p className="flex items-center gap-1"><Users className="h-3 w-3" /> {m.orphanage.number_of_people} people</p>
                    )}
                    {m.orphanage.needs_description && (
                      <p className="flex items-center gap-1"><Utensils className="h-3 w-3" /> Needs: {m.orphanage.needs_description}</p>
                    )}
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
