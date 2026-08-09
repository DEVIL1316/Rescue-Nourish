import { useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDestructiveProps {
  trigger: ReactNode;
  title: string;
  /** Name of the record being removed; shown to the user for verification. */
  itemLabel?: string;
  description?: string;
  /** When true, the user must type DELETE before the action is enabled. */
  requireTyping?: boolean;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}

const CONFIRM_WORD = 'DELETE';

export function ConfirmDestructive({
  trigger,
  title,
  itemLabel,
  description,
  requireTyping = false,
  confirmLabel = 'Delete permanently',
  onConfirm,
}: ConfirmDestructiveProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  const blocked = requireTyping && typed.trim().toUpperCase() !== CONFIRM_WORD;

  const handleOpenChange = (next: boolean) => {
    if (busy) return;
    setOpen(next);
    if (!next) setTyped('');
  };

  const handleConfirm = async () => {
    if (blocked) return;
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
      setTyped('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {itemLabel && (
              <span className="block font-semibold text-foreground mb-1">“{itemLabel}”</span>
            )}
            {description ?? 'This action cannot be undone and the record will be removed for everyone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireTyping && (
          <div className="space-y-2">
            <Label htmlFor="confirm-delete-input" className="text-xs">
              Type <span className="font-mono font-bold">{CONFIRM_WORD}</span> to confirm
            </Label>
            <Input
              id="confirm-delete-input"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={CONFIRM_WORD}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={blocked || busy}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
