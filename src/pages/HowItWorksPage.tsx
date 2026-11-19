import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Palette,
  SlidersHorizontal,
  Rocket,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Users2,
  Headphones
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Register Your School',
      phase: 'Day 1: Profile & Curriculum Setup',
      description:
        'Book a short walkthrough with our team. We configure your school profile, academic term, class arms, and grading preferences (Western, Madrasah, or Combined).',
      icon: ClipboardCheck,
      deliverables: [
        'School Admin Google account activated',
        'Term calendar & class arms configured',
        'Conventional & Madrasah subjects set'
      ]
    },
    {
      step: '02',
      title: 'Choose a Website Option',
      phase: 'Days 2 – 3: Public Website Setup',
      description:
        'Pick one of our ready-made school website templates or request a bespoke website built around your crest, admissions schedule, and campus photos.',
      icon: Palette,
      deliverables: [
        'Custom domain mapping (e.g. yourschool.edu)',
        'Online admissions inquiry forms',
        'Leadership welcome note & galleries'
      ]
    },
    {
      step: '03',
      title: 'Import Students & Assign Teachers',
      phase: 'Days 3 – 5: Spreadsheet Migration',
      description:
        'Send us your student and teacher lists in Excel or CSV. We upload your roster, map each teacher’s Google email to their assigned class, and configure tuition terms.',
      icon: SlidersHorizontal,
      deliverables: [
        'Free student & guardian Excel import',
        'Teacher-to-class & subject mapping',
        'Term tuition schedules configured'
      ]
    },
    {
      step: '04',
      title: 'Train Staff & Start Term Work',
      phase: 'Day 6 Onwards: Daily Operations',
      description:
        'Share the Teacher Portal login link with staff, run a hands-on training session, and start marking attendance, saving CA/Exam scores, and printing report cards and tuition receipts.',
      icon: Rocket,
      deliverables: [
        'Direct teacher login & 1-hour training',
        'Printable terminal report cards & receipts',
        'Mon – Sat phone & WhatsApp support'
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F8FAFC] to-white py-16 lg:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              3 to 7 Day Guided Setup
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              How a School Joins and Starts Using NUSMADE
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Our onboarding team handles spreadsheet imports, teacher role setup, and live training so your staff start cleanly without disrupting classes.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 Steps Timeline */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] text-white flex items-center justify-center shadow-sm shrink-0">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#EC4899] uppercase tracking-wider block">
                        Step {item.step} • {item.phase}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 font-display mt-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-slate-200 font-display hidden sm:block">
                    {item.step}
                  </span>
                </div>

                <p className="text-slate-600 text-base leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="border-t border-slate-200 pt-6">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-4">
                    What Happens During This Step
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {item.deliverables.map((deliv, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Direct Teacher Onboarding Guarantees */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC] border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left md:text-center max-w-2xl md:mx-auto mb-12 space-y-4">
            <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
              Direct Teacher Onboarding
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Hands-On Help for Principals and Teachers
            </h3>
            <p className="text-slate-600 text-base">
              We handle data preparation and live orientation so your staff start comfortably.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base font-display">Free Excel Data Migration</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Send us your student registers, guardian phone numbers, and staff emails in Excel. Our team checks and uploads everything for you.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="w-11 h-11 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center">
                <Users2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base font-display">Live Staff Training</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                We run practical training sessions with your teachers and office staff until everyone knows how to record attendance and exam scores.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base font-display">Direct Support Contact</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reach your assigned onboarding specialist by phone or WhatsApp Monday through Saturday, 8 AM – 6 PM.
              </p>
            </div>
          </div>

          <div className="mt-12 text-left md:text-center">
            <Link
              to="/book-demo"
              className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm"
            >
              <span>Schedule Your School Onboarding Call</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
