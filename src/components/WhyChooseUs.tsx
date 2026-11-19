import React, { useState } from 'react';
import {
  Smile,
  Smartphone,
  BookMarked,
  Network,
  FileSpreadsheet,
  Layers,
  Headphones,
  Calculator
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const [studentCountSlider, setStudentCountSlider] = useState<number>(650);

  const hoursSavedPerTerm = Math.round(studentCountSlider * 0.45);
  const paperSheetsSaved = studentCountSlider * 24;

  const reasons = [
    {
      title: 'Fast Staff Setup',
      desc: 'Teachers and bursars learn daily attendance, 40/60 markbooks, and receipt printing within one hour of guided orientation.',
      icon: Smile,
      tag: '1-Hour Training'
    },
    {
      title: 'Phone & Laptop Ready',
      desc: 'Take class roll call from a smartphone in the classroom or record term fees and print receipts from the front office computer.',
      icon: Smartphone,
      tag: 'Works on Any Screen'
    },
    {
      title: 'Western & Madrasah Tracks',
      desc: 'Track standard primary and secondary subjects alongside Islamic Studies, Arabic grading, and Quranic memorization (Tahfiz).',
      icon: BookMarked,
      tag: 'Dual Curriculum'
    },
    {
      title: 'All School Sections Combined',
      desc: 'Run Nursery, Primary, Secondary, and Madrasah arms in one admin console while keeping each teacher locked to their assigned class.',
      icon: Network,
      tag: 'Role Separated'
    },
    {
      title: 'Printable Reports & Receipts',
      desc: 'Generate clean terminal report cards with CA and Exam totals, plus numbered tuition receipts ready to print or hand to parents.',
      icon: FileSpreadsheet,
      tag: 'Instant Printouts'
    },
    {
      title: 'Templates or Custom Sites',
      desc: 'Launch with a ready-made school website template in days or commission a custom-built website matched to your school brand.',
      icon: Layers,
      tag: 'Website Included'
    },
    {
      title: 'Direct Support Team',
      desc: 'Get spreadsheet import help, staff onboarding sessions, and phone or WhatsApp assistance Monday through Saturday, 8 AM to 6 PM.',
      icon: Headphones,
      tag: 'Mon – Sat Support'
    }
  ];

  return (
    <section id="why-us" className="py-16 lg:py-24 bg-[#F8FAFC] border-y border-slate-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left md:text-center max-w-3xl md:mx-auto mb-12 space-y-4">
          <p className="text-sm font-bold uppercase tracking-wider text-[#6D28D9]">
            Built for Daily School Operations
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Why School Owners Switch to NUSMADE
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            Practical tools built around how private schools and Madrasahs actually run attendance, CA/Exam grading, and termly fee collection.
          </p>
        </div>

        {/* 7 Reasons + Efficiency Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-colors flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-sm font-semibold text-[#6D28D9]">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Interactive Calculator Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#5B21B6] text-white shadow-lg md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                  <Calculator className="w-4 h-4 text-pink-300" />
                  <span>Term Time & Paper Estimator</span>
                </span>
                <span className="text-sm text-purple-200 font-semibold">For School Owners</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
                Estimate Hours & Paper Saved Each Term
              </h3>
              <p className="text-purple-100 text-sm mb-6">
                Move the slider to your student count to preview administrative hours and printed sheets avoided per term:
              </p>

              {/* Slider */}
              <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-6">
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <label htmlFor="why-us-students">Enrolled Students</label>
                  <span className="text-base font-extrabold text-pink-200 font-display">
                    {studentCountSlider.toLocaleString()} Students
                  </span>
                </div>
                <div className="min-h-11 flex items-center">
                  <input
                    id="why-us-students"
                    type="range"
                    min="100"
                    max="2500"
                    step="50"
                    value={studentCountSlider}
                    onChange={(e) => setStudentCountSlider(Number(e.target.value))}
                    className="w-full h-2.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#EC4899]"
                  />
                </div>
                <div className="flex justify-between text-sm text-purple-200 mt-1">
                  <span>100</span>
                  <span>1,250</span>
                  <span>2,500+</span>
                </div>
              </div>

              {/* 3 Metric Calculations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/15">
                  <div className="text-2xl font-extrabold text-pink-200 font-display">
                    ~{hoursSavedPerTerm} hrs
                  </div>
                  <div className="text-sm text-purple-100 mt-1">Staff hours saved per term</div>
                </div>

                <div className="bg-white/10 p-4 rounded-xl border border-white/15">
                  <div className="text-2xl font-extrabold text-pink-200 font-display">
                    {paperSheetsSaved.toLocaleString()}+
                  </div>
                  <div className="text-sm text-purple-100 mt-1">Paper sheets avoided</div>
                </div>

                <div className="bg-white/10 p-4 rounded-xl border border-white/15">
                  <div className="text-2xl font-extrabold text-pink-200 font-display">
                    {studentCountSlider.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-100 mt-1">Report cards auto-computed</div>
                </div>
              </div>

              <p className="text-sm text-purple-200 mt-4">
                Based on ~27 minutes saved per student across roll calls, CA/Exam tallying, and receipt writing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
