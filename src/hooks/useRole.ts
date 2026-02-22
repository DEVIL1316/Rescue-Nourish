import { useState, useEffect } from 'react';

export type AppRole = 'donor' | 'ngo' | 'orphanage_member' | 'admin';

export function useRole() {
  const [role, setRoleState] = useState<AppRole | null>(() => {
    return localStorage.getItem('app_role') as AppRole | null;
  });

  const setRole = (newRole: AppRole) => {
    localStorage.setItem('app_role', newRole);
    setRoleState(newRole);
  };

  const clearRole = () => {
    localStorage.removeItem('app_role');
    setRoleState(null);
  };

  return { role, setRole, clearRole };
}
