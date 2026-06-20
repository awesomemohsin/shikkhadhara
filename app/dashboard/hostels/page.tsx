'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { Home, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HostelsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const tenantSlug = useTenantSlug();
  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Validate student/parent role or above (everyone in tenant has read access)
  const isAuthorized = !!user;
  const isAdmin = user && ['super_admin', 'admin'].includes(user.role);

  useEffect(() => {
    if (isAuthorized) {
      fetchHostels();
    } else {
      setLoading(false);
    }
  }, [tenantSlug, isAuthorized]);

  const fetchHostels = async () => {
    try {
      const response = await fetch(`/api/hostels?tenant=${tenantSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHostels(data.hostels || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch hostels');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-2xl shadow-sm border border-red-50">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-550 max-w-sm">Please log in to view hostel facilities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ops Hostel Management</h1>
          <p className="text-slate-500 mt-1">Configure dormitory rooms, occupant allocation, and capacities</p>
        </div>
        {isAdmin && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/10 flex items-center space-x-1.5">
            <Plus size={16} />
            <span>Create Hostel</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Loading hostel details...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostels.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
              <Home className="mx-auto mb-4 text-slate-300" size={48} />
              <p className="text-sm">No hostels registered for tenant: <span className="font-semibold text-indigo-500">{tenantSlug}</span></p>
            </div>
          ) : (
            hostels.map((hostel) => (
              <div key={hostel._id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                      <Home size={18} className="text-indigo-500" />
                      <span>{hostel.name}</span>
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">{hostel.address || 'Dhaka, Bangladesh'}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                    {hostel.type}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50/50 rounded-xl p-3">
                    <p className="text-xs text-slate-450 font-medium">Total Capacity</p>
                    <p className="text-xl font-extrabold text-slate-800 mt-1">{hostel.capacity || 0}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-3">
                    <p className="text-xs text-slate-450 font-medium">Rooms Configured</p>
                    <p className="text-xl font-extrabold text-slate-800 mt-1">{hostel.rooms?.length || 0}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
