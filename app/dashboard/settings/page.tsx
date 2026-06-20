'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        setSuccess('Profile updated successfully!');
        setUser(data.user); // update client state globally
        
        // Save updated user to localstorage
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
        setSuccess('Organization settings updated successfully!');
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
        setSuccess('Password changed successfully!');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Manage your account and organization settings</p>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4">
          <p className="text-sm text-rose-600 dark:text-rose-450 font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-4 border border-border/40 h-fit">
          <nav className="space-y-1.5">
            {[
              { id: 'profile', label: 'Profile Settings' },
              { id: 'organization', label: 'Organization' },
              { id: 'security', label: 'Security' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setError('');
                  setSuccess('');
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 text-sm font-semibold ${
                  activeTab === item.id
                    ? 'bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600 dark:border-indigo-500 shadow-[inset_1px_0_0_rgba(99,102,241,0.05)]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Forms container */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 border border-border/40">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                    Profile Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, firstName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, lastName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                          Email address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-slate-950 text-slate-400 cursor-not-allowed border-dashed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2 mt-4"
                    >
                      <Save size={18} />
                      <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'organization' && (
              <form onSubmit={handleSaveOrganization} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                    Organization Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={organizationData.name}
                        onChange={(e) =>
                          setOrganizationData({
                            ...organizationData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                          Timezone
                        </label>
                        <select
                          value={organizationData.timezone}
                          onChange={(e) =>
                            setOrganizationData({
                              ...organizationData,
                              timezone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                        >
                          <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                          <option value="UTC">UTC (GMT+0)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                          Currency
                        </label>
                        <select
                          value={organizationData.currency}
                          onChange={(e) =>
                            setOrganizationData({
                              ...organizationData,
                              currency: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                        >
                          <option value="BDT">BDT (৳)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                          Language
                        </label>
                        <select
                          value={organizationData.language}
                          onChange={(e) =>
                            setOrganizationData({
                              ...organizationData,
                              language: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                        >
                          <option value="en">English (US)</option>
                          <option value="bn">Bengali (BD)</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2 mt-4"
                    >
                      <Save size={18} />
                      <span>{loading ? 'Saving...' : 'Save Organization Details'}</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2 mt-4"
                    >
                      <Save size={18} />
                      <span>{loading ? 'Changing...' : 'Change Password'}</span>
                    </Button>
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
