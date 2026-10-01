import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const headingFont = { fontFamily: "'Outfit', system-ui, sans-serif" };

type Props = {
  role: AppRole;
  onBack: () => void;
  onVerified: (role: AppRole) => void;
};

function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  return '+91' + digits.replace(/^0+/, '');
}

export function PhoneOtpLogin({ role, onBack, onVerified }: Props) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [busy, setBusy] = useState(false);
  const fullPhone = normalizePhone(phone);
  const valid = /^\+\d{10,15}$/.test(fullPhone);

  const sendOtp = async () => {
    if (!valid) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      options: { data: { role_type: role } },
    });
    setBusy(false);
    if (error) {
      const notSetUp = /phone provider/i.test(error.message) || (error as any).code === 'phone_provider_disabled';
      toast({
        title: 'Could not send OTP',
        description: notSetUp
          ? 'SMS sending is not set up yet. Please ask the app owner to enable phone login.'
          : error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'OTP sent', description: `A 6-digit code was sent to ${fullPhone}` });
    setStep('otp');
  };

  const verify = async () => {
    if (otp.length < 6) return;
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: 'sms' });
    if (error || !data.user) {
      setBusy(false);
      toast({ title: 'Wrong or expired code', description: error?.message, variant: 'destructive' });
      return;
    }
    const { data: roleRow } = await supabase
      .from('user_roles').select('role').eq('user_id', data.user.id).limit(1).maybeSingle();
    setBusy(false);
    const dbRole = (roleRow?.role as AppRole) || role;
    if (dbRole !== role) {
      toast({ title: 'Signed in', description: `This number is registered as ${dbRole.replace('_', ' ')}.` });
    }
    onVerified(dbRole);
  };

  return (
    <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-xl p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
          {step === 'phone' ? <Phone className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
        </div>
        <h2 style={headingFont} className="text-2xl font-bold text-emerald-950">
          {step === 'phone' ? 'Login with mobile' : 'Enter OTP'}
        </h2>
        <p className="text-emerald-700/70 mt-1 text-sm">
          Continuing as <span className="font-semibold capitalize">{role.replace('_', ' ')}</span>
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="flex items-center px-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-mono">+91</span>
            <Input
              type="tel" inputMode="numeric" autoFocus placeholder="98765 43210"
              value={phone} onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendOtp()}
            />
          </div>
          <Button onClick={sendOtp} disabled={!valid || busy} className="w-full bg-emerald-700 hover:bg-emerald-800">
            {busy ? 'Sending…' : 'Send OTP'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            inputMode="numeric" autoFocus maxLength={6} placeholder="6-digit code"
            className="text-center tracking-[0.5em] font-mono text-lg"
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && verify()}
          />
          <Button onClick={verify} disabled={otp.length < 6 || busy} className="w-full bg-emerald-700 hover:bg-emerald-800">
            {busy ? 'Verifying…' : 'Verify & continue'}
          </Button>
          <button onClick={() => { setOtp(''); sendOtp(); }} disabled={busy}
            className="w-full text-sm text-emerald-700 underline">
            Resend code to {fullPhone}
          </button>
        </div>
      )}

      <Button onClick={step === 'otp' ? () => setStep('phone') : onBack} variant="ghost"
        className="w-full mt-4 text-emerald-700 hover:bg-emerald-50">
        <ArrowLeft className="h-4 w-4 mr-1" /> {step === 'otp' ? 'Change number' : 'Back to role selection'}
      </Button>
    </div>
  );
}
