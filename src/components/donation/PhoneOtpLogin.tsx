import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Lock, UserRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const headingFont = { fontFamily: "'Outfit', system-ui, sans-serif" };

type Props = {
  role: AppRole;
  onBack: () => void;
  onVerified: (role: AppRole) => void;
};

type Mode = 'signin' | 'signup';

export function PhoneOtpLogin({ role, onBack, onVerified }: Props) {
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 6;
  const valid = emailValid && passwordValid && (mode === 'signin' || fullName.trim().length > 0);

  const finish = async (userId: string) => {
    const { data: roleRow } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).limit(1).maybeSingle();
    const dbRole = (roleRow?.role as AppRole) || role;
    if (dbRole !== role) {
      toast({ title: 'Signed in', description: `This account is registered as ${dbRole.replace('_', ' ')}.` });
    }
    onVerified(dbRole);
  };

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { role_type: role, full_name: fullName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast({
            title: 'Check your email',
            description: 'We sent a confirmation link. Confirm it, then come back and sign in.',
          });
          setMode('signin');
          return;
        }
        if (data.user) await finish(data.user.id);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) await finish(data.user.id);
      }
    } catch (error: any) {
      const msg = /invalid login credentials/i.test(error?.message)
        ? 'Wrong email or password. New here? Switch to "Create account" below.'
        : error?.message || 'Something went wrong. Please try again.';
      toast({ title: mode === 'signup' ? 'Could not create account' : 'Could not sign in', description: msg, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-xl p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
          <Mail className="w-6 h-6" />
        </div>
        <h2 style={headingFont} className="text-2xl font-bold text-emerald-950">
          {mode === 'signin' ? 'Sign in with email' : 'Create your account'}
        </h2>
        <p className="text-emerald-700/70 mt-1 text-sm">
          Continuing as <span className="font-semibold capitalize">{role.replace('_', ' ')}</span>
        </p>
      </div>

      <div className="space-y-4">
        {mode === 'signup' && (
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50" />
            <Input
              autoFocus placeholder="Full name" className="pl-9"
              value={fullName} onChange={e => setFullName(e.target.value)}
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50" />
          <Input
            type="email" inputMode="email" autoFocus={mode === 'signin'} placeholder="you@example.com" className="pl-9"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50" />
          <Input
            type="password" placeholder={mode === 'signup' ? 'Password (min 6 characters)' : 'Password'} className="pl-9"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <Button onClick={submit} disabled={!valid || busy} className="w-full bg-emerald-700 hover:bg-emerald-800">
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-emerald-100" />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600/60">OR</span>
          <div className="h-px flex-1 bg-emerald-100" />
        </div>

        <Button
          variant="outline"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </Button>
      </div>

      <Button onClick={onBack} variant="ghost" className="w-full mt-4 text-emerald-700 hover:bg-emerald-50">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to role selection
      </Button>
    </div>
  );
}
