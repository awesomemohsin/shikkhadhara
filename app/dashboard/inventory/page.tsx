'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { Archive, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InventoryPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const tenantSlug = useTenantSlug();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Validate teacher/staff role or above
  const isAuthorized = user && ['super_admin', 'admin', 'teacher', 'staff'].includes(user.role);

  useEffect(() => {
    if (isAuthorized) {
      fetchInventory();
    } else {
      setLoading(false);
    }
  }, [tenantSlug, isAuthorized]);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`/api/inventory?tenant=${tenantSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch inventory stock');
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
        <p className="text-slate-550 max-w-sm">
          Inventory, equipment logs, and stocks can only be accessed by admins, teachers, and staff members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ops Inventory & Stock</h1>
          <p className="text-slate-500 mt-1">Track physical goods, low-stock warnings, and classroom materials</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/10 flex items-center space-x-1.5">
          <Plus size={16} />
          <span>Add Stock Item</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Loading stock registers...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No items in inventory registry for tenant: <span className="font-semibold text-indigo-500">{tenantSlug}</span>
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.itemName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.category || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.status === 'in_stock' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {item.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.supplier || 'Generic'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
