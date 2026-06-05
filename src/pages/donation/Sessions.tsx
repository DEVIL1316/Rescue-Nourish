import { useNavigate } from 'react-router-dom';
import { Heart, Users, Home, Shield, ExternalLink, ArrowLeft, Plus, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole, AppRole } from '@/hooks/useRole';
import { buildQrLoginUrl } from '@/lib/qrLogin';

const headingFont = { fontFamily: "'Outfit', system-ui, sans-serif" };
const bodyFont = { fontFamily: "'Figtree', system-ui, sans-serif" };

type RoleDef = {
  value: AppRole;
  label: string;
  icon: typeof Heart;
  description: string;
  tone: 'donor' | 'ngo' | 'orphanage' | 'admin';
};

const roles: RoleDef[] = [
  { value: 'donor', label: 'Donor', icon: Heart, description: 'Give food, clothes & essentials', tone: 'donor' },
  { value: 'ngo', label: 'NGO', icon: Users, description: 'Coordinate aid & distribution', tone: 'ngo' },
  { value: 'orphanage_member', label: 'Orphanage', icon: Home, description: "Manage your center's needs", tone: 'orphanage' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Platform oversight & control', tone: 'admin' },
];

export default function Sessions() {
  const navigate = useNavigate();
  const { role } = useRole();

  const openInNewTab = (r: AppRole) => {
    const url = buildQrLoginUrl(r, true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const tileStyles: Record<RoleDef['tone'], string> = {
    donor:
      'col-span-12 md:col-span-8 bg-white border-[#0d7a5f]/10 hover:shadow-md',
    ngo:
      'col-span-12 md:col-span-4 bg-[#fdfaf3] border-[#c9a84c]/20 hover:border-[#c9a84c]/40',
    orphanage:
      'col-span-12 md:col-span-6 bg-[#064e3b] border-transparent hover:shadow-[#064e3b]/20 shadow-xl text-white',
    admin:
      'col-span-12 md:col-span-6 bg-white border-[#0d7a5f]/10 hover:shadow-md',
  };

  const iconBox: Record<RoleDef['tone'], string> = {
    donor: 'bg-[#0d7a5f]/5 text-[#0d7a5f] group-hover:bg-[#0d7a5f] group-hover:text-white',
    ngo: 'bg-[#c9a84c]/10 text-[#c9a84c] group-hover:bg-[#c9a84c] group-hover:text-white',
    orphanage: 'bg-[#0d7a5f] text-white group-hover:bg-white group-hover:text-[#064e3b]',
    admin: 'bg-gray-50 text-gray-400 group-hover:bg-[#064e3b]/5 group-hover:text-[#064e3b]',
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ ...bodyFont, background: '#f5f0e0' }}
    >
      <div className="max-w-4xl mx-auto pt-2">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-[#0d7a5f] hover:bg-[#0d7a5f]/5"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex -space-x-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0d7a5f] flex items-center justify-center shadow-lg -rotate-6">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#c9a84c] flex items-center justify-center shadow-lg rotate-6">
              <HandHeart className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 style={headingFont} className="text-3xl font-bold text-[#064e3b] mb-1 tracking-tight">
            Session Manager
          </h1>
          <p className="text-[#0d7a5f] italic text-sm font-medium max-w-md">
            Current session: <span className="not-italic font-semibold capitalize">{role?.replace('_', ' ') ?? 'none'}</span>. Open another role in a new tab to run sessions side by side.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-5">
          {roles.map(r => {
            const Icon = r.icon;
            const isOrphanage = r.tone === 'orphanage';
            return (
              <button
                key={r.value}
                onClick={() => openInNewTab(r.value)}
                className={`group relative overflow-hidden p-8 rounded-[2rem] border shadow-sm transition-all text-left ${tileStyles[r.tone]}`}
              >
                <div className="flex justify-between items-start relative z-10 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${iconBox[r.tone]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3
                      style={headingFont}
                      className={`text-2xl font-bold mb-2 ${isOrphanage ? 'text-white' : 'text-[#064e3b]'}`}
                    >
                      {r.label}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isOrphanage ? 'text-white/70' : 'text-[#0d7a5f]/80'
                      }`}
                    >
                      {r.description}
                    </p>
                  </div>
                  <ExternalLink
                    className={`h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      isOrphanage ? 'text-white/60' : 'text-[#0d7a5f]/40'
                    }`}
                  />
                </div>
                {r.tone === 'donor' && (
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#0d7a5f]/5 rounded-tl-full -mr-8 -mb-8 transition-transform group-hover:scale-110" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tip */}
        <div className="mt-6 p-4 rounded-2xl bg-white border border-[#0d7a5f]/10 text-sm text-[#064e3b] text-center">
          <span className="font-semibold">Tip:</span>{' '}
          <span className="text-[#0d7a5f]">
            Each new tab runs as its own independent session. Closing the tab ends that session without affecting the others.
          </span>
        </div>
      </div>
    </div>
  );
}
