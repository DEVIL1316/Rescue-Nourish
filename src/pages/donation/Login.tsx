import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, HandHeart, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    roleType: 'donor' as 'donor' | 'ngo',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(form.email, form.password, form.fullName, form.roleType);
        if (error) throw error;
        toast({ title: 'Account created!', description: 'Please check your email to verify your account.' });
      } else {
        const { error } = await signIn(form.email, form.password);
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Join our mission to help those in need' : 'Sign in to continue your mission'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="fullName" className="text-emerald-800">Full Name</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="Your full name"
                      required
                      className="border-emerald-200 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <Label className="text-emerald-800">I am a</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, roleType: 'donor' }))}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          form.roleType === 'donor'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                        }`}
                      >
                        <Heart className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-semibold">Donor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, roleType: 'ngo' }))}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          form.roleType === 'ngo'
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-gray-200 text-gray-600 hover:border-orange-300'
                        }`}
                      >
                        <Users className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-semibold">NGO</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email" className="text-emerald-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="border-emerald-200 focus:ring-emerald-500"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-emerald-800">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="border-emerald-200 focus:ring-emerald-500"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
