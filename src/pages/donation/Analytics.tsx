import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, Users, TrendingUp, Heart, Truck, CheckCircle2 } from 'lucide-react';

const PIE_COLORS = ['#059669', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

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

    // Stats
    setStats({
      totalDonations: donations.length,
      totalOrphanages: orphanages.length,
      totalNeeds: needs.length,
      deliveredCount: donations.filter(d => d.tracking_status === 'delivered').length,
      pendingCount: donations.filter(d => d.tracking_status === 'pending').length,
      pickedUpCount: donations.filter(d => d.tracking_status === 'picked_up').length,
    });

    // Food type breakdown
    const foodTypes: Record<string, number> = {};
    donations.forEach(d => {
      const type = d.food_type || 'Other';
      foodTypes[type] = (foodTypes[type] || 0) + 1;
    });
    setFoodTypeData(Object.entries(foodTypes).map(([name, value]) => ({ name, value })));

    // Weekly donations (last 7 days)
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

    // Needs category breakdown
    const needsCats: Record<string, number> = {};
    needs.forEach(n => {
      needsCats[n.category] = (needsCats[n.category] || 0) + 1;
    });
    setNeedsCategoryData(Object.entries(needsCats).map(([name, value]) => ({ name, value })));
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekly Donations */}
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

          {/* Food Type Breakdown */}
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

          {/* Needs by Category */}
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
