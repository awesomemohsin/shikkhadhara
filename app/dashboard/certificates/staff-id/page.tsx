'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Briefcase, Printer, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StaffIdCardPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings customizable in real-time
  const [cardThemeColor, setCardThemeColor] = useState('#6366f1');
  const [cardLayout, setCardLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [schoolName, setSchoolName] = useState('SHIKKHADHARA ACADEMIA');
  const [emergencyPhone, setEmergencyPhone] = useState('+880 1712-345678');

  useEffect(() => {
    if (token) {
      fetchStaffs();
    }
  }, [token]);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/staffs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStaffs(data.teachers || []); // The API stores teachers/staffs in 'teachers' key
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case 'teacher': return 'TEACHER';
      case 'senior_teacher': return 'SENIOR TEACHER';
      case 'headmaster': return 'HEADMASTER';
      case 'associate_headmaster': return 'ASSOCIATE HEADMASTER';
      default: return pos?.toUpperCase() || 'STAFF';
    }
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Briefcase className="text-indigo-600" size={28} />
            <span>Generate Staff ID Cards</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Batch print employee identity badges for teachers and staff members</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/dashboard/certificates/id-settings')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <span>ID Settings</span>
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Button>
        </div>
      </div>

      {/* Control panel & options */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Layout Settings</h3>
          
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Card Layout</label>
              <select
                value={cardLayout}
                onChange={(e) => setCardLayout(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none"
              >
                <option value="vertical">Vertical Portrait</option>
                <option value="horizontal">Horizontal Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Badge Theme Color</label>
              <input
                type="color"
                value={cardThemeColor}
                onChange={(e) => setCardThemeColor(e.target.value)}
                className="w-full h-8 rounded-xl cursor-pointer p-0.5 border"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">School Header Title</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Emergency Phone</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <Button
              onClick={handlePrint}
              disabled={staffs.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5"
            >
              <Printer size={16} />
              <span>Print Batch ({staffs.length})</span>
            </Button>
          </div>
        </div>

        {/* ID Card Display Area */}
        <div className="lg:col-span-3 flex flex-col items-center">
          {loading ? (
            <div className="text-center py-16 text-slate-450 flex items-center gap-2">
              <RefreshCw className="animate-spin" size={20} /> Loading staff directory...
            </div>
          ) : staffs.length === 0 ? (
            <div className="w-full bg-slate-50 dark:bg-slate-955/10 border border-dashed rounded-3xl p-16 text-center text-slate-400 font-semibold text-sm">
              No staff members registered in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full print:grid-cols-2 print:gap-4 print:p-0">
              {staffs.map((staff) => {
                const init = `${staff.firstName[0]}${staff.lastName?.[0] || ''}`;
                
                return cardLayout === 'vertical' ? (
                  /* Vertical portrait ID Badge layout */
                  <div
                    key={staff._id}
                    className="w-72 h-[410px] bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden relative flex flex-col justify-between font-sans text-slate-800 mx-auto print:shadow-none print:border print:m-0 break-inside-avoid"
                  >
                    {/* Header */}
                    <div
                      className="p-3 text-center text-white"
                      style={{ backgroundColor: cardThemeColor }}
                    >
                      <h4 className="font-extrabold text-[10px] tracking-wider truncate uppercase">{schoolName}</h4>
                      <p className="text-[7px] tracking-widest text-white/85">STAFF PASSPORT</p>
                    </div>

                    {/* Photo */}
                    <div className="flex flex-col items-center pt-4">
                      {staff.profileImage ? (
                        <img
                          src={staff.profileImage}
                          alt={staff.firstName}
                          className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-inner"
                        />
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-white font-extrabold text-2xl shadow-inner uppercase"
                          style={{ backgroundColor: `${cardThemeColor}20`, color: cardThemeColor }}
                        >
                          {init}
                        </div>
                      )}
                      <h3 className="font-extrabold text-sm text-slate-900 mt-2 truncate max-w-[220px] uppercase">
                        {staff.firstName} {staff.lastName || ''}
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">{getPositionLabel(staff.position)}</span>
                    </div>

                    {/* Details Table */}
                    <div className="px-4 py-2 space-y-1.5 text-[11px] font-semibold text-slate-650 flex-grow flex flex-col justify-center">
                      <div className="flex justify-between border-b pb-0.5 border-slate-100">
                        <span className="text-slate-400">Employee ID:</span>
                        <span className="text-slate-850 font-bold">{staff.employeeId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5 border-slate-100">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-slate-850 font-bold truncate max-w-[150px]">{staff.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5 border-slate-100">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-slate-850 font-bold">{staff.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5 border-slate-100">
                        <span className="text-slate-400">Joined Date:</span>
                        <span className="text-slate-850 font-bold">
                          {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Barcode / Footer */}
                    <div className="bg-slate-50 p-2.5 flex flex-col items-center justify-center border-t border-slate-100">
                      <div className="text-[10px] text-slate-500 font-bold tracking-tight mb-1 flex items-center justify-center gap-1">
                        <span>Office Phone:</span>
                        <span className="text-slate-800">{emergencyPhone}</span>
                      </div>
                      {/* Barcode graphic */}
                      <div className="h-6 w-44 flex items-center justify-between opacity-80 select-none">
                        {Array.from({ length: 24 }).map((_, bIdx) => (
                          <div
                            key={bIdx}
                            className="bg-black h-full"
                            style={{ width: `${(bIdx % 4 === 0 ? 3 : bIdx % 2 === 0 ? 1 : 2)}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Horizontal landscape ID Badge layout */
                  <div
                    key={staff._id}
                    className="w-96 h-60 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden relative flex flex-col justify-between font-sans text-slate-800 mx-auto print:shadow-none print:border print:m-0 break-inside-avoid"
                  >
                    {/* Header */}
                    <div
                      className="p-2.5 px-4 text-left text-white flex justify-between items-center"
                      style={{ backgroundColor: cardThemeColor }}
                    >
                      <h4 className="font-extrabold text-[10px] tracking-wider truncate uppercase w-2/3">{schoolName}</h4>
                      <span className="text-[7px] font-bold tracking-widest text-white/80 w-1/3 text-right">STAFF BADGE</span>
                    </div>

                    {/* Content (horizontal grid) */}
                    <div className="flex-grow flex p-4 gap-4 items-center">
                      {/* Photo Left */}
                      <div className="flex flex-col items-center">
                        {staff.profileImage ? (
                          <img
                            src={staff.profileImage}
                            alt={staff.firstName}
                            className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-inner"
                          />
                        ) : (
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-inner uppercase"
                            style={{ backgroundColor: `${cardThemeColor}20`, color: cardThemeColor }}
                          >
                            {init}
                          </div>
                        )}
                        <span className="text-[8px] font-extrabold text-slate-400 mt-1">ID: {staff.employeeId || 'N/A'}</span>
                      </div>

                      {/* Detail list Right */}
                      <div className="flex-grow space-y-1.5 text-[11px] font-semibold text-slate-655 flex flex-col justify-center">
                        <h3 className="font-extrabold text-sm text-slate-900 border-b pb-0.5 uppercase truncate max-w-[200px]">
                          {staff.firstName} {staff.lastName || ''}
                        </h3>
                        <div className="flex justify-between border-b pb-0.5 border-slate-50">
                          <span className="text-slate-455 text-[10px]">Position:</span>
                          <span className="text-slate-850 font-bold text-xs text-indigo-650">{getPositionLabel(staff.position)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-0.5 border-slate-50">
                          <span className="text-slate-455 text-[10px]">Office Contact:</span>
                          <span className="text-slate-850 font-bold">{staff.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-0.5 border-slate-50">
                          <span className="text-slate-455 text-[10px]">Joined Date:</span>
                          <span className="text-slate-850 font-bold">
                            {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 p-2 px-4 flex justify-between items-center border-t border-slate-100">
                      <div className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                        <span>Office Phone:</span>
                        <span className="text-slate-800">{emergencyPhone}</span>
                      </div>
                      {/* Barcode */}
                      <div className="h-4 w-28 flex items-center justify-between opacity-80 select-none">
                        {Array.from({ length: 18 }).map((_, bIdx) => (
                          <div
                            key={bIdx}
                            className="bg-black h-full"
                            style={{ width: `${(bIdx % 4 === 0 ? 2 : bIdx % 2 === 0 ? 1 : 1.5)}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
