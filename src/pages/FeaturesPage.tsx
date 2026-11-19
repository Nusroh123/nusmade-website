import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CalendarCheck2,
  FileCheck2,
  Calculator,
  CreditCard,
  Laptop,
  MessageSquare,
  Globe2,
  BarChart3,
  Search,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const features = [
    {
      id: 'student-mgmt',
      title: 'Student Management',
      category: 'admin',
      categoryLabel: 'Administration',
      icon: Users,
      description:
        'Digital records for every enrolled learner including admission numbers, class placement, guardian contacts, and academic history.',
      highlight: 'Unique admission IDs & digital profiles',
      capabilities: [
        'Automated matriculation/admission number assignment',
        'Class and arm placement across Western & Madrasah tracks',
        'Guardian contact details stored privately for Admin',
        'Student status control (Active, Suspended, Graduated)'
      ]
    },
    {
      id: 'staff-mgmt',
      title: 'Staff Management',
      category: 'admin',
      categoryLabel: 'Administration',
      icon: Briefcase,
      description:
        'Register teaching staff by Google email, assign each teacher to a specific class and subject, and control active or paused access.',
      highlight: 'Class-scoped teacher permissions',
      capabilities: [
        'Form teacher and primary subject assignment per class',
        'Strict role separation (School Admin vs. Class Teacher)',
        'One-click teacher status control (Active / Suspended)',
        'Automatic student-to-teacher class filtering'
      ]
    },
    {
      id: 'attendance-tracking',
      title: 'Attendance Tracking',
      category: 'admin',
      categoryLabel: 'Administration',
      icon: CalendarCheck2,
      description:
        'Take roll call on phones, tablets, or computers. Mark Present, Late, or Absent by date with full term attendance percentages.',
      highlight: 'Date-keyed roll call & attendance rates',
      capabilities: [
        'Fast roll call with one-tap Mark Class Present',
        'Date-keyed attendance history across the term',
        'Attendance percentages included on terminal report cards',
        'Shared visibility for Admin and assigned Class Teacher'
      ]
    },
    {
      id: 'fee-mgmt',
      title: 'Fee Management',
      category: 'finance',
      categoryLabel: 'Finance & Fees',
      icon: CreditCard,
      description:
        'Record term tuition payments by Bank Transfer, Cash, or Card/POS, print numbered receipts, and monitor remaining balances inside the Admin ledger.',
      highlight: 'Numbered receipts & private admin ledger',
      capabilities: [
        'Per-student term fee setup and balance updates',
        'Support for Bank Transfer, Card/POS, and Cash logging',
        'Printable numbered school tuition receipts',
        'Hidden from Class Teacher logins for financial privacy'
      ]
    },
    {
      id: 'exam-mgmt',
      title: 'Examination Management',
      category: 'academic',
      categoryLabel: 'Academics & Exams',
      icon: FileCheck2,
      description:
        'Record Continuous Assessment (0–40) and Exam (0–60) marks across classes and subjects with automatic score range validation.',
      highlight: 'Weighted CA (40) + Exam (60) scoring',
      capabilities: [
        'Standard 40% Continuous Assessment + 60% Exam weighting',
        'Batch score saving per class and subject',
        'Live grade & remark updates as scores save',
        'Conventional and Madrasah / Tahfiz curriculum modes'
      ]
    },
    {
      id: 'auto-results',
      title: 'Automatic Result Calculation',
      category: 'academic',
      categoryLabel: 'Academics & Exams',
      icon: Calculator,
      description:
        'Generate clean terminal report cards in minutes. Subject totals, averages, grade letters, attendance %, and teacher remarks compute automatically.',
      highlight: 'Instant grade calculation & report sheets',
      capabilities: [
        'Automatic subject totals and overall term average',
        'Grade letter calculation (A1 through F9)',
        'Printable branded student terminal report cards',
        'Zero manual addition or transcription errors'
      ]
    },
    {
      id: 'online-learning',
      title: 'Online Learning & CBT Add-On',
      category: 'learning',
      categoryLabel: 'Online Learning',
      icon: Laptop,
      description:
        'Add digital study notes, assignments, and Computer-Based Tests (CBT) during Growth Suite or Custom school onboarding.',
      highlight: 'Included on Growth Suite & Custom plans',
      capabilities: [
        'Subject-organized study guides and resource links',
        'Timed online quizzes and CBT practice exams',
        'Assignment workflow tailored to your school classes',
        'Tahfiz Quran memorization notes in report cards'
      ]
    },
    {
      id: 'reports-analytics',
      title: 'Reports and Analytics',
      category: 'analytics',
      categoryLabel: 'Reports & Analytics',
      icon: BarChart3,
      description:
        'Monitor total enrollment, today’s attendance counts, tuition collected vs. outstanding balances, and class staffing status from Overview.',
      highlight: 'Live Admin overview & printouts',
      capabilities: [
        'Live student count and class staffing status',
        'Daily and cumulative attendance rates per student',
        'Real-time tuition expected, paid, and balance totals',
        'Print-ready report sheets and numbered receipts'
      ]
    },
    {
      id: 'parent-comm',
      title: 'Parent Records & Handouts',
      category: 'communication',
      categoryLabel: 'Communication',
      icon: MessageSquare,
      description:
        'Store guardian names and phone numbers privately in the Admin ledger and print clean terminal reports and tuition receipts for families.',
      highlight: 'Guardian directory & printable handouts',
      capabilities: [
        'Guardian contact directory reserved for Admin view',
        'Parent-ready terminal report card summaries',
        'Printable fee receipts showing remaining balance',
        'Optional bulk SMS notice setup during onboarding'
      ]
    },
    {
      id: 'website-mgmt',
      title: 'School Website Development',
      category: 'admin',
      categoryLabel: 'Administration',
      icon: Globe2,
      description:
        'Publish a mobile-ready public website from our ready-made templates or commission a bespoke site built for your school brand.',
      highlight: 'Ready templates or custom setup',
      capabilities: [
        '3 ready-made templates (Classic, Madrasah, Modern STEM)',
        'Custom school domain and mobile-friendly layout',
        'Admissions inquiry & walkthrough request forms',
        'Custom school branding and photo sections'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Features' },
    { id: 'admin', label: 'Administration' },
    { id: 'academic', label: 'Exams & Results' },
    { id: 'finance', label: 'Fees' },
    { id: 'learning', label: 'Online Learning' },
    { id: 'analytics', label: 'Reports' }
  ];

  const filteredFeatures = features.filter((feat) => {
    const matchesCategory = selectedCategory === 'all' || feat.category === selectedCategory;
    const matchesSearch =
      feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.highlight.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F8FAFC] to-white py-16 lg:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              Feature Directory
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Every Tool Inside the NUSMADE School Platform
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Review the exact tools for student enrollment, teacher class locks, attendance, tuition receipts, CA/Exam grading, and printable report cards.
            </p>
          </div>
        </div>
      </section>

      {/* Main Feature Grid & Filter Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-11 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#6D28D9] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-11 pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-6 sm:p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 hover:border-purple-300 transition-colors flex flex-col justify-between gap-6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-600">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-display mb-2">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>

                    <div className="space-y-2 border-t border-slate-200 pt-4">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Key Capabilities
                      </span>
                      {item.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-[#EC4899]">{item.highlight}</span>
                    <Link
                      to="/book-demo"
                      className="min-h-11 px-2 inline-flex items-center gap-1 font-bold text-[#6D28D9] hover:underline"
                    >
                      <span>Request Walkthrough</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-left sm:text-center p-8 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-4">
              <p className="text-slate-600 text-base">
                No features found matching “{searchQuery}”. Clear the search or switch back to all features.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="min-h-11 px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-sm font-bold cursor-pointer"
              >
                Reset Search & Filters
              </button>
            </div>
          )}

          {/* Bottom Callout */}
          <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-slate-900 font-display">
                Want to see CA + Exam calculation live?
              </h4>
              <p className="text-sm text-slate-600">
                Try entering scores inside our Sandbox Demo or schedule a live school walkthrough.
              </p>
            </div>
            <Link
              to="/book-demo"
              className="w-full sm:w-auto shrink-0 min-h-12 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm inline-flex items-center justify-center gap-2"
            >
              <span>Book a Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
