import React from 'react';
import { School, BookOpenCheck, Globe } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const scenarios = [
    {
      quote:
        'Instead of spending two weeks tallying broadsheets by hand, teachers enter CA (40) and Exam (60) scores directly in their class portal while totals and grades calculate immediately.',
      title: 'Faster Terminal Result Compilation',
      subtitle: '800-Student Primary & Secondary School',
      focus: 'SMS & Report Engine',
      icon: School
    },
    {
      quote:
        'Schools running national subjects alongside Arabic and Tahfiz tracks manage everything in one portal—teachers record Quranic memorization notes right next to term scores.',
      title: 'Dual Western & Madrasah Tracking',
      subtitle: 'Combined Madrasah & College',
      focus: 'Madrasah & Tahfiz',
      icon: BookOpenCheck
    },
    {
      quote:
        'New parents find admissions dates and fee instructions on a clean mobile school site, while the school office issues numbered tuition receipts with accurate remaining balances.',
      title: 'Online Admissions & Numbered Receipts',
      subtitle: 'Growing Private Academy',
      focus: 'School Website & Fees',
      icon: Globe
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center max-w-2xl md:mx-auto mb-12 space-y-4">
          <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
            Sample School Workflows
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            How Schools Put NUSMADE to Work
          </h2>
          <p className="text-slate-600 text-base">
            Illustrative workflows showing how conventional schools and Madrasahs run classes, report sheets, and fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-purple-300 transition-colors flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                      {item.focus}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    “{item.quote}”
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-bold text-slate-900 text-base font-display">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[#6D28D9] font-semibold mt-1">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
