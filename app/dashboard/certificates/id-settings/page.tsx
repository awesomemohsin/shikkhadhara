'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IDCardSettingsPage() {
  const router = useRouter();

  // Settings states
  const [cardThemeColor, setCardThemeColor] = useState('#3b82f6');
  const [cardLayout, setCardLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [schoolName, setSchoolName] = useState('SHIKKHADHARA ACADEMIA');
  const [emergencyPhone, setEmergencyPhone] = useState('+880 1712-345678');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Settings className="text-indigo-600" size={28} />
            <span>ID Card Settings</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Configure default dimensions, color themes, and card layouts for Student and Staff ID Badges</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/certificates/student-id')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to ID Cards</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Customization Panel</h3>
          
          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Default Card Orientation</label>
              <select
                value={cardLayout}
                onChange={(e) => setCardLayout(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="vertical">Vertical Portrait Layout</option>
                <option value="horizontal">Horizontal Landscape Layout</option>
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
              type="submit"
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5"
            >
              <Save size={16} />
              <span>{saved ? 'Settings Saved!' : 'Save Settings'}</span>
            </Button>
          </form>
        </div>

        {/* Real-time Preview Area */}
        <div className="lg:col-span-2 flex flex-col items-center space-y-4">
          <div className="flex items-center gap-1.5 self-start text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Eye size={14} />
            <span>ID Badge Live Layout Preview</span>
          </div>

          {/* ID Card Mockup Frame */}
          {cardLayout === 'vertical' ? (
            /* Vertical portrait mockup */
            <div className="w-56 h-80 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden relative flex flex-col justify-between font-sans text-slate-800 pointer-events-none">
              {/* Header */}
              <div className="p-2 text-center text-white" style={{ backgroundColor: cardThemeColor }}>
                <h4 className="font-extrabold text-[8px] tracking-wider truncate uppercase">{schoolName}</h4>
                <p className="text-[6px] tracking-widest text-white/80">IDENTITY CARD</p>
              </div>

              {/* Photo */}
              <div className="flex flex-col items-center pt-2.5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-inner uppercase"
                  style={{ backgroundColor: `${cardThemeColor}20`, color: cardThemeColor }}
                >
                  JD
                </div>
                <h3 className="font-extrabold text-xs text-slate-900 mt-1.5 uppercase">John Doe</h3>
                <span className="text-[8px] font-bold text-slate-400">STUDENT</span>
              </div>

              {/* Details */}
              <div className="px-3 py-1 space-y-1 text-[9px] font-semibold text-slate-500 flex-grow flex flex-col justify-center">
                <div className="flex justify-between border-b pb-0.5 border-slate-50">
                  <span>Roll No:</span>
                  <span className="text-slate-850 font-bold">101</span>
                </div>
                <div className="flex justify-between border-b pb-0.5 border-slate-50">
                  <span>Class:</span>
                  <span className="text-slate-850 font-bold">Class 10</span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-2 flex flex-col items-center justify-center border-t border-slate-100">
                <div className="text-[8px] text-slate-500 font-bold tracking-tight mb-1 flex items-center justify-center gap-1">
                  <span>Emergency:</span>
                  <span className="text-slate-800">{emergencyPhone}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Horizontal landscape mockup */
            <div className="w-80 h-48 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden relative flex flex-col justify-between font-sans text-slate-800 pointer-events-none">
              {/* Header */}
              <div className="p-2 px-3 text-left text-white flex justify-between items-center" style={{ backgroundColor: cardThemeColor }}>
                <h4 className="font-extrabold text-[8px] tracking-wider truncate uppercase w-2/3">{schoolName}</h4>
                <span className="text-[6px] font-bold tracking-widest text-white/80 w-1/3 text-right">BADGE</span>
              </div>

              {/* Content */}
              <div className="flex-grow flex p-3 gap-3 items-center">
                {/* Photo Left */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-inner uppercase"
                    style={{ backgroundColor: `${cardThemeColor}20`, color: cardThemeColor }}
                  >
                    JD
                  </div>
                </div>

                {/* Detail list Right */}
                <div className="flex-grow space-y-1 text-[9px] font-semibold text-slate-500 flex flex-col justify-center">
                  <h3 className="font-extrabold text-xs text-slate-900 border-b pb-0.5 uppercase">John Doe</h3>
                  <div className="flex justify-between border-b pb-0.5 border-slate-50">
                    <span>Class:</span>
                    <span className="text-slate-850 font-bold">Class 10</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-1.5 px-3 flex justify-between items-center border-t border-slate-100">
                <div className="text-[8px] text-slate-500 font-bold flex items-center gap-1">
                  <span>Emergency:</span>
                  <span className="text-slate-800">{emergencyPhone}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
