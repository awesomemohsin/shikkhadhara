'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { FileText, Plus, Check, X, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LeavesPage() {
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
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="text-indigo-600" size={28} />
            <span>Leave Management</span>
          </h1>
          <p className="text-slate-500 mt-1">Apply for leave, track requests, and manage staff leave approvals</p>
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
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <Check size={16} className="text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <AlertCircle size={16} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-2">
            {leaves.filter((l) => l.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved Leaves</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {leaves.filter((l) => l.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Filed Applications</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{leaves.length}</p>
        </div>
      </div>

      {/* Leave Logs */}
      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">Loading leave registers...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {isAdmin && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Applicant</th>}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-550 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-550 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/40 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        {leave.user ? `${leave.user.firstName} ${leave.user.lastName || ''}` : leave.userEmail}
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          {leave.role}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 capitalize">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      <div className="flex items-center space-x-1">
                        <Calendar size={13} className="text-slate-400" />
                        <span>
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        leave.status === 'approved'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : leave.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {leave.status}
                      </span>
                      {leave.remarks && (
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Remarks: {leave.remarks}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      {isAdmin && leave.status === 'pending' && (
                        <div className="inline-flex space-x-1">
                          {reviewId === leave._id ? (
                            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 rounded-xl p-1.5 shadow-sm">
                              <input
                                type="text"
                                placeholder="Remarks..."
                                value={reviewRemarks}
                                onChange={(e) => setReviewRemarks(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
                              />
                              <button
                                onClick={() => handleReviewLeave(leave._id, 'approved')}
                                className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
                                title="Confirm Approve"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => handleReviewLeave(leave._id, 'rejected')}
                                className="p-1 rounded bg-rose-500 text-white hover:bg-rose-600"
                                title="Confirm Reject"
                              >
                                <X size={12} />
                              </button>
                              <button
                                onClick={() => setReviewId(null)}
                                className="p-1 rounded bg-slate-200 text-slate-650 hover:bg-slate-300"
                                title="Cancel Review"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Button
                                onClick={() => {
                                  setReviewId(leave._id);
                                  setReviewRemarks('');
                                }}
                                className="bg-slate-50 border border-slate-100 hover:bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1.5 text-xs rounded-xl shadow-xs"
                              >
                                Review Request
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {!isAdmin && leave.status === 'pending' && (
                        <button
                          onClick={() => handleDeleteLeave(leave._id)}
                          className="text-rose-500 hover:text-rose-700 font-semibold text-xs transition-colors"
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
      )}

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-100 w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">New Leave Application</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-450 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 font-medium py-2.5 rounded-xl shadow-md">
                  Submit Application
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-650 flex-1 font-medium py-2.5 rounded-xl"
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
