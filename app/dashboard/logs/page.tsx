'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { FileText, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogsPage() {
  const token = useAuthStore((state) => state.token);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    userEmail: '',
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.entity) queryParams.append('entity', filters.entity);
      if (filters.userEmail) queryParams.append('userEmail', filters.userEmail);

      const response = await fetch(`/api/audit-logs?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({ action: '', entity: '', userEmail: '' });
    // Fetch logs with cleared filters immediately
    setTimeout(() => {
      fetchLogs();
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Audit Logs</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Monitor system activities and user actions across the organization
        </p>
      </div>

      {/* Filters Form */}
      <form onSubmit={applyFilters} className="bg-white dark:bg-slate-900 p-4 border border-border/40 rounded-2xl flex flex-col md:flex-row gap-4 items-end font-sans">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">User Email</label>
          <input
            type="text"
            placeholder="Search by user email..."
            value={filters.userEmail}
            onChange={(e) => handleFilterChange('userEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Action</label>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Entity Type</label>
          <select
            value={filters.entity}
            onChange={(e) => handleFilterChange('entity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All Entities</option>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Section">Section</option>
            <option value="SubjectGroup">Subject Group</option>
            <option value="Fee">Fee</option>
            <option value="Payment">Payment</option>
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 px-4 h-10 w-full md:w-auto">
            <Search size={16} />
            <span>Search</span>
          </Button>
          <Button type="button" onClick={clearFilters} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 flex items-center gap-1.5 px-4 h-10 w-full md:w-auto">
            <RefreshCw size={16} />
            <span>Reset</span>
          </Button>
        </div>
      </form>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading audit logs...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto border border-border/40">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">User Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Activity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 font-medium">
                    No activity logs found matching the filters
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-slate-450 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">
                      {log.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        log.action === 'create'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : log.action === 'update'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-450'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-450'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400 font-sans">
                      {log.details}
                    </td>
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
