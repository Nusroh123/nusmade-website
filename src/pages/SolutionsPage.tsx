import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WebsiteTemplatePreviewer } from '../components/WebsiteTemplatePreviewer';
import { PricingSection } from '../components/PricingSection';
import { Globe, Database, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SolutionsPage: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash]);

  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F8FAFC] to-white py-16 lg:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              NUSMADE Product Suite
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Three Connected Tools for Websites, Records, and Learning.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Launch a public school website, run daily attendance, tuition receipts, and CA/Exam markbooks, or add digital lessons and CBT quizzes—all configured around your school structure.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Detailed Breakdown */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {/* Solution 1: School Website Development + Interactive Template Previewer */}
          <div id="website-solution" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center scroll-mt-24">
            <div className="lg:col-span-5 space-y-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Solution 01</span>
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                School Website Development
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Publish a clear public site for parents using ready-made templates or commission a bespoke school design.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Test our three ready-made template layouts on the right with your own school name.
              </p>

              <div className="space-y-4 pt-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">
                  Core Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Ready templates or bespoke design</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Online admissions inquiry form</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Academic calendar & news updates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Campus photos & facility highlights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Mobile-ready responsive layout</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Custom school domain & SSL</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/book-demo?plan=Starter+Plan"
                  className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-900 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors"
                >
                  <span>Request Website Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <WebsiteTemplatePreviewer />
            </div>
          </div>

          {/* Solution 2: School Management System (SMS) */}
          <div id="sms-solution" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-12 border-t border-slate-200 scroll-mt-24">
            <div className="lg:col-span-6 order-2 lg:order-1 bg-[#F8FAFC] border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold text-sm shrink-0">
                      SMS
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Academic & Admin Console</h4>
                      <p className="text-sm text-slate-500">Sample Term 2 Snapshot</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 shrink-0">Live Data</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">Student Enrollment</span>
                    <span className="font-bold text-[#6D28D9]">1,250 Active</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">Daily Attendance Roll Call</span>
                    <span className="font-bold text-emerald-600">94% Present</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">Tuition Fee Receipts</span>
                    <span className="font-bold text-slate-900">₦44,250,000 Logged</span>
                  </div>
                  <div className="p-4 rounded-xl bg-pink-50/70 border border-pink-100 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">CA (40) + Exam (60) Grading</span>
                    <span className="font-bold text-[#EC4899]">Instant Report Cards</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#EC4899] uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Solution 02 (Core System)</span>
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                School Management System (SMS)
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Separate Admin and Teacher logins give principals oversight of fees and records while teachers work strictly inside their assigned classes.
              </p>

              <div className="space-y-4 pt-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">
                  Included Modules
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Student enrollment & admission IDs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Teacher accounts & class locks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Date-keyed daily attendance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Western, Madrasah & Dual subjects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Tuition fee ledger & numbered receipts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <span>Printable terminal report cards</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/book-demo?plan=Growth+Suite"
                  className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm"
                >
                  <span>Schedule SMS Demonstration</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Solution 3: Learning Management System (LMS) */}
          <div id="lms-solution" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-12 border-t border-slate-200 scroll-mt-24">
            <div className="lg:col-span-6 space-y-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Solution 03</span>
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                Learning Management System (LMS)
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Extend classroom instruction with study notes, homework assignments, and Computer-Based Testing (CBT) add-ons configured during onboarding.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Teachers upload weekly notes, assign practice quizzes, and record Quranic memorization (Tahfiz) milestones alongside regular subject grades.
              </p>

              <div className="space-y-4 pt-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">
                  LMS Add-On Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Subject syllabuses & weekly modules</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>PDF notes, audio & video links</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Homework & assignment tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Online CBT tests & practice quizzes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Student progress summaries</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>Tahfiz Quran memorization logs</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/book-demo?plan=Growth+Suite"
                  className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-900 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors"
                >
                  <span>Request LMS Walkthrough</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#F8FAFC] border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-900 font-display">Student Study Module Preview</span>
                  <span className="text-sm font-bold text-[#6D28D9]">CBT Ready</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">Mathematics: Algebra</span>
                      <span className="text-sm text-emerald-600 font-bold shrink-0">Week 6</span>
                    </div>
                    <p className="text-sm text-slate-500">PDF study guide and 15 practice problems attached.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">Islamic Studies: Surah Al-Mulk</span>
                      <span className="text-sm text-[#EC4899] font-bold shrink-0">Tahfiz</span>
                    </div>
                    <p className="text-sm text-slate-500">Ayah 1 – 15 recitation check & Tajweed notes.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-purple-900">Mid-Term CBT Readiness</span>
                      <span className="font-bold text-[#6D28D9]">75% Prepared</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                      <div className="bg-[#6D28D9] h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Quote Builder */}
      <PricingSection />

      {/* Bottom Strip */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left md:text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Need a custom setup for multiple school sections?
          </h3>
          <p className="text-slate-600 text-base max-w-xl md:mx-auto">
            Book a walkthrough and we will map Website, SMS, and LMS modules directly to your classes and student count.
          </p>
          <div className="pt-2">
            <Link
              to="/book-demo"
              className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
