import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users2,
  BookOpenCheck,
  Compass,
  Target,
  Eye,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const values = [
    {
      title: 'Built for Everyday Speed',
      desc: 'Teachers and bursars spend minutes—not weekends—taking roll call, entering CA/Exam marks, and issuing fee receipts.',
      icon: Award
    },
    {
      title: 'Western & Madrasah Support',
      desc: 'Equal support for national curricula and Madrasah Arabic, Fiqh, and Quranic memorization (Tahfiz) assessments.',
      icon: Compass
    },
    {
      title: 'Role-Separated Privacy',
      desc: 'Only school administrators see guardian phone numbers and fee ledgers; teachers see only students in their assigned class.',
      icon: ShieldCheck
    },
    {
      title: 'Hands-On Onboarding',
      desc: 'Our team imports your spreadsheet student lists, configures subjects, trains teachers, and stays reachable Mon – Sat.',
      icon: HeartHandshake
    }
  ];

  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F8FAFC] to-white py-16 lg:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              About NUSMADE
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Practical School Software Built for Real Classrooms.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              NUSMADE helps conventional schools and Madrasahs replace paper attendance registers, hand-tallied broadsheets, and manual fee notebooks with one organized portal.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Narrative */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-slate-700 text-base leading-relaxed">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                Replacing End-of-Term Paperwork With Clear Records
              </h2>
              <p>
                Across primary, secondary, and Madrasah schools, staff spend dozens of hours every term copying CA scores into paper broadsheets, calculating percentages by hand, and writing tuition receipts in duplicate books.
              </p>
              <p>
                <strong className="text-slate-900">NUSMADE</strong> brings your public school website, student enrollment, daily attendance, CA (40) + Exam (60) markbook, and tuition ledger into one place—with strict role separation between school administrators and class teachers.
              </p>
              <p>
                Whether your institution runs national subjects, an Arabic and Tahfiz curriculum, or both combined, you can switch curriculum modes and grade schemes without juggling separate tools.
              </p>

              <div className="pt-2">
                <Link
                  to="/book-demo"
                  className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm"
                >
                  <span>Book a School Walkthrough</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F8FAFC] p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 font-display border-b border-slate-200 pb-4">
                Who Uses NUSMADE
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">School Owners & Proprietors</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Live fee collection vs. outstanding totals, enrollment counts, and numbered receipts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center shrink-0">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">School Administrators</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Student admission records, teacher class assignments, and printable terminal report cards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                    <BookOpenCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Class Teachers</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Focused class workspace to mark daily attendance and save CA (40) + Exam (60) scores.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Conventional Schools & Madrasahs</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Western, Arabic, and Tahfiz memorization subjects managed side by side.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC] border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
                <Target className="w-6 h-6 stroke-[2.2]" />
              </div>
              <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">Our Mission</p>
              <h3 className="text-2xl font-extrabold text-slate-900 font-display">
                Give Every School Reliable Digital Records
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Provide conventional schools and Madrasahs with clear, role-separated tools that save staff hours, prevent lost fee and exam records, and produce accurate reports for parents.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#EC4899] flex items-center justify-center">
                <Eye className="w-6 h-6 stroke-[2.2]" />
              </div>
              <p className="text-sm font-bold text-[#EC4899] uppercase tracking-wider">Our Vision</p>
              <h3 className="text-2xl font-extrabold text-slate-900 font-display">
                Dependable Software for Community & Private Schools
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Make complete admissions, attendance, markbook, and fee-receipt software straightforward enough for any school team—from growing local academies to multi-arm Madrasahs—to run from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left md:text-center max-w-3xl md:mx-auto mb-12 space-y-4">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              How We Work
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Our Core Principles
            </h2>
            <p className="text-slate-600 text-base">
              What guides how we design screens and support school teams every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-purple-300 transition-colors space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {v.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner */}
          <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-purple-200 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-slate-900 font-display">
                Want to test NUSMADE with sample data first?
              </h4>
              <p className="text-sm text-slate-600">
                Try the Sandbox Demo right now or book a walkthrough for your own school.
              </p>
            </div>
            <Link
              to="/live-demo"
              className="w-full sm:w-auto shrink-0 min-h-12 px-6 py-3 rounded-xl font-bold text-sm text-slate-900 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors flex items-center justify-center gap-2"
            >
              <span>Open Sandbox Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
