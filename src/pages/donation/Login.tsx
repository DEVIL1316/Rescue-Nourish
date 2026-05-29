import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRole, AppRole } from '@/hooks/useRole';
import { Heart, Users, HandHeart, Home, Shield, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';

const roles: { value: AppRole; label: string; icon: typeof Heart; description: string; color: string; bgColor: string }[] = [
  { value: 'donor', label: 'Donor', icon: Heart, description: 'I want to donate food, clothes, or supplies', color: 'text-emerald-800', bgColor: 'hover:border-emerald-300' },
  { value: 'ngo', label: 'NGO', icon: Users, description: 'I represent an NGO organization', color: 'text-orange-800', bgColor: 'hover:border-orange-300' },
  { value: 'orphanage_member', label: 'Orphanage Member', icon: Home, description: 'I am part of an orphanage', color: 'text-blue-800', bgColor: 'hover:border-blue-300' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Platform administrator with full control', color: 'text-red-800', bgColor: 'hover:border-red-300' },
];

export default function Login() {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showQR, setShowQR] = useState(false);
  const [selectedQRRole, setSelectedQRRole] = useState<AppRole>('donor');
  const [showQR, setShowQR] = useState(false);
  const [selectedQRRole, setSelectedQRRole] = useState<AppRole>('donor');
  const [qrNewSession, setQrNewSession] = useState(false);
    const sessionMode = searchParams.get('session');
    if (roleParam && roles.some(r => r.value === roleParam)) {
      setRole(roleParam, sessionMode === 'new' ? 'tab' : 'persistent');
      navigate('/', { replace: true });
    }
  }, [searchParams, setRole, navigate]);

  const handleSelect = (role: AppRole) => {
    setRole(role);
    navigate('/');
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-10 w-10 text-emerald-600 fill-emerald-600" />
            <HandHeart className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-4xl font-black text-emerald-800 tracking-tight">
            Rescue & Nourish
          </h1>
          <p className="text-emerald-600 mt-2 font-medium">
            Connecting donors, NGOs & orphanages
          </p>
        </div>

        <Card className="border-emerald-200 shadow-xl bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-emerald-800">
              {showQR ? 'Scan QR to Login' : 'Choose Your Role'}
            </CardTitle>
            <CardDescription>
              {showQR
                ? 'Scan from any device — works any time, never expires'
                : "Select how you'd like to use the platform"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showQR ? (
              <>
                {roles.map(r => (
                  <button
                    key={r.value}
                    onClick={() => handleSelect(r.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all border-gray-200 ${r.bgColor} hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3">
                      <r.icon className={`h-8 w-8 ${r.color}`} />
                      <div>
                        <p className={`font-bold ${r.color}`}>{r.label}</p>
                        <p className="text-sm text-gray-500">{r.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
                <Button
                  onClick={() => setShowQR(true)}
                  variant="outline"
                  className="w-full mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Login with QR Code
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {roles.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setSelectedQRRole(r.value)}
                      className={`p-2 rounded-lg border-2 text-center transition-all ${
                        selectedQRRole === r.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <r.icon className={`h-5 w-5 mx-auto ${r.color}`} />
                      <p className="text-xs mt-1 font-medium">{r.label}</p>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center bg-white p-6 rounded-xl border-2 border-emerald-100">
                  <QRCodeSVG
                    value={`${origin}/login?role=${selectedQRRole}`}
                    size={220}
                    level="H"
                    includeMargin
                    fgColor="#065f46"
                  />
                  <p className="text-xs text-gray-500 mt-3 text-center break-all">
                    {origin}/login?role={selectedQRRole}
                  </p>
                  <p className="text-sm text-emerald-700 mt-2 font-medium">
                    Scan to login as <span className="capitalize">{selectedQRRole.replace('_', ' ')}</span>
                  </p>
                </div>

                <Button
                  onClick={() => setShowQR(false)}
                  variant="ghost"
                  className="w-full text-emerald-700"
                >
                  ← Back to role selection
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
