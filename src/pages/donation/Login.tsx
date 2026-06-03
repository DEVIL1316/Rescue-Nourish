import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRole, AppRole } from '@/hooks/useRole';
import { Heart, Users, HandHeart, Home, Shield, QrCode, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { buildQrLoginUrl } from '@/lib/qrLogin';

type RoleDef = {
  value: AppRole;
  label: string;
  icon: typeof Heart;
  description: string;
};

const roles: RoleDef[] = [
  { value: 'donor', label: 'Donor', icon: Heart, description: 'I want to donate food, clothes, or essential supplies' },
  { value: 'ngo', label: 'NGO', icon: Users, description: 'I represent an organization' },
  { value: 'orphanage_member', label: 'Orphanage Member', icon: Home, description: "Manage your center's needs" },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Full platform control' },
];

const headingFont = { fontFamily: "'Outfit', system-ui, sans-serif" };
const bodyFont = { fontFamily: "'Figtree', system-ui, sans-serif" };

export default function Login() {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showQR, setShowQR] = useState(false);
  const [selectedQRRole, setSelectedQRRole] = useState<AppRole>('donor');
  const [qrNewSession, setQrNewSession] = useState(false);
  const qrLoginUrl = buildQrLoginUrl(selectedQRRole, qrNewSession);

  useEffect(() => {
    const roleParam = searchParams.get('role') as AppRole | null;
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        ...bodyFont,
        background:
          'radial-gradient(ellipse at top right, #ecfdf5 0%, #ffffff 45%, rgba(254,243,199,0.4) 100%)',
      }}
    >
      <div className="max-w-3xl w-full flex flex-col items-center">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 rotate-3">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100 -rotate-6 -ml-3">
              <HandHeart className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 style={headingFont} className="text-4xl font-bold text-emerald-950 tracking-tight">
            Rescue & Nourish
          </h1>
          <p className="text-emerald-700/70 mt-2 font-medium italic">
            Connecting donors, NGOs &amp; orphanages
          </p>
        </div>

        {!showQR ? (
          <>
            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 w-full mb-8">
              {/* Donor — large */}
              <button
                onClick={() => handleSelect('donor')}
                className="md:col-span-4 group relative overflow-hidden p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 style={headingFont} className="text-xl font-bold text-emerald-950">
                        Donor
                      </h3>
                      <p className="text-emerald-700/70 mt-1">
                        I want to donate food, clothes, or essential supplies
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-50/60 rounded-full group-hover:scale-110 transition-transform duration-500" />
              </button>

              {/* NGO — amber accent */}
              <button
                onClick={() => handleSelect('ngo')}
                className="md:col-span-2 group relative overflow-hidden p-8 rounded-3xl bg-amber-50 border border-amber-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 text-left"
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="w-12 h-12 bg-amber-200/60 rounded-xl flex items-center justify-center text-amber-700 mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 style={headingFont} className="text-xl font-bold text-amber-950">
                      NGO
                    </h3>
                    <p className="text-amber-800/70 mt-1 text-sm">I represent an organization</p>
                  </div>
                </div>
              </button>

              {/* Orphanage — dark feature */}
              <button
                onClick={() => handleSelect('orphanage_member')}
                className="md:col-span-3 group relative overflow-hidden p-8 rounded-3xl bg-emerald-950 border border-emerald-900 shadow-lg hover:shadow-emerald-900/30 transition-all duration-300 text-left text-white"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 shrink-0 bg-emerald-800 rounded-2xl flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
                    <Home className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 style={headingFont} className="text-xl font-bold">
                      Orphanage Member
                    </h3>
                    <p className="text-emerald-200/70 mt-0.5 text-sm">
                      Manage your center's needs
                    </p>
                  </div>
                </div>
              </button>

              {/* Admin */}
              <button
                onClick={() => handleSelect('admin')}
                className="md:col-span-3 group relative overflow-hidden p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 style={headingFont} className="text-xl font-bold text-emerald-950">
                      Admin
                    </h3>
                    <p className="text-emerald-700/70 mt-0.5 text-sm">Full platform control</p>
                  </div>
                </div>
              </button>
            </div>

            {/* QR Login CTA */}
            <button
              onClick={() => setShowQR(true)}
              className="w-full max-w-sm group flex items-center justify-center gap-3 py-4 px-8 bg-white border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer"
            >
              <QrCode className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Login with QR Code</span>
            </button>
          </>
        ) : (
          <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 style={headingFont} className="text-2xl font-bold text-emerald-950">
                Scan QR to Login
              </h2>
              <p className="text-emerald-700/70 mt-1 text-sm">
                Scan from any device — works any time, never expires
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {roles.map(r => {
                const Icon = r.icon;
                const active = selectedQRRole === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setSelectedQRRole(r.value)}
                    className={`p-2 rounded-xl border-2 text-center transition-all ${
                      active
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto ${active ? 'text-emerald-600' : 'text-gray-500'}`} />
                    <p className="text-[11px] mt-1 font-medium text-emerald-900">{r.label}</p>
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={qrNewSession}
                onChange={e => setQrNewSession(e.target.checked)}
                className="accent-emerald-600"
              />
              Open as a new independent session
            </label>

            <div className="flex flex-col items-center bg-white p-5 rounded-2xl border-2 border-emerald-100">
              <QRCodeSVG
                key={qrLoginUrl}
                value={qrLoginUrl}
                size={220}
                level="H"
                marginSize={4}
                fgColor="#065f46"
              />
              <p className="text-xs text-gray-500 mt-3 text-center break-all">{qrLoginUrl}</p>
              <p className="text-sm text-emerald-700 mt-2 font-medium">
                Scan to login as{' '}
                <span className="capitalize">{selectedQRRole.replace('_', ' ')}</span>
                {qrNewSession && ' (new session)'}
              </p>
            </div>

            <Button
              onClick={() => setShowQR(false)}
              variant="ghost"
              className="w-full mt-4 text-emerald-700 hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to role selection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
