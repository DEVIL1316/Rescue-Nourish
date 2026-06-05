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
      style={{ ...bodyFont, background: '#f5f0e0' }}
    >
      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex -space-x-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0d7a5f] flex items-center justify-center shadow-lg -rotate-6">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#c9a84c] flex items-center justify-center shadow-lg rotate-6">
              <HandHeart className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 style={headingFont} className="text-4xl font-bold text-[#064e3b] mb-1 tracking-tight">
            Rescue & Nourish
          </h1>
          <p className="text-[#0d7a5f] italic text-sm font-medium">
            Connecting donors, NGOs &amp; orphanages
          </p>
        </div>

        {!showQR ? (
          <>
            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-5 w-full mb-12">
              {/* Donor — large */}
              <button
                onClick={() => handleSelect('donor')}
                className="col-span-12 md:col-span-8 group relative overflow-hidden p-8 rounded-[2rem] bg-white border border-[#0d7a5f]/10 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#0d7a5f]/5 flex items-center justify-center text-[#0d7a5f] mb-6 group-hover:bg-[#0d7a5f] group-hover:text-white transition-colors">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h3 style={headingFont} className="text-2xl font-bold text-[#064e3b] mb-2">
                      Donor
                    </h3>
                    <p className="text-[#0d7a5f] max-w-xs leading-relaxed">
                      I want to donate food, clothes, or essential supplies to those in need.
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#c9a84c] bg-[#c9a84c]/10 px-3 py-1 rounded-full whitespace-nowrap">
                    Give today
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#0d7a5f]/5 rounded-tl-full -mr-8 -mb-8 transition-transform group-hover:scale-110" />
              </button>

              {/* NGO — cream tinted */}
              <button
                onClick={() => handleSelect('ngo')}
                className="col-span-12 md:col-span-4 group p-8 rounded-[2rem] bg-[#fdfaf3] border border-[#c9a84c]/20 shadow-sm hover:border-[#c9a84c]/40 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] mb-6 group-hover:bg-[#c9a84c] group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <h3 style={headingFont} className="text-2xl font-bold text-[#064e3b] mb-2">
                  NGO
                </h3>
                <p className="text-[#0d7a5f]/80 text-sm leading-relaxed">
                  I represent an organization coordinating aid and distribution.
                </p>
              </button>

              {/* Orphanage — dark contrast */}
              <button
                onClick={() => handleSelect('orphanage_member')}
                className="col-span-12 md:col-span-6 group p-8 rounded-[2rem] bg-[#064e3b] shadow-xl hover:shadow-[#064e3b]/20 transition-all text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#0d7a5f] flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-[#064e3b] transition-colors">
                    <Home className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 style={headingFont} className="text-xl font-bold text-white mb-1">
                      Orphanage Member
                    </h3>
                    <p className="text-white/70 text-sm">
                      Manage your center's needs and track active incoming aid.
                    </p>
                  </div>
                </div>
              </button>

              {/* Admin — utility */}
              <button
                onClick={() => handleSelect('admin')}
                className="col-span-12 md:col-span-6 group p-8 rounded-[2rem] bg-white border border-[#0d7a5f]/10 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-[#064e3b]/5 group-hover:text-[#064e3b] transition-colors">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 style={headingFont} className="text-xl font-bold text-[#064e3b] mb-1">
                      Admin
                    </h3>
                    <p className="text-[#0d7a5f]/70 text-sm">
                      Full platform control and ecosystem oversight.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* QR Login CTA */}
            <button
              onClick={() => setShowQR(true)}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-dashed border-[#0d7a5f]/30 text-[#0d7a5f] font-semibold hover:border-[#0d7a5f] hover:bg-[#0d7a5f]/5 transition-all"
            >
              <QrCode className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Login with QR Code</span>
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
