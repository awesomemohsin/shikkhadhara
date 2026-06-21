'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Globe, Save, RefreshCw, CheckCircle2, AlertCircle, ShieldAlert, Image, Layout, MessageSquare, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FrontendWebsitePage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Landing Page parameters
  const [config, setConfig] = useState({
    heroTitle: 'Welcome to Greenwood High School',
    heroDescription: 'Empowering minds, shaping futures, and building leaders of tomorrow.',
    contactEmail: 'info@greenwood.edu',
    contactPhone: '+880299887766',
    address: 'Plot 4, Road 12, Sector 3, Uttara, Dhaka',
    announcement: 'Admission going on for the Academic Year 2026-2027! Register today.',
    announcementActive: true,
    logoPath: '/images/school-logo.png',
  });

  const isAdmin = user && ['super_admin', 'admin', 'owner'].includes(user.role);

  useEffect(() => {
    if (token) {
      fetchConfig();
    }
  }, [token]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/organization', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.organization) {
          // Merge with mock landing config settings stored in the database settings object
          const dbSettings = data.organization.settings || {};
          setConfig((prev) => ({
            ...prev,
            heroTitle: dbSettings.heroTitle || prev.heroTitle,
            heroDescription: dbSettings.heroDescription || prev.heroDescription,
            contactEmail: dbSettings.contactEmail || data.organization.email || prev.contactEmail,
            contactPhone: dbSettings.contactPhone || data.organization.phone || prev.contactPhone,
            address: dbSettings.address || data.organization.address || prev.address,
            announcement: dbSettings.announcement || prev.announcement,
            announcementActive: dbSettings.announcementActive !== undefined ? dbSettings.announcementActive : prev.announcementActive,
            logoPath: data.organization.logo || prev.logoPath,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Store landing configurations within the settings block
        body: JSON.stringify({
          settings: {
            heroTitle: config.heroTitle,
            heroDescription: config.heroDescription,
            contactEmail: config.contactEmail,
            contactPhone: config.contactPhone,
            address: config.address,
            announcement: config.announcement,
            announcementActive: config.announcementActive,
          }
        }),
      });

      if (response.ok) {
        setSuccess('Frontend settings saved and deployed successfully!');
        fetchConfig();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to update frontend configuration');
      }
    } catch (err) {
      setError('Connection failed. Please check network.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert size={48} className="text-rose-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="text-sm text-slate-500">Only school administrators can edit landing page assets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Globe className="text-blue-600" size={28} />
          <span>Frontend Website Builder</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Configure school landing messages, active notifications, and contact parameters.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <p className="text-sm font-semibold">Fetching website setup...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Customizer */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 dark:text-white text-base border-b pb-2 flex items-center gap-2">
                <Layout size={18} className="text-blue-600" />
                Customize Landing Section
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Landing Title / Heading</label>
                  <input
                    type="text"
                    value={config.heroTitle}
                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Short Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={config.heroDescription}
                    onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Public Contact Email</label>
                    <input
                      type="email"
                      value={config.contactEmail}
                      onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Public Contact Phone</label>
                    <input
                      type="text"
                      value={config.contactPhone}
                      onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Campus Location Address</label>
                  <input
                    type="text"
                    value={config.address}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1"
                    required
                  />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-805 pt-4 space-y-4">
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                    <Megaphone size={16} className="text-amber-500" />
                    Alert Announcement Bar
                  </h3>

                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      id="announcementActive"
                      checked={config.announcementActive}
                      onChange={(e) => setConfig({ ...config, announcementActive: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="announcementActive" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                      Enable banner announcement at top of home screen
                    </label>
                  </div>

                  {config.announcementActive && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Announcement Text</label>
                      <input
                        type="text"
                        value={config.announcement}
                        onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 shadow-sm flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{saving ? 'Saving changes...' : 'Save & Publish Website'}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Real-time Preview Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Image size={14} className="text-indigo-500" />
                Live Preview
              </h3>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs relative">
                {/* Announcement bar */}
                {config.announcementActive && (
                  <div className="bg-amber-500 text-white text-[8px] font-bold py-1 px-3 text-center truncate">
                    {config.announcement}
                  </div>
                )}

                {/* Main page content */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Greenwood</span>
                    <span className="text-[8px] font-bold text-slate-400">Login</span>
                  </div>

                  <div className="text-center py-6 px-2 space-y-2 bg-gradient-to-tr from-blue-50/50 to-indigo-50/30 rounded-xl">
                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs leading-snug">
                      {config.heroTitle}
                    </h4>
                    <p className="text-[8px] text-slate-500 font-semibold leading-relaxed">
                      {config.heroDescription}
                    </p>
                  </div>

                  <div className="space-y-1 text-[8px] text-slate-500 font-semibold pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Email:</span>
                      <span>{config.contactEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Phone:</span>
                      <span>{config.contactPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Location:</span>
                      <span className="truncate max-w-[120px]">{config.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
