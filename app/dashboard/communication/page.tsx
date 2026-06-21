'use client';

import { useState } from 'react';
import { MessageSquare, Send, Sparkles, RefreshCw, Layers, Award, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CommunicationHubPage() {
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [recipientGroup, setRecipientGroup] = useState('all_students');
  const [template, setTemplate] = useState('fees_due');
  const [customText, setCustomText] = useState('Dear parent, this is to inform you that the monthly tuition fees are now due. Please clear the payment as soon as possible.');
  
  const [smsBalance, setSmsBalance] = useState(4850);
  const [waBalance, setWaBalance] = useState(1200);

  const [logs, setLogs] = useState<any[]>([
    { id: '1', channel: 'SMS', recipient: 'All Class 8 Parents', message: 'Evaluation results for Math Quiz 1 are now published.', date: new Date().toLocaleDateString(), status: 'delivered' },
    { id: '2', channel: 'WhatsApp', recipient: 'All Teachers', message: 'Staff meeting scheduled for tomorrow at 2:00 PM in Conference Room.', date: new Date().toLocaleDateString(), status: 'delivered' }
  ]);

  const [sending, setSending] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    if (val === 'fees_due') {
      setCustomText('Dear parent, this is to inform you that the monthly tuition fees are now due. Please clear the payment as soon as possible.');
    } else if (val === 'attendance_absent') {
      setCustomText('Dear parent, your child was marked absent today without leave notification. Please contact the class teacher.');
    } else if (val === 'result_published') {
      setCustomText('Dear parent, the terminal exam results have been published online. Please check the student portal.');
    } else {
      setCustomText('');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText) return;
    setSending(true);

    setTimeout(() => {
      const newLog = {
        id: Date.now().toString(),
        channel: channel === 'sms' ? 'SMS' : 'WhatsApp',
        recipient: recipientGroup.replace('_', ' ').toUpperCase(),
        message: customText,
        date: new Date().toLocaleDateString(),
        status: 'delivered'
      };

      setLogs([newLog, ...logs]);
      if (channel === 'sms') setSmsBalance(smsBalance - 150);
      else setWaBalance(waBalance - 80);

      setSending(false);
      setAlertMsg('Broadcast messages dispatched successfully!');
      setTimeout(() => setAlertMsg(''), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <MessageSquare className="text-indigo-650" size={28} />
            <span>Communication Gateway</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Send bulk SMS notifications and WhatsApp circular alerts to students, parents, and teachers.</p>
        </div>
      </div>

      {alertMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold">
          {alertMsg}
        </div>
      )}

      {/* Gateway Balance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">SMS Gateway Credits Available</p>
            <p className="text-2xl font-extrabold text-slate-850 dark:text-white mt-1">{smsBalance} SMS</p>
          </div>
          <span className="text-xs font-extrabold bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-xl">SMS Active</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">WhatsApp Business Api Credits</p>
            <p className="text-2xl font-extrabold text-slate-850 dark:text-white mt-1">{waBalance} Sessions</p>
          </div>
          <span className="text-xs font-extrabold bg-green-500/10 text-green-500 px-3 py-1.5 rounded-xl">API Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Broadcast Message</h3>
          
          <form onSubmit={handleSend} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Channel</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                    channel === 'sms' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-650' : 'bg-transparent text-slate-455'
                  }`}
                >
                  SMS Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                    channel === 'whatsapp' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-650' : 'bg-transparent text-slate-455'
                  }`}
                >
                  WhatsApp Api
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Group</label>
                <select
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none"
                >
                  <option value="all_students">All Students/Parents</option>
                  <option value="all_teachers">All Teachers</option>
                  <option value="class_8">Class 8 Parents</option>
                  <option value="class_9">Class 9 Parents</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Predefined Templates</label>
                <select
                  value={template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none"
                >
                  <option value="fees_due">Fees Outstanding Alert</option>
                  <option value="attendance_absent">Student Absent Notice</option>
                  <option value="result_published">Exam Result Online</option>
                  <option value="custom">Custom Empty Template</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message Body</label>
              <textarea
                placeholder="Write your custom broadcast notification details..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl outline-none h-24 text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm animate-in fade-in"
            >
              <Send size={15} />
              <span>{sending ? 'Dispatching broadcast...' : 'Send Broadcast'}</span>
            </Button>
          </form>
        </div>

        {/* History Table Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base border-b pb-2 mb-4">Message Log History</h3>
          
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="p-4 border dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-955/20 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-extrabold px-2.5 py-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-slate-600 uppercase tracking-wider">
                      {log.channel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 ml-2">To: {log.recipient}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{log.date}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{log.message}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.2 rounded-lg">Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
