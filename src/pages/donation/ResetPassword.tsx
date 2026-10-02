import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const headingFont = { fontFamily: "'Outfit', system-ui, sans-serif" };

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Recovery links arrive with type=recovery in the URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async () => {
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      const weak = /weak|easy to guess/i.test(error.message);
      toast({
        title: 'Could not update password',
        description: weak ? 'That password is too easy to guess. Try a longer one with numbers and symbols.' : error.message,
        variant: 'destructive',
      });
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/welcome'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3e8] p-4">
      <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-xl p-8">
        {done ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
            <h2 style={headingFont} className="text-2xl font-bold text-emerald-950">Password updated</h2>
            <p className="text-emerald-700/70 mt-2 text-sm">Taking you back to sign in…</p>
          </div>
        ) : ready ? (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Lock className="w-6 h-6" />
              </div>
              <h2 style={headingFont} className="text-2xl font-bold text-emerald-950">Set a new password</h2>
              <p className="text-emerald-700/70 mt-1 text-sm">Choose a strong password you don't use elsewhere.</p>
            </div>
            <div className="space-y-4">
              <Input type="password" placeholder="New password (min 6 characters)" autoFocus
                value={password} onChange={e => setPassword(e.target.value)} />
              <Input type="password" placeholder="Repeat new password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()} />
              <Button onClick={submit} disabled={busy || !password} className="w-full bg-emerald-700 hover:bg-emerald-800">
                {busy ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <h2 style={headingFont} className="text-xl font-bold text-emerald-950">Invalid or expired link</h2>
            <p className="text-emerald-700/70 mt-2 text-sm">Request a new password reset from the sign-in screen.</p>
            <Button onClick={() => navigate('/welcome')} variant="outline" className="mt-4 border-emerald-200 text-emerald-700">
              Back to sign in
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
