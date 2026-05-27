import { useState, useEffect } from 'react';

export type AppRole = 'donor' | 'ngo' | 'orphanage_member' | 'admin';

// Prefer per-tab sessionStorage so multiple tabs can run as different roles.
// Fall back to localStorage so existing single-tab logins keep working.
function readRole(): AppRole | null {
  if (typeof window === 'undefined') return null;
  return (sessionStorage.getItem('app_role') ||
    localStorage.getItem('app_role')) as AppRole | null;
}

export function useRole() {
  const [role, setRoleState] = useState<AppRole | null>(() => readRole());

  useEffect(() => {
    const sync = () => setRoleState(readRole());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const setRole = (newRole: AppRole, scope: 'tab' | 'persistent' = 'persistent') => {
    if (scope === 'tab') {
      sessionStorage.setItem('app_role', newRole);
    } else {
      localStorage.setItem('app_role', newRole);
      sessionStorage.setItem('app_role', newRole);
    }
    setRoleState(newRole);
  };

  const clearRole = () => {
    sessionStorage.removeItem('app_role');
    localStorage.removeItem('app_role');
    setRoleState(null);
  };

  return { role, setRole, clearRole };
}
