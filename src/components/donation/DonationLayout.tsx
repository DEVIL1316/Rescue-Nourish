import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Utensils, Stethoscope, MessageCircle, Building2, LogOut, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Food & Donations', icon: Utensils },
  { path: '/needs', label: 'Medical & Needs', icon: Stethoscope },
  { path: '/chat', label: 'Donors & Chat', icon: MessageCircle },
  { path: '/ngos', label: 'NGOs', icon: Building2 },
];

export function DonationLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      {/* Top Nav */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-emerald-600 fill-emerald-600" />
            <HandHeart className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-black text-emerald-800 tracking-tight hidden sm:inline">
              Rescue & Nourish
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={active ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden md:inline ml-1">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Button variant="ghost" size="sm" onClick={signOut} className="text-red-500 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Logout</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
