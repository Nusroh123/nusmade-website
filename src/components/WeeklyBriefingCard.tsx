import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCopy,
  CreditCard,
  MessageSquare,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

export interface WeeklyFollowUpItem {
  studentId: string;
  studentName: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  absentDays: number;
  lateDays: number;
  totalDaysTracked: number;
  summaryText: string;
}

export interface WeeklyFeeReminderItem {
  studentId: string;
  studentName: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  termFeeNgn: number;
  amountPaidNgn: number;
  balanceNgn: number;
}

export interface WeeklyClassReadinessItem {
  className: string;
  teacherName: string | null;
  studentCount: number;
  attendanceSummary: string;
  marksSummary: string;
  needsAttention: boolean;
}

interface WeeklyBriefingCardProps {
  storageNamespace: string;
  schoolName: string;
  termLabel: string;
  weekLabel: string;
  followUpStudents: WeeklyFollowUpItem[];
  feeReminders: WeeklyFeeReminderItem[];
  totalOwingCount: number;
  classReadiness: WeeklyClassReadinessItem[];
  onRecordFee?: (studentId: string) => void;
  onOpenAttendance?: () => void;
  onOpenClassCheck?: (className: string, needsTeacher: boolean) => void;
  onNotify?: (message: string) => void;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

async function copyTextSafely(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export const WeeklyBriefingCard: React.FC<WeeklyBriefingCardProps> = ({
  storageNamespace,
  schoolName,
  termLabel,
  weekLabel,
  followUpStudents,
  feeReminders,
  totalOwingCount,
  classReadiness,
  onRecordFee,
  onOpenAttendance,
  onOpenClassCheck,
  onNotify,
}) => {
  const storageKey = `nusmade_weekly_briefing_contacted_${storageNamespace}`;

  const [contactedIds, setContactedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string');
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(contactedIds));
    } catch {
      // Ignore storage write errors
    }
  }, [contactedIds, storageKey]);

  const showFeedback = (msg: string) => {
    setInlineFeedback(msg);
    onNotify?.(msg);
    window.setTimeout(() => {
      setInlineFeedback((curr) => (curr === msg ? null : curr));
    }, 3400);
  };

  const toggleContacted = (item: WeeklyFollowUpItem) => {
    const isAlready = contactedIds.includes(item.studentId);
    setContactedIds((prev) =>
      isAlready ? prev.filter((id) => id !== item.studentId) : [...prev, item.studentId]
    );
    showFeedback(
      isAlready
        ? `Reopened guardian follow-up for ${item.studentName}.`
        : `Marked ${item.guardianName} (${item.studentName}) as contacted this week.`
    );
  };

  const buildAttendanceSms = (item: WeeklyFollowUpItem) =>
    `Assalamu alaikum / Hello ${item.guardianName}, from ${schoolName || 'School Admin'}: ${item.studentName} (${item.className}) ${item.summaryText.toLowerCase()} (${weekLabel}). Please reply or call the school office if support is needed.`;

  const buildFeeSms = (item: WeeklyFeeReminderItem) =>
    `Assalamu alaikum / Hello ${item.guardianName}, friendly weekly tuition reminder from ${schoolName || 'School Admin'} (${termLabel}): ${item.studentName} (${item.className}) has an outstanding balance of ${formatNaira(item.balanceNgn)}. Thank you.`;

  const handleCopyAttendanceSms = async (item: WeeklyFollowUpItem) => {
    const ok = await copyTextSafely(buildAttendanceSms(item));
    showFeedback(
      ok
        ? `Copied guardian message for ${item.studentName}.`
        : `Ready to copy for ${item.guardianName} (${item.guardianPhone}).`
    );
  };

  const handleCopyFeeReminder = async (item: WeeklyFeeReminderItem) => {
    const ok = await copyTextSafely(buildFeeSms(item));
    showFeedback(
      ok
        ? `Copied fee reminder for ${item.guardianName} (${formatNaira(item.balanceNgn)}).`
        : `Fee reminder prepared for ${item.guardianName} (${item.guardianPhone}).`
    );
  };

  const pendingFollowUps = followUpStudents.filter(
    (item) => !contactedIds.includes(item.studentId)
  ).length;
  const classesNeedingAttention = classReadiness.filter((c) => c.needsAttention).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 print:hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#6D28D9]">
            <CalendarCheck className="w-4 h-4 text-[#EC4899] shrink-0" />
            <span>Weekly School Briefing · {weekLabel}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            This Week&apos;s Owner &amp; Admin Checklist
          </h2>
          <p className="text-sm text-slate-600">
            Review missed days, send fee reminders, and confirm class scores before Monday morning.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-base font-extrabold text-slate-900 tabular-nums block">
              {pendingFollowUps}
            </span>
            <span className="text-sm text-slate-600 block">Calls due</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-base font-extrabold text-amber-700 tabular-nums block">
              {totalOwingCount}
            </span>
            <span className="text-sm text-slate-600 block">Fees owing</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-base font-extrabold text-[#6D28D9] tabular-nums block">
              {classesNeedingAttention}
            </span>
            <span className="text-sm text-slate-600 block">Class checks</span>
          </div>
        </div>
      </div>

      {inlineFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{inlineFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* 1. Attendance Follow-Ups This Week */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  1. Attendance Follow-Ups
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Students absent or repeatedly late this week.
                </p>
              </div>
              <PhoneCall className="w-5 h-5 text-[#EC4899] shrink-0 mt-0.5" />
            </div>

            {followUpStudents.length === 0 ? (
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <p className="text-sm font-semibold text-emerald-700">
                  No attendance alerts this week.
                </p>
                <p className="text-sm text-slate-600">
                  All enrolled students attended on time. Open Attendance anytime to review roll call.
                </p>
                {onOpenAttendance && (
                  <button
                    type="button"
                    onClick={onOpenAttendance}
                    className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-[#6D28D9] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    Open Attendance Register
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {followUpStudents.map((item) => {
                  const isContacted = contactedIds.includes(item.studentId);
                  const isPreviewOpen = previewStudentId === item.studentId;
                  return (
                    <div
                      key={item.studentId}
                      className={`p-4 rounded-xl border transition-colors space-y-3 ${
                        isContacted
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {item.studentName}
                          </span>
                          <span className="text-sm font-semibold text-slate-600 shrink-0">
                            {item.className}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-amber-800">
                          {item.summaryText}
                        </p>
                        <p className="text-sm text-slate-600">
                          Guardian: {item.guardianName}
                          {item.guardianPhone ? ` · ${item.guardianPhone}` : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleContacted(item)}
                          className={`inline-flex items-center justify-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                            isContacted
                              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                              : 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]'
                          }`}
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{isContacted ? 'Contacted' : 'Mark Contacted'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPreviewStudentId(isPreviewOpen ? null : item.studentId)
                          }
                          className="inline-flex items-center justify-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 shrink-0" />
                          <span>{isPreviewOpen ? 'Hide SMS' : 'Preview SMS'}</span>
                        </button>
                      </div>

                      {isPreviewOpen && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {buildAttendanceSms(item)}
                          </p>
                          <button
                            type="button"
                            onClick={() => void handleCopyAttendanceSms(item)}
                            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#6D28D9] bg-white border border-purple-200 hover:bg-purple-50 transition-colors cursor-pointer"
                          >
                            <ClipboardCopy className="w-4 h-4 shrink-0" />
                            <span>Copy Message</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Tuition Balances Due This Week */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  2. Tuition Reminders Due
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Send polite guardian reminders or record payments.
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
            </div>

            {feeReminders.length === 0 ? (
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  All term tuition balances are settled.
                </p>
                <p className="text-sm text-slate-600">
                  Zero unpaid fee reminders are needed this week.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {feeReminders.map((item) => (
                  <div
                    key={item.studentId}
                    className="p-4 rounded-xl bg-white border border-slate-200 space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {item.studentName}
                        </span>
                        <span className="text-sm font-extrabold text-amber-700 tabular-nums shrink-0">
                          {formatNaira(item.balanceNgn)} due
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {item.className} · Paid {formatNaira(item.amountPaidNgn)} of{' '}
                        {formatNaira(item.termFeeNgn)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Guardian: {item.guardianName}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleCopyFeeReminder(item)}
                        className="inline-flex items-center justify-center gap-1.5 min-h-11 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <ClipboardCopy className="w-4 h-4 shrink-0" />
                        <span>Copy Reminder</span>
                      </button>

                      {onRecordFee && (
                        <button
                          type="button"
                          onClick={() => onRecordFee(item.studentId)}
                          className="inline-flex items-center justify-center min-h-11 px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer"
                        >
                          Record Fee
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Class Marks & Teacher Check-In */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  3. Class &amp; Score Check
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Weekly status of roll call and subject score entry.
                </p>
              </div>
              <UserCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            </div>

            {classReadiness.length === 0 ? (
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <p className="text-sm font-semibold text-slate-800">No classes configured yet.</p>
                <p className="text-sm text-slate-600">
                  Add classes in School Settings to track weekly teacher readiness.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {classReadiness.map((cls) => (
                  <div
                    key={cls.className}
                    className="p-4 rounded-xl bg-white border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{cls.className}</span>
                      <span
                        className={`text-sm font-semibold ${
                          cls.needsAttention ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {cls.needsAttention ? 'Action needed' : 'On track'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      {cls.teacherName
                        ? `Teacher: ${cls.teacherName}`
                        : 'No active teacher assigned'}
                      {` · ${cls.studentCount} student${cls.studentCount === 1 ? '' : 's'}`}
                    </p>
                    <p className="text-sm text-slate-600">{cls.attendanceSummary}</p>
                    <p className="text-sm text-slate-600">{cls.marksSummary}</p>

                    {onOpenClassCheck && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenClassCheck(cls.className, !cls.teacherName)}
                          className="min-h-11 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#6D28D9] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                          {!cls.teacherName ? 'Assign Teacher' : 'Review Class Scores'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
