'use client';

import { useState } from 'react';
import { FileText, Sparkles, Printer, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuestionPaperPage() {
  const [selectedClass, setSelectedClass] = useState('8');
  const [subject, setSubject] = useState('General Mathematics');
  const [chapter, setChapter] = useState('Chapter 3: Algebraic Expressions');
  const [difficulty, setDifficulty] = useState('medium');
  const [generationMode, setGenerationMode] = useState<'ai' | 'manual'>('ai');
  const [totalMarks, setTotalMarks] = useState(50);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      // Mock generation of standard layout exam paper
      const mockQuestions = [
        { id: 1, type: 'mcq', question: 'Find the factors of algebraic formula x^2 - y^2.', options: ['(x-y)(x-y)', '(x+y)(x-y)', '(x+y)(x+y)', 'None of these'], marks: 2 },
        { id: 2, type: 'mcq', question: 'If a + b = 5 and ab = 6, find value of a^2 + b^2.', options: ['12', '13', '15', '25'], marks: 2 },
        { id: 3, type: 'creative', question: 'Explain in detail the geometrical proof of formula (a+b)^2.', subquestions: ['Define algebraic variables. (2 marks)', 'State formula for (a-b)^2. (3 marks)', 'Prove algebraically: a^3 - b^3 = (a-b)(a^2 + ab + b^2). (5 marks)'], marks: 10 },
        { id: 4, type: 'short', question: 'Simplify the mathematical expression: 5x + 3y - (2x - 4y) + 7.', marks: 6 }
      ];

      setGeneratedPaper({
        schoolName: 'SHIKKHADHARA ACADEMIA',
        examName: 'Annual Academic Terminal Evaluation',
        subject: subject,
        className: `Class ${selectedClass}`,
        timeAllowed: '2 Hours 30 Minutes',
        totalMarks: totalMarks,
        instructions: 'Read questions carefully. Figures in the right margins indicate full marks allocated to respective items.',
        questions: mockQuestions
      });

      setIsGenerating(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <FileText className="text-indigo-650" size={28} />
            <span>AI Question Paper Planner</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Generate printable student term exam question papers using chapter banks or AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:w-full">
        {/* Setup Parameters Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm print:hidden space-y-4 h-fit">
          <h3 className="font-bold text-slate-805 dark:text-slate-200 text-base border-b pb-2">Generation Rules</h3>
          
          <form onSubmit={handleGenerate} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Class Level</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-850 dark:text-slate-200"
              >
                {['6', '7', '8', '9', '10'].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chapter / Topic</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                >
                  <option value="easy">Easy (Conceptual)</option>
                  <option value="medium">Medium (Analytical)</option>
                  <option value="hard">Hard (Creative Application)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Generator Engine</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGenerationMode('ai')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    generationMode === 'ai' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-650' : 'bg-transparent text-slate-400'
                  }`}
                >
                  <Sparkles size={12} className="inline mr-1" /> AI Engine
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode('manual')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    generationMode === 'manual' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-650' : 'bg-transparent text-slate-400'
                  }`}
                >
                  Manual Bank
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Generating Exam Sheet...' : 'Generate Questions'}</span>
            </Button>
          </form>
        </div>

        {/* Display Generated PDF/Print Sheet */}
        <div className="lg:col-span-2 flex flex-col items-center print:w-full">
          {!generatedPaper ? (
            <div className="w-full bg-slate-50 dark:bg-slate-955/10 border border-dashed rounded-3xl p-16 text-center text-slate-400 font-semibold text-sm flex flex-col justify-center items-center gap-3 print:hidden">
              <FileText size={48} className="text-slate-300" />
              <span>Please configure academic subjects and chapters to generate a print-ready test sheet.</span>
            </div>
          ) : (
            <div className="w-full space-y-4 print:w-full">
              <div className="flex justify-end print:hidden">
                <Button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-2"
                >
                  <Printer size={16} />
                  <span>Print Exam Sheet</span>
                </Button>
              </div>

              {/* Printable Page */}
              <div className="w-full bg-white p-12 relative flex flex-col justify-between shadow-md print:shadow-none print:p-0 font-serif text-black min-h-[11in] select-text">
                {/* Header */}
                <div className="text-center space-y-1.5 border-b border-black pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-wider">{generatedPaper.schoolName}</h2>
                  <p className="text-sm font-sans font-bold tracking-tight text-slate-550">{generatedPaper.examName}</p>
                  <div className="flex justify-between text-xs font-sans font-bold pt-2 px-1">
                    <span>Subject: {generatedPaper.subject}</span>
                    <span>Level: {generatedPaper.className}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans font-bold px-1">
                    <span>Time Allowed: {generatedPaper.timeAllowed}</span>
                    <span>Total Marks: {generatedPaper.totalMarks}</span>
                  </div>
                </div>

                <div className="text-xs italic py-3 font-sans">
                  Instructions: {generatedPaper.instructions}
                </div>

                {/* Questions list */}
                <div className="space-y-6 flex-grow py-4">
                  {generatedPaper.questions.map((q: any, idx: number) => (
                    <div key={q.id} className="text-sm leading-relaxed space-y-1">
                      <div className="flex justify-between items-start font-bold">
                        <span className="w-6 shrink-0">{idx + 1}.</span>
                        <p className="flex-grow font-semibold">{q.question}</p>
                        <span className="w-12 text-right font-bold text-xs">[{q.marks}M]</span>
                      </div>

                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-2 gap-2 pl-6 font-sans text-xs pt-1.5">
                          {q.options.map((opt: string, oIdx: number) => (
                            <span key={oIdx}>({String.fromCharCode(97 + oIdx)}) {opt}</span>
                          ))}
                        </div>
                      )}

                      {q.type === 'creative' && q.subquestions && (
                        <div className="pl-6 space-y-1 pt-1 italic text-xs">
                          {q.subquestions.map((sub: string, sIdx: number) => (
                            <p key={sIdx}>({String.fromCharCode(97 + sIdx)}) {sub}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Page Footer */}
                <div className="border-t border-slate-200 pt-6 text-center text-[10px] font-sans text-slate-400 print:hidden flex justify-between items-center">
                  <span>System Generated Code: SHIKKHA-AI-8094</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
