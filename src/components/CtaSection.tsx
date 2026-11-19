import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, CheckCircle } from 'lucide-react';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left sm:text-center relative z-10 space-y-6">
        <p className="text-sm font-bold uppercase tracking-wider text-purple-200">
          Book a School Walkthrough
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white">
          See Your School&apos;s Subjects and Report Sheet Live
        </h2>

        <p className="text-slate-300 text-base max-w-2xl sm:mx-auto leading-relaxed">
          Share your class levels, grading weights, and whether you run conventional or Madrasah tracks. We will prepare a 30-minute walkthrough using your real subjects.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
          <Link
            to="/book-demo"
            className="w-full sm:w-auto min-h-12 px-8 py-3 rounded-xl font-bold text-base text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Book a Demo</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/contact"
            className="w-full sm:w-auto min-h-12 px-6 py-3 rounded-xl font-semibold text-base text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-[#EC4899]" />
            <span>Speak with an Advisor</span>
          </Link>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>30-day guided school trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Excel student roster import included</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Direct trainer onboarding (Mon – Sat)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
