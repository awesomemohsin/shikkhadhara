'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { FileText, Plus, Check, X, Calendar, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

function LeavesPageContent() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user && ['admin', 'super_admin', 'owner'].includes(user.role);

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Submit request form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Admin approval remarks state
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch leave requests');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Leave request submitted successfully!');
        setShowForm(false);
        setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        fetchLeaves();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to submit leave request');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const handleReviewLeave = async (id: string, status: 'approved' | 'rejected') => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, remarks: reviewRemarks }),
      });

      if (response.ok) {
        setSuccess(`Leave request ${status} successfully!`);
        setReviewId(null);
        setReviewRemarks('');
        fetchLeaves();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to update leave request');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this leave application?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Leave request cancelled and deleted.');
        fetchLeaves();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to cancel leave request');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-955 dark:text-white tracking-tight flex items-center space-x-2">
            <FileText className="text-indigo-600" size={28} />
            <span>Leave Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Apply for leaves, track submissions, and handle approval registers
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/10 flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>Apply for Leave</span>
          </Button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <Check size={16} className="text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <AlertCircle size={16} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
            {leaves.filter((l) => l.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved Leaves</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-450 mt-2">
            {leaves.filter((l) => l.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Filed Applications</p>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{leaves.length}</p>
        </div>
      </div>

      {/* Leave Logs */}
      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <RefreshCw className="animate-spin mr-2" size={18} />
          <span className="font-semibold">Loading leave registers...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800">
                <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                  {isAdmin && <th className="px-6 py-4 text-left">Applicant</th>}
                  <th className="px-6 py-4 text-left">Leave Type</th>
                  <th className="px-6 py-4 text-left">Duration</th>
                  <th className="px-6 py-4 text-left">Reason</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-slate-400 italic">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/30 transition-colors">
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {leave.user ? `${leave.user.firstName} ${leave.user.lastName || ''}` : leave.userEmail}
                          </span>
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                            {leave.role?.replace('_', ' ')}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 capitalize">
                        {leave.leaveType}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">
                        <div className="flex items-center space-x-1">
                          <Calendar size={13} className="text-slate-400" />
                          <span>
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          leave.status === 'approved'
                            ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                            : leave.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                              : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30'
                        }`}>
                          {leave.status}
                        </span>
                        {leave.remarks && (
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Remarks: {leave.remarks}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAdmin && leave.status === 'pending' && (
                          <div className="inline-flex">
                            {reviewId === leave._id ? (
                              <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm">
                                <input
                                  type="text"
                                  placeholder="Remarks..."
                                  value={reviewRemarks}
                                  onChange={(e) => setReviewRemarks(e.target.value)}
                                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-750 dark:text-slate-200"
                                />
                                <button
                                  onClick={() => handleReviewLeave(leave._id, 'approved')}
                                  className="p-1 rounded bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                                  title="Confirm Approve"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => handleReviewLeave(leave._id, 'rejected')}
                                  className="p-1 rounded bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                                  title="Confirm Reject"
                                >
                                  <X size={12} />
                                </button>
                                <button
                                  onClick={() => setReviewId(null)}
                                  className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-350"
                                  title="Cancel Review"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => {
                                  setReviewId(leave._id);
                                  setReviewRemarks('');
                                }}
                                className="bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-400 dark:border-slate-750 font-bold px-3 py-1.5 text-xs rounded-xl shadow-xs"
                              >
                                Review Request
                              </Button>
                            )}
                          </div>
                        )}
                        {!isAdmin && leave.status === 'pending' && (
                          <button
                            onClick={() => handleDeleteLeave(leave._id)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Cancel Application
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <h2 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">New Leave Application</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-450 hover:text-slate-750 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  required
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="other">Other / General</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason</label>
                <textarea
                  placeholder="State the reason for leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="bg-indigo-650 hover:bg-indigo-750 text-white flex-1 font-bold py-2.5 rounded-xl shadow-md cursor-pointer">
                  Submit Application
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-300 flex-1 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeavesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading leave requests...</div>}>
      <LeavesPageContent />
    </Suspense>
  );
}
