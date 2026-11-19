import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { PricingSection } from '../components/PricingSection';
import { Testimonials } from '../components/Testimonials';
import { Faq } from '../components/Faq';
import { CtaSection } from '../components/CtaSection';
import { Globe, Database, GraduationCap, ArrowRight, Check } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Solutions Preview Section */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left md:text-center max-w-3xl md:mx-auto mb-12 space-y-4">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              3 Core Solutions
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Three Core Tools for Daily School Work
            </h2>
            <p className="text-slate-600 text-base">
              Pick a public school website, the main School Management System, or digital learning add-ons built for conventional schools and Madrasahs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Solution 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs transition-colors flex flex-col justify-between gap-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider block mb-2">
                  Online Presence
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display mb-2">
                  School Website Development
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Give parents a clear school website using our ready-made templates or request a bespoke site built around your school colors.
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Admissions & online inquiry forms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Term calendar & school news</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Custom school domain & mobile layout</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/solutions#website-solution"
                className="w-full min-h-11 py-2.5 px-4 rounded-xl font-semibold text-sm text-slate-900 bg-white border border-slate-300 hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Website Options</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Solution 2 (Featured Primary) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#6D28D9] shadow-lg shadow-purple-100/50 flex flex-col justify-between gap-6 relative">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
                    <Database className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-sm font-bold text-[#EC4899] uppercase tracking-wider">
                    Core Hub
                  </span>
                </div>
                <span className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider block mb-2">
                  Daily Operations
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display mb-2">
                  School Management System (SMS)
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Manage student admissions, class-locked teacher logins, attendance roll calls, tuition fee receipts, and automatic CA + Exam report cards.
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Admin & class-scoped teacher portals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Auto-computed 40/60 terminal report cards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Tuition fee ledger & numbered receipts</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/solutions#sms-solution"
                className="w-full min-h-12 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Explore SMS Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Solution 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs transition-colors flex flex-col justify-between gap-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-sm font-bold text-[#EC4899] uppercase tracking-wider block mb-2">
                  Digital Classroom
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display mb-2">
                  Learning Management System (LMS)
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Optional modules configured during onboarding for study notes, homework submissions, CBT quizzes, and Tahfiz memorization milestones.
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Digital syllabus & study notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Computer-Based Tests (CBT) add-on</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Homework & Tahfiz milestone tracking</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/solutions#lms-solution"
                className="w-full min-h-11 py-2.5 px-4 rounded-xl font-semibold text-sm text-slate-900 bg-white border border-slate-300 hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore LMS Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose NUSMADE + Efficiency Estimator */}
      <WhyChooseUs />

      {/* Sample Use Cases / Stories */}
      <Testimonials />

      {/* Pricing & Interactive Quote Builder */}
      <PricingSection />

      {/* FAQs */}
      <Faq />

      {/* Call To Action */}
      <CtaSection />
    </div>
  );
};
