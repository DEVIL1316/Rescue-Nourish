/**
 * Loads the Google Maps JavaScript API once with the connector's
 * referrer-restricted browser key. Rendering only — all place data
 * comes from the maps-service edge function.
 */

const CALLBACK_NAME = '__initRescueNourishMap';

let loadPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
    const channel = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'];
    if (!key) {
      reject(new Error('Google Maps browser key is not configured'));
      return;
    }

    (window as any)[CALLBACK_NAME] = () => resolve((window as any).google?.maps);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${CALLBACK_NAME}&channel=${channel}&language=en&region=IN`;
    script.async = true;
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);

    setTimeout(() => {
      if (!(window as any).google?.maps) reject(new Error('Google Maps took too long to load'));
    }, 15000);
  });

  return loadPromise;
}
