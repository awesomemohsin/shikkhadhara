'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { Image as ImageIcon, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const tenantSlug = useTenantSlug();
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user && ['super_admin', 'admin'].includes(user.role);

  useEffect(() => {
    fetchGallery();
  }, [tenantSlug]);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/gallery?tenant=${tenantSlug}`);
      if (response.ok) {
        const data = await response.json();
        setGallery(data.gallery || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch gallery images');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Institutional Gallery</h1>
          <p className="text-slate-500 mt-1">Browse photos of school events, achievements, and campuses</p>
        </div>
        {isAdmin && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/10 flex items-center space-x-1.5">
            <Plus size={16} />
            <span>Upload Image</span>
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
        <div className="flex justify-center items-center h-48 text-slate-400">Loading gallery albums...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
              <ImageIcon className="mx-auto mb-4 text-slate-300" size={48} />
              <p className="text-sm">No photos uploaded to gallery for tenant: <span className="font-semibold text-indigo-500">{tenantSlug}</span></p>
            </div>
          ) : (
            gallery.map((item) => (
              <div key={item._id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="relative h-48 bg-slate-100 flex items-center justify-center text-slate-300">
                  {/* Fallback mock image visualization */}
                  <ImageIcon size={48} />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-slate-450 mt-1 line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
