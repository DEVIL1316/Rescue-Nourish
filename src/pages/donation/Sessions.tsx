import { useNavigate } from 'react-router-dom';
import { Heart, Users, Home, Shield, ExternalLink, ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRole, AppRole } from '@/hooks/useRole';
import { buildQrLoginUrl } from '@/lib/qrLogin';

const roles: { value: AppRole; label: string; icon: typeof Heart; color: string }[] = [
  { value: 'donor', label: 'Donor', icon: Heart, color: 'text-emerald-700' },
  { value: 'ngo', label: 'NGO', icon: Users, color: 'text-orange-700' },
  { value: 'orphanage_member', label: 'Orphanage', icon: Home, color: 'text-blue-700' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-red-700' },
];

export default function Sessions() {
  const navigate = useNavigate();
  const { role } = useRole();

  const openInNewTab = (r: AppRole) => {
    const url = buildQrLoginUrl(r, true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-orange-50 to-amber-50 p-4">
      <div className="max-w-2xl mx-auto pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <Card className="border-emerald-200 shadow-xl bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-800 flex items-center gap-2">
              <Plus className="h-6 w-6" /> Session Manager
            </CardTitle>
            <CardDescription>
              Your current session ({role ?? 'none'}) stays active in this tab.
              Open another role in a new tab to run two sessions at once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map(r => (
              <button
                key={r.value}
                onClick={() => openInNewTab(r.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <r.icon className={`h-7 w-7 ${r.color}`} />
                  <div className="text-left">
                    <p className={`font-bold ${r.color}`}>{r.label}</p>
                    <p className="text-xs text-gray-500">Open new tab as {r.label}</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </button>
            ))}

            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              Tip: Each new tab runs as its own independent session. Closing the
              tab ends that session without affecting the others.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
