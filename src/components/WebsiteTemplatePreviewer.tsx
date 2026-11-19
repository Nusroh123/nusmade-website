import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Smartphone, ArrowRight, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';

type TemplateId = 'classic' | 'madrasah' | 'modern';

export const WebsiteTemplatePreviewer: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [customSchoolName, setCustomSchoolName] = useState<string>('Al-Hikmah Premier Academy');

  const templates = [
    {
      id: 'classic' as TemplateId,
      name: 'Classic Academy',
      audience: 'Primary & Secondary',
      accent: 'from-[#6D28D9] to-[#4C1D95]',
      motto: 'Character & Academic Discipline',
      ctaText: 'Apply for 2026/2027 Session',
      highlights: ['Admissions Form', 'Term Calendar', 'Parent Portal']
    },
    {
      id: 'madrasah' as TemplateId,
      name: 'Al-Madrasah',
      audience: 'Madrasah & Tahfiz',
      accent: 'from-emerald-700 to-[#6D28D9]',
      motto: 'Sacred Knowledge & Western Studies • 1448 AH',
      ctaText: 'Enroll in Tahfiz & Western Tracks',
      highlights: ['Tahfiz Track', 'Arabic & Islamic', 'Hijri Calendar']
    },
    {
      id: 'modern' as TemplateId,
      name: 'Modern STEM',
      audience: 'International Colleges',
      accent: 'from-[#0F172A] via-[#4C1D95] to-[#EC4899]',
      motto: 'Science, Research & Practical Skills',
      ctaText: 'Book Campus Tour & E-Portal',
      highlights: ['CBT Mock Portal', 'STEM Labs', 'Fee Instructions']
    }
  ];

  const active = templates.find((t) => t.id === selectedTemplate) ?? templates[0];
  const displaySchoolName = customSchoolName.trim() || 'Your School Name';
  const slug =
    displaySchoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 20) || 'yourschool';

  const demoUrl = `/book-demo?plan=${encodeURIComponent('Starter Plan')}&schoolName=${encodeURIComponent(
    displaySchoolName
  )}&notes=${encodeURIComponent(`Interested in the "${active.name}" website template.`)}`;

  return (
    <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-xs space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-[#6D28D9]">
            Live Website Template Preview
          </p>
          <h4 className="text-base font-bold text-slate-900 mt-1">
            Preview 3 Ready-Made Themes With Your School Name
          </h4>
        </div>

        {/* Desktop vs Mobile toggle */}
        <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`min-h-11 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              deviceMode === 'desktop' ? 'bg-[#6D28D9] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`min-h-11 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              deviceMode === 'mobile' ? 'bg-[#6D28D9] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Live School Name Input + Template Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <label htmlFor="preview-school-name" className="block text-sm font-semibold text-slate-700 mb-2">
            School Name
          </label>
          <input
            id="preview-school-name"
            type="text"
            value={customSchoolName}
            onChange={(e) => setCustomSchoolName(e.target.value)}
            maxLength={44}
            placeholder="Enter your school name..."
            className="w-full min-h-11 px-4 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
          />
        </div>
        <div className="lg:col-span-7">
          <span className="block text-sm font-semibold text-slate-700 mb-2">
            Template Style
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`min-h-11 px-3 py-2 rounded-xl text-sm font-bold transition-colors text-left border cursor-pointer truncate ${
                  selectedTemplate === tpl.id
                    ? 'bg-purple-50 border-[#6D28D9] text-[#6D28D9]'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Browser Mockup */}
      <div className={`mx-auto transition-all duration-300 ${deviceMode === 'mobile' ? 'max-w-[320px]' : 'w-full'}`}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-slate-300 text-sm font-mono truncate">
                https://www.{slug}.edu.ng
              </span>
            </div>
            <span className="text-sm text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-4 h-4" /> SSL
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4 pointer-events-none select-none">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${active.accent} text-white flex items-center justify-center shrink-0`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-900 font-display truncate uppercase">
                  {displaySchoolName}
                </span>
              </div>
              {deviceMode === 'desktop' && (
                <span className="text-sm text-slate-500 font-medium hidden sm:inline shrink-0">
                  About • Admissions
                </span>
              )}
            </div>

            <div className={`rounded-2xl bg-gradient-to-r ${active.accent} text-white p-6 space-y-2`}>
              <span className="block text-sm font-bold uppercase tracking-wider text-white/90">
                {active.audience}
              </span>
              <h5 className="text-lg font-extrabold font-display leading-snug">
                Welcome to {displaySchoolName}
              </h5>
              <p className="text-sm text-white/90">{active.motto}</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-bold text-sm">
                  {active.ctaText} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className={`grid gap-2 ${deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {active.highlights.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-sm text-slate-600">
          Need a completely custom design? We also build bespoke school websites from scratch.
        </p>
        <Link
          to={demoUrl}
          className="w-full sm:w-auto shrink-0 min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-sm font-bold transition-colors shadow-xs"
        >
          <span>Use “{active.name}”</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
