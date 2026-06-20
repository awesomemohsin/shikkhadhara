'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-gray-900">{process.env.NEXT_PUBLIC_APP_NAME || 'ShikkhaDhara'}</h1>
        <p className="text-lg text-gray-600">Multi-Tenant Management System</p>
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
