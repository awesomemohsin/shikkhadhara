'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DollarSign, Plus, Trash2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeeTypesPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Config Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [allocData, setAllocData] = useState({
    feeCategoryId: '',
    class: '',
    amount: '',
    dueDate: '',
    month: new Date().toLocaleString('default', { month: 'short' }),
    year: new Date().getFullYear().toString(),
    description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchAllocations();
      fetchSections();
    }
  }, [token]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/fees/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await fetch('/api/fees/allocations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAllocations(data.allocations || []);
      }
    } catch (error) {
      console.error('Failed to fetch allocations:', error);
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/fees/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName, description: categoryDesc }),
      });

      if (response.ok) {
        setSuccess('Fee category created!');
        setCategoryName('');
        setCategoryDesc('');
        setShowCategoryForm(false);
        fetchCategories();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to create category');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee category?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/fees/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Fee category deleted!');
        fetchCategories();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to delete category');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  const handleTriggerAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/fees/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(allocData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Fees successfully allocated! Generated ${data.generatedInvoicesCount} student invoices.`);
        setAllocData({
          feeCategoryId: '',
          class: '',
          amount: '',
          dueDate: '',
          month: new Date().toLocaleString('default', { month: 'short' }),
          year: new Date().getFullYear().toString(),
          description: '',
        });
        setShowAllocationForm(false);
        fetchAllocations();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to trigger fee allocation');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  const uniqueClasses = Array.from(new Set(sections.map((s) => s.class)));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="text-indigo-600" size={28} />
            <span>Billing Fee Types & Categories</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Configure billing structures and distribute invoices</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/fees')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Registry</span>
          </Button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <CheckCircle size={16} className="text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <AlertCircle size={16} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading configurations...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Configurations Panel */}
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Fee Categories</h3>
                  <Button
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 font-semibold px-2.5 py-1.5 text-xs rounded-xl"
                  >
                    <Plus size={14} className="mr-1 inline animate-in fade-in" />
                    <span>Create Fee Type</span>
                  </Button>
                </div>

                {showCategoryForm && (
                  <form onSubmit={handleCreateCategory} className="bg-slate-50 dark:bg-slate-955/25 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Admission Fee"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                      <input
                        type="text"
                        placeholder="Describe the fee purpose..."
                        value={categoryDesc}
                        onChange={(e) => setCategoryDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                      />
                    </div>
                    <div className="flex space-x-2 pt-1">
                      <Button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-xs">
                        Save Category
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCategoryForm(false)}
                        className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350 font-medium px-4 py-2 rounded-xl text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                  {categories.length === 0 ? (
                    <p className="text-slate-455 text-xs italic p-4 text-center">No fee types defined.</p>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat._id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 shadow-xs">
                        <div>
                          <p className="text-sm font-bold text-slate-850 dark:text-slate-205">{cat.name}</p>
                          <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">{cat.description || 'No description'}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Class Allocation Trigger panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-805 dark:text-slate-205 text-base">Allocate Fees to Class</h3>
                <Button
                  onClick={() => setShowAllocationForm(!showAllocationForm)}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-medium px-2.5 py-1.5 text-xs rounded-xl shadow-md"
                >
                  <Plus size={14} className="mr-1 inline" />
                  <span>Run Allocation</span>
                </Button>
              </div>

              {showAllocationForm && (
                <form onSubmit={handleTriggerAllocation} className="bg-slate-50 dark:bg-slate-955/25 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fee Category</label>
                      <select
                        value={allocData.feeCategoryId}
                        onChange={(e) => setAllocData({ ...allocData, feeCategoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Class</label>
                      <select
                        value={allocData.class}
                        onChange={(e) => setAllocData({ ...allocData, class: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                        required
                      >
                        <option value="">Select Class</option>
                        {uniqueClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (BDT)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={allocData.amount}
                        onChange={(e) => setAllocData({ ...allocData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                      <input
                        type="date"
                        value={allocData.dueDate}
                        onChange={(e) => setAllocData({ ...allocData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Month</label>
                      <select
                        value={allocData.month}
                        onChange={(e) => setAllocData({ ...allocData, month: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                      >
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Year</label>
                      <input
                        type="number"
                        value={allocData.year}
                        onChange={(e) => setAllocData({ ...allocData, year: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Invoice Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Term 2 exam fees"
                      value={allocData.description}
                      onChange={(e) => setAllocData({ ...allocData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2 border-t border-slate-105 dark:border-slate-800 pt-3">
                    <Button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-xs">
                      Trigger Allocations
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowAllocationForm(false)}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350 font-medium px-4 py-2 rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Past Allocations History */}
              <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-105 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocations Audit Ledger</h4>
                {allocations.length === 0 ? (
                  <p className="text-slate-450 text-xs italic py-4 text-center">No allocations processed.</p>
                ) : (
                  allocations.map((alloc) => (
                    <div key={alloc._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 shadow-xs text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{alloc.category ? alloc.category.name : 'Unknown Fee'}</span>
                        <span className="text-indigo-650 dark:text-indigo-400">৳{alloc.amount}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-455">
                        <span>Class: <span className="font-semibold text-slate-700 dark:text-slate-300">{alloc.class}</span> | {alloc.month} {alloc.year}</span>
                        <span>Due: {new Date(alloc.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
