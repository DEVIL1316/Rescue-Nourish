import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, Users, TrendingUp, Heart, Truck, CheckCircle2, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PIE_COLORS = ['#059669', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

interface Anomaly {
  id: string;
  type: 'spike' | 'duplicate' | 'unusual_time' | 'rapid_fire' | 'quality';
  severity: 'low' | 'medium' | 'high';
  message: string;
  details: string;
  timestamp: string;
}

function detectAnomalies(donations: any[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // 1. Detect duplicates (same donor + same title within 1 hour)
  const grouped: Record<string, any[]> = {};
  donations.forEach(d => {
    const key = `${d.donor_id}_${d.title?.toLowerCase().trim()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });
  Object.entries(grouped).forEach(([, items]) => {
    if (items.length > 1) {
      const sorted = items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      for (let i = 1; i < sorted.length; i++) {
        const diff = new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime();
        if (diff < 3600000) {
          anomalies.push({
            id: sorted[i].id,
            type: 'duplicate',
            severity: 'high',
            message: `Duplicate donation: "${sorted[i].title}"`,
            details: `Same donor submitted identical donation within ${Math.round(diff / 60000)} minutes`,
            timestamp: sorted[i].created_at,
          });
        }
      }
    }
  });

  // 2. Detect unusual hours (midnight to 5 AM)
  donations.forEach(d => {
    const hour = new Date(d.created_at).getHours();
    if (hour >= 0 && hour < 5) {
      anomalies.push({
        id: d.id,
        type: 'unusual_time',
        severity: 'low',
        message: `Off-hours donation: "${d.title}"`,
        details: `Created at ${new Date(d.created_at).toLocaleTimeString()} — unusual activity window`,
        timestamp: d.created_at,
      });
    }
  });

  // 3. Rapid-fire: same donor > 5 donations in a day
  const dailyByDonor: Record<string, Record<string, number>> = {};
  donations.forEach(d => {
    const day = new Date(d.created_at).toISOString().split('T')[0];
    if (!dailyByDonor[d.donor_id]) dailyByDonor[d.donor_id] = {};
    dailyByDonor[d.donor_id][day] = (dailyByDonor[d.donor_id][day] || 0) + 1;
  });
  Object.entries(dailyByDonor).forEach(([donorId, days]) => {
    Object.entries(days).forEach(([day, count]) => {
      if (count > 5) {
        anomalies.push({
          id: `rf_${donorId}_${day}`,
          type: 'rapid_fire',
          severity: 'medium',
          message: `Rapid-fire: ${count} donations in one day`,
          details: `Donor submitted ${count} donations on ${day} — possible spam or test data`,
          timestamp: `${day}T00:00:00Z`,
        });
      }
    });
  });

  // 4. Low quality ratings
  donations.forEach(d => {
    if (d.quality_rating !== null && d.quality_rating <= 2) {
      anomalies.push({
        id: d.id,
        type: 'quality',
        severity: d.quality_rating <= 1 ? 'high' : 'medium',
        message: `Low quality: "${d.title}" rated ${d.quality_rating}/5`,
        details: 'This donation has a very low quality rating and may need review',
        timestamp: d.created_at,
      });
    }
  });

  // 5. Daily spike detection (> 2x average)
  const dailyCounts: Record<string, number> = {};
  donations.forEach(d => {
    const day = new Date(d.created_at).toISOString().split('T')[0];
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const counts = Object.values(dailyCounts);
  if (counts.length > 2) {
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    Object.entries(dailyCounts).forEach(([day, count]) => {
      if (count > avg * 2 && count > 3) {
        anomalies.push({
          id: `spike_${day}`,
          type: 'spike',
          severity: 'medium',
          message: `Spike detected: ${count} donations on ${day}`,
          details: `Daily average is ${avg.toFixed(1)} — this day had ${((count / avg) * 100).toFixed(0)}% of average`,
          timestamp: `${day}T00:00:00Z`,
        });
      }
    });
  }

  return anomalies.sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    return sev[a.severity] - sev[b.severity];
  });
}

export default function Analytics() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalOrphanages: 0,
    totalNeeds: 0,
    deliveredCount: 0,
    pendingCount: 0,
    pickedUpCount: 0,
  });
  const [foodTypeData, setFoodTypeData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [needsCategoryData, setNeedsCategoryData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const [donRes, orphRes, needsRes] = await Promise.all([
      supabase.from('donations').select('*'),
      supabase.from('orphanages').select('id'),
      supabase.from('needs').select('*'),
    ]);

    const donations = donRes.data || [];
    const orphanages = orphRes.data || [];
    const needs = needsRes.data || [];

    setStats({
      totalDonations: donations.length,
      totalOrphanages: orphanages.length,
      totalNeeds: needs.length,
      deliveredCount: donations.filter(d => d.tracking_status === 'delivered').length,
      pendingCount: donations.filter(d => d.tracking_status === 'pending').length,
      pickedUpCount: donations.filter(d => d.tracking_status === 'picked_up').length,
    });

    const foodTypes: Record<string, number> = {};
    donations.forEach(d => {
      const type = d.food_type || 'Other';
      foodTypes[type] = (foodTypes[type] || 0) + 1;
    });
    setFoodTypeData(Object.entries(foodTypes).map(([name, value]) => ({ name, value })));

    const weekly: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en-US', { weekday: 'short' });
      weekly[key] = 0;
    }
    donations.forEach(d => {
      const date = new Date(d.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 6) {
        const key = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (weekly[key] !== undefined) weekly[key]++;
      }
    });
    setWeeklyData(Object.entries(weekly).map(([day, count]) => ({ day, count })));

    const needsCats: Record<string, number> = {};
    needs.forEach(n => {
      needsCats[n.category] = (needsCats[n.category] || 0) + 1;
    });
    setNeedsCategoryData(Object.entries(needsCats).map(([name, value]) => ({ name, value })));

    // Anomaly detection
    setAnomalies(detectAnomalies(donations));
  };

  const severityColor = (s: string) => {
    if (s === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const typeIcon = (t: string) => {
    if (t === 'duplicate') return <ShieldAlert className="h-4 w-4" />;
    if (t === 'spike') return <TrendingUp className="h-4 w-4" />;
    if (t === 'rapid_fire') return <Activity className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const statCards = [
    { label: 'Total Donations', value: stats.totalDonations, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Delivered', value: stats.deliveredCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'In Transit', value: stats.pickedUpCount, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: stats.pendingCount, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Orphanages', value: stats.totalOrphanages, icon: Heart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Open Needs', value: stats.totalNeeds, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-800">Analytics Dashboard</h1>
          <p className="text-sm text-emerald-600 mt-1">Overview of donations, needs, and impact</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(s => (
            <Card key={s.label} className="border-emerald-100">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`p-2 rounded-full ${s.bg} mb-2`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Anomaly Detection */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50/50 to-amber-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Anomaly Detection
              </CardTitle>
              <Badge variant="outline" className={anomalies.length > 0 ? 'border-red-300 text-red-600' : 'border-emerald-300 text-emerald-600'}>
                {anomalies.length} {anomalies.length === 1 ? 'anomaly' : 'anomalies'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {anomalies.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-700 font-semibold">All Clear!</p>
                <p className="text-sm text-gray-500">No anomalies detected in donation patterns</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {anomalies.map((a, i) => (
                  <div key={`${a.id}_${i}`} className={`flex items-start gap-3 p-3 rounded-lg border ${severityColor(a.severity)}`}>
                    <div className="mt-0.5">{typeIcon(a.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{a.message}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                          {a.severity}
                        </Badge>
                      </div>
                      <p className="text-xs mt-0.5 opacity-80">{a.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-base">Donations This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-base">Food Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {foodTypeData.length === 0 ? (
                <p className="text-center text-gray-400 py-12">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={foodTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {foodTypeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-100 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-base">Needs by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {needsCategoryData.length === 0 ? (
                <p className="text-center text-gray-400 py-12">No needs data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={needsCategoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={12} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DonationLayout>
  );
}