import React from 'react';
import { 
  ClipboardCheck, 
  Palette, 
  SlidersHorizontal, 
  Rocket, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface HowItWorksProps {
  onOpenDemo: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenDemo }) => {
  const steps = [
    {
      step: '01',
      title: 'Register Your School',
      shortDesc: 'Quick Onboarding & Profile Setup',
      description: 'Fill our simple onboarding form or speak with a specialist. We configure your school profile, academic calendar, terms, and branches.',
      icon: ClipboardCheck,
      details: ['Institution basic details', 'Curriculum & levels definition', 'Secure admin account setup']
    },
    {
      step: '02',
      title: 'Choose a Website Option',
      shortDesc: 'Ready Template or Bespoke Design',
      description: 'Select from our library of elegant, mobile-friendly school website templates or request a tailor-made custom website reflecting your school crest.',
      icon: Palette,
      details: ['Template selection or custom brief', 'Logo & brand colors integration', 'Admissions form & domain connection']
    },
    {
      step: '03',
      title: 'Set Up Your Management System',
      shortDesc: 'Classes, Students & Teacher Import',
      description: 'Import existing student and staff lists via Excel or let our support team migrate your records. Configure class subjects, grading scale, and fee structures.',
      icon: SlidersHorizontal,
      details: ['Bulk student & staff Excel import', 'Grading scale & fee schedules', 'Teacher login credential generation']
    },
    {
      step: '04',
      title: 'Start Managing Digitally',
      shortDesc: 'Live Launch & Effortless Operations',
      description: 'Roll out access to teachers, students, and parents. Take roll calls, publish results with a click, collect fees online, and enjoy seamless administration.',
      icon: Rocket,
      details: ['Staff training session included', 'Parent SMS credentials broadcast', 'Ongoing dedicated support']
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>Simple 4-Step Process</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            How It Works
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Transitioning your school to NUSMADE is swift, guided, and hassle-free. From initial setup to full digital launch, our team supports you every step of the way.
          </p>
        </div>

        {/* 4 Steps Grid with Step Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={item.step}
                className="relative bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black font-display text-slate-300 group-hover:text-[#6D28D9] transition-colors">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-[#6D28D9] group-hover:bg-[#6D28D9] group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-display mb-1">
                    {item.title}
                  </h3>

                  <p className="text-xs font-semibold text-[#EC4899] mb-3">
                    {item.shortDesc}
                  </p>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-slate-200/70 pt-4 space-y-1.5">
                  {item.details.map((bullet, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-slate-900 font-display">
              Need assistance migrating existing student records from Excel?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Our technical onboarding team handles data cleaning and upload for free during your initial setup.
            </p>
          </div>
          <button
            onClick={onOpenDemo}
            className="shrink-0 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Start Free Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
