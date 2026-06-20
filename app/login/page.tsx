'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const tenantSlug = useTenantSlug();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (tenantSlug) {
        headers['x-tenant-subdomain'] = tenantSlug;
      }

      const response = await fetch(`/api/auth/login${tenantSlug ? `?subdomain=${tenantSlug}` : ''}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();

      // Store in localStorage
      localStorage.setItem('token', data.token);
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.organization) {
        localStorage.setItem('organization', JSON.stringify(data.organization));
      }

      // Update store
      setToken(data.token);
      setUser(data.user);
      if (data.organization) {
        setOrganization(data.organization);
      }

      // Redirect to dashboard
      if (data.user.role === 'owner') {
        router.push('/dashboard');
      } else {
        const userTenantSlug = data.tenant?.subdomain;
        if (userTenantSlug && userTenantSlug !== 'shikkhadhara') {
          router.push(`/${userTenantSlug}/dashboard`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/0 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/0 blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10 space-y-8">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/40 rounded-3xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/logo.png"
              alt={process.env.NEXT_PUBLIC_APP_NAME || 'ShikkhaDhara'}
              width={160}
              height={44}
              priority
              className="h-10 w-auto object-contain brightness-110 mb-4"
            />
            <p className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Multi-Tenant Management System
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4">
                <p className="text-xs text-rose-400 font-medium text-center">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/50 border-slate-800/60 focus:border-indigo-500 text-white rounded-xl py-2.5 placeholder:text-slate-655"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/50 border-slate-800/60 focus:border-indigo-500 text-white rounded-xl py-2.5 placeholder:text-slate-655"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </Button>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-slate-800/40">
              <p className="text-sm text-slate-450">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-150">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
