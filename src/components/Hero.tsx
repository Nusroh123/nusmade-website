import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Layers,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  FileText,
  Bell,
  MessageSquare,
  X,
} from 'lucide-react';
import {
  formatDisplayNumeral,
  formatInputScore,
  getLocalizedGradeDetails,
  getMadrasahModeShortLabel,
  getMadrasahSubjectsPreset,
  parseScoreInput,
  type MadrasahGradingMode,
} from '../lib/madrasahGrading';
import { MadrasahGradingModal } from './MadrasahGradingPrompt';

interface SubjectScore {
  name: string;
  ca: number;
  exam: number;
}

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results' | 'fees'>('overview');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [showSmsPreview, setShowSmsPreview] = useState<boolean>(false);
  const [curriculumTrack, setCurriculumTrack] = useState<'conventional' | 'madrasah'>('conventional');
  const [madrasahMode, setMadrasahMode] = useState<MadrasahGradingMode>('both');
  const [showHeroMadrasahModal, setShowHeroMadrasahModal] = useState<boolean>(false);

  const [conventionalScores, setConventionalScores] = useState<SubjectScore[]>([
    { name: 'Mathematics', ca: 34, exam: 52 },
    { name: 'English Language', ca: 31, exam: 48 },
    { name: 'Basic Science', ca: 36, exam: 55 },
  ]);

  const [madrasahScores, setMadrasahScores] = useState<SubjectScore[]>([
    { name: 'القرآن الكريم · Quranic Tahfiz', ca: 38, exam: 56 },
    { name: 'النحو · Arabic Grammar', ca: 32, exam: 49 },
    { name: 'الفقه والحديث · Fiqh & Hadith', ca: 35, exam: 51 },
  ]);

  const activeSubjects = curriculumTrack === 'conventional' ? conventionalScores : madrasahScores;
  const isMadrasah = curriculumTrack === 'madrasah';

  const handleSelectHeroMadrasahMode = (mode: MadrasahGradingMode) => {
    setMadrasahMode(mode);
    setCurriculumTrack('madrasah');
    const presetSubjects = getMadrasahSubjectsPreset(mode).slice(0, 3);
    setMadrasahScores((prev) =>
      prev.map((row, idx) => ({
        ...row,
        name: presetSubjects[idx] ?? row.name,
      }))
    );
    setShowHeroMadrasahModal(false);
  };

  const updateScore = (idx: number, field: 'ca' | 'exam', rawStr: string) => {
    const max = field === 'ca' ? 40 : 60;
    const clamped = parseScoreInput(rawStr, max);
    if (curriculumTrack === 'conventional') {
      setConventionalScores((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [field]: clamped } : row))
      );
    } else {
      setMadrasahScores((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [field]: clamped } : row))
      );
    }
  };

  const getGradeInfo = (total: number) =>
    getLocalizedGradeDetails(total, curriculumTrack, madrasahMode);

  const averageScore = Math.round(
    activeSubjects.reduce((acc, s) => acc + s.ca + s.exam, 0) / activeSubjects.length
  );

  const feeCollected = currency === 'NGN' ? '₦44,250,000' : '$184,200';
  const feeTarget = currency === 'NGN' ? '₦50,000,000' : '$208,000';
  const bankTransferVal = currency === 'NGN' ? '₦28,320,000' : '$118,500';
  const onlineCardVal = currency === 'NGN' ? '₦15,930,000' : '$65,700';

  return (
    <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC]/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions (Left aligned at all viewports) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              For Conventional Schools &amp; Madrasahs
            </p>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] font-display">
              Run Attendance, Results, and Tuition in One School Portal.
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              <strong className="text-slate-900 font-semibold">NUSMADE</strong> gives school owners a dedicated Admin console, teachers a class-only roll call and 40/60 markbook, and every school a clear website.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <Link
                to="/book-demo"
                className="w-full sm:w-auto min-h-12 px-6 py-3 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2 group cursor-pointer text-base whitespace-nowrap"
              >
                <span>Book a Demo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/live-demo"
                className="w-full sm:w-auto min-h-12 px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer text-base hover:border-[#6D28D9] whitespace-nowrap"
              >
                <span>Try Sandbox Demo</span>
              </Link>
            </div>

            <div className="text-sm text-slate-600">
              Already registered your school?{' '}
              <Link
                to="/school"
                className="inline-flex items-center min-h-11 font-bold text-[#6D28D9] hover:underline"
              >
                Open Admin &amp; Teacher Staff Login &rarr;
              </Link>
            </div>

            {/* Proof Points */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0" />
                <span>School Websites</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0" />
                <span>Conventional &amp; Tahfiz</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0" />
                <span>40/60 Auto Report Cards</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive School Management Dashboard Preview */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Dashboard Title bar */}
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between gap-2 text-white border-b border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 pl-2 truncate">
                      Sample School Portal
                    </span>
                  </div>
                  <div className="inline-flex items-center bg-slate-800 rounded-xl p-1 text-sm font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setCurrency('NGN')}
                      className={`min-h-11 px-3 rounded-lg cursor-pointer transition-colors ${
                        currency === 'NGN' ? 'bg-[#6D28D9] text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      ₦ NGN
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`min-h-11 px-3 rounded-lg cursor-pointer transition-colors ${
                        currency === 'USD' ? 'bg-[#6D28D9] text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      $ USD
                    </button>
                  </div>
                </div>

                {/* Dashboard Inner Header */}
                <div className="bg-[#F8FAFC] p-4 sm:p-6 border-b border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-display">
                        Al-Hikmah Academy &amp; Madrasah
                      </h3>
                      <p className="text-sm text-slate-600">
                        Click a tab or edit CA and Exam scores inside Results.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-800">
                      Term 2 · 2026/27
                    </span>
                  </div>

                  {/* Interactive Tab Switcher (44px touch targets, wraps cleanly on 375px) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-1.5 rounded-xl border border-slate-200 text-sm font-semibold">
                    {(
                      [
                        { id: 'overview', label: 'Overview' },
                        { id: 'attendance', label: 'Attendance' },
                        { id: 'results', label: 'Results' },
                        { id: 'fees', label: 'Fees' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`min-h-11 px-3 rounded-lg transition-colors cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-[#6D28D9] text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dashboard Body */}
                <div className="p-4 sm:p-6 space-y-4 bg-white">
                  {/* 4 Illustrative KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-purple-900">Students</span>
                        <Users className="w-4 h-4 text-[#6D28D9]" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 font-display tabular-nums">
                        1,250
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-700">Staff</span>
                        <Briefcase className="w-4 h-4 text-slate-700" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 font-display tabular-nums">
                        85
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-700">Classes</span>
                        <Layers className="w-4 h-4 text-[#6D28D9]" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 font-display tabular-nums">
                        32
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-pink-50/70 border border-pink-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-pink-900">Roll Call</span>
                        <TrendingUp className="w-4 h-4 text-[#EC4899]" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 font-display tabular-nums">
                        94%
                      </div>
                    </div>
                  </div>

                  {/* Tab Views */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-slate-900">Term Tuition Collected</span>
                            <span className="text-emerald-700 font-bold tabular-nums">88.5%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-[#6D28D9] h-2 rounded-full" style={{ width: '88.5%' }} />
                          </div>
                          <div className="flex justify-between text-sm text-slate-600 tabular-nums">
                            <span>{feeCollected}</span>
                            <span>of {feeTarget}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-2">
                          <span className="text-sm font-bold text-slate-900 block">Try Interactive Tools</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveTab('results')}
                              className="min-h-11 px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-[#6D28D9] hover:border-purple-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <FileText className="w-4 h-4 text-[#6D28D9] shrink-0" />
                              <span>Marks</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowSmsPreview(!showSmsPreview)}
                              className="min-h-11 px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-[#EC4899] hover:border-pink-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Bell className="w-4 h-4 text-[#EC4899] shrink-0" />
                              <span>Notice</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {showSmsPreview ? (
                        <div className="border border-pink-200 rounded-xl p-4 bg-pink-50/50 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                              <MessageSquare className="w-4 h-4 text-[#EC4899]" />
                              <span>Parent Notice Preview</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowSmsPreview(false)}
                              className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-500 hover:bg-pink-100 cursor-pointer"
                              aria-label="Close parent notice preview"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-pink-100 leading-relaxed">
                            "Dear Parent, Term 2 report sheet for <strong>Amina Bello (JSS 2A)</strong> is ready. Attendance: 96%. Printed report card and receipt #9842 are available from the school office."
                          </p>
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 text-sm">
                          <div className="font-semibold text-slate-800">Sample Term Activity</div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100 gap-2">
                            <span className="text-slate-700">JSS 3 Mathematics exam scores saved</span>
                            <span className="text-slate-500 shrink-0 tabular-nums">10m ago</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100 gap-2">
                            <span className="text-slate-700">Primary 5 Arabic oral test scored</span>
                            <span className="text-slate-500 shrink-0 tabular-nums">24m ago</span>
                          </div>
                          <div className="flex items-center justify-between py-1 gap-2">
                            <span className="text-slate-700">Tuition receipt #9842 issued</span>
                            <span className="text-slate-500 shrink-0 tabular-nums">45m ago</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'attendance' && (
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-sm space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center font-bold text-slate-900 pb-2 border-b border-slate-200">
                        <span>Today&apos;s Roll Call by Section</span>
                        <span className="text-[#6D28D9] tabular-nums">94.0%</span>
                      </div>
                      <div className="space-y-2 tabular-nums">
                        <div className="flex justify-between text-slate-700">
                          <span>Primary 1 – 6 (12 Arms)</span>
                          <span className="font-semibold text-emerald-700">96.4% Present</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>JSS 1 – 3 (9 Arms)</span>
                          <span className="font-semibold text-emerald-700">94.8% Present</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>SSS 1 – 3 (8 Arms)</span>
                          <span className="font-semibold text-emerald-700">91.5% Present</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Tahfiz &amp; I&apos;dadi (3 Arms)</span>
                          <span className="font-semibold text-emerald-700">97.2% Present</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'results' && (
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-sm space-y-4 animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900 block">40/60 Score Calculator</span>
                          <span className="text-sm text-slate-600">Edit CA or Exam scores to see grades update</span>
                        </div>
                        <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 text-sm font-semibold">
                          <button
                            type="button"
                            onClick={() => setCurriculumTrack('conventional')}
                            className={`min-h-11 px-3 rounded-lg cursor-pointer ${
                              curriculumTrack === 'conventional' ? 'bg-[#6D28D9] text-white' : 'text-slate-600'
                            }`}
                          >
                            Conventional
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowHeroMadrasahModal(true)}
                            className={`min-h-11 px-3 rounded-lg cursor-pointer ${
                              curriculumTrack === 'madrasah' ? 'bg-[#6D28D9] text-white' : 'text-slate-600'
                            }`}
                          >
                            Madrasah
                          </button>
                        </div>
                      </div>

                      {isMadrasah && (
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-sm">
                          <span className="font-semibold text-slate-800">
                            Mode: <span className="text-[#6D28D9]">{getMadrasahModeShortLabel(madrasahMode)}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowHeroMadrasahModal(true)}
                            className="font-bold text-[#6D28D9] hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      )}

                      <div className="space-y-2">
                        {activeSubjects.map((sub, idx) => {
                          const total = sub.ca + sub.exam;
                          const info = getGradeInfo(total);
                          return (
                            <div
                              key={sub.name}
                              className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center bg-white p-3 rounded-xl border border-slate-200"
                            >
                              <div className="sm:col-span-5 flex items-center justify-between font-semibold text-slate-900">
                                <span>{sub.name}</span>
                                <span className="sm:hidden inline-flex items-center gap-2 tabular-nums">
                                  <span className="font-extrabold">
                                    {formatDisplayNumeral(total, isMadrasah, madrasahMode)}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded font-bold ${info.badge}`}>
                                    {info.grade}
                                  </span>
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 sm:contents">
                                <label className="sm:col-span-2 flex items-center gap-2">
                                  <span className="sm:hidden text-slate-600">CA</span>
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={40}
                                    aria-label={`${sub.name} CA score`}
                                    value={formatInputScore(sub.ca, isMadrasah, madrasahMode)}
                                    onChange={(e) => updateScore(idx, 'ca', e.target.value)}
                                    className="w-full min-h-11 px-2 text-center border border-slate-300 rounded-lg font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                                  />
                                </label>
                                <label className="sm:col-span-2 flex items-center gap-2">
                                  <span className="sm:hidden text-slate-600">Exam</span>
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={60}
                                    aria-label={`${sub.name} Exam score`}
                                    value={formatInputScore(sub.exam, isMadrasah, madrasahMode)}
                                    onChange={(e) => updateScore(idx, 'exam', e.target.value)}
                                    className="w-full min-h-11 px-2 text-center border border-slate-300 rounded-lg font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                                  />
                                </label>
                              </div>
                              <div className="hidden sm:flex sm:col-span-3 items-center justify-end gap-2 tabular-nums">
                                <span className="font-extrabold text-slate-900">
                                  {formatDisplayNumeral(total, isMadrasah, madrasahMode)}
                                </span>
                                <span className={`px-2 py-0.5 rounded font-bold ${info.badge}`}>
                                  {info.grade}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-sm tabular-nums">
                        <span className="text-slate-700">
                          Term Average:{' '}
                          <strong className="text-slate-900">
                            {formatDisplayNumeral(averageScore, isMadrasah, madrasahMode)}%
                          </strong>{' '}
                          ({getGradeInfo(averageScore).remark})
                        </span>
                        <span className="text-emerald-700 font-bold">Auto-Calculated</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'fees' && (
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-sm space-y-3 animate-fade-in tabular-nums">
                      <div className="flex justify-between items-center font-bold text-slate-900 pb-2 border-b border-slate-200">
                        <span>Term Tuition &amp; Bus Fees</span>
                        <span className="text-emerald-700">{feeCollected}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between p-3 bg-white rounded-xl border border-slate-200">
                          <span className="font-medium text-slate-800">Bank Transfer / POS</span>
                          <span className="text-slate-700 font-semibold">{bankTransferVal}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-white rounded-xl border border-slate-200">
                          <span className="font-medium text-slate-800">Card &amp; Cash</span>
                          <span className="text-slate-700 font-semibold">{onlineCardVal}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 text-sm text-slate-600">
                        <span>Pending balances: 142 students</span>
                        <Link to="/features" className="text-[#6D28D9] font-semibold hover:underline">
                          Fee features &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MadrasahGradingModal
        isOpen={showHeroMadrasahModal}
        currentMode={madrasahMode}
        onSelect={handleSelectHeroMadrasahMode}
        onClose={() => setShowHeroMadrasahModal(false)}
      />
    </section>
  );
};
