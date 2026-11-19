import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  LogIn,
  LogOut,
  Users,
  UserCheck,
  CreditCard,
  FileSpreadsheet,
  Settings,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
  Printer,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  X,
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  Check,
} from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { ADMIN_EMAIL } from '../lib/firebase';
import { formatPlainError } from '../lib/formatError';
import {
  WeeklyBriefingCard,
  type WeeklyClassReadinessItem,
  type WeeklyFeeReminderItem,
  type WeeklyFollowUpItem,
} from '../components/WeeklyBriefingCard';
import {
  createTeacherAndSyncClass,
  deleteSchoolStudent,
  deleteTeacherAndClearStudents,
  enrollNewStudent,
  getStudentAttendanceForDate,
  getStudentAttendanceSummary,
  getTodayIsoDate,
  initializeSchoolSystem,
  markStudentsPresentBatchInDb,
  recordStudentTuitionPayment,
  saveStudentMarksAndRemarksInDb,
  subscribeAllStudentFees,
  subscribeAllStudents,
  subscribeAllTeachers,
  subscribeSchoolSettings,
  updateSchoolSettingsAndSyncTeachers,
  updateStudentAttendanceInDb,
  updateStudentClassInDb,
  updateTeacherAndSyncClass,
  type AttendanceStatus,
  type FeePaymentItem,
  type FeePaymentMethod,
  type MadrasahGradingMode,
  type SchoolCurriculumType,
  type SchoolMark,
  type SchoolSettingsRecord,
  type SchoolStudentFeeRecord,
  type SchoolStudentRecord,
  type SchoolTeacherRecord,
  type TeacherStatus,
} from '../lib/schoolDb';
import {
  formatDisplayNumeral,
  formatInputScore,
  getLocalizedGradeDetails,
  getMadrasahModeShortLabel,
  getMadrasahSubjectsPreset,
  parseScoreInput,
} from '../lib/madrasahGrading';
import {
  MadrasahGradingModal,
  MadrasahGradingSelector,
} from '../components/MadrasahGradingPrompt';

type AdminWorkspaceTab =
  | 'overview'
  | 'attendance'
  | 'teachers'
  | 'students'
  | 'results'
  | 'fees'
  | 'settings';

interface ActiveFeeReceipt {
  schoolName: string;
  termLabel: string;
  studentName: string;
  className: string;
  guardianName: string;
  balanceAfterNgn: number;
  payment: FeePaymentItem;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export const SchoolAdminPage: React.FC = () => {
  const { user, isAuthReady, isAdmin, isSigningIn, authError, signInWithGoogle, signOutUser } =
    useFirebaseAuth();

  // Live Firestore State
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettingsRecord | null>(null);
  const [teachers, setTeachers] = useState<SchoolTeacherRecord[]>([]);
  const [students, setStudents] = useState<SchoolStudentRecord[]>([]);
  const [studentFees, setStudentFees] = useState<SchoolStudentFeeRecord[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>('overview');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');

  // Attendance Tab State
  const [attendanceDate, setAttendanceDate] = useState<string>(() => getTodayIsoDate());
  const [attendanceClassFilter, setAttendanceClassFilter] = useState('all');
  const [savingAttendanceId, setSavingAttendanceId] = useState<string | null>(null);
  const [isBatchMarkingAttendance, setIsBatchMarkingAttendance] = useState(false);

  // First-time School Setup Form
  const [setupName, setSetupName] = useState('Al-Hikmah Model College');
  const [setupType, setSetupType] = useState<SchoolCurriculumType>('conventional');
  const [setupMadrasahGrading, setSetupMadrasahGrading] = useState<MadrasahGradingMode>('both');
  const [setupTerm, setSetupTerm] = useState('First Term · 2026/2027');
  const [setupSeedSamples, setSetupSeedSamples] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Teachers Tab Form & Editing
  const teacherNameInputRef = useRef<HTMLInputElement | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    assignedClass: '',
    assignedSubject: '',
  });
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);
  const [confirmDeleteTeacherId, setConfirmDeleteTeacherId] = useState<string | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editTeacherDraft, setEditTeacherDraft] = useState<{
    assignedClass: string;
    assignedSubject: string;
    status: TeacherStatus;
  }>({ assignedClass: '', assignedSubject: '', status: 'active' });

  // Students Tab: Enroll Modal & Delete
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    fullName: '',
    admissionNo: '',
    className: '',
    gender: 'Female' as 'Male' | 'Female',
    guardianName: '',
    guardianPhone: '',
    termFeeNgn: '75000',
  });
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<string | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentClass, setEditingStudentClass] = useState('');
  const [isSavingStudentClass, setIsSavingStudentClass] = useState(false);

  // Results & Report Cards Tab
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [pendingResultStudentId, setPendingResultStudentId] = useState<string | null>(null);
  const [marksDraft, setMarksDraft] = useState<SchoolMark[]>([]);
  const [remarkDraft, setRemarkDraft] = useState('');
  const [tahfizDraft, setTahfizDraft] = useState('');
  const [isSavingResult, setIsSavingResult] = useState(false);

  // Fees Tab: Payment Modal & Receipt
  const [feeModalStudentId, setFeeModalStudentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<FeePaymentMethod>('Bank Transfer');
  const [paymentNote, setPaymentNote] = useState('Termly tuition payment');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ActiveFeeReceipt | null>(null);

  // School Settings Tab Form
  const [settingsNameDraft, setSettingsNameDraft] = useState('');
  const [settingsTypeDraft, setSettingsTypeDraft] = useState<SchoolCurriculumType>('conventional');
  const [settingsMadrasahGrading, setSettingsMadrasahGrading] =
    useState<MadrasahGradingMode>('english');
  const [showSettingsMadrasahModal, setShowSettingsMadrasahModal] = useState(false);
  const [settingsTermDraft, setSettingsTermDraft] = useState('');
  const [settingsClassesText, setSettingsClassesText] = useState('');
  const [settingsSubjectsText, setSettingsSubjectsText] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => {
      setStatusNotice((curr) => (curr === msg ? null : curr));
    }, 3600);
  };

  // Subscribe to Firestore only when verified Admin is signed in
  useEffect(() => {
    if (!isAuthReady || !isAdmin) {
      setSettingsLoaded(false);
      setSchoolSettings(null);
      setTeachers([]);
      setStudents([]);
      setStudentFees([]);
      return;
    }

    setDbError(null);
    const unsubSettings = subscribeSchoolSettings(
      (data) => {
        setSchoolSettings(data);
        setSettingsLoaded(true);
      },
      (msg) => {
        setDbError(formatPlainError(msg, 'Unable to load school settings.'));
        setSettingsLoaded(true);
      }
    );
    const unsubTeachers = subscribeAllTeachers(setTeachers, (msg) =>
      setDbError(formatPlainError(msg, 'Unable to load teacher list.'))
    );
    const unsubStudents = subscribeAllStudents(setStudents, (msg) =>
      setDbError(formatPlainError(msg, 'Unable to load student list.'))
    );
    const unsubFees = subscribeAllStudentFees(setStudentFees, (msg) =>
      setDbError(formatPlainError(msg, 'Unable to load tuition fee records.'))
    );

    return () => {
      unsubSettings();
      unsubTeachers();
      unsubStudents();
      unsubFees();
    };
  }, [isAuthReady, isAdmin]);

  // Sync default class/subject dropdowns when schoolSettings loads/changes
  useEffect(() => {
    if (!schoolSettings) return;
    setSettingsNameDraft(schoolSettings.schoolName);
    setSettingsTypeDraft(schoolSettings.schoolType);
    setSettingsMadrasahGrading(schoolSettings.madrasahGradingMode ?? 'english');
    setSettingsTermDraft(schoolSettings.termLabel);
    setSettingsClassesText(schoolSettings.classes.join(', '));
    setSettingsSubjectsText(schoolSettings.subjects.join(', '));

    setTeacherForm((prev) => ({
      ...prev,
      assignedClass: schoolSettings.classes.includes(prev.assignedClass)
        ? prev.assignedClass
        : schoolSettings.classes[0] || '',
      assignedSubject: schoolSettings.subjects.includes(prev.assignedSubject)
        ? prev.assignedSubject
        : schoolSettings.subjects[0] || '',
    }));
    setEnrollForm((prev) => ({
      ...prev,
      className: schoolSettings.classes.includes(prev.className)
        ? prev.className
        : schoolSettings.classes[0] || '',
    }));
  }, [schoolSettings]);

  // Keep selected student valid for Results tab
  useEffect(() => {
    if (students.length === 0) {
      setSelectedStudentId('');
      return;
    }
    if (!students.some((s) => s.studentId === selectedStudentId)) {
      setSelectedStudentId(students[0].studentId);
    }
  }, [students, selectedStudentId]);

  const selectedResultStudent = useMemo(
    () => students.find((s) => s.studentId === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  // Sync marks & remark draft when switching selected student in Results tab
  useEffect(() => {
    if (!selectedResultStudent || !schoolSettings) {
      setMarksDraft([]);
      setRemarkDraft('');
      setTahfizDraft('');
      return;
    }
    const existingMap = new Map(selectedResultStudent.marks.map((m) => [m.subject, m]));
    const merged: SchoolMark[] = schoolSettings.subjects.slice(0, 20).map((subj) => {
      const found = existingMap.get(subj);
      return found ? { ...found } : { subject: subj, ca: 0, exam: 0 };
    });
    for (const m of selectedResultStudent.marks) {
      if (!merged.some((x) => x.subject === m.subject) && merged.length < 20) {
        merged.push({ ...m });
      }
    }
    setMarksDraft(merged);
    setRemarkDraft(selectedResultStudent.teacherRemark);
    setTahfizDraft(selectedResultStudent.tahfizProgress);
  }, [selectedResultStudent, schoolSettings]);

  // Derived Metrics
  const kpis = useMemo(() => {
    const activeTeachers = teachers.filter((t) => t.status === 'active').length;
    const presentOrLate = students.filter(
      (s) => s.attendanceToday === 'present' || s.attendanceToday === 'late'
    ).length;
    const attendanceRate =
      students.length > 0 ? Math.round((presentOrLate / students.length) * 100) : 0;

    const totalExpected = studentFees.reduce((sum, f) => sum + f.termFeeNgn, 0);
    const totalCollected = studentFees.reduce((sum, f) => sum + f.amountPaidNgn, 0);
    const totalOutstanding = Math.max(0, totalExpected - totalCollected);

    return {
      totalStudents: students.length,
      activeTeachers,
      presentOrLate,
      attendanceRate,
      totalExpected,
      totalCollected,
      totalOutstanding,
    };
  }, [teachers, students, studentFees]);

  const weeklyBriefing = useMemo(() => {
    const todayIso = getTodayIsoDate();
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekDates: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      weekDates.push(`${y}-${m}-${day}`);
    }

    const feeMap = new Map(studentFees.map((f) => [f.studentId, f]));

    const followUpStudents: WeeklyFollowUpItem[] = [];
    for (const stu of students) {
      let absentDays = 0;
      let lateDays = 0;
      let trackedDays = 0;
      for (const iso of weekDates) {
        const status =
          stu.attendanceHistory[iso] ?? (iso === todayIso ? stu.attendanceToday : null);
        if (status) {
          trackedDays += 1;
          if (status === 'absent') absentDays += 1;
          if (status === 'late') lateDays += 1;
        }
      }
      if (trackedDays === 0) {
        trackedDays = 1;
        if (stu.attendanceToday === 'absent') absentDays = 1;
        if (stu.attendanceToday === 'late') lateDays = 1;
      }

      if (absentDays >= 1 || lateDays >= 2) {
        const parts: string[] = [];
        if (absentDays > 0) {
          parts.push(`Absent ${absentDays} of ${trackedDays} tracked day${trackedDays === 1 ? '' : 's'}`);
        }
        if (lateDays > 0) {
          parts.push(`Late ${lateDays} day${lateDays === 1 ? '' : 's'}`);
        }
        const feeInfo = feeMap.get(stu.studentId);
        followUpStudents.push({
          studentId: stu.studentId,
          studentName: stu.fullName,
          className: stu.className,
          guardianName: feeInfo?.guardianName ?? 'Parent / Guardian',
          guardianPhone: feeInfo?.guardianPhone ?? '',
          absentDays,
          lateDays,
          totalDaysTracked: trackedDays,
          summaryText: parts.join(' · '),
        });
      }
    }
    followUpStudents.sort((a, b) => b.absentDays - a.absentDays || b.lateDays - a.lateDays);

    const allOwing: WeeklyFeeReminderItem[] = studentFees
      .map((fee) => ({
        studentId: fee.studentId,
        studentName: fee.fullName,
        className: fee.className,
        guardianName: fee.guardianName,
        guardianPhone: fee.guardianPhone,
        termFeeNgn: fee.termFeeNgn,
        amountPaidNgn: fee.amountPaidNgn,
        balanceNgn: Math.max(0, fee.termFeeNgn - fee.amountPaidNgn),
      }))
      .filter((item) => item.balanceNgn > 0)
      .sort((a, b) => b.balanceNgn - a.balanceNgn);

    const classes = schoolSettings?.classes ?? [];
    const classReadiness: WeeklyClassReadinessItem[] = classes.map((cls) => {
      const assigned = teachers.find((t) => t.status === 'active' && t.assignedClass === cls);
      const classStudents = students.filter((s) => s.className === cls);
      const presentOrLate = classStudents.filter(
        (s) => s.attendanceToday === 'present' || s.attendanceToday === 'late'
      ).length;
      const scoredCount = classStudents.filter((s) =>
        s.marks.some((m) => m.ca + m.exam > 0)
      ).length;
      const hasAbsences = classStudents.some((s) => s.attendanceToday === 'absent');
      const missingMarks = classStudents.length > 0 && scoredCount < classStudents.length;

      return {
        className: cls,
        teacherName: assigned?.fullName ?? null,
        studentCount: classStudents.length,
        attendanceSummary:
          classStudents.length === 0
            ? 'No students enrolled yet'
            : `${presentOrLate}/${classStudents.length} present or late today`,
        marksSummary:
          classStudents.length === 0
            ? 'Awaiting enrollment'
            : `${scoredCount}/${classStudents.length} students have CA & exam scores`,
        needsAttention: !assigned || hasAbsences || missingMarks,
      };
    });

    return {
      weekLabel: `Week of ${weekDates[0]}`,
      followUpStudents,
      feeReminders: allOwing.slice(0, 4),
      totalOwingCount: allOwing.length,
      classReadiness,
    };
  }, [students, teachers, studentFees, schoolSettings]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (studentClassFilter !== 'all' && s.className !== studentClassFilter) return false;
      if (!q) return true;
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      );
    });
  }, [students, studentSearch, studentClassFilter]);

  const filteredAttendanceStudents = useMemo(() => {
    if (attendanceClassFilter === 'all') return students;
    return students.filter((s) => s.className === attendanceClassFilter);
  }, [students, attendanceClassFilter]);

  const attendanceDateStats = useMemo(() => {
    const statuses = filteredAttendanceStudents.map((s) =>
      getStudentAttendanceForDate(s, attendanceDate)
    );
    return {
      total: filteredAttendanceStudents.length,
      present: statuses.filter((st) => st === 'present').length,
      late: statuses.filter((st) => st === 'late').length,
      absent: statuses.filter((st) => st === 'absent').length,
      unmarked: statuses.filter((st) => st === null).length,
    };
  }, [filteredAttendanceStudents, attendanceDate]);

  const feeTargetStudent = useMemo(
    () => studentFees.find((f) => f.studentId === feeModalStudentId) ?? null,
    [studentFees, feeModalStudentId]
  );

  const isMadrasah = schoolSettings?.schoolType === 'madrasah';
  const activeGradingMode: MadrasahGradingMode = isMadrasah
    ? schoolSettings?.madrasahGradingMode ?? 'english'
    : 'english';

  const selectedResultSummary = useMemo(() => {
    const type = schoolSettings?.schoolType ?? 'conventional';
    if (marksDraft.length === 0) {
      return {
        totalObtained: 0,
        maxTotal: 0,
        average: 0,
        grade: getLocalizedGradeDetails(0, type, activeGradingMode),
      };
    }
    const totalObtained = marksDraft.reduce((sum, m) => sum + m.ca + m.exam, 0);
    const maxTotal = marksDraft.length * 100;
    const average = Math.round(totalObtained / marksDraft.length);
    return {
      totalObtained,
      maxTotal,
      average,
      grade: getLocalizedGradeDetails(average, type, activeGradingMode),
    };
  }, [marksDraft, schoolSettings?.schoolType, activeGradingMode]);

  const selectedResultAttendance = useMemo(() => {
    if (!selectedResultStudent) {
      return { present: 0, late: 0, absent: 0, totalDays: 0, attendancePct: 100 };
    }
    return getStudentAttendanceSummary(selectedResultStudent);
  }, [selectedResultStudent]);

  const hasUnsavedResultEdits = useMemo(() => {
    if (!selectedResultStudent || !schoolSettings) return false;
    if (remarkDraft !== selectedResultStudent.teacherRemark) return true;
    if (tahfizDraft !== selectedResultStudent.tahfizProgress) return true;
    const savedMap = new Map(selectedResultStudent.marks.map((m) => [m.subject, m]));
    for (const m of marksDraft) {
      const saved = savedMap.get(m.subject);
      const savedCa = saved?.ca ?? 0;
      const savedExam = saved?.exam ?? 0;
      if (m.ca !== savedCa || m.exam !== savedExam) return true;
    }
    return false;
  }, [selectedResultStudent, schoolSettings, marksDraft, remarkDraft, tahfizDraft]);

  // Handlers
  const handleInitializeSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbError(null);
    if (!setupName.trim()) {
      setDbError('Please enter your school name.');
      return;
    }
    setIsInitializing(true);
    try {
      await initializeSchoolSystem({
        schoolName: setupName,
        schoolType: setupType,
        madrasahGradingMode: setupType === 'madrasah' ? setupMadrasahGrading : 'english',
        termLabel: setupTerm,
        seedSampleStudents: setupSeedSamples,
      });
      showToast('Real School System created and ready to use.');
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to set up the school database right now.'));
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolSettings) return;
    setDbError(null);

    const name = teacherForm.fullName.trim();
    const email = teacherForm.email.trim().toLowerCase();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setDbError('Enter a valid teacher full name and Google email address.');
      return;
    }
    if (teachers.some((t) => t.email.toLowerCase() === email)) {
      setDbError(
        'A teacher with that email is already registered. Edit their record in the directory right beside this form.'
      );
      return;
    }

    setIsSavingTeacher(true);
    try {
      await createTeacherAndSyncClass({
        fullName: name,
        email,
        assignedClass: teacherForm.assignedClass || schoolSettings.classes[0],
        assignedSubject: teacherForm.assignedSubject || schoolSettings.subjects[0],
        settings: schoolSettings,
        allStudents: students,
      });
      setTeacherForm((prev) => ({ ...prev, fullName: '', email: '' }));
      showToast(`Assigned ${name} (${email}) to ${teacherForm.assignedClass}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to save this teacher assignment.'));
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const handleSaveTeacherEdit = async (teacher: SchoolTeacherRecord) => {
    setDbError(null);
    const nextClass =
      editTeacherDraft.assignedClass || schoolSettings?.classes[0] || teacher.assignedClass;
    const nextSubject =
      editTeacherDraft.assignedSubject || schoolSettings?.subjects[0] || teacher.assignedSubject;
    if (!nextClass || !nextSubject) {
      setDbError('Please select both a class and a primary subject before saving.');
      return;
    }
    setIsSavingTeacher(true);
    try {
      await updateTeacherAndSyncClass({
        teacher,
        nextStatus: editTeacherDraft.status,
        nextClass,
        nextSubject,
        allStudents: students,
      });
      setEditingTeacherId(null);
      showToast(
        `Updated ${teacher.fullName} to ${nextClass} (${nextSubject}).`
      );
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to update teacher assignment.'));
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const handleDeleteTeacher = async (teacher: SchoolTeacherRecord) => {
    setDbError(null);
    setIsSavingTeacher(true);
    try {
      await deleteTeacherAndClearStudents(teacher, students);
      setConfirmDeleteTeacherId(null);
      showToast(`Removed ${teacher.fullName} and cleared class link.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to remove this teacher right now.'));
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolSettings) return;
    setDbError(null);

    const fullName = enrollForm.fullName.trim();
    const guardianName = enrollForm.guardianName.trim();
    const guardianPhone = enrollForm.guardianPhone.trim();
    if (!fullName || !guardianName || guardianPhone.length < 7) {
      setDbError('Please enter student full name, guardian name, and a valid guardian phone number.');
      return;
    }

    const admissionNo =
      enrollForm.admissionNo.trim() ||
      `SCH-${new Date().getFullYear()}-${String(students.length + 101).padStart(3, '0')}`;

    setIsEnrolling(true);
    try {
      await enrollNewStudent({
        fullName,
        admissionNo,
        className: enrollForm.className || schoolSettings.classes[0],
        gender: enrollForm.gender,
        guardianName,
        guardianPhone,
        termFeeNgn: Math.max(0, Number(enrollForm.termFeeNgn) || 0),
        settings: schoolSettings,
        teachers,
      });
      setEnrollForm((prev) => ({
        ...prev,
        fullName: '',
        admissionNo: '',
        guardianName: '',
        guardianPhone: '',
      }));
      setShowEnrollModal(false);
      showToast(`Enrolled ${fullName} into ${enrollForm.className}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to enroll student. Please check the fields and try again.'));
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setDbError(null);
    setDeletingStudentId(studentId);
    try {
      await deleteSchoolStudent(studentId);
      setConfirmDeleteStudentId(null);
      showToast('Student academic and fee records removed.');
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to remove student record right now.'));
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleSaveStudentClass = async (student: SchoolStudentRecord) => {
    setDbError(null);
    const nextClass = editingStudentClass || schoolSettings?.classes[0] || student.className;
    if (!nextClass) {
      setDbError('Please pick a class before saving.');
      return;
    }
    setIsSavingStudentClass(true);
    try {
      await updateStudentClassInDb({
        student,
        nextClass,
        teachers,
        hasFeeRecord: studentFees.some((f) => f.studentId === student.studentId),
      });
      setEditingStudentId(null);
      showToast(`Moved ${student.fullName} to ${nextClass}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to update student class right now.'));
    } finally {
      setIsSavingStudentClass(false);
    }
  };

  const handleAdminSetAttendance = async (
    student: SchoolStudentRecord,
    status: AttendanceStatus
  ) => {
    setDbError(null);
    setSavingAttendanceId(student.studentId);
    try {
      await updateStudentAttendanceInDb(student, status, attendanceDate);
      showToast(`Marked ${student.fullName} as ${status} for ${attendanceDate}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to update attendance right now.'));
    } finally {
      setSavingAttendanceId(null);
    }
  };

  const handleAdminMarkVisiblePresent = async () => {
    if (filteredAttendanceStudents.length === 0) return;
    setDbError(null);
    setIsBatchMarkingAttendance(true);
    try {
      await markStudentsPresentBatchInDb(filteredAttendanceStudents, attendanceDate);
      showToast(
        `Marked ${filteredAttendanceStudents.length} student(s) Present for ${attendanceDate}.`
      );
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to mark all visible students present.'));
    } finally {
      setIsBatchMarkingAttendance(false);
    }
  };

  const handleSaveStudentResults = async (): Promise<boolean> => {
    if (!selectedResultStudent) return false;
    setDbError(null);
    setIsSavingResult(true);
    try {
      const cleanedMarks = marksDraft.slice(0, 20).map((m) => ({
        subject: m.subject,
        ca: Math.min(40, Math.max(0, Math.round(Number(m.ca) || 0))),
        exam: Math.min(60, Math.max(0, Math.round(Number(m.exam) || 0))),
      }));
      await saveStudentMarksAndRemarksInDb({
        studentId: selectedResultStudent.studentId,
        marks: cleanedMarks,
        teacherRemark: remarkDraft,
        tahfizProgress: tahfizDraft,
      });
      showToast(`Saved terminal marks and remarks for ${selectedResultStudent.fullName}.`);
      return true;
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to save student results. Please try again.'));
      return false;
    } finally {
      setIsSavingResult(false);
    }
  };

  const handleRequestSwitchResultStudent = (nextId: string) => {
    if (nextId === selectedStudentId) return;
    if (hasUnsavedResultEdits) {
      setPendingResultStudentId(nextId);
      return;
    }
    setPendingResultStudentId(null);
    setSelectedStudentId(nextId);
  };

  const handleSaveAndSwitchResultStudent = async () => {
    if (!pendingResultStudentId) return;
    const nextId = pendingResultStudentId;
    const savedOk = await handleSaveStudentResults();
    if (savedOk) {
      setPendingResultStudentId(null);
      setSelectedStudentId(nextId);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeTargetStudent || !schoolSettings) return;
    setDbError(null);

    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setDbError('Enter a valid payment amount in Naira.');
      return;
    }

    setIsRecordingPayment(true);
    try {
      const tx = await recordStudentTuitionPayment({
        feeRecord: feeTargetStudent,
        amountNgn: amount,
        method: paymentMethod,
        note: paymentNote,
      });
      const balanceAfter = Math.max(
        0,
        feeTargetStudent.termFeeNgn - (feeTargetStudent.amountPaidNgn + amount)
      );
      setActiveReceipt({
        schoolName: schoolSettings.schoolName,
        termLabel: schoolSettings.termLabel,
        studentName: feeTargetStudent.fullName,
        className: feeTargetStudent.className,
        guardianName: feeTargetStudent.guardianName,
        balanceAfterNgn: balanceAfter,
        payment: tx,
      });
      setFeeModalStudentId(null);
      setPaymentAmount('');
      showToast(`Recorded ${formatNaira(amount)} tuition payment for ${feeTargetStudent.fullName}.`);
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to record this payment right now.'));
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbError(null);

    const classes = settingsClassesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
    const subjects = settingsSubjectsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 25);

    if (!settingsNameDraft.trim() || classes.length === 0 || subjects.length === 0) {
      setDbError('School name, at least 1 class, and at least 1 subject are required.');
      return;
    }

    setIsSavingSettings(true);
    try {
      await updateSchoolSettingsAndSyncTeachers(
        {
          schoolName: settingsNameDraft,
          schoolType: settingsTypeDraft,
          madrasahGradingMode:
            settingsTypeDraft === 'madrasah' ? settingsMadrasahGrading : 'english',
          termLabel: settingsTermDraft,
          classes,
          subjects,
        },
        teachers
      );
      showToast('School settings updated and synced across teacher portals.');
    } catch (err) {
      setDbError(formatPlainError(err, 'Unable to save school settings. Please try again.'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handlePrintDialog = (label: string) => {
    showToast(`Opening print dialog for ${label}.`);
    window.print();
  };

  const goToEnrollModal = () => {
    setActiveTab('students');
    setShowEnrollModal(true);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[82vh] py-12 lg:py-16 print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Admin Context Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#6D28D9]">
              <ShieldCheck className="w-4 h-4 text-[#EC4899] shrink-0" />
              <span>School Administrator Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {schoolSettings ? schoolSettings.schoolName : 'School Admin Sign-In'}
            </h1>
            <p className="text-sm text-slate-600">
              {schoolSettings
                ? `${
                    schoolSettings.schoolType === 'madrasah'
                      ? `Madrasah / Tahfiz (${getMadrasahModeShortLabel(schoolSettings.madrasahGradingMode)})`
                      : 'Conventional Curriculum'
                  } · ${schoolSettings.termLabel}`
                : `Restricted to verified School Admin (${ADMIN_EMAIL})`}
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
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <span>Leads Inbox</span>
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
            <p className="text-base font-semibold text-slate-600">Checking administrator credentials...</p>
          </div>
        )}

        {/* Signed Out */}
        {isAuthReady && !user && (
          <div className="max-w-lg mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6D28D9] border border-purple-100 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                School Admin Sign-In Required
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Sign in with the School Administrator Google account (
                <strong className="text-slate-900">{ADMIN_EMAIL}</strong>) to configure classes, assign teachers, enroll students, and manage fees.
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
              Are you a class teacher?{' '}
              <Link to="/school/teacher" className="font-bold text-[#6D28D9] hover:underline">
                Go to Class Teacher Login &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Signed In But Not Admin */}
        {isAuthReady && user && !isAdmin && (
          <div className="max-w-lg mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-red-200 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                Administrator Access Only
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                You are signed in as <strong className="text-slate-900">{user.email}</strong>. This portal is strictly reserved for the School Administrator.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={isSigningIn}
                className="min-h-11 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSigningIn ? 'Opening Google...' : 'Switch Google Account'}
              </button>
              <Link
                to="/school/teacher"
                className="inline-flex items-center min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Open Class Teacher Portal
              </Link>
            </div>
          </div>
        )}

        {/* Authorized Admin Area */}
        {isAuthReady && isAdmin && (
          <>
            {dbError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 flex items-center gap-2 print:hidden">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dbError}</span>
              </div>
            )}

            {statusNotice && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800 flex items-center gap-2 print:hidden">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusNotice}</span>
              </div>
            )}

            {!settingsLoaded ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                <Clock className="w-8 h-8 text-[#6D28D9] animate-spin mx-auto" />
                <p className="text-base font-semibold text-slate-600">Loading your school database...</p>
              </div>
            ) : !schoolSettings ? (
              /* First-Time Setup Screen */
              <form
                onSubmit={handleInitializeSchool}
                className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 space-y-6"
              >
                <div className="space-y-2">
                  <span className="text-sm font-bold text-[#6D28D9]">Step 1 of 1 · Initial Setup</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                    Set Up Your Real School Database
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed">
                    Create your live school workspace. Once initialized, you can assign teachers to specific classes, enroll students, and manage fees.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">School Name</label>
                    <input
                      type="text"
                      required
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      placeholder="e.g., Al-Hikmah Model College"
                      className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Curriculum Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSetupType('conventional')}
                        className={`min-h-11 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          setupType === 'conventional'
                            ? 'border-[#6D28D9] bg-purple-50 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-base font-bold">Conventional School</div>
                        <div className="text-sm text-slate-500 mt-1">JSS 1A, JSS 2A, SSS 1 Science</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSetupType('madrasah')}
                        className={`min-h-11 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          setupType === 'madrasah'
                            ? 'border-[#6D28D9] bg-purple-50 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-base font-bold">Madrasah &amp; Tahfiz</div>
                        <div className="text-sm text-slate-500 mt-1">
                          Ibtida&apos;iyyah, I&apos;dadiyyah, Tahfiz Halqah
                        </div>
                      </button>
                    </div>
                  </div>

                  {setupType === 'madrasah' && (
                    <MadrasahGradingSelector
                      value={setupMadrasahGrading}
                      onChange={setSetupMadrasahGrading}
                    />
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Active Term / Session
                    </label>
                    <input
                      type="text"
                      required
                      value={setupTerm}
                      onChange={(e) => setSetupTerm(e.target.value)}
                      className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                    />
                  </div>

                  <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer min-h-11">
                    <input
                      type="checkbox"
                      checked={setupSeedSamples}
                      onChange={(e) => setSetupSeedSamples(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[#6D28D9] focus:ring-[#6D28D9]"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      <strong className="block text-slate-900">
                        Include 3 starter students to test right away
                      </strong>
                      Recommended while learning — you can delete them anytime or enroll real students.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isInitializing}
                  className="w-full min-h-11 py-3 px-6 rounded-xl text-base font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isInitializing ? 'Creating School Database...' : 'Initialize Real School System'}
                </button>
              </form>
            ) : (
              /* Active Admin Workspace */
              <>
                {/* Navigation Tabs */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap gap-2 print:hidden">
                  {(
                    [
                      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
                      { id: 'teachers', label: `Teachers & Classes (${teachers.length})`, icon: UserCheck },
                      { id: 'students', label: `Students (${students.length})`, icon: Users },
                      { id: 'results', label: 'Results & Report Cards', icon: FileSpreadsheet },
                      { id: 'fees', label: 'Tuition Fees (Admin Only)', icon: CreditCard },
                      { id: 'settings', label: 'School Settings', icon: Settings },
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

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Enrolled Students</span>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-3xl font-extrabold text-slate-900 font-display tabular-nums">
                            {kpis.totalStudents}
                          </span>
                          <Users className="w-5 h-5 text-[#6D28D9]" />
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Active Teachers</span>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-3xl font-extrabold text-slate-900 font-display tabular-nums">
                            {kpis.activeTeachers}
                          </span>
                          <UserCheck className="w-5 h-5 text-[#EC4899]" />
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Attendance Today</span>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-3xl font-extrabold text-emerald-700 font-display tabular-nums">
                            {kpis.attendanceRate}%
                          </span>
                          <span className="text-sm text-slate-500 tabular-nums">
                            {kpis.presentOrLate}/{kpis.totalStudents} marked
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Fees Collected</span>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">
                            {formatNaira(kpis.totalCollected)}
                          </span>
                          <CreditCard className="w-5 h-5 text-[#6D28D9]" />
                        </div>
                        <p className="text-sm text-slate-500 mt-1 tabular-nums">
                          Outstanding: {formatNaira(kpis.totalOutstanding)}
                        </p>
                      </div>
                    </div>

                    <WeeklyBriefingCard
                      storageNamespace="real_school_admin"
                      schoolName={schoolSettings.schoolName}
                      termLabel={schoolSettings.termLabel}
                      weekLabel={weeklyBriefing.weekLabel}
                      followUpStudents={weeklyBriefing.followUpStudents}
                      feeReminders={weeklyBriefing.feeReminders}
                      totalOwingCount={weeklyBriefing.totalOwingCount}
                      classReadiness={weeklyBriefing.classReadiness}
                      onRecordFee={(stuId) => {
                        const targetFee = studentFees.find((f) => f.studentId === stuId);
                        const balance = targetFee
                          ? Math.max(0, targetFee.termFeeNgn - targetFee.amountPaidNgn)
                          : 0;
                        setActiveTab('fees');
                        setFeeModalStudentId(stuId);
                        setPaymentAmount(balance > 0 ? String(balance) : '10000');
                      }}
                      onOpenAttendance={() => setActiveTab('attendance')}
                      onOpenClassCheck={(clsName, needsTeacher) => {
                        if (needsTeacher) {
                          setActiveTab('teachers');
                          setTeacherForm((prev) => ({ ...prev, assignedClass: clsName }));
                          return;
                        }
                        const firstInClass = students.find((s) => s.className === clsName);
                        if (firstInClass) setSelectedStudentId(firstInClass.studentId);
                        setActiveTab('results');
                      }}
                      onNotify={showToast}
                    />

                    {/* Class Staffing Coverage */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-900 font-display">
                            Class Staffing &amp; Student Coverage
                          </h2>
                          <p className="text-sm text-slate-600 mt-1">
                            Each class needs an active teacher assigned so they can sign in at /school/teacher.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('teachers')}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer self-start"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Assign Teacher</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {schoolSettings.classes.map((cls) => {
                          const assigned = teachers.find(
                            (t) => t.status === 'active' && t.assignedClass === cls
                          );
                          const count = students.filter((s) => s.className === cls).length;
                          return (
                            <div
                              key={cls}
                              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-extrabold text-slate-900">{cls}</h3>
                                <span className="text-sm font-semibold text-slate-600 tabular-nums">
                                  {count} student{count === 1 ? '' : 's'}
                                </span>
                              </div>
                              {assigned ? (
                                <div className="text-sm text-slate-700 space-y-1">
                                  <p className="font-bold text-emerald-700">{assigned.fullName}</p>
                                  <p className="text-slate-600 truncate">{assigned.email}</p>
                                  <p className="text-slate-500">Subject: {assigned.assignedSubject}</p>
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-amber-700">
                                  No active teacher assigned yet
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: ATTENDANCE */}
                {activeTab === 'attendance' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          School Attendance Register
                        </h2>
                        <p className="text-sm text-slate-600 mt-1 tabular-nums">
                          Date: {attendanceDate} · Present: {attendanceDateStats.present} · Late:{' '}
                          {attendanceDateStats.late} · Absent: {attendanceDateStats.absent}
                          {attendanceDateStats.unmarked > 0
                            ? ` · Unmarked: ${attendanceDateStats.unmarked}`
                            : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="date"
                          aria-label="Attendance register date"
                          value={attendanceDate}
                          max={getTodayIsoDate()}
                          onChange={(e) => {
                            if (e.target.value) setAttendanceDate(e.target.value);
                          }}
                          className="min-h-11 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                        />

                        <select
                          aria-label="Filter attendance by class"
                          value={attendanceClassFilter}
                          onChange={(e) => setAttendanceClassFilter(e.target.value)}
                          className="min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="all">All Classes</option>
                          {schoolSettings.classes.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={
                            isBatchMarkingAttendance || filteredAttendanceStudents.length === 0
                          }
                          onClick={() => void handleAdminMarkVisiblePresent()}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <Check className="w-4 h-4" />
                          <span>
                            {isBatchMarkingAttendance ? 'Saving All...' : 'Mark Visible Present'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {filteredAttendanceStudents.length === 0 ? (
                      <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                        <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-900">
                            No students found for this class filter
                          </p>
                          <p className="text-sm text-slate-600">
                            Show all classes or enroll a new student into your school.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                          {attendanceClassFilter !== 'all' && (
                            <button
                              type="button"
                              onClick={() => setAttendanceClassFilter('all')}
                              className="min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                            >
                              Show All Classes
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={goToEnrollModal}
                            className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Enroll Student</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                        {filteredAttendanceStudents.map((stu) => {
                          const dateStatus = getStudentAttendanceForDate(stu, attendanceDate);
                          const summary = getStudentAttendanceSummary(stu);
                          const isSavingThis = savingAttendanceId === stu.studentId;
                          return (
                            <div
                              key={stu.studentId}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/60"
                            >
                              <div>
                                <p className="text-base font-bold text-slate-900">{stu.fullName}</p>
                                <p className="text-sm text-slate-500 tabular-nums">
                                  {stu.className} · {stu.admissionNo} · Term Attendance:{' '}
                                  <strong className="text-slate-700">{summary.attendancePct}%</strong>{' '}
                                  ({summary.present + summary.late}/{summary.totalDays}d)
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {isSavingThis && (
                                  <span className="text-sm font-medium text-slate-500 mr-1">
                                    Saving...
                                  </span>
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
                                      onClick={() => void handleAdminSetAttendance(stu, status)}
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
                    )}
                  </div>
                )}

                {/* TAB 2: TEACHERS & CLASSES */}
                {activeTab === 'teachers' && (
                  <div className="space-y-6">
                    {/* Beginner Testing Tip */}
                    <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 sm:p-6 flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-700 leading-relaxed space-y-1">
                        <p className="font-bold text-slate-900">
                          How Teacher Logins Work (and how you can test it yourself):
                        </p>
                        <p>
                          Add a teacher below using their exact Google email (Gmail). All students in their assigned class link to that teacher automatically. To test it right now, assign a{' '}
                          <strong className="text-slate-900">second Gmail account you own</strong> to a class like{' '}
                          <span className="font-semibold">{schoolSettings.classes[0]}</span>, then open{' '}
                          <Link to="/school/teacher" className="font-bold text-[#6D28D9] underline">
                            /school/teacher
                          </Link>{' '}
                          in an Incognito browser window and sign in with that Gmail.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Assign New Teacher Form */}
                      <form
                        onSubmit={handleCreateTeacher}
                        className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 self-start"
                      >
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          Assign New Class Teacher
                        </h2>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Teacher Full Name
                          </label>
                          <input
                            ref={teacherNameInputRef}
                            type="text"
                            required
                            value={teacherForm.fullName}
                            onChange={(e) =>
                              setTeacherForm({ ...teacherForm, fullName: e.target.value })
                            }
                            placeholder="e.g., Ustadh Abdullahi Musa"
                            className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Teacher Google Email (Gmail)
                          </label>
                          <input
                            type="email"
                            required
                            value={teacherForm.email}
                            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                            placeholder="teacher.name@gmail.com"
                            className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Assigned Class
                          </label>
                          <select
                            value={teacherForm.assignedClass}
                            onChange={(e) =>
                              setTeacherForm({ ...teacherForm, assignedClass: e.target.value })
                            }
                            className="w-full min-h-11 pl-4 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                          >
                            {schoolSettings.classes.map((cls) => (
                              <option key={cls} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Primary Subject
                          </label>
                          <select
                            value={teacherForm.assignedSubject}
                            onChange={(e) =>
                              setTeacherForm({ ...teacherForm, assignedSubject: e.target.value })
                            }
                            className="w-full min-h-11 pl-4 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                          >
                            {schoolSettings.subjects.map((subj) => (
                              <option key={subj} value={subj}>
                                {subj}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingTeacher}
                          className="w-full min-h-11 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>
                            {isSavingTeacher ? 'Assigning Teacher...' : 'Save & Link Class Students'}
                          </span>
                        </button>
                      </form>

                      {/* Teachers Directory */}
                      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          Registered Class Teachers ({teachers.length})
                        </h2>

                        {dbError && (
                          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{dbError}</span>
                          </div>
                        )}
                        {statusNotice && (
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{statusNotice}</span>
                          </div>
                        )}

                        {teachers.length === 0 ? (
                          <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                            <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                            <div className="space-y-1">
                              <p className="text-base font-bold text-slate-900">
                                No teachers assigned yet
                              </p>
                              <p className="text-sm text-slate-600">
                                Add a teacher in the form to give them access to their class roll call and markbook.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => teacherNameInputRef.current?.focus()}
                              className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add First Teacher</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {teachers.map((tch) => {
                              const linkedCount = students.filter(
                                (s) => s.classTeacherEmail === tch.email.toLowerCase()
                              ).length;
                              const isEditing = editingTeacherId === tch.teacherId;

                              return (
                                <div
                                  key={tch.teacherId}
                                  className="p-4 rounded-2xl border border-slate-200 space-y-4"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-extrabold text-slate-900">
                                          {tch.fullName}
                                        </h3>
                                        <span
                                          className={`text-sm font-bold px-2.5 py-0.5 rounded-md ${
                                            tch.status === 'active'
                                              ? 'bg-emerald-50 text-emerald-700'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}
                                        >
                                          {tch.status === 'active' ? 'Active' : 'Suspended'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-600 mt-1">{tch.email}</p>
                                      <p className="text-sm text-slate-500 mt-1">
                                        Class: <strong className="text-slate-800">{tch.assignedClass}</strong> ·
                                        Subject: <strong className="text-slate-800">{tch.assignedSubject}</strong> ·{' '}
                                        <span className="tabular-nums">{linkedCount}</span> students linked
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isEditing) {
                                            setEditingTeacherId(null);
                                          } else {
                                            const validClass = schoolSettings.classes.includes(
                                              tch.assignedClass
                                            )
                                              ? tch.assignedClass
                                              : schoolSettings.classes[0] || tch.assignedClass;
                                            const validSubject = schoolSettings.subjects.includes(
                                              tch.assignedSubject
                                            )
                                              ? tch.assignedSubject
                                              : schoolSettings.subjects[0] || tch.assignedSubject;
                                            setEditingTeacherId(tch.teacherId);
                                            setEditTeacherDraft({
                                              assignedClass: validClass,
                                              assignedSubject: validSubject,
                                              status: tch.status,
                                            });
                                          }
                                        }}
                                        className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                      >
                                        {isEditing ? 'Cancel' : 'Edit Assignment'}
                                      </button>

                                      {confirmDeleteTeacherId === tch.teacherId ? (
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            disabled={isSavingTeacher}
                                            onClick={() => void handleDeleteTeacher(tch)}
                                            className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                                          >
                                            {isSavingTeacher ? 'Removing...' : 'Confirm Remove'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteTeacherId(null)}
                                            className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteTeacherId(tch.teacherId)}
                                          className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 border border-slate-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                          title="Remove teacher"
                                          aria-label={`Remove teacher ${tch.fullName}`}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {isEditing && (
                                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                      <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                          Class
                                        </label>
                                        <select
                                          value={editTeacherDraft.assignedClass}
                                          onChange={(e) =>
                                            setEditTeacherDraft({
                                              ...editTeacherDraft,
                                              assignedClass: e.target.value,
                                            })
                                          }
                                          className="w-full min-h-11 pl-3 pr-10 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                                        >
                                          {schoolSettings.classes.map((cls) => (
                                            <option key={cls} value={cls}>
                                              {cls}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                          Subject
                                        </label>
                                        <select
                                          value={editTeacherDraft.assignedSubject}
                                          onChange={(e) =>
                                            setEditTeacherDraft({
                                              ...editTeacherDraft,
                                              assignedSubject: e.target.value,
                                            })
                                          }
                                          className="w-full min-h-11 pl-3 pr-10 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                                        >
                                          {schoolSettings.subjects.map((subj) => (
                                            <option key={subj} value={subj}>
                                              {subj}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">
                                          Access Status
                                        </label>
                                        <select
                                          value={editTeacherDraft.status}
                                          onChange={(e) =>
                                            setEditTeacherDraft({
                                              ...editTeacherDraft,
                                              status: e.target.value as TeacherStatus,
                                            })
                                          }
                                          className="w-full min-h-11 pl-3 pr-10 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                                        >
                                          <option value="active">Active (Can Sign In)</option>
                                          <option value="inactive">Suspended</option>
                                        </select>
                                      </div>

                                      <button
                                        type="button"
                                        disabled={isSavingTeacher}
                                        onClick={() => void handleSaveTeacherEdit(tch)}
                                        className="min-h-11 py-2 px-4 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                                      >
                                        {isSavingTeacher ? 'Saving...' : 'Save Changes'}
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
                  </div>
                )}

                {/* TAB 3: STUDENTS */}
                {activeTab === 'students' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            placeholder="Search student or admission no..."
                            className="min-h-11 pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] w-full sm:w-64"
                          />
                        </div>

                        <select
                          aria-label="Filter students by class"
                          value={studentClassFilter}
                          onChange={(e) => setStudentClassFilter(e.target.value)}
                          className="min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="all">All Classes</option>
                          {schoolSettings.classes.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowEnrollModal(true)}
                        className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer self-start"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Enroll Student</span>
                      </button>
                    </div>

                    {dbError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{dbError}</span>
                      </div>
                    )}
                    {statusNotice && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{statusNotice}</span>
                      </div>
                    )}

                    {filteredStudents.length === 0 ? (
                      <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-900">
                            {students.length === 0
                              ? 'No students enrolled yet'
                              : 'No students match your current search'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {students.length === 0
                              ? 'Add your first student to generate admission numbers, attendance registers, and tuition records.'
                              : 'Clear your search or class filter, or enroll a new learner.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                          {(studentSearch || studentClassFilter !== 'all') && (
                            <button
                              type="button"
                              onClick={() => {
                                setStudentSearch('');
                                setStudentClassFilter('all');
                              }}
                              className="min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                            >
                              Clear Search &amp; Filters
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowEnrollModal(true)}
                            className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Enroll Student</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                          {filteredStudents.map((stu) => {
                            const summary = getStudentAttendanceSummary(stu);
                            const isDeletingThis = deletingStudentId === stu.studentId;
                            return (
                              <div
                                key={stu.studentId}
                                className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/40"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-base text-slate-900">{stu.fullName}</div>
                                    <div className="text-sm text-slate-500 font-mono">
                                      {stu.admissionNo} · {stu.gender}
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 text-[#6D28D9]">
                                    {stu.className}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 pt-2 border-t border-slate-200/70">
                                  <span>
                                    Teacher:{' '}
                                    <strong className="text-slate-800">
                                      {stu.classTeacherEmail || 'Unassigned'}
                                    </strong>
                                  </span>
                                  <span className="font-bold text-emerald-700 tabular-nums">
                                    {summary.attendancePct}% Term Attendance
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                                  {editingStudentId === stu.studentId ? (
                                    <div className="w-full pt-2 border-t border-slate-200/70 space-y-2">
                                      <label className="block text-sm font-bold text-slate-700">
                                        Move Student to Class
                                      </label>
                                      <select
                                        value={editingStudentClass}
                                        onChange={(e) => setEditingStudentClass(e.target.value)}
                                        className="w-full min-h-11 pl-3 pr-10 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                                      >
                                        {schoolSettings.classes.map((cls) => (
                                          <option key={cls} value={cls}>
                                            {cls}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          disabled={isSavingStudentClass}
                                          onClick={() => void handleSaveStudentClass(stu)}
                                          className="flex-1 min-h-11 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer disabled:opacity-60"
                                        >
                                          {isSavingStudentClass ? 'Saving...' : 'Save Class'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingStudentId(null)}
                                          className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : confirmDeleteStudentId === stu.studentId ? (
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={isDeletingThis}
                                        onClick={() => void handleDeleteStudent(stu.studentId)}
                                        className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                                      >
                                        {isDeletingThis ? 'Removing...' : 'Confirm Delete'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteStudentId(null)}
                                        className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const validClass = schoolSettings.classes.includes(
                                            stu.className
                                          )
                                            ? stu.className
                                            : schoolSettings.classes[0] || stu.className;
                                          setEditingStudentId(stu.studentId);
                                          setEditingStudentClass(validClass);
                                          setConfirmDeleteStudentId(null);
                                        }}
                                        className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                                      >
                                        Edit Class
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteStudentId(stu.studentId)}
                                        className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Remove</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-sm font-bold text-slate-600">
                                <th className="py-3 px-3">Admission No</th>
                                <th className="py-3 px-3">Student Name</th>
                                <th className="py-3 px-3">Class</th>
                                <th className="py-3 px-3">Assigned Teacher</th>
                                <th className="py-3 px-3">Attendance</th>
                                <th className="py-3 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                              {filteredStudents.map((stu) => {
                                const summary = getStudentAttendanceSummary(stu);
                                const isDeletingThis = deletingStudentId === stu.studentId;
                                return (
                                  <tr key={stu.studentId} className="hover:bg-slate-50/70">
                                    <td className="py-3 px-3 font-mono text-sm font-semibold text-slate-600">
                                      {stu.admissionNo}
                                    </td>
                                    <td className="py-3 px-3">
                                      <div className="font-bold text-slate-900">{stu.fullName}</div>
                                      <div className="text-sm text-slate-500">{stu.gender}</div>
                                    </td>
                                    <td className="py-3 px-3 text-sm font-semibold text-slate-800">
                                      {stu.className}
                                    </td>
                                    <td className="py-3 px-3 text-sm text-slate-600">
                                      {stu.classTeacherEmail || (
                                        <span className="text-amber-700 font-medium">Unassigned</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-3 tabular-nums">
                                      <span
                                        className={`text-sm font-bold capitalize ${
                                          stu.attendanceToday === 'present'
                                            ? 'text-emerald-700'
                                            : stu.attendanceToday === 'late'
                                              ? 'text-amber-700'
                                              : 'text-red-700'
                                        }`}
                                      >
                                        {stu.attendanceToday}
                                      </span>
                                      <span className="block text-sm text-slate-500">
                                        {summary.attendancePct}% term ({summary.present + summary.late}/
                                        {summary.totalDays}d)
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      {editingStudentId === stu.studentId ? (
                                        <div className="inline-flex items-center justify-end gap-2">
                                          <select
                                            aria-label={`New class for ${stu.fullName}`}
                                            value={editingStudentClass}
                                            onChange={(e) => setEditingStudentClass(e.target.value)}
                                            className="min-h-11 pl-3 pr-9 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                                          >
                                            {schoolSettings.classes.map((cls) => (
                                              <option key={cls} value={cls}>
                                                {cls}
                                              </option>
                                            ))}
                                          </select>
                                          <button
                                            type="button"
                                            disabled={isSavingStudentClass}
                                            onClick={() => void handleSaveStudentClass(stu)}
                                            className="min-h-11 px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer disabled:opacity-60"
                                          >
                                            {isSavingStudentClass ? 'Saving...' : 'Save'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingStudentId(null)}
                                            className="min-h-11 px-3 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : confirmDeleteStudentId === stu.studentId ? (
                                        <div className="inline-flex items-center gap-2">
                                          <button
                                            type="button"
                                            disabled={isDeletingThis}
                                            onClick={() => void handleDeleteStudent(stu.studentId)}
                                            className="min-h-11 px-3 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                                          >
                                            {isDeletingThis ? 'Removing...' : 'Confirm'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteStudentId(null)}
                                            className="min-h-11 px-3 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const validClass = schoolSettings.classes.includes(
                                                stu.className
                                              )
                                                ? stu.className
                                                : schoolSettings.classes[0] || stu.className;
                                              setEditingStudentId(stu.studentId);
                                              setEditingStudentClass(validClass);
                                              setConfirmDeleteStudentId(null);
                                            }}
                                            className="min-h-11 px-3.5 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                                          >
                                            Edit Class
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteStudentId(stu.studentId)}
                                            className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 border border-slate-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                            title="Delete student"
                                            aria-label={`Remove student ${stu.fullName}`}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 4: RESULTS & REPORT CARDS */}
                {activeTab === 'results' && (
                  <div className="space-y-6">
                    {students.length === 0 ? (
                      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                        <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-900">No students enrolled yet</p>
                          <p className="text-sm text-slate-600">
                            Enroll at least one student first to record subject marks and print terminal report cards.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={goToEnrollModal}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Enroll First Student</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Student Selector & Score Editor */}
                        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-5 print:hidden">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-bold text-slate-700">
                                Select Student
                              </label>
                              {hasUnsavedResultEdits && (
                                <span className="text-sm font-bold text-amber-700">Unsaved edits</span>
                              )}
                            </div>
                            <select
                              value={selectedStudentId}
                              onChange={(e) => handleRequestSwitchResultStudent(e.target.value)}
                              className="w-full min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                            >
                              {students.map((s) => (
                                <option key={s.studentId} value={s.studentId}>
                                  {s.fullName} ({s.className})
                                </option>
                              ))}
                            </select>

                            {pendingResultStudentId && (
                              <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                                <p className="text-sm font-semibold text-amber-900">
                                  You have unsaved changes for {selectedResultStudent?.fullName}. Save before switching?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={isSavingResult}
                                    onClick={() => void handleSaveAndSwitchResultStudent()}
                                    className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer disabled:opacity-60"
                                  >
                                    {isSavingResult ? 'Saving...' : 'Save & Switch'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextId = pendingResultStudentId;
                                      setPendingResultStudentId(null);
                                      if (nextId) setSelectedStudentId(nextId);
                                    }}
                                    className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 cursor-pointer"
                                  >
                                    Discard &amp; Switch
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPendingResultStudentId(null)}
                                    className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                                  >
                                    Stay
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-sm font-bold text-slate-600 px-1">
                              <div className="col-span-6">Subject</div>
                              <div className="col-span-3 text-center">
                                CA ({isMadrasah && activeGradingMode !== 'english' ? '٠–٤٠ / 40' : '40'})
                              </div>
                              <div className="col-span-3 text-center">
                                Exam ({isMadrasah && activeGradingMode !== 'english' ? '٠–٦٠ / 60' : '60'})
                              </div>
                            </div>
                            {marksDraft.map((m, idx) => (
                              <div key={m.subject} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6 text-sm font-semibold text-slate-800 truncate">
                                  {m.subject}
                                </div>
                                <div className="col-span-3">
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={40}
                                    aria-label={`${m.subject} CA score`}
                                    value={formatInputScore(m.ca, isMadrasah, activeGradingMode)}
                                    onChange={(e) => {
                                      const val = parseScoreInput(e.target.value, 40);
                                      setMarksDraft((prev) =>
                                        prev.map((item, i) => (i === idx ? { ...item, ca: val } : item))
                                      );
                                    }}
                                    className="w-full min-h-11 px-2 py-2 text-sm text-center rounded-xl border border-slate-300 tabular-nums"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={60}
                                    aria-label={`${m.subject} Exam score`}
                                    value={formatInputScore(m.exam, isMadrasah, activeGradingMode)}
                                    onChange={(e) => {
                                      const val = parseScoreInput(e.target.value, 60);
                                      setMarksDraft((prev) =>
                                        prev.map((item, i) => (i === idx ? { ...item, exam: val } : item))
                                      );
                                    }}
                                    className="w-full min-h-11 px-2 py-2 text-sm text-center rounded-xl border border-slate-300 tabular-nums"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {schoolSettings.schoolType === 'madrasah' && (
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                Tahfiz / Hifz Milestone
                              </label>
                              <input
                                type="text"
                                value={tahfizDraft}
                                onChange={(e) => setTahfizDraft(e.target.value)}
                                placeholder="e.g., Completed Juz 18 with Tajwid"
                                className="w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border border-slate-300"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              Teacher / Principal Remark
                            </label>
                            <textarea
                              rows={2}
                              value={remarkDraft}
                              onChange={(e) => setRemarkDraft(e.target.value)}
                              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={isSavingResult}
                              onClick={() => void handleSaveStudentResults()}
                              className="flex-1 min-h-11 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                            >
                              {isSavingResult ? 'Saving Changes...' : 'Save Result Changes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintDialog('terminal report sheet')}
                              className="inline-flex items-center justify-center gap-2 min-h-11 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                              <span>Print Report</span>
                            </button>
                          </div>
                        </div>

                        {/* Printable Terminal Report Sheet */}
                        {selectedResultStudent && (() => {
                          const isRtlArabic = isMadrasah && activeGradingMode === 'arabic';
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
                                      : 'Official Terminal Report Sheet'}
                                  </p>
                                  <h2 className="text-xl font-extrabold text-slate-900 font-display mt-1">
                                    {schoolSettings.schoolName}
                                  </h2>
                                  <p className="text-sm text-slate-500">{schoolSettings.termLabel}</p>
                                </div>
                                <div
                                  className={`text-sm ${
                                    isRtlArabic ? 'text-right sm:text-left' : 'text-left sm:text-right'
                                  }`}
                                >
                                  <p className="font-bold text-slate-900">{selectedResultStudent.fullName}</p>
                                  <p className="text-slate-600">
                                    {selectedResultStudent.className} · {selectedResultStudent.admissionNo}
                                  </p>
                                </div>
                              </div>

                              {/* Mobile Subject List */}
                              <div className="md:hidden divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                                {marksDraft.map((m) => {
                                  const total = m.ca + m.exam;
                                  const g = getLocalizedGradeDetails(
                                    total,
                                    schoolSettings.schoolType,
                                    activeGradingMode
                                  );
                                  return (
                                    <div
                                      key={m.subject}
                                      className="p-4 flex items-center justify-between gap-3 text-sm tabular-nums"
                                    >
                                      <div>
                                        <p className="font-bold text-slate-900">{m.subject}</p>
                                        <p className="text-slate-500">
                                          {isRtlArabic ? 'الأعمال' : 'CA'}{' '}
                                          {formatDisplayNumeral(m.ca, isMadrasah, activeGradingMode)} ·{' '}
                                          {isRtlArabic ? 'الامتحان' : 'Exam'}{' '}
                                          {formatDisplayNumeral(m.exam, isMadrasah, activeGradingMode)}
                                        </p>
                                      </div>
                                      <div className={isRtlArabic ? 'text-left' : 'text-right'}>
                                        <p className="font-extrabold text-slate-900">
                                          {formatDisplayNumeral(total, isMadrasah, activeGradingMode)}/
                                          {formatDisplayNumeral(100, isMadrasah, activeGradingMode)}
                                        </p>
                                        <p className={`font-bold ${g.textColor}`}>
                                          {g.grade} ({g.remark})
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Desktop Table */}
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
                                        {isRtlArabic ? 'المجموع (١٠٠)' : 'Total (100)'}
                                      </th>
                                      <th className="py-2 pl-2 text-center">
                                        {isRtlArabic ? 'التقدير' : 'Grade'}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 tabular-nums">
                                    {marksDraft.map((m) => {
                                      const total = m.ca + m.exam;
                                      const g = getLocalizedGradeDetails(
                                        total,
                                        schoolSettings.schoolType,
                                        activeGradingMode
                                      );
                                      return (
                                        <tr key={m.subject}>
                                          <td className="py-3 pr-3 font-semibold text-slate-900">
                                            {m.subject}
                                          </td>
                                          <td className="py-3 px-2 text-center text-slate-600">
                                            {formatDisplayNumeral(m.ca, isMadrasah, activeGradingMode)}
                                          </td>
                                          <td className="py-3 px-2 text-center text-slate-600">
                                            {formatDisplayNumeral(m.exam, isMadrasah, activeGradingMode)}
                                          </td>
                                          <td className="py-3 px-2 text-center font-bold text-slate-900">
                                            {formatDisplayNumeral(total, isMadrasah, activeGradingMode)}
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
                                    {isRtlArabic ? 'المجموع الكلي' : 'Aggregate Score'}
                                  </span>
                                  <span className="text-base font-extrabold text-slate-900">
                                    {formatDisplayNumeral(
                                      selectedResultSummary.totalObtained,
                                      isMadrasah,
                                      activeGradingMode
                                    )}{' '}
                                    /{' '}
                                    {formatDisplayNumeral(
                                      selectedResultSummary.maxTotal,
                                      isMadrasah,
                                      activeGradingMode
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">
                                    {isRtlArabic ? 'المعدل العام' : 'Term Average'}
                                  </span>
                                  <span className="text-base font-extrabold text-[#6D28D9]">
                                    {formatDisplayNumeral(
                                      selectedResultSummary.average,
                                      isMadrasah,
                                      activeGradingMode
                                    )}
                                    %
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">
                                    {isRtlArabic ? 'نسبة الحضور' : 'Term Attendance'}
                                  </span>
                                  <span className="text-base font-extrabold text-emerald-700">
                                    {formatDisplayNumeral(
                                      selectedResultAttendance.attendancePct,
                                      isMadrasah,
                                      activeGradingMode
                                    )}
                                    %
                                    <span className="text-sm font-medium text-slate-500 ml-1">
                                      ({selectedResultAttendance.present + selectedResultAttendance.late}/
                                      {selectedResultAttendance.totalDays}d)
                                    </span>
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">
                                    {isRtlArabic ? 'التقدير العام' : 'Overall Standing'}
                                  </span>
                                  <span
                                    className={`text-base font-extrabold ${selectedResultSummary.grade.textColor}`}
                                  >
                                    {selectedResultSummary.grade.grade} — {selectedResultSummary.grade.remark}
                                  </span>
                                </div>
                              </div>

                              {(tahfizDraft || remarkDraft) && (
                                <div className="space-y-2 text-sm text-slate-700 border-t border-slate-200 pt-4">
                                  {tahfizDraft && (
                                    <p>
                                      <strong className="text-slate-900">
                                        {isRtlArabic ? 'متابعة الحفظ:' : 'Tahfiz Progress:'}
                                      </strong>{' '}
                                      {tahfizDraft}
                                    </p>
                                  )}
                                  {remarkDraft && (
                                    <p>
                                      <strong className="text-slate-900">
                                        {isRtlArabic ? 'ملاحظة المعلم:' : 'Teacher Remark:'}
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
                  </div>
                )}

                {/* TAB 5: TUITION FEES (ADMIN ONLY) */}
                {activeTab === 'fees' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Expected Term Fees</span>
                        <p className="text-2xl font-extrabold text-slate-900 font-display mt-2 tabular-nums">
                          {formatNaira(kpis.totalExpected)}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Collected to Date</span>
                        <p className="text-2xl font-extrabold text-emerald-700 font-display mt-2 tabular-nums">
                          {formatNaira(kpis.totalCollected)}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Outstanding Balance</span>
                        <p className="text-2xl font-extrabold text-[#EC4899] font-display mt-2 tabular-nums">
                          {formatNaira(kpis.totalOutstanding)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display">
                          Student Tuition Ledger (Strictly Admin-Only)
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          Teachers cannot access this collection or view guardian contact numbers in their portal.
                        </p>
                      </div>

                      {studentFees.length === 0 ? (
                        <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                          <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-base font-bold text-slate-900">No tuition records yet</p>
                            <p className="text-sm text-slate-600">
                              Enroll your first student to generate their term fee ledger and payment receipts.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={goToEnrollModal}
                            className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Enroll First Student</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Mobile Cards */}
                          <div className="md:hidden space-y-4">
                            {studentFees.map((fee) => {
                              const balance = Math.max(0, fee.termFeeNgn - fee.amountPaidNgn);
                              const latestTx = fee.payments[0];
                              return (
                                <div
                                  key={fee.studentId}
                                  className="p-4 rounded-2xl border border-slate-200 space-y-4 bg-slate-50/40 text-sm tabular-nums"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="font-bold text-slate-900 text-base">
                                        {fee.fullName}
                                      </div>
                                      <div className="text-slate-500">
                                        {fee.className} · {fee.guardianName} ({fee.guardianPhone})
                                      </div>
                                    </div>
                                    {balance === 0 ? (
                                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                                        Cleared
                                      </span>
                                    ) : (
                                      <span className="font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg">
                                        Owes {formatNaira(balance)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
                                    <div>
                                      <span className="text-slate-500 block">Term Fee</span>
                                      <span className="font-bold text-slate-900">
                                        {formatNaira(fee.termFeeNgn)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block">Amount Paid</span>
                                      <span className="font-bold text-emerald-700">
                                        {formatNaira(fee.amountPaidNgn)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {latestTx && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveReceipt({
                                            schoolName: schoolSettings.schoolName,
                                            termLabel: schoolSettings.termLabel,
                                            studentName: fee.fullName,
                                            className: fee.className,
                                            guardianName: fee.guardianName,
                                            balanceAfterNgn: balance,
                                            payment: latestTx,
                                          })
                                        }
                                        className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                      >
                                        <Receipt className="w-4 h-4" />
                                        <span>Receipt</span>
                                      </button>
                                    )}
                                    {balance > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFeeModalStudentId(fee.studentId);
                                          setPaymentAmount(String(balance));
                                        }}
                                        className="flex-1 min-h-11 px-4 py-2 rounded-xl font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] cursor-pointer"
                                      >
                                        Record Payment
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Desktop Table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-sm font-bold text-slate-600">
                                  <th className="py-3 px-3">Student &amp; Class</th>
                                  <th className="py-3 px-3">Guardian Contact</th>
                                  <th className="py-3 px-3 text-right">Term Fee</th>
                                  <th className="py-3 px-3 text-right">Paid</th>
                                  <th className="py-3 px-3 text-right">Balance</th>
                                  <th className="py-3 px-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-sm tabular-nums">
                                {studentFees.map((fee) => {
                                  const balance = Math.max(0, fee.termFeeNgn - fee.amountPaidNgn);
                                  const latestTx = fee.payments[0];
                                  return (
                                    <tr key={fee.studentId} className="hover:bg-slate-50/70">
                                      <td className="py-3 px-3">
                                        <div className="font-bold text-slate-900">{fee.fullName}</div>
                                        <div className="text-slate-500">{fee.className}</div>
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="font-semibold text-slate-800">
                                          {fee.guardianName}
                                        </div>
                                        <div className="text-slate-500">{fee.guardianPhone}</div>
                                      </td>
                                      <td className="py-3 px-3 text-right font-semibold text-slate-800">
                                        {formatNaira(fee.termFeeNgn)}
                                      </td>
                                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                                        {formatNaira(fee.amountPaidNgn)}
                                      </td>
                                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                                        {balance === 0 ? (
                                          <span className="text-emerald-700">Cleared</span>
                                        ) : (
                                          <span className="text-red-700">{formatNaira(balance)}</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-3 text-right">
                                        <div className="inline-flex items-center gap-2">
                                          {latestTx && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setActiveReceipt({
                                                  schoolName: schoolSettings.schoolName,
                                                  termLabel: schoolSettings.termLabel,
                                                  studentName: fee.fullName,
                                                  className: fee.className,
                                                  guardianName: fee.guardianName,
                                                  balanceAfterNgn: balance,
                                                  payment: latestTx,
                                                })
                                              }
                                              className="inline-flex items-center gap-1.5 min-h-11 px-3 py-2 rounded-xl font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                            >
                                              <Receipt className="w-4 h-4" />
                                              <span>Receipt</span>
                                            </button>
                                          )}
                                          {balance > 0 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setFeeModalStudentId(fee.studentId);
                                                setPaymentAmount(String(balance));
                                              }}
                                              className="min-h-11 px-4 py-2 rounded-xl font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] cursor-pointer"
                                            >
                                              Record Payment
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 6: SCHOOL SETTINGS */}
                {activeTab === 'settings' && (
                  <form
                    onSubmit={handleSaveSchoolSettings}
                    className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 font-display">
                        School Profile, Classes &amp; Subjects
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Updates automatically sync to all teacher portals.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">School Name</label>
                      <input
                        type="text"
                        required
                        value={settingsNameDraft}
                        onChange={(e) => setSettingsNameDraft(e.target.value)}
                        className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Curriculum Mode
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSettingsTypeDraft('conventional')}
                            className={`min-h-11 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              settingsTypeDraft === 'conventional'
                                ? 'border-[#6D28D9] bg-purple-50 text-slate-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-sm font-bold">Conventional School</div>
                            <div className="text-sm text-slate-500 mt-0.5">
                              Standard 0–9 &amp; A1–F9 grading
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsTypeDraft('madrasah');
                              setShowSettingsMadrasahModal(true);
                            }}
                            className={`min-h-11 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              settingsTypeDraft === 'madrasah'
                                ? 'border-[#6D28D9] bg-purple-50 text-slate-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-sm font-bold">Madrasah &amp; Tahfiz</div>
                            <div className="text-sm text-slate-500 mt-0.5">
                              Arabic (٠–٩), English, or Both
                            </div>
                          </button>
                        </div>
                      </div>

                      {settingsTypeDraft === 'madrasah' && (
                        <MadrasahGradingSelector
                          value={settingsMadrasahGrading}
                          onChange={(mode) => setSettingsMadrasahGrading(mode)}
                        />
                      )}

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Active Term Label
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsTermDraft}
                          onChange={(e) => setSettingsTermDraft(e.target.value)}
                          className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Classes (comma-separated)
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsClassesText}
                        onChange={(e) => setSettingsClassesText(e.target.value)}
                        className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <label className="block text-sm font-bold text-slate-700">
                          Subjects (comma-separated)
                        </label>
                        {settingsTypeDraft === 'madrasah' && (
                          <button
                            type="button"
                            onClick={() =>
                              setSettingsSubjectsText(
                                getMadrasahSubjectsPreset(settingsMadrasahGrading).join(', ')
                              )
                            }
                            className="min-h-11 px-3 py-1.5 rounded-xl text-sm font-semibold text-[#6D28D9] bg-purple-50 border border-purple-200 hover:bg-purple-100 cursor-pointer"
                          >
                            Load {getMadrasahModeShortLabel(settingsMadrasahGrading)} Subjects
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={settingsSubjectsText}
                        onChange={(e) => setSettingsSubjectsText(e.target.value)}
                        className="w-full px-4 py-3 text-base rounded-xl border border-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="min-h-11 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isSavingSettings ? 'Saving & Syncing...' : 'Save School Settings'}
                    </button>
                  </form>
                )}

                <MadrasahGradingModal
                  isOpen={showSettingsMadrasahModal}
                  currentMode={settingsMadrasahGrading}
                  onSelect={(mode) => {
                    setSettingsMadrasahGrading(mode);
                    setShowSettingsMadrasahModal(false);
                  }}
                  onClose={() => setShowSettingsMadrasahModal(false)}
                />
              </>
            )}
          </>
        )}

        {/* Enroll Student Modal */}
        {showEnrollModal && schoolSettings && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleEnrollStudent}
              className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 font-display">
                  Enroll New Student
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  aria-label="Close modal"
                  className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {dbError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{dbError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.fullName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, fullName: e.target.value })}
                    placeholder="e.g., Zainab Adewale"
                    className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Class</label>
                  <select
                    value={enrollForm.className}
                    onChange={(e) => setEnrollForm({ ...enrollForm, className: e.target.value })}
                    className="w-full min-h-11 pl-4 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white"
                  >
                    {schoolSettings.classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={enrollForm.gender}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, gender: e.target.value as 'Male' | 'Female' })
                    }
                    className="w-full min-h-11 pl-4 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Admission No. (optional)
                  </label>
                  <input
                    type="text"
                    value={enrollForm.admissionNo}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, admissionNo: e.target.value })
                    }
                    placeholder="Auto-generated if blank"
                    className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Term Tuition Fee (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={enrollForm.termFeeNgn}
                    onChange={(e) => setEnrollForm({ ...enrollForm, termFeeNgn: e.target.value })}
                    className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Guardian Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.guardianName}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, guardianName: e.target.value })
                    }
                    placeholder="e.g., Alhaji Kareem Adewale"
                    className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Guardian Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={enrollForm.guardianPhone}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, guardianPhone: e.target.value })
                    }
                    placeholder="08031234567"
                    className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling}
                  className="min-h-11 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer disabled:opacity-60"
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Record Payment Modal */}
        {feeTargetStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleRecordPayment}
              className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display">
                    Record Tuition Payment
                  </h3>
                  <p className="text-sm text-slate-500">
                    {feeTargetStudent.fullName} · {feeTargetStudent.className}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeeModalStudentId(null)}
                  aria-label="Close payment modal"
                  className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Amount Paid (₦)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as FeePaymentMethod)}
                  className="w-full min-h-11 pl-4 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online Card">Online Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Note</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full min-h-11 px-4 py-2.5 text-base rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeeModalStudentId(null)}
                  className="min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="min-h-11 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer disabled:opacity-60"
                >
                  {isRecordingPayment ? 'Saving Payment...' : 'Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Official School Receipt Modal */}
        {activeReceipt && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-2">
                <div>
                  <p className="text-sm font-bold text-emerald-700">Official School Tuition Receipt</p>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display mt-1">
                    {activeReceipt.schoolName}
                  </h3>
                  <p className="text-sm text-slate-500">{activeReceipt.termLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  aria-label="Close receipt modal"
                  className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer print:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeReceipt.payment.receiptNo}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {activeReceipt.studentName} ({activeReceipt.className})
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Payer / Guardian:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {activeReceipt.guardianName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Payment Date &amp; Method:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {activeReceipt.payment.date} · {activeReceipt.payment.method}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 text-base">
                  <span className="font-bold text-slate-700">Amount Paid:</span>
                  <span className="font-extrabold text-emerald-700 tabular-nums">
                    {formatNaira(activeReceipt.payment.amountNgn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Balance:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatNaira(activeReceipt.balanceAfterNgn)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintDialog('tuition receipt')}
                  className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
