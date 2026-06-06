import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useLanguage, LANGUAGES, Language } from '@/contexts/LanguageContext';
import { Heart, Utensils, Stethoscope, MessageCircle, Building2, LogOut, HandHeart, UserCog, BarChart3, Truck, Bell, Eye, Shield, Brain, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DonationLayout({ children }: { children: ReactNode }) {
  const { role, clearRole } = useRole();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: t('nav.food'), icon: Utensils },
    { path: '/tracking', label: t('nav.tracking'), icon: Truck },
    { path: '/needs', label: t('nav.needs'), icon: Stethoscope },
    { path: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { path: '/ngos', label: t('nav.ngos'), icon: Building2 },
    { path: '/watchlist', label: t('nav.watchlist'), icon: Eye },
    { path: '/smart-matching', label: t('nav.smart'), icon: Brain },
    { path: '/notifications', label: t('nav.notifications'), icon: Bell },
    { path: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { path: '/profile', label: t('nav.profile'), icon: UserCog },
  ];
  const adminNavItem = { path: '/admin', label: t('nav.admin'), icon: Shield };
  const adminHiddenPaths = ['/', '/needs', '/ngos', '/watchlist', '/smart-matching'];
  const allNavItems =
    role === 'admin'
      ? [...navItems.filter(item => !adminHiddenPaths.includes(item.path)), adminNavItem]
      : role === 'donor'
        ? navItems.filter(item => item.path !== '/analytics')
        : role === 'orphanage_member'
          ? navItems.filter(item => !['/watchlist', '/analytics', '/smart-matching'].includes(item.path))
          : navItems;

  const handleLeave = () => {
    clearRole();
    navigate('/welcome');
  };

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const LanguageMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50 px-2">
          <Languages className="h-4 w-4" />
          <span className="ml-1 hidden md:inline">{currentLang.native}</span>
          <span className="ml-1 md:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        {LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={language === lang.code ? 'bg-emerald-50 font-semibold' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.native}
            <span className="ml-2 text-xs text-gray-400">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 pb-20 sm:pb-0">
      {/* Desktop header */}
      <header className="hidden sm:block bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-emerald-600 fill-emerald-600" />
            <HandHeart className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-black text-emerald-800 tracking-tight">
              {t('app.title')}
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
            <LanguageMenu />
            <span className="text-xs font-semibold text-emerald-600 capitalize">
              {role?.replace('_', ' ')}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLeave} className="text-red-500 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span className="ml-1">{t('action.switchRole')}</span>
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
        <div className="flex items-center gap-1">
          <LanguageMenu />
          <Button variant="ghost" size="sm" onClick={handleLeave} className="text-red-500 hover:bg-red-50 px-2">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
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
