import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  LogIn,
  LogOut,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Check,
  Printer,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { formatPlainError } from '../lib/formatError';
import {
  getStudentAttendanceForDate,
  getStudentAttendanceSummary,
  getTodayIsoDate,
  markStudentsPresentBatchInDb,
  saveClassMarksBatchInDb,
  saveStudentMarksAndRemarksInDb,
  subscribeMyClassStudents,
  subscribeMyTeacherProfile,
  updateStudentAttendanceInDb,
  type AttendanceStatus,
  type MadrasahGradingMode,
  type SchoolMark,
  type SchoolStudentRecord,
  type SchoolTeacherRecord,
} from '../lib/schoolDb';
import {
  formatDisplayNumeral,
  formatInputScore,
  getLocalizedGradeDetails,
  getMadrasahModeShortLabel,
  parseScoreInput,
} from '../lib/madrasahGrading';

type TeacherWorkspaceTab = 'rollcall' | 'markbook' | 'reports';

export const TeacherPortalPage: React.FC = () => {
  const { user, isAuthReady, isAdmin, isSigningIn, authError, signInWithGoogle, signOutUser } =
    useFirebaseAuth();

  const [teacherLoaded, setTeacherLoaded] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<SchoolTeacherRecord | null>(null);
  const [classStudents, setClassStudents] = useState<SchoolStudentRecord[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TeacherWorkspaceTab>('rollcall');
  const [rollCallDate, setRollCallDate] = useState<string>(() => getTodayIsoDate());
  const [selectedSubject, setSelectedSubject] = useState('');

  // Local draft map for Subject Markbook batch editing: { [studentId]: { ca, exam } }
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, { ca: number; exam: number }>>({});
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  // Remarks & Report Card state
  const [selectedReportStudentId, setSelectedReportStudentId] = useState('');
  const [remarkDraft, setRemarkDraft] = useState('');
  const [tahfizDraft, setTahfizDraft] = useState('');
  const [isSavingRemark, setIsSavingRemark] = useState(false);

  const showSaved = (msg: string) => {
    setSavedBanner(msg);
    window.setTimeout(() => {
      setSavedBanner((curr) => (curr === msg ? null : curr));
    }, 3400);
  };

  // Step 1: Verify whether signed-in user's Google email is assigned in /school_teachers
  useEffect(() => {
    if (!isAuthReady || !user?.email) {
      setTeacherLoaded(false);
      setTeacherProfile(null);
      setClassStudents([]);
      return;
    }

    setDbError(null);
    const unsubProfile = subscribeMyTeacherProfile(
      user.email,
      (profile) => {
        setTeacherProfile(profile);
        setTeacherLoaded(true);
      },
      (msg) => {
        setDbError(formatPlainError(msg, 'Unable to check your teacher profile right now.'));
        setTeacherLoaded(true);
      }
    );

    return () => {
      unsubProfile();
    };
  }, [isAuthReady, user?.email]);

  // Step 2: Subscribe ONLY to students assigned to this active teacher
  useEffect(() => {
    if (!user?.email || !teacherProfile || teacherProfile.status !== 'active') {
      setClassStudents([]);
      return;
    }

    const unsubStudents = subscribeMyClassStudents(
      user.email,
      (list) => setClassStudents(list),
      (msg) => setDbError(formatPlainError(msg, 'Unable to load students in your assigned class.'))
    );

    return () => {
      unsubStudents();
    };
  }, [user?.email, teacherProfile]);

  // Default selected subject to teacher's primary assignedSubject
  useEffect(() => {
    if (!teacherProfile) return;
    setSelectedSubject(
      (prev) => prev || teacherProfile.assignedSubject || teacherProfile.subjects[0] || ''
    );
  }, [teacherProfile]);

  // Populate markbook local score drafts whenever students or selectedSubject changes
  useEffect(() => {
    if (!selectedSubject) return;
    const next: Record<string, { ca: number; exam: number }> = {};
    for (const stu of classStudents) {
      const found = stu.marks.find((m) => m.subject === selectedSubject);
      next[stu.studentId] = { ca: found?.ca ?? 0, exam: found?.exam ?? 0 };
    }
    setScoreDrafts(next);
  }, [classStudents, selectedSubject]);

  // Keep selectedReportStudentId valid
  useEffect(() => {
    if (classStudents.length === 0) {
      setSelectedReportStudentId('');
      return;
    }
    if (!classStudents.some((s) => s.studentId === selectedReportStudentId)) {
      setSelectedReportStudentId(classStudents[0].studentId);
    }
  }, [classStudents, selectedReportStudentId]);

  const reportStudent = useMemo(
    () => classStudents.find((s) => s.studentId === selectedReportStudentId) ?? null,
    [classStudents, selectedReportStudentId]
  );

  useEffect(() => {
    if (!reportStudent) {
      setRemarkDraft('');
      setTahfizDraft('');
      return;
    }
    setRemarkDraft(reportStudent.teacherRemark);
    setTahfizDraft(reportStudent.tahfizProgress);
  }, [reportStudent]);

  const classStats = useMemo(() => {
    const total = classStudents.length;
    const statuses = classStudents.map((s) => getStudentAttendanceForDate(s, rollCallDate));
    const present = statuses.filter((st) => st === 'present').length;
    const late = statuses.filter((st) => st === 'late').length;
    const absent = statuses.filter((st) => st === 'absent').length;
    const unmarked = statuses.filter((st) => st === null).length;
    return { total, present, late, absent, unmarked };
  }, [classStudents, rollCallDate]);

  const isMadrasah = teacherProfile?.schoolType === 'madrasah';
  const gradingMode: MadrasahGradingMode = isMadrasah
    ? teacherProfile?.madrasahGradingMode ?? 'english'
    : 'english';

  const reportSummary = useMemo(() => {
    const schoolType = teacherProfile?.schoolType ?? 'conventional';
    if (!reportStudent || reportStudent.marks.length === 0) {
      return {
        totalObtained: 0,
        maxTotal: 0,
        average: 0,
        grade: getLocalizedGradeDetails(0, schoolType, gradingMode),
        attendance: reportStudent
          ? getStudentAttendanceSummary(reportStudent)
          : { present: 0, late: 0, absent: 0, totalDays: 0, attendancePct: 100 },
      };
    }
    const totalObtained = reportStudent.marks.reduce((sum, m) => sum + m.ca + m.exam, 0);
    const maxTotal = reportStudent.marks.length * 100;
    const average = Math.round(totalObtained / reportStudent.marks.length);
    return {
      totalObtained,
      maxTotal,
      average,
      grade: getLocalizedGradeDetails(average, schoolType, gradingMode),
      attendance: getStudentAttendanceSummary(reportStudent),
    };
  }, [reportStudent, teacherProfile?.schoolType, gradingMode]);

  // Build updated marks array for a student cleanly (respecting Firestore 1..20 limit & 0..40 / 0..60 caps)
  function buildUpdatedMarks(
    stu: SchoolStudentRecord,
    subject: string,
    ca: number,
    exam: number
  ): SchoolMark[] {
    const clampedCa = Math.min(40, Math.max(0, Math.round(Number(ca) || 0)));
    const clampedExam = Math.min(60, Math.max(0, Math.round(Number(exam) || 0)));
    const exists = stu.marks.some((m) => m.subject === subject);

    if (exists) {
      return stu.marks.slice(0, 20).map((m) =>
        m.subject === subject ? { subject, ca: clampedCa, exam: clampedExam } : m
      );
    }
    const base = stu.marks.slice(0, 19);
    return [...base, { subject, ca: clampedCa, exam: clampedExam }];
  }

  const handleSetAttendance = async (student: SchoolStudentRecord, status: AttendanceStatus) => {
    setDbError(null);
    setSavingStudentId(student.studentId);
    try {
      await updateStudentAttendanceInDb(student, status, rollCallDate);
      showSaved(`Marked ${student.fullName} as ${status} for ${rollCallDate}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to save attendance. Please try again.'));
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleMarkClassPresent = async () => {
    if (classStudents.length === 0) return;
    setDbError(null);
    setIsBatchSaving(true);
    try {
      await markStudentsPresentBatchInDb(classStudents, rollCallDate);
      showSaved(
        `All ${classStudents.length} students in ${teacherProfile?.assignedClass} marked Present for ${rollCallDate}.`
      );
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to mark the class present. Please try again.'));
    } finally {
      setIsBatchSaving(false);
    }
  };

  const handleSaveOneStudentScore = async (stu: SchoolStudentRecord) => {
    const draft = scoreDrafts[stu.studentId];
    if (!draft || !selectedSubject) return;
    setDbError(null);
    setSavingStudentId(stu.studentId);
    try {
      const nextMarks = buildUpdatedMarks(stu, selectedSubject, draft.ca, draft.exam);
      await saveStudentMarksAndRemarksInDb({
        studentId: stu.studentId,
        marks: nextMarks,
        teacherRemark: stu.teacherRemark,
        tahfizProgress: stu.tahfizProgress,
      });
      showSaved(`Saved ${selectedSubject} score for ${stu.fullName}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to save student score. Please try again.'));
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleSaveAllScores = async () => {
    if (!selectedSubject || classStudents.length === 0) return;
    setDbError(null);
    setIsBatchSaving(true);
    try {
      const updates = classStudents.map((stu) => {
        const draft = scoreDrafts[stu.studentId] ?? { ca: 0, exam: 0 };
        return {
          studentId: stu.studentId,
          marks: buildUpdatedMarks(stu, selectedSubject, draft.ca, draft.exam),
          teacherRemark: stu.teacherRemark,
          tahfizProgress: stu.tahfizProgress,
        };
      });
      await saveClassMarksBatchInDb(updates);
      showSaved(`Saved ${selectedSubject} scores for all ${classStudents.length} students.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Could not save the class markbook. Please try again.'));
    } finally {
      setIsBatchSaving(false);
    }
  };

  const handleSaveRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportStudent) return;
    setDbError(null);
    setIsSavingRemark(true);
    try {
      await saveStudentMarksAndRemarksInDb({
        studentId: reportStudent.studentId,
        marks: reportStudent.marks,
        teacherRemark: remarkDraft,
        tahfizProgress: tahfizDraft,
      });
      showSaved(`Updated terminal remark for ${reportStudent.fullName}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to save teacher remark. Please try again.'));
    } finally {
      setIsSavingRemark(false);
    }
  };

  const handlePrintReport = () => {
    showSaved('Opening print dialog for terminal report card.');
    window.print();
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[82vh] py-12 lg:py-16 print:bg-white print:py-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Teacher Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#BE185D]">
              <UserCheck className="w-4 h-4 text-[#EC4899] shrink-0" />
              <span>Class Teacher Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {teacherProfile && teacherProfile.status === 'active'
                ? `${teacherProfile.assignedClass} — Teacher Workspace`
                : 'Class Teacher Sign-In'}
            </h1>
            <p className="text-sm text-slate-600">
              {teacherProfile && teacherProfile.status === 'active'
                ? `${teacherProfile.schoolName} · ${teacherProfile.termLabel} · Signed in as ${teacherProfile.fullName}`
                : 'Sign in with the Google account assigned to your class by your School Administrator.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/school"
              className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Portal Gateway</span>
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Auth Loading */}
        {!isAuthReady && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <Clock className="w-8 h-8 text-[#6D28D9] animate-spin mx-auto" />
            <p className="text-base font-semibold text-slate-600">Checking teacher session...</p>
          </div>
        )}

        {/* Not Signed In */}
        {isAuthReady && !user && (
          <div className="max-w-lg mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#EC4899] border border-pink-100 flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                Sign In With Your Teacher Gmail
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Use the Google account that your School Administrator assigned to your class. Once signed in, you will only see students in your assigned class.
              </p>
            </div>
            {authError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 text-left">
                {authError}
              </div>
            )}
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={isSigningIn}
              className="w-full min-h-11 py-3 px-6 rounded-xl font-bold text-base text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSigningIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}</span>
            </button>
            <div className="pt-2 text-sm text-slate-600">
              Are you the School Administrator?{' '}
              <Link to="/school/admin" className="font-bold text-[#6D28D9] hover:underline">
                Open School Admin Login &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Signed In -> Verifying Teacher Assignment */}
        {isAuthReady && user && !teacherLoaded && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <Clock className="w-8 h-8 text-[#6D28D9] animate-spin mx-auto" />
            <p className="text-base font-semibold text-slate-600">Checking your class assignment...</p>
          </div>
        )}

        {/* Signed In -> Not Registered or Suspended */}
        {isAuthReady && user && teacherLoaded && (!teacherProfile || teacherProfile.status !== 'active') && (
          <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                {teacherProfile ? 'Teacher Account Suspended' : 'No Active Class Assignment Found'}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                You are signed in as <strong className="text-slate-900">{user.email}</strong>.{' '}
                {teacherProfile
                  ? 'Your School Administrator temporarily set your teacher account to inactive.'
                  : 'This Google email has not been assigned to any class by your School Administrator yet.'}
              </p>
            </div>
            {dbError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 text-left">
                {dbError}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={isSigningIn}
                className="min-h-11 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSigningIn ? 'Opening Google...' : 'Switch Google Account'}
              </button>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              {isAdmin && (
                <Link
                  to="/school/admin"
                  className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#6D28D9] bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Open School Admin</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Active Verified Class Teacher Workspace */}
        {isAuthReady && user && teacherLoaded && teacherProfile && teacherProfile.status === 'active' && (
          <>
            {/* Scope & Privacy Notice Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Lock className="w-4 h-4 text-[#6D28D9] shrink-0" />
                <span>
                  Assigned class: <strong className="text-slate-900">{teacherProfile.assignedClass}</strong> · Primary subject:{' '}
                  <strong className="text-slate-900">{teacherProfile.assignedSubject}</strong>
                </span>
              </div>
              <span className="text-sm font-medium text-slate-500">
                Tuition fees, guardian phone numbers, and other classes are hidden
              </span>
            </div>

            {dbError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 flex items-center gap-2 print:hidden">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dbError}</span>
              </div>
            )}

            {savedBanner && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800 flex items-center gap-2 print:hidden">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{savedBanner}</span>
              </div>
            )}

            {/* Teacher Workspace Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap gap-2 print:hidden">
              {(
                [
                  { id: 'rollcall', label: `My Class Roll Call (${classStudents.length})`, icon: CalendarCheck },
                  { id: 'markbook', label: 'Subject Markbook (CA & Exam)', icon: FileSpreadsheet },
                  { id: 'reports', label: 'Remarks & Report Cards', icon: Award },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#6D28D9] text-white'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {classStudents.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900">
                    No students enrolled in {teacherProfile.assignedClass} yet
                  </p>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Ask your School Administrator to enroll students into {teacherProfile.assignedClass}. They will appear here automatically.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                    to="/school"
                    className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Portal Gateway</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/school/admin"
                      className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enroll Students in Admin</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* TAB 1: MY CLASS ROLL CALL */}
                {activeTab === 'rollcall' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          Daily Attendance — {teacherProfile.assignedClass}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1 tabular-nums">
                          Date: {rollCallDate} · Present: {classStats.present} · Late: {classStats.late} · Absent:{' '}
                          {classStats.absent}
                          {classStats.unmarked > 0 ? ` · Unmarked: ${classStats.unmarked}` : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="date"
                          aria-label="Roll call date"
                          value={rollCallDate}
                          max={getTodayIsoDate()}
                          onChange={(e) => {
                            if (e.target.value) setRollCallDate(e.target.value);
                          }}
                          className="min-h-11 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                        />

                        <button
                          type="button"
                          disabled={isBatchSaving}
                          onClick={() => void handleMarkClassPresent()}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isBatchSaving ? 'Saving All...' : 'Mark Entire Class Present'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                      {classStudents.map((stu) => {
                        const dateStatus = getStudentAttendanceForDate(stu, rollCallDate);
                        const termSummary = getStudentAttendanceSummary(stu);
                        const isSavingThis = savingStudentId === stu.studentId;
                        return (
                          <div
                            key={stu.studentId}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/60"
                          >
                            <div>
                              <p className="text-base font-bold text-slate-900">{stu.fullName}</p>
                              <p className="text-sm text-slate-500 tabular-nums">
                                {stu.admissionNo} · {stu.gender} · Term Attendance: {termSummary.attendancePct}%
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {isSavingThis && (
                                <span className="text-sm font-medium text-slate-500 mr-1">Saving...</span>
                              )}
                              {(['present', 'late', 'absent'] as const).map((status) => {
                                const active = dateStatus === status;
                                const activeStyles =
                                  status === 'present'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : status === 'late'
                                      ? 'bg-amber-500 text-white border-amber-500'
                                      : 'bg-red-600 text-white border-red-600';

                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    disabled={isSavingThis}
                                    onClick={() => void handleSetAttendance(stu, status)}
                                    className={`min-h-11 px-4 py-2 rounded-xl text-sm font-bold capitalize border transition-colors cursor-pointer disabled:opacity-60 ${
                                      active
                                        ? activeStyles
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: SUBJECT MARKBOOK */}
                {activeTab === 'markbook' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          Batch Score Entry — {teacherProfile.assignedClass}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          Enter Continuous Assessment (max 40) and Exam (max 60).
                          {isMadrasah
                            ? ` Grading Mode: ${getMadrasahModeShortLabel(gradingMode)}.`
                            : ' Totals and grades update live.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          aria-label="Select subject"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                        >
                          {teacherProfile.subjects.map((subj) => (
                            <option key={subj} value={subj}>
                              {subj}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={isBatchSaving}
                          onClick={() => void handleSaveAllScores()}
                          className="min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isBatchSaving ? 'Saving All...' : 'Save All Class Scores'}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Cards (phones) */}
                    <div className="md:hidden space-y-4">
                      {classStudents.map((stu) => {
                        const draft = scoreDrafts[stu.studentId] ?? { ca: 0, exam: 0 };
                        const total = draft.ca + draft.exam;
                        const grade = getLocalizedGradeDetails(total, teacherProfile.schoolType, gradingMode);
                        return (
                          <div
                            key={stu.studentId}
                            className="p-4 rounded-2xl border border-slate-200 space-y-4 bg-slate-50/40"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="font-bold text-base text-slate-900">{stu.fullName}</div>
                                <div className="text-sm text-slate-500">{stu.admissionNo}</div>
                              </div>
                              <div className="text-right tabular-nums">
                                <span className="text-base font-extrabold text-slate-900">
                                  {formatDisplayNumeral(total, isMadrasah, gradingMode)}
                                </span>
                                <span className={`block text-sm font-bold ${grade.textColor}`}>
                                  {grade.grade}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                  CA (0–40{isMadrasah && gradingMode !== 'english' ? ' / ٠–٤٠' : ''})
                                </label>
                                <input
                                  type={isMadrasah ? 'text' : 'number'}
                                  inputMode="numeric"
                                  min={0}
                                  max={40}
                                  value={formatInputScore(draft.ca, isMadrasah, gradingMode)}
                                  onChange={(e) => {
                                    const val = parseScoreInput(e.target.value, 40);
                                    setScoreDrafts((prev) => ({
                                      ...prev,
                                      [stu.studentId]: { ...draft, ca: val },
                                    }));
                                  }}
                                  className="w-full min-h-11 px-3 py-2 text-sm text-center font-semibold rounded-xl border border-slate-300 bg-white tabular-nums"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                  Exam (0–60{isMadrasah && gradingMode !== 'english' ? ' / ٠–٦٠' : ''})
                                </label>
                                <input
                                  type={isMadrasah ? 'text' : 'number'}
                                  inputMode="numeric"
                                  min={0}
                                  max={60}
                                  value={formatInputScore(draft.exam, isMadrasah, gradingMode)}
                                  onChange={(e) => {
                                    const val = parseScoreInput(e.target.value, 60);
                                    setScoreDrafts((prev) => ({
                                      ...prev,
                                      [stu.studentId]: { ...draft, exam: val },
                                    }));
                                  }}
                                  className="w-full min-h-11 px-3 py-2 text-sm text-center font-semibold rounded-xl border border-slate-300 bg-white tabular-nums"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={savingStudentId === stu.studentId}
                              onClick={() => void handleSaveOneStudentScore(stu)}
                              className="w-full min-h-11 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {savingStudentId === stu.studentId ? 'Saving Score...' : 'Save Student Score'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-sm font-bold text-slate-600">
                            <th className="py-3 px-3">Student</th>
                            <th className="py-3 px-3 text-center">
                              CA ({isMadrasah && gradingMode === 'arabic' ? '٠–٤٠' : '0–40'})
                            </th>
                            <th className="py-3 px-3 text-center">
                              Exam ({isMadrasah && gradingMode === 'arabic' ? '٠–٦٠' : '0–60'})
                            </th>
                            <th className="py-3 px-3 text-center">
                              Total ({isMadrasah && gradingMode === 'arabic' ? '١٠٠' : '100'})
                            </th>
                            <th className="py-3 px-3 text-center">Grade</th>
                            <th className="py-3 px-3 text-right">Save Row</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm tabular-nums">
                          {classStudents.map((stu) => {
                            const draft = scoreDrafts[stu.studentId] ?? { ca: 0, exam: 0 };
                            const total = draft.ca + draft.exam;
                            const grade = getLocalizedGradeDetails(total, teacherProfile.schoolType, gradingMode);
                            return (
                              <tr key={stu.studentId} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-900">{stu.fullName}</div>
                                  <div className="text-sm text-slate-500">{stu.admissionNo}</div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={40}
                                    aria-label={`CA score for ${stu.fullName}`}
                                    value={formatInputScore(draft.ca, isMadrasah, gradingMode)}
                                    onChange={(e) => {
                                      const val = parseScoreInput(e.target.value, 40);
                                      setScoreDrafts((prev) => ({
                                        ...prev,
                                        [stu.studentId]: { ...draft, ca: val },
                                      }));
                                    }}
                                    className="w-24 min-h-11 px-3 py-2 text-sm text-center font-semibold rounded-xl border border-slate-300"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={60}
                                    aria-label={`Exam score for ${stu.fullName}`}
                                    value={formatInputScore(draft.exam, isMadrasah, gradingMode)}
                                    onChange={(e) => {
                                      const val = parseScoreInput(e.target.value, 60);
                                      setScoreDrafts((prev) => ({
                                        ...prev,
                                        [stu.studentId]: { ...draft, exam: val },
                                      }));
                                    }}
                                    className="w-24 min-h-11 px-3 py-2 text-sm text-center font-semibold rounded-xl border border-slate-300"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center font-extrabold text-slate-900 text-base">
                                  {formatDisplayNumeral(total, isMadrasah, gradingMode)}
                                </td>
                                <td className={`py-3 px-3 text-center text-sm font-bold ${grade.textColor}`}>
                                  {grade.grade}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    type="button"
                                    disabled={savingStudentId === stu.studentId}
                                    onClick={() => void handleSaveOneStudentScore(stu)}
                                    className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    {savingStudentId === stu.studentId ? 'Saving...' : 'Save'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: REMARKS & REPORT CARDS */}
                {activeTab === 'reports' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <form
                      onSubmit={handleSaveRemark}
                      className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 self-start print:hidden"
                    >
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Student in {teacherProfile.assignedClass}
                        </label>
                        <select
                          value={selectedReportStudentId}
                          onChange={(e) => setSelectedReportStudentId(e.target.value)}
                          className="w-full min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                        >
                          {classStudents.map((s) => (
                            <option key={s.studentId} value={s.studentId}>
                              {s.fullName} ({s.admissionNo})
                            </option>
                          ))}
                        </select>
                      </div>

                      {teacherProfile.schoolType === 'madrasah' && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Tahfiz / Memorization Progress
                          </label>
                          <input
                            type="text"
                            value={tahfizDraft}
                            onChange={(e) => setTahfizDraft(e.target.value)}
                            placeholder="e.g., Memorized Juz 15 with Tajwid"
                            className="w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border border-slate-300"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Form Teacher Terminal Remark
                        </label>
                        <textarea
                          rows={3}
                          value={remarkDraft}
                          onChange={(e) => setRemarkDraft(e.target.value)}
                          placeholder="Write an academic and conduct remark for the guardian..."
                          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={isSavingRemark}
                          className="flex-1 min-h-11 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isSavingRemark ? 'Saving Remark...' : 'Save Remark'}
                        </button>
                        <button
                          type="button"
                          onClick={handlePrintReport}
                          className="inline-flex items-center justify-center gap-2 min-h-11 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print</span>
                        </button>
                      </div>
                    </form>

                    {reportStudent && (() => {
                      const isRtlArabic = isMadrasah && gradingMode === 'arabic';
                      return (
                        <div
                          dir={isRtlArabic ? 'rtl' : 'ltr'}
                          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6"
                        >
                          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-[#6D28D9]">
                                {isRtlArabic
                                  ? 'كشف الدرجات والتقويم الفصلي'
                                  : 'Terminal Academic Report'}
                              </p>
                              <h2 className="text-xl font-extrabold text-slate-900 font-display mt-1">
                                {teacherProfile.schoolName}
                              </h2>
                              <p className="text-sm text-slate-500">{teacherProfile.termLabel}</p>
                            </div>
                            <div
                              className={`text-sm ${
                                isRtlArabic ? 'text-right sm:text-left' : 'text-left sm:text-right'
                              }`}
                            >
                              <p className="font-bold text-slate-900">{reportStudent.fullName}</p>
                              <p className="text-slate-600">
                                {reportStudent.className} · {reportStudent.admissionNo}
                              </p>
                            </div>
                          </div>

                          {/* Mobile Subject Scores */}
                          <div className="md:hidden divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                            {reportStudent.marks.map((m) => {
                              const total = m.ca + m.exam;
                              const g = getLocalizedGradeDetails(total, teacherProfile.schoolType, gradingMode);
                              return (
                                <div key={m.subject} className="p-4 flex items-center justify-between gap-3 text-sm tabular-nums">
                                  <div>
                                    <p className="font-bold text-slate-900">{m.subject}</p>
                                    <p className="text-slate-500">
                                      {isRtlArabic ? 'الأعمال' : 'CA'}{' '}
                                      {formatDisplayNumeral(m.ca, isMadrasah, gradingMode)} ·{' '}
                                      {isRtlArabic ? 'الامتحان' : 'Exam'}{' '}
                                      {formatDisplayNumeral(m.exam, isMadrasah, gradingMode)}
                                    </p>
                                  </div>
                                  <div className={isRtlArabic ? 'text-left' : 'text-right'}>
                                    <p className="font-extrabold text-slate-900">
                                      {formatDisplayNumeral(total, isMadrasah, gradingMode)}/
                                      {formatDisplayNumeral(100, isMadrasah, gradingMode)}
                                    </p>
                                    <p className={`font-bold ${g.textColor}`}>{g.grade} ({g.remark})</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Desktop Subject Table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table
                              className={`w-full border-collapse text-sm ${
                                isRtlArabic ? 'text-right' : 'text-left'
                              }`}
                            >
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-600 font-bold">
                                  <th className="py-2 pr-3">{isRtlArabic ? 'المادة' : 'Subject'}</th>
                                  <th className="py-2 px-2 text-center">
                                    {isRtlArabic ? 'الأعمال (٤٠)' : 'CA (40)'}
                                  </th>
                                  <th className="py-2 px-2 text-center">
                                    {isRtlArabic ? 'الامتحان (٦٠)' : 'Exam (60)'}
                                  </th>
                                  <th className="py-2 px-2 text-center">
                                    {isRtlArabic ? 'المجموع (١٠٠)' : 'Total'}
                                  </th>
                                  <th className="py-2 pl-2 text-center">
                                    {isRtlArabic ? 'التقدير' : 'Grade'}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 tabular-nums">
                                {reportStudent.marks.map((m) => {
                                  const total = m.ca + m.exam;
                                  const g = getLocalizedGradeDetails(total, teacherProfile.schoolType, gradingMode);
                                  return (
                                    <tr key={m.subject}>
                                      <td className="py-3 pr-3 font-semibold text-slate-900">{m.subject}</td>
                                      <td className="py-3 px-2 text-center text-slate-600">
                                        {formatDisplayNumeral(m.ca, isMadrasah, gradingMode)}
                                      </td>
                                      <td className="py-3 px-2 text-center text-slate-600">
                                        {formatDisplayNumeral(m.exam, isMadrasah, gradingMode)}
                                      </td>
                                      <td className="py-3 px-2 text-center font-bold text-slate-900">
                                        {formatDisplayNumeral(total, isMadrasah, gradingMode)}
                                      </td>
                                      <td className={`py-3 pl-2 text-center font-bold ${g.textColor}`}>
                                        {g.grade} ({g.remark})
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-sm tabular-nums">
                            <div>
                              <span className="text-slate-500 block">
                                {isRtlArabic ? 'المجموع الكلي' : 'Total Score'}
                              </span>
                              <span className="text-base font-extrabold text-slate-900">
                                {formatDisplayNumeral(reportSummary.totalObtained, isMadrasah, gradingMode)} /{' '}
                                {formatDisplayNumeral(reportSummary.maxTotal, isMadrasah, gradingMode)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">
                                {isRtlArabic ? 'المعدل العام' : 'Class Average'}
                              </span>
                              <span className="text-base font-extrabold text-[#6D28D9]">
                                {formatDisplayNumeral(reportSummary.average, isMadrasah, gradingMode)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">
                                {isRtlArabic ? 'نسبة الحضور' : 'Term Attendance'}
                              </span>
                              <span className="text-base font-extrabold text-emerald-700">
                                {formatDisplayNumeral(reportSummary.attendance.attendancePct, isMadrasah, gradingMode)}%
                                <span className="text-sm font-medium text-slate-500 ml-1">
                                  ({reportSummary.attendance.present + reportSummary.attendance.late}/{reportSummary.attendance.totalDays}d)
                                </span>
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">
                                {isRtlArabic ? 'التقدير العام' : 'Standing'}
                              </span>
                              <span className={`text-base font-extrabold ${reportSummary.grade.textColor}`}>
                                {reportSummary.grade.grade} — {reportSummary.grade.remark}
                              </span>
                            </div>
                          </div>

                          {(tahfizDraft || remarkDraft) && (
                            <div className="space-y-2 text-sm text-slate-700 border-t border-slate-200 pt-4">
                              {tahfizDraft && (
                                <p>
                                  <strong className="text-slate-900">
                                    {isRtlArabic ? 'متابعة الحفظ:' : 'Tahfiz Milestone:'}
                                  </strong>{' '}
                                  {tahfizDraft}
                                </p>
                              )}
                              {remarkDraft && (
                                <p>
                                  <strong className="text-slate-900">
                                    {isRtlArabic ? 'ملاحظة المعلم:' : 'Class Teacher Remark:'}
                                  </strong>{' '}
                                  {remarkDraft}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
