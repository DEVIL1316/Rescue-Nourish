import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { Heart, Utensils, Stethoscope, MessageCircle, Building2, LogOut, HandHeart, UserCog, BarChart3, Truck, Bell, Eye, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Food & Donations', icon: Utensils },
  { path: '/tracking', label: 'Tracking', icon: Truck },
  { path: '/needs', label: 'Medical & Needs', icon: Stethoscope },
  { path: '/chat', label: 'Donors & Chat', icon: MessageCircle },
  { path: '/ngos', label: 'NGOs', icon: Building2 },
  { path: '/watchlist', label: 'Watchlist', icon: Eye },
  { path: '/smart-matching', label: 'Smart Match', icon: Brain },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: UserCog },
];

const adminNavItem = { path: '/admin', label: 'Admin', icon: Shield };

export function DonationLayout({ children }: { children: ReactNode }) {
  const { role, clearRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const allNavItems = role === 'admin' ? [...navItems, adminNavItem] : navItems;

  const handleLeave = () => {
    clearRole();
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 pb-20 sm:pb-0">
      {/* Desktop header */}
      <header className="hidden sm:block bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-emerald-600 fill-emerald-600" />
            <HandHeart className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-black text-emerald-800 tracking-tight">
              Rescue & Nourish
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {allNavItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={active ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="ml-1">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600 capitalize">
              {role?.replace('_', ' ')}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLeave} className="text-red-500 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span className="ml-1">Switch Role</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sm:hidden bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-emerald-600 fill-emerald-600" />
          <span className="text-lg font-black text-emerald-800">R&N</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLeave} className="text-red-500 hover:bg-red-50 px-2">
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 z-50 safe-area-pb">
        <div className="flex justify-around py-2">
          {allNavItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5">
                <item.icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className={`text-[10px] ${active ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
