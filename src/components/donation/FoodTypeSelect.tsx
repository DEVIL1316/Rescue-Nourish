import { FOOD_TYPES } from '@/lib/donationConstants';
import { Label } from '@/components/ui/label';

interface FoodTypeSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

/** Chip-style multi-select over the shared food-type vocabulary. */
export function FoodTypeSelect({ value, onChange, label = 'Required Food Types' }: FoodTypeSelectProps) {
  const toggle = (type: string) => {
    onChange(value.includes(type) ? value.filter(v => v !== type) : [...value, type]);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-1.5">
        {FOOD_TYPES.map(type => {
          const active = value.includes(type);
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(type)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'bg-emerald-600 text-emerald-50 border-emerald-600'
                  : 'bg-background text-muted-foreground border-border hover:border-emerald-400'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
