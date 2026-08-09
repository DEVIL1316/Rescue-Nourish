import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtTime = (t: string) => {
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${((hr + 11) % 12) + 1}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
};

interface Booking {
  id: string;
  booked_by: string;
  booker_name: string | null;
  slot_date: string;
  slot_time: string;
  notes: string | null;
  status: string;
}

export function BookingSlots({ donationId, donorId }: { donationId: string; donorId?: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('donation_bookings')
      .select('*')
      .eq('donation_id', donationId)
      .order('slot_date')
      .order('slot_time');
    setBookings((data as Booking[]) || []);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, donationId]);

  const takenForDate = new Set(
    bookings.filter(b => b.slot_date === date && b.status !== 'cancelled').map(b => b.slot_time.slice(0, 5)),
  );

  const book = async () => {
    if (!user) { toast({ title: 'Please sign in to book a slot', variant: 'destructive' }); return; }
    if (!time) { toast({ title: 'Pick a time slot first', variant: 'destructive' }); return; }
    setSaving(true);
    const { error } = await supabase.from('donation_bookings').insert({
      donation_id: donationId,
      booked_by: user.id,
      booker_name: user.user_metadata?.full_name || user.email || null,
      slot_date: date,
      slot_time: time,
      notes: notes.trim().slice(0, 300) || null,
    });
    setSaving(false);
    if (error) {
      toast({
        title: 'Could not book',
        description: error.code === '23505' ? 'That slot is already taken.' : error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Slot booked 📅', description: `${date} at ${fmtTime(time)}` });
    setTime('');
    setNotes('');
    load();
  };

  const cancel = async (id: string) => {
    const { error } = await supabase.from('donation_bookings').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Booking cancelled' });
    load();
  };

  const canManage = (b: Booking) => user && (b.booked_by === user.id || donorId === user.id);

  return (
    <div className="mt-3 border-t border-emerald-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
      >
        <CalendarClock className="h-3.5 w-3.5" />
        {open ? 'Hide pickup slots' : 'Book a pickup slot'}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              min={todayStr()}
              value={date}
              onChange={e => { setDate(e.target.value); setTime(''); }}
              className="h-9 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Time slot</Label>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {TIME_SLOTS.map(t => {
                const taken = takenForDate.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={taken}
                    aria-pressed={time === t}
                    onClick={() => setTime(t)}
                    className={`rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors ${
                      taken
                        ? 'border-muted bg-muted text-muted-foreground line-through cursor-not-allowed'
                        : time === t
                          ? 'border-emerald-600 bg-emerald-600 text-primary-foreground'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {fmtTime(t)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs">Note (optional)</Label>
            <Input
              value={notes}
              maxLength={300}
              onChange={e => setNotes(e.target.value)}
              placeholder="Vehicle, contact person…"
              className="h-9 text-sm"
            />
          </div>

          <Button onClick={book} disabled={saving} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm booking'}
          </Button>

          {bookings.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-emerald-800">Booked slots</p>
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1.5">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-emerald-800 truncate">
                      {b.slot_date} · {fmtTime(b.slot_time.slice(0, 5))}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {b.booker_name || 'Someone'}{b.notes ? ` — ${b.notes}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="secondary" className="text-[10px]">{b.status}</Badge>
                    {canManage(b) && (
                      <button type="button" aria-label="Cancel booking" onClick={() => cancel(b.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
