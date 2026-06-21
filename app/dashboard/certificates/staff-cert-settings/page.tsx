'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StaffCertificateSettingsPage() {
  const router = useRouter();

  // Settings state
  const [borderStyle, setBorderStyle] = useState<string>('solid');
  const [borderColor, setBorderColor] = useState<string>('#475569');
  const [headerTitle, setHeaderTitle] = useState<string>('SHIKKHADHARA ACADEMIA');
  const [headerSub, setHeaderSub] = useState<string>('Dhaka, Bangladesh | Registration No: 80942512');
  const [signatureLeft, setSignatureLeft] = useState<string>('Prepared By');
  const [signatureRight, setSignatureRight] = useState<string>('Authorized Signature');
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
            <span>Staff Certificate Settings</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Configure institutional branding templates and signing definitions for staff NOC and experience letters</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/certificates/staff-cert')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Generator</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Customization Panel</h3>
          
          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Border Style</label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="solid">Simple Solid Line</option>
                <option value="double">Classic Double Line</option>
                <option value="dashed">Modern Dashed Line</option>
                <option value="none">No Border / Plain Sheet</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Border Color</label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-full h-8 rounded-xl cursor-pointer p-0.5 border"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Header Title</label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Header Subtitle</label>
              <input
                type="text"
                value={headerSub}
                onChange={(e) => setHeaderSub(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Left Signature Label</label>
              <input
                type="text"
                value={signatureLeft}
                onChange={(e) => setSignatureLeft(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Right Signature Label</label>
              <input
                type="text"
                value={signatureRight}
                onChange={(e) => setSignatureRight(e.target.value)}
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
            <span>Letterhead Layout Preview Mockup</span>
          </div>

          {/* Letterhead Mockup Frame */}
          <div className="w-full aspect-[1.414/1] bg-white p-10 relative flex flex-col justify-between shadow-md border-slate-100 select-none font-serif text-slate-800 pointer-events-none"
            style={{
              borderStyle: borderStyle === 'none' ? 'none' : borderStyle,
              borderWidth: borderStyle === 'none' ? '0px' : borderStyle === 'double' ? '12px' : '2px',
              borderColor: borderColor,
            }}
          >
            {/* Header Section */}
            <div className="text-center space-y-1.5 border-b border-indigo-900/10 pb-2">
              <h2 className="text-xl font-extrabold tracking-widest text-indigo-900 uppercase">{headerTitle}</h2>
              <p className="text-[9px] uppercase font-sans font-bold tracking-widest text-slate-450">{headerSub}</p>
              <div className="h-[1px] bg-indigo-900/10 w-full my-0.5" />
            </div>

            {/* Letter Content Body */}
            <div className="py-4 space-y-2 text-[10px] leading-relaxed text-justify px-6 text-slate-500">
              <p className="text-right">Date: DD/MM/YYYY</p>
              <p className="font-bold text-xs text-slate-700 text-center font-sans tracking-wide">SUBJECT: TO WHOM IT MAY CONCERN</p>
              <p className="indent-4">This is a mock layout representing experience letter and NOC descriptions for staff and teachers.</p>
              <p>During their tenure, they have completed all academic projects and handled classes properly.</p>
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-end pt-8 text-[10px] font-sans font-semibold">
              <div className="text-center space-y-1 w-1/3">
                <p className="border-t border-slate-300 pt-1 text-slate-450">{signatureLeft}</p>
              </div>
              <div className="text-center space-y-1 w-1/3">
                {/* Spacer */}
              </div>
              <div className="text-center space-y-1.5 w-1/3">
                <p className="border-t border-slate-300 pt-1 text-slate-655 font-bold">{signatureRight}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
