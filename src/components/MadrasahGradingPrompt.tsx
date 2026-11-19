import React from 'react';
import { BookOpen, CheckCircle2, X } from 'lucide-react';
import {
  MADRASAH_GRADING_OPTIONS,
  type MadrasahGradingMode,
} from '../lib/madrasahGrading';

interface MadrasahGradingSelectorProps {
  value: MadrasahGradingMode;
  onChange: (mode: MadrasahGradingMode) => void;
  title?: string;
  subtitle?: string;
}

export const MadrasahGradingSelector: React.FC<MadrasahGradingSelectorProps> = ({
  value,
  onChange,
  title = 'Madrasah Grading System & Numerals',
  subtitle = 'Do you want Arabic-only grading and numerals, English grading, or both?',
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
      <div className="flex items-start gap-2.5">
        <BookOpen className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {MADRASAH_GRADING_OPTIONS.map((opt) => {
          const active = value === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => onChange(opt.mode)}
              className={`min-h-11 p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                active
                  ? 'border-[#6D28D9] bg-white shadow-2xs ring-1 ring-[#6D28D9]'
                  : 'border-slate-200 bg-white/80 hover:bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{opt.title}</span>
                  <span
                    className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${
                      active
                        ? 'bg-purple-100 text-[#6D28D9]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.badgeText}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{opt.description}</p>
              </div>
              {active && (
                <CheckCircle2 className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface MadrasahGradingModalProps {
  isOpen: boolean;
  currentMode: MadrasahGradingMode;
  onSelect: (mode: MadrasahGradingMode) => void;
  onClose: () => void;
}

export const MadrasahGradingModal: React.FC<MadrasahGradingModalProps> = ({
  isOpen,
  currentMode,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="madrasah-grading-modal-title"
    >
      <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-sm font-bold text-[#6D28D9] block">
              Madrasah &amp; Tahfiz School Setup
            </span>
            <h2
              id="madrasah-grading-modal-title"
              className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display"
            >
              Which Grading System &amp; Numerals Do You Want?
            </h2>
            <p className="text-sm text-slate-600">
              Choose whether teachers and report cards should use Arabic numerals and grades only, English only, or both together.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Madrasah grading selector"
            className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {MADRASAH_GRADING_OPTIONS.map((opt) => {
            const active = currentMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => onSelect(opt.mode)}
                className={`w-full min-h-11 p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  active
                    ? 'border-[#6D28D9] bg-purple-50/70 ring-1 ring-[#6D28D9]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{opt.title}</span>
                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-lg bg-purple-100 text-[#6D28D9]">
                      {opt.badgeText}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{opt.description}</p>
                </div>
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-1 ${
                    active ? 'text-[#6D28D9]' : 'text-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Keep Current ({currentMode === 'arabic' ? 'Arabic Only' : currentMode === 'both' ? 'Both' : 'English Only'})
          </button>
        </div>
      </div>
    </div>
  );
};
