'use client';

import { useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle2, AlertCircle, Upload, RefreshCw, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ImportPageContent() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const headers = [
      'admissionNo', 'admissionDate', 'rollNumber', 'class', 'section',
      'firstName', 'lastName', 'gender', 'dateOfBirth', 'bloodGroup',
      'religion', 'mobileNumber', 'email', 'nidNo',
      'height', 'weight', 'address', 'city', 'state', 'pincode',
      'fatherName', 'fatherPhone', 'fatherOccupation', 'motherName', 'motherPhone',
      'motherOccupation', 'guardianName', 'relationWithStudent', 'guardianPhone',
      'guardianEmail', 'guardianOccupation', 'guardianAddress', 'fatherNidNo', 'motherNidNo'
    ];
    const sampleRow = [
      '2026001', '2026-06-21', '01', '1', 'A',
      'John', 'Doe', 'male', '2015-05-15', 'O+',
      'Islam', '01712345678', 'john.doe@example.com', '1234567890',
      '120', '35', '123 Dhaka Road', 'Dhaka', 'Dhaka', '1200',
      'Robert Doe', '01712345679', 'Business', 'Mary Doe', '01712345680', 'Homemaker',
      'Robert Doe', 'Father', '01712345679', 'robert@example.com', 'Business', '123 Dhaka Road', '1234567891', '1234567892'
    ];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportSuccess('');
    setImportError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setImportError('CSV file must contain a header row and at least one student row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const list: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const studentObj: any = {};

          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              if (['height', 'weight', 'discountPercentage'].includes(header)) {
                studentObj[header] = parseFloat(values[index]) || 0;
              } else if (header === 'isSpecialChild') {
                studentObj[header] = values[index].toLowerCase() === 'true';
              } else {
                studentObj[header] = values[index];
              }
            }
          });

          // Validation
          if (!studentObj.firstName) {
            setImportError(`Row ${i + 1} is missing the required 'firstName' field`);
            return;
          }
          if (!studentObj.class) {
            setImportError(`Row ${i + 1} is missing the required 'class' field`);
            return;
          }

          list.push(studentObj);
        }

        setParsedStudents(list);
      } catch (err) {
        setImportError('Failed to parse CSV file. Ensure correct comma-separated format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedStudents.length === 0) {
      setImportError('No student data loaded to import');
      return;
    }

    setImporting(true);
    setImportSuccess('');
    setImportError('');

    try {
      const response = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students: parsedStudents }),
      });

      if (response.ok) {
        const data = await response.json();
        setImportSuccess(data.message || `Successfully imported ${data.count} students!`);
        setParsedStudents([]);
        setImportFile(null);
      } else {
        const data = await response.json();
        setImportError(data.message || 'Bulk import failed');
      }
    } catch (err) {
      setImportError('Connection to server failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-955 dark:text-white tracking-tight flex items-center space-x-2">
            <FileText className="text-indigo-600" size={28} />
            <span>Student Bulk Import</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Import multiple students concurrently using a standardized comma-separated CSV list
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-200">
        {importSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl flex items-center space-x-2 text-sm font-semibold">
            <CheckCircle2 size={18} className="text-emerald-550 mr-1" />
            <span>{importSuccess}</span>
          </div>
        )}

        {importError && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2 text-sm font-semibold">
            <AlertCircle size={18} className="text-red-500 mr-1" />
            <span>{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step Card / Instructions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-655 dark:text-indigo-400 px-2 py-0.5 text-xs rounded-full">Step 1</span>
                Download Template
              </h2>
              <p className="text-xs text-slate-500">Download the default CSV layout before filling in student records. Do not change headers.</p>
              <Button
                onClick={downloadTemplate}
                type="button"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <FileText size={16} />
                <span>Download CSV Template</span>
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-655 dark:text-indigo-400 px-2 py-0.5 text-xs rounded-full">Step 2</span>
                Upload Populated CSV
              </h2>
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div className="border border-dashed border-gray-300 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-955/20 text-center relative hover:bg-slate-100/30 transition-colors">
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-455 hover:text-indigo-550 transition-colors">
                    <Upload className="mb-2 text-indigo-550" size={28} />
                    <span className="text-xs font-bold">{importFile ? importFile.name : 'Choose CSV File'}</span>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                
                {parsedStudents.length > 0 && (
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Parsed {parsedStudents.length} students successfully</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={importing || parsedStudents.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <UserCheck size={18} />
                  )}
                  <span>Process Import</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Parsed list preview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base">Import Preview</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Below is a list of students parsed from your uploaded file.</p>
                </div>
                <span className="text-xs font-bold text-indigo-655 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-3 py-1 rounded-full">
                  {parsedStudents.length} Row(s)
                </span>
              </div>

              {parsedStudents.length === 0 ? (
                <div className="text-center py-24 text-slate-400 italic">
                  No data loaded. Select a template-based CSV file to review contents here.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl max-h-[450px]">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 dark:bg-slate-850/50 sticky top-0">
                      <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                        <th className="px-4 py-3 text-left">Admission No</th>
                        <th className="px-4 py-3 text-left">First Name</th>
                        <th className="px-4 py-3 text-left">Last Name</th>
                        <th className="px-4 py-3 text-left">Class</th>
                        <th className="px-4 py-3 text-left">Section</th>
                        <th className="px-4 py-3 text-left">Gender</th>
                        <th className="px-4 py-3 text-left">NID No</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedStudents.map((student, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-500">{student.admissionNo || 'N/A'}</td>
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{student.firstName}</td>
                          <td className="px-4 py-3 font-semibold text-slate-650">{student.lastName || ''}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                              Class {student.class}
                            </span>
                          </td>
                          <td className="px-4 py-3">{student.section || 'N/A'}</td>
                          <td className="px-4 py-3 capitalize">{student.gender || 'N/A'}</td>
                          <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">{student.nidNo || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentImportPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading bulk import page...</div>}>
      <ImportPageContent />
    </Suspense>
  );
}
