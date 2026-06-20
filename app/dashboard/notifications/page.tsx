'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Send, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const token = useAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'sms',
    title: '',
    message: '',
    recipients: 'all',
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Notification sent successfully');
        setFormData({ type: 'sms', title: '', message: '', recipients: 'all' });
        setShowForm(false);
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Send SMS, WhatsApp, and Email notifications</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send size={20} className="mr-2" />
          Send Notification
        </Button>

        {showForm && (
          <form onSubmit={handleSendNotification} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="in_app">In-App</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <select
                  value={formData.recipients}
                  onChange={(e) =>
                    setFormData({ ...formData, recipients: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                  <option value="parents">Parents</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notification title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Notification message"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Send
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading notifications...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No notifications sent</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        notif.type === 'sms'
                          ? 'bg-blue-100 text-blue-600'
                          : notif.type === 'whatsapp'
                            ? 'bg-green-100 text-green-600'
                            : notif.type === 'email'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Bell size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notif.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : notif.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {notif.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{notif.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="capitalize">{notif.type}</span>
                        <span>
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
