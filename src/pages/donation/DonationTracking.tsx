import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DonationLayout } from '@/components/donation/DonationLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-100' },
  { key: 'picked_up', label: 'Picked Up', icon: Truck, color: 'text-blue-600 bg-blue-100' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' },
];

function getStepIndex(status: string) {
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function DonationTracking() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => { fetchDonations(); }, []);

  const fetchDonations = async () => {
    const { data } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setDonations(data);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { tracking_status: newStatus };
    if (newStatus === 'picked_up') updates.picked_up_at = new Date().toISOString();
    if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();

    const { error } = await supabase.from('donations').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Create notification for donor
    const donation = donations.find(d => d.id === id);
    if (donation && user) {
      await supabase.from('notifications').insert({
        user_id: donation.donor_id,
        title: `Donation ${newStatus === 'picked_up' ? 'Picked Up' : 'Delivered'}`,
        message: `Your donation "${donation.title}" has been ${newStatus === 'picked_up' ? 'picked up' : 'delivered'}!`,
        type: 'tracking',
        related_id: id,
      });
    }

    toast({ title: `Status updated to ${newStatus.replace('_', ' ')}!` });
    fetchDonations();
  };

  return (
    <DonationLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-800">Donation Tracking</h1>
          <p className="text-sm text-emerald-600 mt-1">Track status of all donations in real-time</p>
        </div>

        {donations.length === 0 ? (
          <Card className="border-dashed border-emerald-300">
            <CardContent className="p-8 text-center text-emerald-600">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              No donations to track yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {donations.map(d => {
              const currentStep = getStepIndex(d.tracking_status);
              const isOwner = user?.id === d.donor_id;

              return (
                <Card key={d.id} className="border-emerald-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-bold text-emerald-800">{d.title}</h3>
                        <p className="text-xs text-gray-500">
                          {d.food_type && `🍽️ ${d.food_type}`} {d.quantity && `• 📦 ${d.quantity}`}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusSteps[currentStep].color}`}>
                        {statusSteps[currentStep].label}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-1 mb-4">
                      {statusSteps.map((step, i) => {
                        const StepIcon = step.icon;
                        const isActive = i <= currentStep;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className={`flex flex-col items-center flex-1 ${isActive ? '' : 'opacity-30'}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? step.color : 'bg-gray-100 text-gray-400'}`}>
                                <StepIcon className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] mt-1 font-medium text-gray-600">{step.label}</span>
                              {i === 1 && d.picked_up_at && (
                                <span className="text-[9px] text-gray-400">{new Date(d.picked_up_at).toLocaleDateString()}</span>
                              )}
                              {i === 2 && d.delivered_at && (
                                <span className="text-[9px] text-gray-400">{new Date(d.delivered_at).toLocaleDateString()}</span>
                              )}
                            </div>
                            {i < statusSteps.length - 1 && (
                              <div className={`h-0.5 flex-1 mx-1 ${i < currentStep ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    {isOwner && currentStep < 2 && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(d.id, statusSteps[currentStep + 1].key)}
                        className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                      >
                        Mark as {statusSteps[currentStep + 1].label}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
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
