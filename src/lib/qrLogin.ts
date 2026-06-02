import type { AppRole } from '@/hooks/useRole';

const PUBLISHED_APP_URL = 'https://zombie-web-survival.lovable.app';

function isPreviewHost(hostname: string) {
  return hostname.includes('id-preview--') || hostname.includes('lovable.app');
}

export function getQrLoginBaseUrl() {
  if (typeof window === 'undefined') return PUBLISHED_APP_URL;

  const { origin, hostname } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return origin;
  }

  if (isPreviewHost(hostname) && PUBLISHED_APP_URL) {
    return PUBLISHED_APP_URL;
  }

  return origin;
}

export function buildQrLoginUrl(role: AppRole, newSession = false) {
  const url = new URL('/welcome', getQrLoginBaseUrl());
  url.searchParams.set('role', role);

  if (newSession) {
    url.searchParams.set('session', 'new');
  }

  return url.toString();
}