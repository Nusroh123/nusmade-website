import React from 'react';
import { Globe, Database, GraduationCap, Check, ArrowRight } from 'lucide-react';

interface SolutionsProps {
  onOpenDemo: () => void;
}

export const Solutions: React.FC<SolutionsProps> = ({ onOpenDemo }) => {
  const solutions = [
    {
      id: 'website',
      title: 'School Website Development',
      badge: 'Online Identity & Admissions',
      tagline: 'Launch a clear public site for parents and new applicants.',
      description:
        'Choose from ready-made school website templates or request a custom site matched to your school’s colors, admissions steps, and calendar.',
      icon: Globe,
      color: 'purple',
      popular: false,
      items: [
        'Choice of ready-to-launch templates or bespoke custom design',
        'Online student admissions & application form portal',
        'News, events calendar, and official school announcements',
        'Photo galleries, facilities showcase & principal’s desk',
        'Mobile-friendly responsive layout & custom domain setup',
        'Built-in search optimization and fast mobile loading'
      ],
      previewSnippet: 'Includes responsive portal + admissions form'
    },
    {
      id: 'sms',
      title: 'School Management System (SMS)',
      badge: 'Core Academic & Admin Hub',
      tagline: 'Run daily attendance, CA/Exam markbooks, and tuition receipts in one place.',
      description:
        'A role-separated admin and teacher portal that replaces paper attendance registers, hand-tallied broadsheets, and manual fee notebooks.',
      icon: Database,
      color: 'pink',
      popular: true,
      items: [
        'Student enrollment and academic records',
        'Teacher accounts & strict class-scoped permissions',
        'Date-keyed daily roll call & term attendance tracking',
        'Classes, curriculum mode, and subject configuration',
        'Termly school fees ledger & printable numbered receipts',
        'Guardian contact directory (hidden from teachers)',
        'CA (40) + Exam (60) markbook & automatic grading',
        'Printable terminal report cards & Tahfiz milestones'
      ],
      previewSnippet: 'Live attendance, fees, markbook & report cards'
    },
    {
      id: 'lms',
      title: 'Learning Management System (LMS)',
      badge: 'Digital Classroom Add-On',
      tagline: 'Share study materials and CBT practice quizzes between classes.',
      description:
        'Configured during Growth Suite or Custom onboarding so teachers can share curriculum materials, run CBT practice tests, and record study progress.',
      icon: GraduationCap,
      color: 'purple',
      popular: false,
      items: [
        'Organized courses, subjects, and weekly syllabus setup',
        'Digital study materials (PDFs, notes & audio links)',
        'Assignments & homework tracking configured per school',
        'Computer-Based Testing (CBT) & quiz add-on setup',
        'Student learning progress & terminal remark tracking',
        'Madrasah Quranic memorization (Tahfiz) milestone records'
      ],
      previewSnippet: 'Configured with Growth Suite & Custom onboarding'
    }
  ];

  return (
    <section id="solutions" className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center max-w-3xl md:mx-auto mb-12 space-y-4">
          <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
            Three Connected School Modules
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Our Solutions
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            From your public school website to daily attendance, grading, and e-learning, pick the exact modules your institution needs.
          </p>
        </div>

        {/* 3 Solutions Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            const isHighlight = sol.popular;

            return (
              <div
                key={sol.id}
                className={`relative flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 transition-colors border ${
                  isHighlight
                    ? 'border-[#6D28D9] shadow-xl shadow-purple-100/60 ring-1 ring-[#6D28D9]/20'
                    : 'border-slate-200 hover:border-purple-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        sol.color === 'pink'
                          ? 'bg-pink-100 text-[#EC4899]'
                          : 'bg-purple-100 text-[#6D28D9]'
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-sm font-bold text-[#6D28D9]">
                      {isHighlight ? 'Most Popular' : sol.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mb-2">
                    {sol.title}
                  </h3>

                  <p className="text-sm font-semibold text-[#6D28D9] mb-4">
                    {sol.tagline}
                  </p>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {sol.description}
                  </p>

                  <div className="border-t border-slate-100 pt-6 mb-8">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-4">
                      Included Capabilities
                    </span>
                    <ul className="space-y-2">
                      {sol.items.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenDemo}
                    className={`w-full min-h-12 py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isHighlight
                        ? 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-sm'
                        : 'bg-white border border-slate-300 hover:border-[#6D28D9] text-slate-900'
                    }`}
                  >
                    <span>
                      Request Demo for {sol.id === 'website' ? 'Websites' : sol.id === 'sms' ? 'SMS' : 'LMS'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-left sm:text-center text-sm text-slate-500 mt-2">
                    {sol.previewSnippet}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
