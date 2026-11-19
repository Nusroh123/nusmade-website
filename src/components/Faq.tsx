import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can NUSMADE handle Madrasah curricula with Arabic and Islamic Studies?',
      a: 'Yes. Schools can switch between Western, Madrasah, or Combined Dual Curriculum modes. Teachers can grade Arabic subjects and record Quranic memorization (Tahfiz) progress alongside standard subjects.'
    },
    {
      q: 'How long does it take to onboard our school and staff?',
      a: 'Most schools go live in 3 to 7 business days. Our team imports your existing student and class lists from spreadsheets, configures subjects, and trains teachers on how to log in and record scores.'
    },
    {
      q: 'Do our teachers need advanced computer skills?',
      a: 'No. Teachers sign in with Google, immediately see only their assigned class, mark Present/Late/Absent with one tap, and enter CA (0–40) and Exam (0–60) scores from any phone or computer.'
    },
    {
      q: 'How does tuition fee tracking and receipt generation work?',
      a: 'Only your School Administrator or bursar can open the Tuition Fees tab. You record Bank Transfer, Card/POS, or Cash payments against a student’s term fee, balances update immediately, and a numbered receipt opens ready to print.'
    },
    {
      q: 'Can we get a custom website designed for our school, or only templates?',
      a: 'Both options are available. You can launch quickly with one of our ready-made school website templates or request a bespoke website tailored to your school’s branding and admissions workflow.'
    },
    {
      q: 'How is student and financial data separated between Admin and Teachers?',
      a: 'Your live portal runs on Google Cloud Firestore with role-based security rules. Only the School Administrator can view fee ledgers and guardian contact numbers; teachers are restricted strictly to students in their assigned class.'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 lg:py-24 bg-white border-t border-slate-200/60 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center mb-12 space-y-4">
          <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
            Common Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base">
            Clear answers on onboarding, teacher access, fee receipts, and school security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-purple-200 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full min-h-12 py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]"
                >
                  <span className="font-display">{faq.q}</span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-purple-100 text-[#6D28D9]' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
