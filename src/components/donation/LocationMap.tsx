import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/googleMaps';
import { MapPin } from 'lucide-react';

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  /** Determines the marker colour; defaults to the theme emerald. */
  color?: string;
}

const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 };

export function LocationMap({ markers, height = 320 }: { markers: MapMarker[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: BANGALORE_CENTER,
          zoom: 11,
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
        });
        setReady(true);
      })
      .catch((e) => !cancelled && setError(e?.message || 'Map could not load'));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = (window as any).google.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new maps.LatLngBounds();
    markers.forEach((mk) => {
      const marker = new maps.Marker({
        position: { lat: mk.lat, lng: mk.lng },
        map: mapRef.current,
        title: mk.title,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: mk.color || '#059669',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      const info = new maps.InfoWindow({
        content: `<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#065f46">${mk.title}</div>`,
      });
      marker.addListener('click', () => info.open({ anchor: marker, map: mapRef.current }));
      markersRef.current.push(marker);
      bounds.extend({ lat: mk.lat, lng: mk.lng });
    });

    if (markers.length === 1) {
      mapRef.current.setCenter(markers[0]);
      mapRef.current.setZoom(14);
    } else if (markers.length > 1) {
      mapRef.current.fitBounds(bounds, 48);
    }
  }, [ready, markers]);

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 text-center"
        style={{ height }}
      >
        <MapPin className="h-8 w-8 text-emerald-300 mb-2" />
        <p className="text-sm text-emerald-600">{error}</p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full rounded-lg" style={{ height }} aria-label="Map" />;
}
