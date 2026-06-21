'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Settings as SettingsIcon, Save, KeyRound, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';

export default function SettingsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [organizationData, setOrganizationData] = useState({
    name: '',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    language: 'en',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/organization', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.organization) {
          setOrganizationData({
            name: data.organization.name || '',
            timezone: data.organization.settings?.timezone || 'Asia/Dhaka',
            currency: data.organization.settings?.currency || 'BDT',
            language: data.organization.settings?.language || 'en',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch organization settings:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Profile details updated successfully!');
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (securityData.newPassword !== securityData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Password updated successfully!');
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: organizationData.name,
          timezone: organizationData.timezone,
          currency: organizationData.currency,
          language: organizationData.language,
        }),
      });

      if (response.ok) {
        setSuccess('Organization profile settings updated successfully!');
        fetchOrganization();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update organization settings');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canEditOrg = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Account & System Settings"
        description="Modify your personal profile details, organization settings, preferences, and secure credentials."
        breadcrumbs={[{ label: 'Settings' }]}
      />

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold text-center max-w-xl">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-semibold text-center max-w-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 rounded-2xl p-4 shadow-xs h-fit">
          <nav className="space-y-1.5">
            {[
              { id: 'profile', label: 'Profile Parameters', icon: User },
              { id: 'organization', label: 'Organization Config', icon: Briefcase },
              { id: 'security', label: 'Security & Access', icon: KeyRound },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setError('');
                    setSuccess('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-155 text-xs font-bold flex items-center space-x-2.5 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border-l-2 border-blue-550 font-bold shadow-[inset_1px_0_0_rgba(59,130,246,0.05)]'
                      : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-900 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={14} className="shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Configurations Forms Container */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 rounded-3xl p-6 sm:p-8 shadow-xs">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-base border-b pb-2 mb-4">
                    Modify Profile Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-slate-950 border border-slate-200 border-dashed text-slate-400 rounded-xl text-sm cursor-not-allowed"
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Email address can only be changed by system owners.</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Phone</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 py-2.5 shadow-xs flex items-center space-x-1.5 text-xs"
                      >
                        <Save size={14} />
                        <span>{loading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'organization' && (
              <form onSubmit={handleSaveOrganization} className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-base border-b pb-2 mb-4">
                    Organization Profile
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Organization Name</label>
                      <input
                        type="text"
                        value={organizationData.name}
                        onChange={(e) => setOrganizationData({ ...organizationData, name: e.target.value })}
                        disabled={!canEditOrg}
                        className={
                          canEditOrg
                            ? 'w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 dark:text-white'
                            : 'w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-slate-950 border border-slate-200 border-dashed text-slate-400 rounded-xl text-sm cursor-not-allowed'
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Default Timezone</label>
                        <select
                          value={organizationData.timezone}
                          onChange={(e) => setOrganizationData({ ...organizationData, timezone: e.target.value })}
                          disabled={!canEditOrg}
                          className={
                            canEditOrg
                              ? 'w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
                              : 'w-full px-3.5 py-2 bg-slate-100/55 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed'
                          }
                        >
                          <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                          <option value="UTC">UTC (GMT+0)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Currency</label>
                        <select
                          value={organizationData.currency}
                          onChange={(e) => setOrganizationData({ ...organizationData, currency: e.target.value })}
                          disabled={!canEditOrg}
                          className={
                            canEditOrg
                              ? 'w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-xs font-bold text-slate-855 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
                              : 'w-full px-3.5 py-2 bg-slate-100/55 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed'
                          }
                        >
                          <option value="BDT">BDT (৳)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System Language</label>
                        <select
                          value={organizationData.language}
                          onChange={(e) => setOrganizationData({ ...organizationData, language: e.target.value })}
                          disabled={!canEditOrg}
                          className={
                            canEditOrg
                              ? 'w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-xs font-bold text-slate-855 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer'
                              : 'w-full px-3.5 py-2 bg-slate-100/55 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed'
                          }
                        >
                          <option value="en">English (US)</option>
                          <option value="bn">Bengali (BD)</option>
                        </select>
                      </div>
                    </div>
                    {canEditOrg ? (
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 py-2.5 shadow-xs flex items-center space-x-1.5 text-xs"
                        >
                          <Save size={14} />
                          <span>{loading ? 'Saving Settings...' : 'Save Organization Changes'}</span>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">SaaS parameters are managed in organization setup. Contact system administrator for details.</p>
                    )}
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-base border-b pb-2 mb-4">
                    Change Account Password
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 py-2.5 shadow-xs flex items-center space-x-1.5 text-xs"
                      >
                        <Save size={14} />
                        <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
