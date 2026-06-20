'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setOrganization = useAuthStore((state) => state.setOrganization);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      const data = await response.json();

      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update store
      setToken(data.token);
      setUser(data.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/0 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/0 blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10 space-y-6">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/40 rounded-3xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/logo.png"
              alt={process.env.NEXT_PUBLIC_APP_NAME || 'ShikkhaDhara'}
              width={150}
              height={40}
              priority
              className="h-9 w-auto object-contain brightness-110 mb-3"
            />
            <p className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Set up your ShikkhaDhara account
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3">
                <p className="text-xs text-rose-400 font-medium text-center">{error}</p>
              </div>
            )}

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">First Name</label>
                  <Input
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950/50 border-slate-800/60 focus:border-indigo-500 text-white rounded-xl placeholder:text-slate-655"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Last Name</label>
                  <Input
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950/50 border-slate-800/60 focus:border-indigo-500 text-white rounded-xl placeholder:text-slate-655"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/50 border-slate-800/60 focus:border-indigo-500 text-white rounded-xl placeholder:text-slate-655"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/50 border-slate-800/60 focus:border-indigo-500 text-white rounded-xl placeholder:text-slate-655"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Organization Name</label>
                <Input
                  name="organizationName"
                  type="text"
                  placeholder="ShikkhaDhara Academy"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/50 border-slate-800/60 focus:border-indigo-500 text-white rounded-xl placeholder:text-slate-655"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : 'Register'}
              </Button>
            </div>

            <div className="text-center mt-5 pt-3.5 border-t border-slate-800/40">
              <p className="text-sm text-slate-450">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-150">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
