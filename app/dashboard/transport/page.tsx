'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Truck, Plus, Trash2, Edit2, Search, Printer, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TransportPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals & Form state
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    routeName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    routeFare: 0,
    status: 'active',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user && ['super_admin', 'admin'].includes(user.role);

  useEffect(() => {
    fetchRoutes();
  }, [token]);

  const fetchRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/transport', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to fetch transport routes');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routeName || !formData.vehicleNumber || !formData.driverName) {
      setError('Route Name, Vehicle Number, and Driver Name are required');
      return;
    }
    setError('');
    setSuccess('');

    try {
      const url = editingRoute ? `/api/transport/${editingRoute._id}` : '/api/transport';
      const method = editingRoute ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(`Route "${formData.routeName}" saved successfully!`);
        setShowForm(false);
        setEditingRoute(null);
        setFormData({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', routeFare: 0, status: 'active' });
        fetchRoutes();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to save transport route');
      }
    } catch (err) {
      setError('Network request failed');
    }
  };

  const handleEditClick = (route: any) => {
    setEditingRoute(route);
    setFormData({
      routeName: route.routeName || '',
      vehicleNumber: route.vehicleNumber || '',
      driverName: route.driverName || '',
      driverPhone: route.driverPhone || '',
      routeFare: route.routeFare || 0,
      status: route.status || 'active',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete transport route "${name}"?`)) return;

    try {
      const response = await fetch(`/api/transport/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Route deleted successfully.');
        fetchRoutes();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to delete route');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const filteredRoutes = routes.filter((r) => {
    return r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.driverName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans print:bg-white print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Truck className="text-indigo-650" size={28} />
            <span>Transport Routes</span>
          </h1>
          <p className="text-slate-550 dark:text-slate-400 mt-1 text-sm">Configure school buses, vehicle routes, drivers, and fares.</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-205/60 font-bold text-xs"
          >
            <Printer size={15} />
            <span>Print List</span>
          </Button>
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingRoute(null);
                setFormData({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', routeFare: 0, status: 'active' });
                setShowForm(!showForm);
              }}
              className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-sm text-xs"
            >
              <Plus size={16} className="mr-1" />
              <span>Add Route</span>
            </Button>
          )}
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300 print:hidden">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300 print:hidden">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 max-w-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-200 print:hidden">
          <h2 className="text-base font-bold text-slate-850 dark:text-white mb-4">
            {editingRoute ? 'Edit Transport Route' : 'Add New Transport Route'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Route Name / Destination</label>
              <input
                type="text"
                placeholder="e.g. Route A - Mirpur to Farmgate"
                value={formData.routeName}
                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vehicle / Bus Number</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka Metro-HA-11-22"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Route Fare (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.routeFare}
                  onChange={(e) => setFormData({ ...formData, routeFare: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Driver Name</label>
                <input
                  type="text"
                  placeholder="Abdul Rahman"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Driver Phone</label>
                <input
                  type="tel"
                  placeholder="+8801XXXXXXXXX"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Route Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-sm transition-all"
              >
                Save Route
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRoute(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 rounded-xl px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Directory Table */}
      <div className="space-y-4">
        {/* Search Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 shadow-sm flex items-center justify-between print:hidden">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by route, driver, bus number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2 print:hidden">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm font-semibold">Updating route logs...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Route Destination</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Bus Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Driver Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Fare</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                      No transport routes registered in the system database.
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => (
                    <tr key={route._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 text-sm font-bold text-slate-850 dark:text-slate-200">
                        {route.routeName}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">
                        {route.vehicleNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{route.driverName}</div>
                        <div className="text-xs text-slate-450">{route.driverPhone || '—'}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        ৳{route.routeFare.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                          route.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex space-x-3.5 print:hidden">
                        {isAdmin && (
                          <>
                            <button onClick={() => handleEditClick(route)} className="text-amber-605 dark:text-amber-500 hover:text-amber-800">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(route._id, route.routeName)} className="text-rose-600 dark:text-rose-500 hover:text-rose-800">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
