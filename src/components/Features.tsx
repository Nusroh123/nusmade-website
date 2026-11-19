import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  FileCheck2,
  Calculator,
  CreditCard,
  Laptop,
  MessageSquare,
  Globe2,
  BarChart3,
  Search,
  CheckCircle2
} from 'lucide-react';

export const Features: React.FC = () => {
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
        'Digital records for every enrolled learner. Store admission IDs, class placement, guardian contacts, and academic history in one place.',
      highlight: 'Unique admission IDs & digital profiles'
    },
    {
      id: 'teacher-mgmt',
      title: 'Teacher Management',
      category: 'admin',
      categoryLabel: 'Administration',
      icon: GraduationCap,
      description:
        'Create teacher profiles, assign each teacher to a specific class and subject, activate or pause access, and scope students automatically.',
      highlight: 'Class-scoped Google login & subject limits'
    },
    {
      id: 'attendance-tracking',
      title: 'Attendance Tracking',
      category: 'admin',
      categoryLabel: 'Administration',
      icon: CalendarCheck2,
      description:
        'Take roll call on any phone or computer. Mark Present, Late, or Absent by date and view cumulative term attendance percentages.',
      highlight: 'Date-keyed roll call & attendance rates'
    },
    {
      id: 'exam-mgmt',
      title: 'Examination Management',
      category: 'academic',
      categoryLabel: 'Academics',
      icon: FileCheck2,
      description:
        'Record Continuous Assessment (0–40) scores and Exam (0–60) scores per subject with instant validation against valid score ranges.',
      highlight: 'Weighted CA (40) + Exam (60) scoring'
    },
    {
      id: 'auto-results',
      title: 'Automatic Result Calculation',
      category: 'academic',
      categoryLabel: 'Academics',
      icon: Calculator,
      description:
        'Compute subject totals, averages, grade letters, attendance percentages, and teacher remarks into printable terminal report cards.',
      highlight: 'Instant grade letters & printable reports'
    },
    {
      id: 'fee-mgmt',
      title: 'Fee Management',
      category: 'finance',
      categoryLabel: 'Finance & Payments',
      icon: CreditCard,
      description:
        'Track term tuition fees, record Bank Transfer, Cash, or Card/POS payments, update outstanding balances, and print numbered receipts.',
      highlight: 'Numbered receipts & balance tracking'
    },
    {
      id: 'online-learning',
      title: 'Online Learning & CBT Add-On',
      category: 'learning',
      categoryLabel: 'E-Learning',
      icon: Laptop,
      description:
        'Optional study materials, assignments, and Computer-Based Tests (CBT) configured for your institution during Growth or Custom onboarding.',
      highlight: 'Included in Growth Suite & Custom plans'
    },
    {
      id: 'parent-comm',
      title: 'Parent Updates & Records',
      category: 'communication',
      categoryLabel: 'Communication',
      icon: MessageSquare,
      description:
        'Keep guardian contact details inside the Admin console and print clean terminal report cards and tuition receipts to share with parents.',
      highlight: 'Admin guardian directory & printable slips'
    },
    {
      id: 'website-mgmt',
      title: 'School Website Templates',
      category: 'admin',
      categoryLabel: 'Administration',
      icon: Globe2,
      description:
        'Launch a mobile-ready school website from our ready-made templates or request a bespoke site tailored to your school or Madrasah.',
      highlight: 'Ready templates or custom onboarding'
    },
    {
      id: 'reports-analytics',
      title: 'Reports and Analytics',
      category: 'academic',
      categoryLabel: 'Analytics',
      icon: BarChart3,
      description:
        'Monitor live school enrollment, daily attendance counts, tuition collected vs. outstanding totals, and class performance from Admin Overview.',
      highlight: 'Live overview counts & class breakdowns'
    }
  ];

  const categories = [
    { id: 'all', label: 'All 10 Features' },
    { id: 'admin', label: 'Administration' },
    { id: 'academic', label: 'Academics' },
    { id: 'finance', label: 'Fees' },
    { id: 'learning', label: 'Online Learning' },
    { id: 'communication', label: 'Parent Updates' }
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
    <section id="features" className="py-16 lg:py-24 bg-[#F8FAFC] border-y border-slate-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center max-w-3xl md:mx-auto mb-12 space-y-4">
          <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
            10 Core Modules
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Features Built for Daily School Work
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            Each tool handles a specific administrative job—keeping principals informed, teachers focused on their own class, and records ready to print.
          </p>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-11 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
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
              className="w-full min-h-11 pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-colors flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">
                      {item.categoryLabel}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0" />
                  <span>{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-left sm:text-center p-8 bg-white rounded-2xl border border-slate-200 mt-6 space-y-4">
            <p className="text-slate-600 text-base">
              No features match “{searchQuery}”. Clear the search or switch back to all 10 modules.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="min-h-11 px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-sm font-bold cursor-pointer"
            >
              Show All 10 Features
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
