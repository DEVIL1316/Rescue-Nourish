import { useNavigate } from 'react-router-dom';
import { useRole, AppRole } from '@/hooks/useRole';
import { Heart, Users, HandHeart, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const roles: { value: AppRole; label: string; icon: typeof Heart; description: string; color: string; borderColor: string; bgColor: string }[] = [
  { value: 'donor', label: 'Donor', icon: Heart, description: 'I want to donate food, clothes, or supplies', color: 'text-emerald-800', borderColor: 'border-emerald-500 bg-emerald-50', bgColor: 'hover:border-emerald-300' },
  { value: 'ngo', label: 'NGO', icon: Users, description: 'I represent an NGO organization', color: 'text-orange-800', borderColor: 'border-orange-500 bg-orange-50', bgColor: 'hover:border-orange-300' },
  { value: 'orphanage_member', label: 'Orphanage Member', icon: Home, description: 'I am part of an orphanage', color: 'text-blue-800', borderColor: 'border-blue-500 bg-blue-50', bgColor: 'hover:border-blue-300' },
];

export default function Login() {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleSelect = (role: AppRole) => {
    setRole(role);
    navigate('/');
  };

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
            <CardTitle className="text-2xl text-emerald-800">Choose Your Role</CardTitle>
            <CardDescription>Select how you'd like to use the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
