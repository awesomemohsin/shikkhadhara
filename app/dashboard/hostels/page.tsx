'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { Home, AlertCircle, Plus, Trash2, Edit2, Search, Filter, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HostelsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const tenantSlug = useTenantSlug();

  const [hostels, setHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals & Form states
  const [showModal, setShowModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'boys',
    address: '',
    capacity: 0,
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [roomInput, setRoomInput] = useState({
    roomNumber: '',
    capacity: 2,
    type: 'double',
  });

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

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
    setLoading(true);
    setError('');
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

  const handleAddRoom = () => {
    if (!roomInput.roomNumber) return;
    setRooms([...rooms, { ...roomInput, occupied: 0 }]);
    setRoomInput({ roomNumber: '', capacity: 2, type: 'double' });
  };

  const handleRemoveRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      setError('Hostel Name and Address are required');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const totalCapacity = rooms.reduce((acc, r) => acc + Number(r.capacity), 0);
      const payload = {
        ...formData,
        capacity: totalCapacity > 0 ? totalCapacity : formData.capacity,
        rooms,
      };

      const url = editingHostel ? `/api/hostels/${editingHostel._id}` : '/api/hostels';
      const method = editingHostel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(`Hostel "${formData.name}" saved successfully!`);
        setShowModal(false);
        setEditingHostel(null);
        setFormData({ name: '', type: 'boys', address: '', capacity: 0 });
        setRooms([]);
        fetchHostels();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to save hostel');
      }
    } catch (err) {
      setError('Network request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (hostel: any) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name || '',
      type: hostel.type || 'boys',
      address: hostel.address || '',
      capacity: hostel.capacity || 0,
    });
    setRooms(hostel.rooms || []);
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete hostel "${name}"? This will delete all rooms associated with it.`)) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/hostels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Hostel deleted successfully.');
        fetchHostels();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to delete hostel');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-2xl shadow-sm border border-rose-50">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-555 max-w-sm font-medium">Please log in to view hostel facilities.</p>
      </div>
    );
  }

  const filteredHostels = hostels.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || h.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Home className="text-indigo-650" size={28} />
            <span>Hostel Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Configure dormitory rooms, occupant allocation, and capacities.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingHostel(null);
              setFormData({ name: '', type: 'boys', address: '', capacity: 0 });
              setRooms([]);
              setShowModal(true);
            }}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5 text-xs"
          >
            <Plus size={16} />
            <span>Create Hostel</span>
          </Button>
        )}
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

      {/* Filters bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-805 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search hostels by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-550 text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-slate-400" size={16} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-550 text-xs font-semibold w-full sm:w-40"
          >
            <option value="all">All Dorms</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="coed">Co-ed</option>
          </select>
        </div>
      </div>

      {/* Hostels List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">Loading hostels...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHostels.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
              <Home className="mx-auto mb-4 text-slate-200" size={48} />
              <p className="text-sm font-semibold">No hostels registered in the database directory.</p>
            </div>
          ) : (
            filteredHostels.map((hostel) => (
              <div key={hostel._id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center space-x-2">
                        <Home size={18} className="text-indigo-500" />
                        <span>{hostel.name}</span>
                      </h3>
                      <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-semibold">{hostel.address}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 uppercase">
                      {hostel.type}
                    </span>
                  </div>
                  
                  {hostel.rooms && hostel.rooms.length > 0 && (
                    <div className="mt-4 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rooms Directory</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {hostel.rooms.map((room: any, index: number) => (
                          <div key={index} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-805 rounded-xl text-[10px] text-slate-600 dark:text-slate-350 font-bold">
                            <div>Rm {room.roomNumber}</div>
                            <div className="text-[9px] text-slate-400 font-semibold capitalize">{room.type} ({room.capacity} slots)</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-805 flex items-center justify-between">
                  <div className="flex space-x-4 text-center">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Total Capacity</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{hostel.capacity || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Rooms</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{hostel.rooms?.length || 0}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2.5">
                      <button onClick={() => handleEditClick(hostel)} className="text-amber-605 dark:text-amber-500 hover:text-amber-800">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(hostel._id, hostel.name)} className="text-rose-600 dark:text-rose-500 hover:text-rose-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingHostel ? 'Edit Hostel Building' : 'Register New Hostel Building'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-650">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hostel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Red House Dormitory"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hostel Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="coed">Co-ed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Building Address</label>
                <input
                  type="text"
                  placeholder="Street details..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>

              {/* Rooms setup builder */}
              <div className="border-t border-slate-100 dark:border-slate-805 pt-4 space-y-4">
                <h3 className="font-bold text-slate-850 dark:text-white text-sm">Configure Rooms Directory</h3>
                
                {/* Rooms list built so far */}
                {rooms.length > 0 && (
                  <div className="flex flex-wrap gap-2 py-2 max-h-32 overflow-y-auto border border-dashed border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                    {rooms.map((room, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-slate-800">
                        <span>Rm {room.roomNumber} ({room.capacity} beds)</span>
                        <button type="button" onClick={() => handleRemoveRoom(index)} className="text-slate-400 hover:text-rose-500">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline add room fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Room Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 101-A"
                      value={roomInput.roomNumber}
                      onChange={(e) => setRoomInput({ ...roomInput, roomNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={roomInput.capacity}
                      onChange={(e) => setRoomInput({ ...roomInput, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddRoom}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold px-3 py-2 rounded-xl text-xs w-full"
                  >
                    Add Room
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 justify-end border-t border-slate-100 dark:border-slate-805">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 dark:bg-slate-800 dark:text-slate-350 rounded-xl px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-sm transition-all"
                >
                  {submitting ? 'Saving...' : 'Save Hostel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
