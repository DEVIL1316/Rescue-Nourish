import type { AppRole } from '@/hooks/useRole';

export function getQrLoginBaseUrl() {
  if (typeof window === 'undefined') return 'https://zombie-web-survival.lovable.app';
  return window.location.origin;
}

export function buildQrLoginUrl(role: AppRole, newSession = false) {
  const url = new URL('/welcome', getQrLoginBaseUrl());
  url.searchParams.set('role', role);

  if (newSession) {
    url.searchParams.set('session', 'new');
  }

  if (typeof window !== 'undefined') {
    const currentParams = new URLSearchParams(window.location.search);
    const previewToken = currentParams.get('__lovable_token');
    const previewSha = currentParams.get('__lovable_sha');

    if (previewToken) {
      url.searchParams.set('__lovable_token', previewToken);
    }

    if (previewSha) {
      url.searchParams.set('__lovable_sha', previewSha);
    }
  }

  return url.toString();
}