import type { AppRole } from '@/hooks/useRole';

const PUBLISHED_QR_BASE_URL = 'https://zombie-web-survival.lovable.app';
const PREVIEW_CONTEXT_KEY = 'lovable:qr-preview-context';

type PreviewContext = {
  origin: string;
  token?: string;
  sha?: string;
};

function isPreviewHost(hostname: string) {
  return hostname.includes('preview') && hostname.endsWith('.lovable.app');
}

function readPreviewContextFromSearch(search: string): PreviewContext | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(search);
  const token = params.get('__lovable_token') ?? undefined;
  const sha = params.get('__lovable_sha') ?? undefined;

  if (!token && !sha) return null;

  return {
    origin: window.location.origin,
    token,
    sha,
  };
}

function readStoredPreviewContext(): PreviewContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PREVIEW_CONTEXT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PreviewContext;
    return parsed.origin ? parsed : null;
  } catch {
    return null;
  }
}

function storePreviewContext(context: PreviewContext | null) {
  if (typeof window === 'undefined' || !context) return;

  try {
    window.sessionStorage.setItem(PREVIEW_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // Ignore storage issues.
  }
}

export function getQrLoginBaseUrl() {
  if (typeof window === 'undefined') return PUBLISHED_QR_BASE_URL;

  if (!isPreviewHost(window.location.hostname)) {
    return window.location.origin;
  }

  const livePreviewContext = readPreviewContextFromSearch(window.location.search);

  if (livePreviewContext) {
    storePreviewContext(livePreviewContext);
    return livePreviewContext.origin;
  }

  const storedPreviewContext = readStoredPreviewContext();

  if (storedPreviewContext?.origin) {
    return storedPreviewContext.origin;
  }

  return PUBLISHED_QR_BASE_URL;
}

export function buildQrLoginUrl(role: AppRole, newSession = false) {
  const url = new URL('/welcome', getQrLoginBaseUrl());
  url.searchParams.set('role', role);

  if (newSession) {
    url.searchParams.set('session', 'new');
  }

  const livePreviewContext = typeof window !== 'undefined'
    ? readPreviewContextFromSearch(window.location.search)
    : null;

  if (livePreviewContext) {
    storePreviewContext(livePreviewContext);
  }

  const previewContext = livePreviewContext ?? readStoredPreviewContext();

  if (previewContext?.token) {
    url.searchParams.set('__lovable_token', previewContext.token);
  }

  if (previewContext?.sha) {
    url.searchParams.set('__lovable_sha', previewContext.sha);
  }

  return url.toString();
}