'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setLoading = useAuthStore((state) => state.setLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setOrganization = useAuthStore((state) => state.setOrganization);

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const orgStr = localStorage.getItem('organization');

        if (token && userStr) {
          setToken(token);
          setUser(JSON.parse(userStr));
          if (orgStr) {
            setOrganization(JSON.parse(orgStr));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setLoading, setUser, setToken, setOrganization]);

  return <>{children}</>;
}
