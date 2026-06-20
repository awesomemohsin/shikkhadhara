'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, ShieldAlert, ArrowLeft, Globe, Loader2, Mail, CheckCircle2, Edit2, Trash2, X } from 'lucide-react';
import Link from 'next/link';

export default function TenantsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    email: '',
    password: '',
  });

  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    subdomain: '',
    email: '',
    status: 'active',
    subscription: {
      plan: 'free',
    },
  });

  useEffect(() => {
    // Guard: Only system owner role can access this page
    if (user && user.role !== 'owner') {
      router.push('/dashboard');
      return;
    }

    if (token) {
      fetchTenants();
    }
  }, [token, user, router]);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tenant registration failed');
      }

      setSuccess(`Tenant "${data.tenant.name}" provisioned successfully! Admin Login Email: "${data.adminEmail}" | Password: "${data.adminPassword}"`);
      setFormData({ name: '', subdomain: '', email: '', password: '' });
      setShowForm(false);
      fetchTenants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleEditClick = (tenant: any) => {
    setEditingTenantId(tenant._id);
    setEditFormData({
      name: tenant.name || '',
      subdomain: tenant.subdomain || '',
      email: tenant.email || '',
      status: tenant.status || 'active',
      subscription: {
        plan: tenant.subscription?.plan || 'free',
      },
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/tenants/${editingTenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tenant update failed');
      }

      setSuccess(`Tenant "${data.tenant.name}" updated successfully!`);
      setShowEditForm(false);
      setEditingTenantId(null);
      fetchTenants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`WARNING: Are you sure you want to delete "${name}"? This will delete the school AND all of its student, staff, fee, exam, and log data. This action is IRREVERSIBLE.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess(`Tenant "${name}" deleted successfully.`);
        fetchTenants();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete tenant');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert size={48} className="text-rose-500 animate-bounce" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">You must be the system owner to access this panel.</p>
        <Link href="/dashboard" className="text-indigo-500 hover:underline text-sm font-semibold flex items-center gap-1">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">SaaS School Provisioner</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm ml-7">Manage institutional tenants, register subdomains, and view platform directories.</p>
        </div>
        
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
          variant="ghost"
          className="flex items-center space-x-2 text-slate-900 dark:text-white hover:text-indigo-650 hover:bg-transparent px-4 py-2 font-bold"
        >
          <Plus size={20} className="text-slate-900 dark:text-white" />
          <span>{showForm ? 'View Directory' : 'Provision School'}</span>
        </Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 max-w-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="text-lg font-bold text-slate-850 dark:text-white mb-4">Register New Institutional Tenant</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">School Name</label>
                <input
                  type="text"
                  placeholder="Greenwood High School"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subdomain Slug</label>
                <div className="flex items-center">
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400 text-sm rounded-l-xl">
                    https://
                  </span>
                  <input
                    type="text"
                    placeholder="greenwood"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white text-sm focus:outline-none"
                    required
                  />
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-l-0 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400 text-sm rounded-r-xl">
                    .shikkhadhara.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Administrator Email</label>
                <input
                  type="email"
                  placeholder="admin@greenwood.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Administrator Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={registering}
                className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-md transition-all flex items-center gap-2"
              >
                {registering ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Seeding Tenant Data...
                  </>
                ) : 'Provision Tenant'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 rounded-xl px-5 border border-border/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Fetching platform schools...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-x-auto shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Institution Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">URL / Subdomain</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                    No schools registered in database.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                      {tenant.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link 
                        href={`/${tenant.subdomain}/dashboard`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        <Globe size={14} />
                        {tenant.subdomain}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-400" />
                        {tenant.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        tenant.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-455'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span className="uppercase text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                        {tenant.subscription?.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {new Date(tenant.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm flex space-x-2">
                      <button 
                        onClick={() => handleEditClick(tenant)} 
                        className="text-amber-605 dark:text-amber-500 hover:text-amber-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant._id, tenant.name)}
                        className="text-rose-600 dark:text-rose-500 hover:text-rose-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Institutional Tenant</h2>
              <button 
                onClick={() => {
                  setShowEditForm(false);
                  setEditingTenantId(null);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">School Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subdomain Slug</label>
                  <div className="flex items-center">
                    <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400 text-sm rounded-l-xl">
                      https://
                    </span>
                    <input
                      type="text"
                      value={editFormData.subdomain}
                      onChange={(e) => setEditFormData({ ...editFormData, subdomain: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white text-sm focus:outline-none"
                      required
                    />
                    <span className="px-3.5 py-2.5 bg-slate-100 border border-l-0 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400 text-sm rounded-r-xl">
                      .shikkhadhara.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Administrator Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Portal Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subscription Plan</label>
                    <select
                      value={editFormData.subscription.plan}
                      onChange={(e) => setEditFormData({ 
                        ...editFormData, 
                        subscription: { ...editFormData.subscription, plan: e.target.value } 
                      })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-950/40 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingTenantId(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registering}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-md transition-all flex items-center gap-2"
                >
                  {registering ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
