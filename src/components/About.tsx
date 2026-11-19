import React from 'react';
import { 
  Building2, 
  Users2, 
  BookOpenCheck, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  GraduationCap, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface AboutProps {
  onOpenDemo: () => void;
}

export const About: React.FC<AboutProps> = ({ onOpenDemo }) => {
  const highlights = [
    {
      title: 'Built for Schools & Madrasahs',
      description: 'Specialized architectures that honor both standard national curriculums and Madrasah Islamic, Arabic, and Tahfiz academic structures.',
      icon: GraduationCap,
      color: 'bg-purple-100 text-[#6D28D9]',
    },
    {
      title: 'Effortless Administrative Control',
      description: 'Say goodbye to fragmented paper ledgers, lost result sheets, and manual attendance books. Manage everything from one unified dashboard.',
      icon: Clock,
      color: 'bg-pink-100 text-[#EC4899]',
    },
    {
      title: 'Direct Parent Connection',
      description: 'Bridge school and home with instant SMS alerts, termly report card downloads, online fee payment receipts, and automated attendance notifications.',
      icon: Users2,
      color: 'bg-purple-100 text-[#6D28D9]',
    },
    {
      title: 'Bank-Grade Data Security',
      description: 'Your institution’s student records, academic performance, and financial audit trails are encrypted, backed up, and protected round the clock.',
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-[#F8FAFC] border-y border-slate-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/70 text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>About NUSMADE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Technology That Makes School Management Easier.
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            NUSMADE provides all-in-one digital solutions that help schools and Madrasahs improve their administrative processes, academic management, and communication between teachers, parents, and school management.
          </p>
        </div>

        {/* 2-Column Story & Pillar Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Left: Narrative & Target Audiences */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p className="text-base sm:text-lg">
                Running a school requires juggling hundreds of interconnected tasks: registering students, scheduling timetables, tracking attendance, tabulating continuous assessments, preparing terminal report cards, and reconciling fee payments.
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-900">NUSMADE</strong> was created specifically to replace cumbersome paperwork and fragmented standalone tools with an integrated, intuitive digital ecosystem. Whether you are a private academy, missionary school, or Madrasah, we empower your educators to focus on teaching while the software handles administrative heavylifting.
              </p>
            </div>

            {/* Target Audience Badges */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Tailored Specifically For:
              </span>
              <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-slate-800">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span>School Owners & Proprietors</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 text-[#EC4899] flex items-center justify-center shrink-0">
                    <Users2 className="w-4 h-4" />
                  </div>
                  <span>School Administrators</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
                    <BookOpenCheck className="w-4 h-4" />
                  </div>
                  <span>Teachers & Educators</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span>Schools & Madrasahs</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors group cursor-pointer"
              >
                <span>Learn how NUSMADE adapts to your school type</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: 4 Pillar Highlights Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-200 transition-all space-y-3"
                >
                  <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
