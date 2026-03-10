import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

export const BANGALORE_LOCATIONS = [
  'Koramangala, Bangalore',
  'Indiranagar, Bangalore',
  'Whitefield, Bangalore',
  'Electronic City, Bangalore',
  'Jayanagar, Bangalore',
  'JP Nagar, Bangalore',
  'HSR Layout, Bangalore',
  'BTM Layout, Bangalore',
  'Marathahalli, Bangalore',
  'Hebbal, Bangalore',
  'Rajajinagar, Bangalore',
  'Malleswaram, Bangalore',
  'Banashankari, Bangalore',
  'Yelahanka, Bangalore',
  'MG Road, Bangalore',
  'Brigade Road, Bangalore',
  'Basavanagudi, Bangalore',
  'Vijayanagar, Bangalore',
  'Peenya, Bangalore',
  'KR Puram, Bangalore',
];

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function LocationSelect({ value, onChange, label = 'Location' }: LocationSelectProps) {
  return (
    <div>
      <Label className="flex items-center gap-1">
        <MapPin className="h-3 w-3" /> {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select a location in Bangalore" />
        </SelectTrigger>
        <SelectContent>
          {BANGALORE_LOCATIONS.map(loc => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
