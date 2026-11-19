import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  CreditCard,
  RotateCcw,
  Plus,
  Search,
  Check,
  CheckCircle2,
  Printer,
  ArrowRight,
  MessageSquare,
  X,
  Building2,
  Receipt,
  BookOpen,
  UserCheck,
  Shield,
  GraduationCap,
} from 'lucide-react';
import {
  createInitialSchoolState,
  getDefaultWeeklyAttendance,
  getTodayIso,
  STORAGE_KEY,
  WEEKLY_DAYS,
  type AttendanceStatus,
  type DemoSchoolState,
  type DemoStudent,
  type FeeTransaction,
  type MadrasahGradingMode,
  type PaymentMethod,
  type SchoolPresetKey,
} from '../lib/demoSchoolData';
import {
  formatDisplayNumeral,
  formatInputScore,
  getLocalizedGradeDetails,
  getMadrasahModeShortLabel,
  parseScoreInput,
} from '../lib/madrasahGrading';
import { MadrasahGradingModal } from '../components/MadrasahGradingPrompt';
import {
  WeeklyBriefingCard,
  type WeeklyClassReadinessItem,
  type WeeklyFeeReminderItem,
  type WeeklyFollowUpItem,
} from '../components/WeeklyBriefingCard';

type PortalRole = 'admin' | 'teacher' | 'parent';
type AdminTab = 'overview' | 'students' | 'attendance' | 'results' | 'fees';
type TeacherTab = 'teacher_attendance' | 'teacher_markbook' | 'teacher_remarks';

interface ActiveReceipt {
  schoolName: string;
  studentName: string;
  admissionNo: string;
  className: string;
  balanceAfterNgn: number;
  transaction: FeeTransaction;
}

export const LiveDemoPage: React.FC = () => {
  const [school, setSchool] = useState<DemoSchoolState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DemoSchoolState;
        if (
          parsed &&
          Array.isArray(parsed.students) &&
          parsed.students.length > 0 &&
          Array.isArray(parsed.teachers) &&
          parsed.teachers.length > 0
        ) {
          return {
            ...parsed,
            madrasahGradingMode: parsed.madrasahGradingMode ?? 'english',
          };
        }
      }
    } catch {
      // Fallback to fresh preset
    }
    return createInitialSchoolState('conventional');
  });

  const [portalRole, setPortalRole] = useState<PortalRole>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('teacher_attendance');
  const [showMadrasahPrompt, setShowMadrasahPrompt] = useState(false);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    () => school.teachers[0]?.id ?? ''
  );
  const [teacherSubject, setTeacherSubject] = useState<string>(
    () => school.teachers[0]?.assignedSubject ?? school.subjects[0] ?? ''
  );
  const [demoBanner, setDemoBanner] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => school.students[0]?.id ?? ''
  );

  // Add Student Form Modal
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    className: school.classes[0] ?? 'JSS 1A',
    gender: 'Female' as 'Male' | 'Female',
    guardianName: '',
    guardianPhone: '',
    termFeeNgn: school.preset === 'madrasah' ? '65000' : '75000',
  });
  const [addStudentError, setAddStudentError] = useState<string | null>(null);

  // Record Fee Modal
  const [feeStudentId, setFeeStudentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentNote, setPaymentNote] = useState('Termly tuition payment');
  const [feeError, setFeeError] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ActiveReceipt | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(school));
    } catch {
      // Ignore storage quota errors
    }
  }, [school]);

  useEffect(() => {
    if (!school.students.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(school.students[0]?.id ?? '');
    }
  }, [school.students, selectedStudentId]);

  useEffect(() => {
    if (!school.teachers.some((t) => t.id === selectedTeacherId)) {
      const first = school.teachers[0];
      setSelectedTeacherId(first?.id ?? '');
      setTeacherSubject(first?.assignedSubject ?? school.subjects[0] ?? '');
    }
  }, [school.teachers, school.subjects, selectedTeacherId]);

  const activeTeacher = useMemo(
    () => school.teachers.find((t) => t.id === selectedTeacherId) ?? school.teachers[0],
    [school.teachers, selectedTeacherId]
  );

  const notifyAction = (msg: string) => {
    setDemoBanner(msg);
    window.setTimeout(() => {
      setDemoBanner((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    const found = school.teachers.find((t) => t.id === teacherId);
    if (found) {
      setTeacherSubject(found.assignedSubject);
      notifyAction(`Switched teacher view to ${found.name} (${found.assignedClass}).`);
    }
  };

  const isMadrasah = school.preset === 'madrasah';
  const gradingMode: MadrasahGradingMode = isMadrasah
    ? school.madrasahGradingMode ?? 'english'
    : 'english';

  const handleSwitchPreset = (
    preset: SchoolPresetKey,
    madrasahMode: MadrasahGradingMode = gradingMode
  ) => {
    const fresh = createInitialSchoolState(preset, madrasahMode);
    setSchool(fresh);
    setClassFilter('all');
    setSearchQuery('');
    setSelectedStudentId(fresh.students[0]?.id ?? '');
    setSelectedTeacherId(fresh.teachers[0]?.id ?? '');
    setTeacherSubject(fresh.teachers[0]?.assignedSubject ?? fresh.subjects[0] ?? '');
    setNewStudentForm({
      fullName: '',
      className: fresh.classes[0] ?? 'JSS 1A',
      gender: 'Female',
      guardianName: '',
      guardianPhone: '',
      termFeeNgn: preset === 'madrasah' ? '65000' : '75000',
    });
    notifyAction(
      preset === 'madrasah'
        ? `Loaded Madrasah & Tahfiz (${getMadrasahModeShortLabel(madrasahMode)}).`
        : 'Loaded Conventional Secondary sample school.'
    );
  };

  const handleSelectMadrasahMode = (mode: MadrasahGradingMode) => {
    setShowMadrasahPrompt(false);
    handleSwitchPreset('madrasah', mode);
  };

  const handleResetDemo = () => {
    const fresh = createInitialSchoolState(school.preset, gradingMode);
    setSchool(fresh);
    setClassFilter('all');
    setSearchQuery('');
    setSelectedStudentId(fresh.students[0]?.id ?? '');
    setSelectedTeacherId(fresh.teachers[0]?.id ?? '');
    setTeacherSubject(fresh.teachers[0]?.assignedSubject ?? fresh.subjects[0] ?? '');
    notifyAction('Sample school restored to initial data.');
  };

  // Derived Live Metrics
  const stats = useMemo(() => {
    const totalStudents = school.students.length;
    const presentCount = school.students.filter(
      (s) => s.attendanceToday === 'present' || s.attendanceToday === 'late'
    ).length;
    const absentStudents = school.students.filter((s) => s.attendanceToday === 'absent');
    const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    const totalExpected = school.students.reduce((sum, s) => sum + s.termFeeNgn, 0);
    const totalCollected = school.students.reduce((sum, s) => sum + s.amountPaidNgn, 0);
    const totalOutstanding = Math.max(0, totalExpected - totalCollected);

    return {
      totalStudents,
      presentCount,
      absentStudents,
      attendanceRate,
      totalExpected,
      totalCollected,
      totalOutstanding,
    };
  }, [school.students]);

  const weeklyBriefing = useMemo(() => {
    const followUpStudents: WeeklyFollowUpItem[] = [];
    for (const stu of school.students) {
      const week = stu.weeklyAttendance ?? getDefaultWeeklyAttendance(stu.attendanceToday, stu.id);
      const statuses = WEEKLY_DAYS.map((day) => (day === 'Fri' ? stu.attendanceToday : week[day]));
      const absentDays = statuses.filter((st) => st === 'absent').length;
      const lateDays = statuses.filter((st) => st === 'late').length;

      if (absentDays >= 1 || lateDays >= 2) {
        const parts: string[] = [];
        if (absentDays > 0) parts.push(`Absent ${absentDays} of 5 days`);
        if (lateDays > 0) parts.push(`Late ${lateDays} day${lateDays === 1 ? '' : 's'}`);
        followUpStudents.push({
          studentId: stu.id,
          studentName: stu.fullName,
          className: stu.className,
          guardianName: stu.guardianName,
          guardianPhone: stu.guardianPhone,
          absentDays,
          lateDays,
          totalDaysTracked: 5,
          summaryText: parts.join(' · '),
        });
      }
    }
    followUpStudents.sort((a, b) => b.absentDays - a.absentDays || b.lateDays - a.lateDays);

    const allOwing: WeeklyFeeReminderItem[] = school.students
      .map((stu) => ({
        studentId: stu.id,
        studentName: stu.fullName,
        className: stu.className,
        guardianName: stu.guardianName,
        guardianPhone: stu.guardianPhone,
        termFeeNgn: stu.termFeeNgn,
        amountPaidNgn: stu.amountPaidNgn,
        balanceNgn: Math.max(0, stu.termFeeNgn - stu.amountPaidNgn),
      }))
      .filter((item) => item.balanceNgn > 0)
      .sort((a, b) => b.balanceNgn - a.balanceNgn);

    const classReadiness: WeeklyClassReadinessItem[] = school.classes.map((cls) => {
      const teacher = school.teachers.find((t) => t.assignedClass === cls);
      const classStudents = school.students.filter((s) => s.className === cls);
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
        teacherName: teacher?.name ?? null,
        studentCount: classStudents.length,
        attendanceSummary:
          classStudents.length === 0
            ? 'No students enrolled yet'
            : `${presentOrLate}/${classStudents.length} present or late today`,
        marksSummary:
          classStudents.length === 0
            ? 'Awaiting enrollment'
            : `${scoredCount}/${classStudents.length} students have CA & exam scores`,
        needsAttention: !teacher || hasAbsences || missingMarks,
      };
    });

    return {
      followUpStudents,
      feeReminders: allOwing.slice(0, 4),
      totalOwingCount: allOwing.length,
      classReadiness,
    };
  }, [school.students, school.classes, school.teachers]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return school.students.filter((s) => {
      if (classFilter !== 'all' && s.className !== classFilter) return false;
      if (!q) return true;
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q)
      );
    });
  }, [school.students, classFilter, searchQuery]);

  const teacherStudents = useMemo(() => {
    if (!activeTeacher) return [];
    return school.students.filter((s) => s.className === activeTeacher.assignedClass);
  }, [school.students, activeTeacher]);

  const selectedStudent = useMemo(
    () => school.students.find((s) => s.id === selectedStudentId) ?? school.students[0],
    [school.students, selectedStudentId]
  );

  const selectedStudentSummary = useMemo(() => {
    if (!selectedStudent || selectedStudent.marks.length === 0) {
      return {
        totalObtained: 0,
        maxTotal: 0,
        average: 0,
        grade: getLocalizedGradeDetails(0, school.preset, gradingMode),
      };
    }
    const totalObtained = selectedStudent.marks.reduce((acc, m) => acc + m.ca + m.exam, 0);
    const maxTotal = selectedStudent.marks.length * 100;
    const average = Math.round(totalObtained / selectedStudent.marks.length);
    return {
      totalObtained,
      maxTotal,
      average,
      grade: getLocalizedGradeDetails(average, school.preset, gradingMode),
    };
  }, [selectedStudent, school.preset, gradingMode]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setAddStudentError(null);
    const fullName = newStudentForm.fullName.trim();
    const guardianName = newStudentForm.guardianName.trim();
    const guardianPhone = newStudentForm.guardianPhone.trim();
    const feeNum = Math.max(0, Number(newStudentForm.termFeeNgn) || 0);

    if (!fullName || !guardianName || !guardianPhone) {
      setAddStudentError('Please enter student name, guardian name, and phone number.');
      return;
    }

    const prefix = school.preset === 'madrasah' ? 'DUA' : 'AMC';
    const nextNum = 200 + school.students.length + 1;
    const newStudent: DemoStudent = {
      id: `stu-${Date.now()}`,
      admissionNo: `${prefix}-2026-${nextNum}`,
      fullName,
      className: newStudentForm.className,
      gender: newStudentForm.gender,
      guardianName,
      guardianPhone,
      attendanceToday: 'present',
      termFeeNgn: feeNum,
      amountPaidNgn: 0,
      teacherRemark: 'Newly enrolled for the current academic term.',
      tahfizProgress:
        school.preset === 'madrasah' ? 'Initial placement & Surah revision assessment' : undefined,
      marks: school.subjects.map((subject) => ({ subject, ca: 28, exam: 42 })),
      payments: [],
    };

    setSchool((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
    }));
    setSelectedStudentId(newStudent.id);
    setShowAddStudent(false);
    setNewStudentForm({
      fullName: '',
      className: school.classes[0] ?? 'JSS 1A',
      gender: 'Female',
      guardianName: '',
      guardianPhone: '',
      termFeeNgn: school.preset === 'madrasah' ? '65000' : '75000',
    });
    notifyAction(`Added ${fullName} to ${newStudent.className}.`);
  };

  const handleUpdateAttendance = (studentId: string, status: AttendanceStatus) => {
    const stu = school.students.find((s) => s.id === studentId);
    setSchool((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id !== studentId) return s;
        const baseWeek = s.weeklyAttendance ?? getDefaultWeeklyAttendance(s.attendanceToday, s.id);
        return {
          ...s,
          attendanceToday: status,
          weeklyAttendance: { ...baseWeek, Fri: status },
        };
      }),
    }));
    if (stu) {
      notifyAction(`Marked ${stu.fullName} as ${status}.`);
    }
  };

  const handleMarkAllPresent = (studentIds?: string[]) => {
    const targetCount = studentIds
      ? studentIds.length
      : school.students.filter((s) => classFilter === 'all' || s.className === classFilter).length;
    setSchool((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        const shouldMark = studentIds
          ? studentIds.includes(s.id)
          : classFilter === 'all' || s.className === classFilter;
        if (!shouldMark) return s;
        const baseWeek = s.weeklyAttendance ?? getDefaultWeeklyAttendance(s.attendanceToday, s.id);
        return {
          ...s,
          attendanceToday: 'present',
          weeklyAttendance: { ...baseWeek, Fri: 'present' },
        };
      }),
    }));
    notifyAction(`Marked ${targetCount} student(s) Present for ${school.attendanceDate}.`);
  };

  const handleUpdateMark = (
    studentId: string,
    subjectName: string,
    field: 'ca' | 'exam',
    rawVal: string
  ) => {
    const max = field === 'ca' ? 40 : 60;
    const numeric = parseScoreInput(rawVal, max);

    setSchool((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              marks: s.marks.map((m) =>
                m.subject === subjectName ? { ...m, [field]: numeric } : m
              ),
            }
          : s
      ),
    }));
  };

  const handleUpdateStudentNote = (
    studentId: string,
    field: 'teacherRemark' | 'tahfizProgress',
    value: string
  ) => {
    setSchool((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const openFeeModal = (student: DemoStudent) => {
    const remaining = Math.max(0, student.termFeeNgn - student.amountPaidNgn);
    setFeeStudentId(student.id);
    setPaymentAmount(remaining > 0 ? String(remaining) : '10000');
    setPaymentMethod('Bank Transfer');
    setPaymentNote('Termly tuition payment');
    setFeeError(null);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFeeError(null);
    const target = school.students.find((s) => s.id === feeStudentId);
    if (!target) return;

    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFeeError('Enter a valid payment amount greater than zero.');
      return;
    }

    const tx: FeeTransaction = {
      receiptNo: `RCP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
        .toString()
        .slice(-3)}`,
      date: getTodayIso(),
      amountNgn: amount,
      method: paymentMethod,
      note: paymentNote.trim() || 'School tuition payment',
    };

    const nextPaid = target.amountPaidNgn + amount;
    const balanceAfterNgn = Math.max(0, target.termFeeNgn - nextPaid);

    setSchool((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === target.id
          ? {
              ...s,
              amountPaidNgn: nextPaid,
              payments: [tx, ...s.payments],
            }
          : s
      ),
    }));

    setFeeStudentId(null);
    setActiveReceipt({
      schoolName: school.schoolName,
      studentName: target.fullName,
      admissionNo: target.admissionNo,
      className: target.className,
      balanceAfterNgn,
      transaction: tx,
    });
    notifyAction(`Recorded ₦${amount.toLocaleString()} payment for ${target.fullName}.`);
  };

  const handlePrintDialog = (label: string) => {
    notifyAction(`Opening print dialog for ${label}.`);
    window.print();
  };

  const adminNavItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4 shrink-0" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4 shrink-0" /> },
    { id: 'results', label: 'Results & Report Card', icon: <FileSpreadsheet className="w-4 h-4 shrink-0" /> },
    { id: 'fees', label: 'Fees & Receipts', icon: <CreditCard className="w-4 h-4 shrink-0" /> },
  ];

  const teacherNavItems: { id: TeacherTab; label: string; icon: React.ReactNode }[] = [
    { id: 'teacher_attendance', label: 'My Class Roll Call', icon: <CalendarCheck className="w-4 h-4 shrink-0" /> },
    { id: 'teacher_markbook', label: 'Enter Subject Scores', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { id: 'teacher_remarks', label: 'Remarks & Report Cards', icon: <FileSpreadsheet className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 lg:py-16 print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Sandbox Header Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 print:hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Interactive School Sandbox</span>
                <span aria-hidden="true">·</span>
                <span>{school.termLabel}</span>
                <span aria-hidden="true">·</span>
                <span>All roles share live school data</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                {school.schoolName || 'Your School Name'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/school"
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Real Staff Login</span>
              </Link>

              <button
                type="button"
                onClick={handleResetDemo}
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Reset Sample School</span>
              </button>

              <Link
                to={`/book-demo?schoolName=${encodeURIComponent(school.schoolName)}`}
                className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Get This for Your School</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Role Switcher + School Mode + School Name */}
          <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
            {/* Switch Portal Role (Admin / Teacher / Parent) */}
            <div className="xl:col-span-5 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-600">Test As:</span>
              <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setPortalRole('admin')}
                  className={`inline-flex items-center gap-2 min-h-11 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    portalRole === 'admin'
                      ? 'bg-[#6D28D9] text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>School Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPortalRole('teacher')}
                  className={`inline-flex items-center gap-2 min-h-11 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    portalRole === 'teacher'
                      ? 'bg-[#6D28D9] text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPortalRole('parent')}
                  className={`inline-flex items-center gap-2 min-h-11 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    portalRole === 'parent'
                      ? 'bg-[#6D28D9] text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Parent</span>
                </button>
              </div>
            </div>

            {/* Preset Switch */}
            <div className="xl:col-span-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-600">Curriculum:</span>
              <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => handleSwitchPreset('conventional')}
                  className={`min-h-11 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    school.preset === 'conventional'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Conventional
                </button>
                <button
                  type="button"
                  onClick={() => setShowMadrasahPrompt(true)}
                  className={`min-h-11 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    school.preset === 'madrasah'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Madrasah &amp; Tahfiz
                </button>
              </div>
            </div>

            {/* Editable School Name */}
            <div className="xl:col-span-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#6D28D9] shrink-0" />
              <input
                aria-label="Test School Name"
                type="text"
                value={school.schoolName}
                onChange={(e) => setSchool((prev) => ({ ...prev, schoolName: e.target.value }))}
                placeholder="Enter school name..."
                className="w-full min-h-11 px-4 py-2 text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              />
            </div>
          </div>

          {isMadrasah && (
            <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                <span className="font-bold text-slate-900">Madrasah Grading &amp; Numerals:</span>{' '}
                <span className="font-semibold text-[#6D28D9]">
                  {getMadrasahModeShortLabel(gradingMode)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['arabic', 'english', 'both'] as const).map((modeOption) => {
                  const active = gradingMode === modeOption;
                  const label =
                    modeOption === 'arabic'
                      ? 'Arabic Only (٠–٩)'
                      : modeOption === 'both'
                        ? 'Both (Arabic & English)'
                        : 'English Only (0–9)';
                  return (
                    <button
                      key={modeOption}
                      type="button"
                      onClick={() => handleSelectMadrasahMode(modeOption)}
                      className={`min-h-11 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#6D28D9] text-white border-[#6D28D9]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Global Action Feedback Banner across ALL Roles */}
        {demoBanner && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800 flex items-center gap-2 print:hidden">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{demoBanner}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* ROLE 1: SCHOOL ADMIN PORTAL */}
        {/* ===================================================================== */}
        {portalRole === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-4 space-y-2 print:hidden">
              <div className="px-3 py-1 text-sm font-bold text-slate-500">
                Principal / Admin View
              </div>
              {adminNavItems.map((item) => {
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAdminTab(item.id)}
                    className={`w-full min-h-11 flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#6D28D9] text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </aside>

            {/* Main Workspace Viewport */}
            <section className="lg:col-span-9 space-y-6">
              {/* OVERVIEW */}
              {adminTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <span className="text-sm font-medium text-slate-500 block">
                        Enrolled Students
                      </span>
                      <span className="text-3xl font-extrabold text-slate-900 font-display tabular-nums mt-2 block">
                        {stats.totalStudents}
                      </span>
                      <span className="text-sm text-slate-500 mt-1 block">
                        Across {school.classes.length} classes · {school.teachers.length} teachers
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <span className="text-sm font-medium text-slate-500 block">
                        Attendance Today
                      </span>
                      <span className="text-3xl font-extrabold text-emerald-700 font-display tabular-nums mt-2 block">
                        {stats.attendanceRate}%
                      </span>
                      <span className="text-sm text-slate-500 mt-1 block tabular-nums">
                        {stats.presentCount} of {stats.totalStudents} present or late
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <span className="text-sm font-medium text-slate-500 block">
                        Term Fees Collected
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#6D28D9] font-display tabular-nums mt-2 block">
                        ₦{stats.totalCollected.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 mt-1 block tabular-nums">
                        Target: ₦{stats.totalExpected.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <span className="text-sm font-medium text-slate-500 block">
                        Outstanding Balance
                      </span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-display tabular-nums mt-2 block">
                        ₦{stats.totalOutstanding.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 mt-1 block">
                        Open Fees tab to record payments
                      </span>
                    </div>
                  </div>

                  <WeeklyBriefingCard
                    storageNamespace={`demo_${school.preset}`}
                    schoolName={school.schoolName}
                    termLabel={school.termLabel}
                    weekLabel={`Week of ${school.attendanceDate}`}
                    followUpStudents={weeklyBriefing.followUpStudents}
                    feeReminders={weeklyBriefing.feeReminders}
                    totalOwingCount={weeklyBriefing.totalOwingCount}
                    classReadiness={weeklyBriefing.classReadiness}
                    onRecordFee={(stuId) => {
                      const target = school.students.find((s) => s.id === stuId);
                      setAdminTab('fees');
                      if (target) openFeeModal(target);
                    }}
                    onOpenAttendance={() => setAdminTab('attendance')}
                    onOpenClassCheck={(clsName) => {
                      const matchedTeacher = school.teachers.find(
                        (t) => t.assignedClass === clsName
                      );
                      if (matchedTeacher) {
                        setSelectedTeacherId(matchedTeacher.id);
                        setTeacherSubject(matchedTeacher.assignedSubject);
                        setPortalRole('teacher');
                        setTeacherTab('teacher_markbook');
                      } else {
                        setAdminTab('results');
                      }
                    }}
                    onNotify={notifyAction}
                  />

                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-display">
                        Test Every Role in Your School
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Switch between School Admin, Teacher, and Parent above to see how scores, attendance, and fees sync across roles.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setPortalRole('teacher');
                          setTeacherTab('teacher_markbook');
                        }}
                        className="min-h-11 p-4 rounded-2xl border border-slate-200 hover:border-[#6D28D9] text-left transition-colors cursor-pointer space-y-1"
                      >
                        <span className="text-base font-bold text-slate-900 block">
                          Switch to Teacher Portal (Enter Scores)
                        </span>
                        <span className="text-sm text-slate-600 block">
                          Work as a class teacher, take daily roll call, and enter CA + Exam scores.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPortalRole('parent')}
                        className="min-h-11 p-4 rounded-2xl border border-slate-200 hover:border-[#6D28D9] text-left transition-colors cursor-pointer space-y-1"
                      >
                        <span className="text-base font-bold text-slate-900 block">
                          Switch to Parent Portal (View Child)
                        </span>
                        <span className="text-sm text-slate-600 block">
                          See what guardians view: today&apos;s attendance, report cards, and fee receipts.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAdminTab('students');
                          setShowAddStudent(true);
                        }}
                        className="min-h-11 p-4 rounded-2xl border border-slate-200 hover:border-[#6D28D9] text-left transition-colors cursor-pointer space-y-1"
                      >
                        <span className="text-base font-bold text-slate-900 block">
                          Enroll a New Student
                        </span>
                        <span className="text-sm text-slate-600 block">
                          Add a student into {school.schoolName} and set their class and term fee.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminTab('fees')}
                        className="min-h-11 p-4 rounded-2xl border border-slate-200 hover:border-[#6D28D9] text-left transition-colors cursor-pointer space-y-1"
                      >
                        <span className="text-base font-bold text-slate-900 block">
                          Record Tuition &amp; Print Receipt
                        </span>
                        <span className="text-sm text-slate-600 block">
                          Log a fee payment and generate an itemized receipt right away.
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STUDENTS */}
              {adminTab === 'students' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-display">
                        Student Directory
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {filteredStudents.length} students displayed · {school.classes.join(', ')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddStudent(true)}
                      className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name, admission no, or guardian..."
                        className="w-full min-h-11 pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      />
                    </div>
                    <select
                      aria-label="Filter students by class"
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                    >
                      <option value="all">All Classes</option>
                      {school.classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-900">No students match this filter</p>
                        <p className="text-sm text-slate-600">
                          Clear your search or class filter, or add a new sample student.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {(searchQuery || classFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setClassFilter('all');
                            }}
                            className="min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                          >
                            Clear Search &amp; Filters
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowAddStudent(true)}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Student</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Cards */}
                      <div className="md:hidden space-y-4">
                        {filteredStudents.map((stu) => {
                          const balance = Math.max(0, stu.termFeeNgn - stu.amountPaidNgn);
                          return (
                            <div
                              key={stu.id}
                              className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/40"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-base font-bold text-slate-900">{stu.fullName}</p>
                                  <p className="text-sm font-mono text-slate-500">
                                    {stu.admissionNo} · {stu.gender}
                                  </p>
                                </div>
                                <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 text-[#6D28D9]">
                                  {stu.className}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600 space-y-1 pt-2 border-t border-slate-200/70">
                                <p>
                                  Guardian: <strong className="text-slate-900">{stu.guardianName}</strong> (
                                  {stu.guardianPhone})
                                </p>
                                <p className="tabular-nums">
                                  Fee Balance:{' '}
                                  {balance === 0 ? (
                                    <strong className="text-emerald-700">Paid</strong>
                                  ) : (
                                    <strong className="text-amber-700">
                                      ₦{balance.toLocaleString()}
                                    </strong>
                                  )}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudentId(stu.id);
                                    setAdminTab('results');
                                  }}
                                  className="flex-1 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  Report Card
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openFeeModal(stu)}
                                  className="flex-1 min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] cursor-pointer"
                                >
                                  Pay Fee
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold">
                              <th className="py-3 px-4">Admission No</th>
                              <th className="py-3 px-4">Student</th>
                              <th className="py-3 px-4">Class</th>
                              <th className="py-3 px-4">Guardian Contact</th>
                              <th className="py-3 px-4 text-right">Fee Balance</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/80">
                            {filteredStudents.map((stu) => {
                              const balance = Math.max(0, stu.termFeeNgn - stu.amountPaidNgn);
                              return (
                                <tr key={stu.id} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                                    {stu.admissionNo}
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-slate-900">
                                    {stu.fullName}
                                    <span className="block text-sm font-normal text-slate-500">
                                      {stu.gender}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-700">{stu.className}</td>
                                  <td className="py-3 px-4 text-slate-700">
                                    {stu.guardianName}
                                    <span className="block text-sm font-mono tabular-nums text-slate-500">
                                      {stu.guardianPhone}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                                    {balance === 0 ? (
                                      <span className="text-emerald-700">Paid</span>
                                    ) : (
                                      <span className="text-amber-700">
                                        ₦{balance.toLocaleString()}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedStudentId(stu.id);
                                          setAdminTab('results');
                                        }}
                                        className="min-h-11 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                                      >
                                        Report Card
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openFeeModal(stu)}
                                        className="min-h-11 px-3 py-2 rounded-xl bg-[#6D28D9] text-white font-semibold hover:bg-[#5B21B6] cursor-pointer whitespace-nowrap"
                                      >
                                        Pay Fee
                                      </button>
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
              )}

              {/* ADMIN ATTENDANCE */}
              {adminTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 font-display">
                          School-Wide Roll Call
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Date: {school.attendanceDate} · Present Rate: {stats.attendanceRate}%
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          aria-label="Filter attendance by class"
                          value={classFilter}
                          onChange={(e) => setClassFilter(e.target.value)}
                          className="min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="all">All Classes</option>
                          {school.classes.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={filteredStudents.length === 0}
                          onClick={() => handleMarkAllPresent()}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark All Present</span>
                        </button>
                      </div>
                    </div>

                    {filteredStudents.length === 0 ? (
                      <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                        <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-900">
                            No students in this class filter
                          </p>
                          <p className="text-sm text-slate-600">
                            Show all classes or enroll a new student to take attendance.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setClassFilter('all');
                              setSearchQuery('');
                            }}
                            className="min-h-11 px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                          >
                            Show All Classes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddStudent(true)}
                            className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Student</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                        {filteredStudents.map((stu) => (
                          <div
                            key={stu.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50"
                          >
                            <div>
                              <span className="text-base font-bold text-slate-900 block">
                                {stu.fullName}
                              </span>
                              <span className="text-sm text-slate-500">
                                {stu.admissionNo} · {stu.className} · Guardian: {stu.guardianPhone}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {(['present', 'late', 'absent'] as AttendanceStatus[]).map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleUpdateAttendance(stu.id, status)}
                                  className={`min-h-11 px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-colors cursor-pointer ${
                                    stu.attendanceToday === status
                                      ? status === 'present'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : status === 'late'
                                          ? 'bg-amber-600 text-white border-amber-600'
                                          : 'bg-red-600 text-white border-red-600'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <MessageSquare className="w-4 h-4 text-[#6D28D9]" />
                      <span>Automatic Parent Absence SMS Preview</span>
                    </div>

                    {stats.absentStudents.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        Every student is currently marked Present or Late. Mark any student{' '}
                        <strong>Absent</strong> above to preview the guardian SMS alert.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {stats.absentStudents.map((stu) => (
                          <div
                            key={stu.id}
                            className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-sm space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500">
                              <span>
                                To: {stu.guardianName} ({stu.guardianPhone})
                              </span>
                              <span className="font-semibold text-red-700">Absence Alert Ready</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed">
                              Dear {stu.guardianName}, {stu.fullName} ({stu.className}) was marked absent at{' '}
                              {school.schoolName} today ({school.attendanceDate}). Please reply or call the school office if this was planned.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ADMIN RESULTS & REPORT CARD */}
              {adminTab === 'results' && selectedStudent && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 print:hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 font-display">
                          Student Results &amp; Report Card Manager
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Review scores submitted by teachers or adjust marks directly.
                        </p>
                      </div>

                      <select
                        aria-label="Select student for report card"
                        value={selectedStudent.id}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="min-h-11 pl-4 pr-10 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      >
                        {school.students.map((stu) => (
                          <option key={stu.id} value={stu.id}>
                            {stu.fullName} ({stu.className})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mobile Mark Editor */}
                    <div className="md:hidden space-y-3">
                      {selectedStudent.marks.map((row) => {
                        const total = row.ca + row.exam;
                        const info = getLocalizedGradeDetails(total, school.preset, gradingMode);
                        return (
                          <div
                            key={row.subject}
                            className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/40"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-base font-bold text-slate-900">
                                {row.subject}
                              </span>
                              <span className={`text-sm font-bold tabular-nums ${info.textColor}`}>
                                {formatDisplayNumeral(total, isMadrasah, gradingMode)}/
                                {formatDisplayNumeral(100, isMadrasah, gradingMode)} · {info.grade} ({info.remark})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                  CA (0–40{isMadrasah && gradingMode !== 'english' ? ' / ٠–٤٠' : ''})
                                </label>
                                <input
                                  type={isMadrasah ? 'text' : 'number'}
                                  inputMode="numeric"
                                  min={0}
                                  max={40}
                                  value={formatInputScore(row.ca, isMadrasah, gradingMode)}
                                  onChange={(e) =>
                                    handleUpdateMark(
                                      selectedStudent.id,
                                      row.subject,
                                      'ca',
                                      e.target.value
                                    )
                                  }
                                  className="w-full min-h-11 px-3 py-2 text-center font-mono text-sm tabular-nums rounded-xl border border-slate-300 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                  Exam (0–60{isMadrasah && gradingMode !== 'english' ? ' / ٠–٦٠' : ''})
                                </label>
                                <input
                                  type={isMadrasah ? 'text' : 'number'}
                                  inputMode="numeric"
                                  min={0}
                                  max={60}
                                  value={formatInputScore(row.exam, isMadrasah, gradingMode)}
                                  onChange={(e) =>
                                    handleUpdateMark(
                                      selectedStudent.id,
                                      row.subject,
                                      'exam',
                                      e.target.value
                                    )
                                  }
                                  className="w-full min-h-11 px-3 py-2 text-center font-mono text-sm tabular-nums rounded-xl border border-slate-300 bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold">
                            <th className="py-3 px-4">Subject</th>
                            <th className="py-3 px-4 text-right">
                              CA ({isMadrasah && gradingMode === 'arabic' ? '٤٠' : '40'})
                            </th>
                            <th className="py-3 px-4 text-right">
                              Exam ({isMadrasah && gradingMode === 'arabic' ? '٦٠' : '60'})
                            </th>
                            <th className="py-3 px-4 text-right">
                              Total ({isMadrasah && gradingMode === 'arabic' ? '١٠٠' : '100'})
                            </th>
                            <th className="py-3 px-4 text-center">Grade</th>
                            <th className="py-3 px-4">Remark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80">
                          {selectedStudent.marks.map((row) => {
                            const total = row.ca + row.exam;
                            const info = getLocalizedGradeDetails(total, school.preset, gradingMode);
                            return (
                              <tr key={row.subject}>
                                <td className="py-3 px-4 font-semibold text-slate-900">
                                  {row.subject}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={40}
                                    aria-label={`${row.subject} CA`}
                                    value={formatInputScore(row.ca, isMadrasah, gradingMode)}
                                    onChange={(e) =>
                                      handleUpdateMark(
                                        selectedStudent.id,
                                        row.subject,
                                        'ca',
                                        e.target.value
                                      )
                                    }
                                    className="w-20 min-h-11 px-3 py-2 text-right font-mono tabular-nums rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                                  />
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <input
                                    type={isMadrasah ? 'text' : 'number'}
                                    inputMode="numeric"
                                    min={0}
                                    max={60}
                                    aria-label={`${row.subject} Exam`}
                                    value={formatInputScore(row.exam, isMadrasah, gradingMode)}
                                    onChange={(e) =>
                                      handleUpdateMark(
                                        selectedStudent.id,
                                        row.subject,
                                        'exam',
                                        e.target.value
                                      )
                                    }
                                    className="w-20 min-h-11 px-3 py-2 text-right font-mono tabular-nums rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                                  />
                                </td>
                                <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                                  {formatDisplayNumeral(total, isMadrasah, gradingMode)}
                                </td>
                                <td
                                  className={`py-3 px-4 text-center font-mono font-bold ${info.textColor}`}
                                >
                                  {info.grade}
                                </td>
                                <td className="py-3 px-4 text-slate-600">{info.remark}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Class Teacher&apos;s Term Remark
                        </label>
                        <input
                          type="text"
                          value={selectedStudent.teacherRemark}
                          onChange={(e) =>
                            handleUpdateStudentNote(
                              selectedStudent.id,
                              'teacherRemark',
                              e.target.value
                            )
                          }
                          className="w-full min-h-11 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                        />
                      </div>

                      {school.preset === 'madrasah' && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Tahfiz / Quranic Memorization Milestone
                          </label>
                          <input
                            type="text"
                            value={selectedStudent.tahfizProgress ?? ''}
                            onChange={(e) =>
                              handleUpdateStudentNote(
                                selectedStudent.id,
                                'tahfizProgress',
                                e.target.value
                              )
                            }
                            className="w-full min-h-11 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          notifyAction(
                            `Saved ${selectedStudent.fullName}'s report card scores and remarks.`
                          )
                        }
                        className="min-h-11 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer"
                      >
                        Save Report Card Updates
                      </button>
                    </div>
                  </div>

                  {/* Printable Report Card Preview */}
                  <ReportCardPreview
                    schoolName={school.schoolName}
                    termLabel={school.termLabel}
                    isMadrasah={isMadrasah}
                    gradingMode={gradingMode}
                    student={selectedStudent}
                    summary={selectedStudentSummary}
                    onPrint={() => handlePrintDialog('report card')}
                  />
                </div>
              )}

              {/* ADMIN FEES & RECEIPTS */}
              {adminTab === 'fees' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-display">
                      Tuition Ledger &amp; Payment Receipts
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 tabular-nums">
                      Collected: ₦{stats.totalCollected.toLocaleString()} · Outstanding: ₦
                      {stats.totalOutstanding.toLocaleString()}
                    </p>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {school.students.map((stu) => {
                      const balance = Math.max(0, stu.termFeeNgn - stu.amountPaidNgn);
                      const statusText =
                        balance === 0 ? 'Paid' : stu.amountPaidNgn > 0 ? 'Partial' : 'Unpaid';
                      const statusClass =
                        balance === 0
                          ? 'text-emerald-700 bg-emerald-50'
                          : stu.amountPaidNgn > 0
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-red-700 bg-red-50';
                      return (
                        <div
                          key={stu.id}
                          className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/40 text-sm tabular-nums"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-base font-bold text-slate-900">{stu.fullName}</p>
                              <p className="text-slate-500 font-mono">
                                {stu.admissionNo} · {stu.className}
                              </p>
                            </div>
                            <span className={`font-bold px-2.5 py-0.5 rounded-lg ${statusClass}`}>
                              {statusText}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70">
                            <div>
                              <span className="text-slate-500 block">Term Fee</span>
                              <span className="font-bold text-slate-900">
                                ₦{stu.termFeeNgn.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Paid</span>
                              <span className="font-bold text-emerald-700">
                                ₦{stu.amountPaidNgn.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Balance</span>
                              <span className="font-bold text-slate-900">
                                ₦{balance.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {stu.payments[0] && (
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveReceipt({
                                    schoolName: school.schoolName,
                                    studentName: stu.fullName,
                                    admissionNo: stu.admissionNo,
                                    className: stu.className,
                                    balanceAfterNgn: balance,
                                    transaction: stu.payments[0],
                                  })
                                }
                                className="flex-1 min-h-11 px-4 py-2 rounded-xl font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                Last Receipt
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openFeeModal(stu)}
                              className="flex-1 min-h-11 px-4 py-2 rounded-xl font-bold bg-[#6D28D9] text-white hover:bg-[#5B21B6] cursor-pointer"
                            >
                              Record Payment
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Class</th>
                          <th className="py-3 px-4 text-right">Term Fee</th>
                          <th className="py-3 px-4 text-right">Paid</th>
                          <th className="py-3 px-4 text-right">Balance</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80">
                        {school.students.map((stu) => {
                          const balance = Math.max(0, stu.termFeeNgn - stu.amountPaidNgn);
                          const statusText =
                            balance === 0 ? 'Paid' : stu.amountPaidNgn > 0 ? 'Partial' : 'Unpaid';
                          const statusClass =
                            balance === 0
                              ? 'text-emerald-700'
                              : stu.amountPaidNgn > 0
                                ? 'text-amber-700'
                                : 'text-red-700';

                          return (
                            <tr key={stu.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                {stu.fullName}
                                <span className="block text-sm font-mono text-slate-500">
                                  {stu.admissionNo}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-700">{stu.className}</td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums">
                                ₦{stu.termFeeNgn.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                                ₦{stu.amountPaidNgn.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                                ₦{balance.toLocaleString()}
                              </td>
                              <td className={`py-3 px-4 font-bold ${statusClass}`}>{statusText}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  {stu.payments[0] && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveReceipt({
                                          schoolName: school.schoolName,
                                          studentName: stu.fullName,
                                          admissionNo: stu.admissionNo,
                                          className: stu.className,
                                          balanceAfterNgn: balance,
                                          transaction: stu.payments[0],
                                        })
                                      }
                                      className="min-h-11 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                                    >
                                      Last Receipt
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openFeeModal(stu)}
                                    className="min-h-11 px-4 py-2 rounded-xl bg-[#6D28D9] text-white font-semibold hover:bg-[#5B21B6] cursor-pointer whitespace-nowrap"
                                  >
                                    Record Payment
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ===================================================================== */}
        {/* ROLE 2: TEACHER PORTAL */}
        {/* ===================================================================== */}
        {portalRole === 'teacher' && activeTeacher && (
          <div className="space-y-6">
            {/* Teacher Identity Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-[#6D28D9] block">
                  Teacher Workspace · Financial &amp; Tuition Records Hidden
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 font-display">
                  Signed in as {activeTeacher.name}
                </h2>
                <p className="text-sm text-slate-600">
                  Assigned Form Class:{' '}
                  <strong className="text-slate-900">{activeTeacher.assignedClass}</strong> · Primary Subject:{' '}
                  <strong className="text-slate-900">{activeTeacher.assignedSubject}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">
                    Switch Teacher Account
                  </label>
                  <select
                    value={activeTeacher.id}
                    onChange={(e) => handleSelectTeacher(e.target.value)}
                    className="min-h-11 pl-4 pr-10 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                  >
                    {school.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.assignedClass} · {t.assignedSubject})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-h-11 inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                  Class scope: <strong className="text-slate-900 ml-1">{activeTeacher.assignedClass}</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Teacher Sidebar */}
              <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-4 space-y-2 print:hidden">
                <div className="px-3 py-1 text-sm font-bold text-slate-500">Teacher Duties</div>
                {teacherNavItems.map((item) => {
                  const isActive = teacherTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTeacherTab(item.id)}
                      className={`w-full min-h-11 flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#6D28D9] text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </aside>

              {/* Teacher Content Area */}
              <section className="lg:col-span-9 space-y-6">
                {/* TEACHER TAB 1: MY CLASS ROLL CALL */}
                {teacherTab === 'teacher_attendance' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 font-display">
                            Take Class Attendance ({activeTeacher.assignedClass})
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Every tap updates the Principal&apos;s dashboard and Parent Portal right away.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={teacherStudents.length === 0}
                          onClick={() => handleMarkAllPresent(teacherStudents.map((s) => s.id))}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 self-start sm:self-auto"
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark Class Present</span>
                        </button>
                      </div>

                      {teacherStudents.length === 0 ? (
                        <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                          <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-base font-bold text-slate-900">
                              No students enrolled in {activeTeacher.assignedClass} yet
                            </p>
                            <p className="text-sm text-slate-600">
                              Switch to School Admin to enroll a student into this class, or select another teacher above.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPortalRole('admin');
                              setAdminTab('students');
                              setShowAddStudent(true);
                            }}
                            className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Switch to School Admin &amp; Enroll Student</span>
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                          {teacherStudents.map((stu) => (
                            <div
                              key={stu.id}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50"
                            >
                              <div>
                                <span className="text-base font-bold text-slate-900 block">
                                  {stu.fullName}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {stu.admissionNo} · {stu.className}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {(['present', 'late', 'absent'] as AttendanceStatus[]).map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleUpdateAttendance(stu.id, status)}
                                    className={`min-h-11 px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-colors cursor-pointer ${
                                      stu.attendanceToday === status
                                        ? status === 'present'
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : status === 'late'
                                            ? 'bg-amber-600 text-white border-amber-600'
                                            : 'bg-red-600 text-white border-red-600'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 text-sm text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <span>
                        Want to confirm the Admin and Parent portals updated? Switch roles in the top bar anytime.
                      </span>
                      <button
                        type="button"
                        onClick={() => setPortalRole('parent')}
                        className="min-h-11 px-5 py-2 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                      >
                        Check Parent View &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TEACHER TAB 2: SUBJECT MARKBOOK (BATCH SCORE ENTRY) */}
                {teacherTab === 'teacher_markbook' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 font-display">
                          Subject Markbook ({teacherSubject})
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Type CA (max 40) and Exam (max 60) scores for your class. Totals and grades compute automatically.
                        </p>
                      </div>

                      <select
                        aria-label="Select subject to grade"
                        value={teacherSubject}
                        onChange={(e) => setTeacherSubject(e.target.value)}
                        className="min-h-11 pl-4 pr-10 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      >
                        {school.subjects.map((subj) => (
                          <option key={subj} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                    </div>

                    {teacherStudents.length === 0 ? (
                      <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-base font-bold text-slate-900">
                            No students enrolled in {activeTeacher.assignedClass} yet
                          </p>
                          <p className="text-sm text-slate-600">
                            Switch to School Admin to enroll students before grading {teacherSubject}.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPortalRole('admin');
                            setAdminTab('students');
                            setShowAddStudent(true);
                          }}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Switch to School Admin &amp; Enroll Student</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Mobile Markbook Cards */}
                        <div className="md:hidden space-y-4">
                          {teacherStudents.map((stu) => {
                            const subjectMark = stu.marks.find(
                              (m) => m.subject === teacherSubject
                            ) ?? { subject: teacherSubject, ca: 0, exam: 0 };
                            const total = subjectMark.ca + subjectMark.exam;
                            const grade = getLocalizedGradeDetails(total, school.preset, gradingMode);
                            return (
                              <div
                                key={stu.id}
                                className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/40"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <p className="text-base font-bold text-slate-900">
                                      {stu.fullName}
                                    </p>
                                    <p className="text-sm font-mono text-slate-500">
                                      {stu.admissionNo} · {stu.className}
                                    </p>
                                  </div>
                                  <div className="text-right tabular-nums">
                                    <span className="text-base font-extrabold text-slate-900 block">
                                      {formatDisplayNumeral(total, isMadrasah, gradingMode)}/
                                      {formatDisplayNumeral(100, isMadrasah, gradingMode)}
                                    </span>
                                    <span className={`text-sm font-bold ${grade.textColor}`}>
                                      {grade.grade} ({grade.remark})
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                      CA (0–40{isMadrasah && gradingMode !== 'english' ? ' / ٠–٤٠' : ''})
                                    </label>
                                    <input
                                      type={isMadrasah ? 'text' : 'number'}
                                      inputMode="numeric"
                                      min={0}
                                      max={40}
                                      value={formatInputScore(subjectMark.ca, isMadrasah, gradingMode)}
                                      onChange={(e) =>
                                        handleUpdateMark(
                                          stu.id,
                                          teacherSubject,
                                          'ca',
                                          e.target.value
                                        )
                                      }
                                      className="w-full min-h-11 px-3 py-2 text-center font-mono text-sm tabular-nums rounded-xl border border-slate-300 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                      Exam (0–60{isMadrasah && gradingMode !== 'english' ? ' / ٠–٦٠' : ''})
                                    </label>
                                    <input
                                      type={isMadrasah ? 'text' : 'number'}
                                      inputMode="numeric"
                                      min={0}
                                      max={60}
                                      value={formatInputScore(subjectMark.exam, isMadrasah, gradingMode)}
                                      onChange={(e) =>
                                        handleUpdateMark(
                                          stu.id,
                                          teacherSubject,
                                          'exam',
                                          e.target.value
                                        )
                                      }
                                      className="w-full min-h-11 px-3 py-2 text-center font-mono text-sm tabular-nums rounded-xl border border-slate-300 bg-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold">
                                <th className="py-3 px-4">Student</th>
                                <th className="py-3 px-4">Class</th>
                                <th className="py-3 px-4 text-right">
                                  CA ({isMadrasah && gradingMode === 'arabic' ? '٠–٤٠' : '0–40'})
                                </th>
                                <th className="py-3 px-4 text-right">
                                  Exam ({isMadrasah && gradingMode === 'arabic' ? '٠–٦٠' : '0–60'})
                                </th>
                                <th className="py-3 px-4 text-right">Total</th>
                                <th className="py-3 px-4 text-center">Grade</th>
                                <th className="py-3 px-4">Remark</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/80">
                              {teacherStudents.map((stu) => {
                                const subjectMark = stu.marks.find(
                                  (m) => m.subject === teacherSubject
                                ) ?? { subject: teacherSubject, ca: 0, exam: 0 };
                                const total = subjectMark.ca + subjectMark.exam;
                                const grade = getLocalizedGradeDetails(total, school.preset, gradingMode);

                                return (
                                  <tr key={stu.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                      {stu.fullName}
                                      <span className="block text-sm font-mono text-slate-500">
                                        {stu.admissionNo}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-700">{stu.className}</td>
                                    <td className="py-3 px-4 text-right">
                                      <input
                                        type={isMadrasah ? 'text' : 'number'}
                                        inputMode="numeric"
                                        min={0}
                                        max={40}
                                        aria-label={`CA score for ${stu.fullName}`}
                                        value={formatInputScore(subjectMark.ca, isMadrasah, gradingMode)}
                                        onChange={(e) =>
                                          handleUpdateMark(
                                            stu.id,
                                            teacherSubject,
                                            'ca',
                                            e.target.value
                                          )
                                        }
                                        className="w-20 min-h-11 px-3 py-2 text-right font-mono tabular-nums rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                                      />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <input
                                        type={isMadrasah ? 'text' : 'number'}
                                        inputMode="numeric"
                                        min={0}
                                        max={60}
                                        aria-label={`Exam score for ${stu.fullName}`}
                                        value={formatInputScore(subjectMark.exam, isMadrasah, gradingMode)}
                                        onChange={(e) =>
                                          handleUpdateMark(
                                            stu.id,
                                            teacherSubject,
                                            'exam',
                                            e.target.value
                                          )
                                        }
                                        className="w-20 min-h-11 px-3 py-2 text-right font-mono tabular-nums rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                                      />
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                                      {formatDisplayNumeral(total, isMadrasah, gradingMode)}
                                    </td>
                                    <td
                                      className={`py-3 px-4 text-center font-mono font-bold ${grade.textColor}`}
                                    >
                                      {grade.grade}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">{grade.remark}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                          <span className="text-sm text-slate-500">
                            Changes update report cards as you type.
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              notifyAction(
                                `${teacherSubject} scores published to Report Cards and Parent Portal.`
                              )
                            }
                            className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            <Check className="w-4 h-4" />
                            <span>Publish {teacherSubject} Scores</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TEACHER TAB 3: REMARKS & REPORT CARDS */}
                {teacherTab === 'teacher_remarks' && selectedStudent && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 print:hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 font-display">
                            Form Teacher Remarks &amp; Report Preview
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Write term remarks or Tahfiz progress notes for any student.
                          </p>
                        </div>

                        <select
                          aria-label="Select student for remark"
                          value={selectedStudent.id}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="min-h-11 pl-4 pr-10 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white"
                        >
                          {school.students.map((stu) => (
                            <option key={stu.id} value={stu.id}>
                              {stu.fullName} ({stu.className})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Form Teacher Remark
                          </label>
                          <input
                            type="text"
                            value={selectedStudent.teacherRemark}
                            onChange={(e) =>
                              handleUpdateStudentNote(
                                selectedStudent.id,
                                'teacherRemark',
                                e.target.value
                              )
                            }
                            className="w-full min-h-11 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                          />
                        </div>

                        {school.preset === 'madrasah' && (
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              Tahfiz Memorization Progress
                            </label>
                            <input
                              type="text"
                              value={selectedStudent.tahfizProgress ?? ''}
                              onChange={(e) =>
                                handleUpdateStudentNote(
                                  selectedStudent.id,
                                  'tahfizProgress',
                                  e.target.value
                                )
                              }
                              className="w-full min-h-11 px-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            notifyAction(`Saved remark for ${selectedStudent.fullName}.`)
                          }
                          className="min-h-11 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer"
                        >
                          Save Teacher Remark
                        </button>
                      </div>
                    </div>

                    <ReportCardPreview
                      schoolName={school.schoolName}
                      termLabel={school.termLabel}
                      isMadrasah={isMadrasah}
                      gradingMode={gradingMode}
                      student={selectedStudent}
                      summary={selectedStudentSummary}
                      onPrint={() => handlePrintDialog('report card')}
                    />
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* ROLE 3: PARENT PORTAL */}
        {/* ===================================================================== */}
        {portalRole === 'parent' && selectedStudent && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div>
                <span className="text-sm font-semibold text-[#6D28D9] block">
                  Parent &amp; Student View
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 font-display mt-1">
                  Welcome, {selectedStudent.guardianName}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Viewing live records for{' '}
                  <strong className="text-slate-900">{selectedStudent.fullName}</strong> (
                  {selectedStudent.className})
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Switch Child / Guardian
                </label>
                <select
                  value={selectedStudent.id}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const next = school.students.find((s) => s.id === e.target.value);
                    if (next) notifyAction(`Viewing guardian portal for ${next.fullName}.`);
                  }}
                  className="min-h-11 pl-4 pr-10 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                >
                  {school.students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.fullName} — Guardian: {stu.guardianName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parent Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <span className="text-sm font-medium text-slate-500 block">
                  Today&apos;s Attendance
                </span>
                <span
                  className={`text-2xl font-extrabold font-display capitalize mt-2 block ${
                    selectedStudent.attendanceToday === 'present'
                      ? 'text-emerald-700'
                      : selectedStudent.attendanceToday === 'late'
                        ? 'text-amber-700'
                        : 'text-red-700'
                  }`}
                >
                  {selectedStudent.attendanceToday}
                </span>
                <span className="text-sm text-slate-500 mt-1 block">
                  Recorded by class teacher ({school.attendanceDate})
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <span className="text-sm font-medium text-slate-500 block">
                  Current Term Average
                </span>
                <span className="text-2xl font-extrabold text-[#6D28D9] font-display tabular-nums mt-2 block">
                  {formatDisplayNumeral(selectedStudentSummary.average, isMadrasah, gradingMode)}% ({selectedStudentSummary.grade.grade})
                </span>
                <span className="text-sm text-slate-500 mt-1 block">
                  {selectedStudentSummary.grade.remark} across {selectedStudent.marks.length} subjects
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <span className="text-sm font-medium text-slate-500 block">Tuition Balance</span>
                <span className="text-2xl font-extrabold text-slate-900 font-display tabular-nums mt-2 block">
                  ₦
                  {Math.max(
                    0,
                    selectedStudent.termFeeNgn - selectedStudent.amountPaidNgn
                  ).toLocaleString()}
                </span>
                <span className="text-sm text-slate-500 mt-1 block tabular-nums">
                  Paid ₦{selectedStudent.amountPaidNgn.toLocaleString()} of ₦
                  {selectedStudent.termFeeNgn.toLocaleString()}
                </span>
              </div>
            </div>

            <ReportCardPreview
              schoolName={school.schoolName}
              termLabel={school.termLabel}
              isMadrasah={isMadrasah}
              gradingMode={gradingMode}
              student={selectedStudent}
              summary={selectedStudentSummary}
              onPrint={() => handlePrintDialog('student report card')}
            />
          </div>
        )}
      </div>

      <MadrasahGradingModal
        isOpen={showMadrasahPrompt}
        currentMode={gradingMode}
        onSelect={handleSelectMadrasahMode}
        onClose={() => setShowMadrasahPrompt(false)}
      />

      {/* Modal: Add Student */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Enroll Sample Student
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addStudentError && (
              <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
                {addStudentError}
              </p>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  value={newStudentForm.fullName}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, fullName: e.target.value })
                  }
                  placeholder="e.g. Maryam Adewale"
                  className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Class</label>
                  <select
                    value={newStudentForm.className}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, className: e.target.value })
                    }
                    className="w-full min-h-11 pl-3 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white"
                  >
                    {school.classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={(e) =>
                      setNewStudentForm({
                        ...newStudentForm,
                        gender: e.target.value as 'Male' | 'Female',
                      })
                    }
                    className="w-full min-h-11 pl-3 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  value={newStudentForm.guardianName}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, guardianName: e.target.value })
                  }
                  placeholder="e.g. Alhaja Sadiya Adewale"
                  className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Guardian Phone *
                  </label>
                  <input
                    type="tel"
                    value={newStudentForm.guardianPhone}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, guardianPhone: e.target.value })
                    }
                    placeholder="0803..."
                    className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Term Fee (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newStudentForm.termFeeNgn}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, termFeeNgn: e.target.value })
                    }
                    className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="min-h-11 px-5 py-2 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-11 px-6 py-2 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {feeStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Record Tuition Payment
              </h3>
              <button
                type="button"
                onClick={() => setFeeStudentId(null)}
                className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feeError && (
              <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
                {feeError}
              </p>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Amount Paid (₦) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full min-h-11 pl-4 pr-10 py-2 text-base rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online Card">Online Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Payment Description
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full min-h-11 px-4 py-2 text-base rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFeeStudentId(null)}
                  className="min-h-11 px-5 py-2 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-11 px-6 py-2 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Payment Receipt */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-2">
              <div>
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4" />
                  Official School Receipt
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-display mt-1">
                  {activeReceipt.schoolName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer print:hidden"
                aria-label="Close receipt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Receipt No</span>
                <span className="font-mono font-bold text-slate-900">
                  {activeReceipt.transaction.receiptNo}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date</span>
                <span className="font-mono text-slate-900">{activeReceipt.transaction.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student</span>
                <span className="font-bold text-slate-900">
                  {activeReceipt.studentName} ({activeReceipt.className})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Admission No</span>
                <span className="font-mono text-slate-900">{activeReceipt.admissionNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-semibold text-slate-900">
                  {activeReceipt.transaction.method}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-mono tabular-nums text-base font-extrabold text-emerald-700">
                  ₦{activeReceipt.transaction.amountNgn.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Remaining Balance</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  ₦{activeReceipt.balanceAfterNgn.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => handlePrintDialog('tuition receipt')}
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="min-h-11 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ReportCardPreviewProps {
  schoolName: string;
  termLabel: string;
  isMadrasah: boolean;
  gradingMode: MadrasahGradingMode;
  student: DemoStudent;
  summary: {
    totalObtained: number;
    maxTotal: number;
    average: number;
    grade: { grade: string; remark: string; textColor: string };
  };
  onPrint: () => void;
}

const ReportCardPreview: React.FC<ReportCardPreviewProps> = ({
  schoolName,
  termLabel,
  isMadrasah,
  gradingMode,
  student,
  summary,
  onPrint,
}) => {
  const isRtlArabic = isMadrasah && gradingMode === 'arabic';
  const schoolType = isMadrasah ? 'madrasah' : 'conventional';

  return (
    <div
      dir={isRtlArabic ? 'rtl' : 'ltr'}
      className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 space-y-6 print:border-0 print:shadow-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-sm font-semibold text-[#6D28D9] block">
            {isRtlArabic ? 'كشف الدرجات والتقويم الفصلي' : 'Official Terminal Report Sheet'}
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 font-display mt-1">{schoolName}</h3>
          <p className="text-sm text-slate-500">{termLabel}</p>
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer print:hidden self-start"
        >
          <Printer className="w-4 h-4" />
          <span>{isRtlArabic ? 'طباعة / PDF' : 'Print / Save PDF'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
        <div>
          <span className="text-slate-500 block">{isRtlArabic ? 'اسم الطالب' : 'Student Name'}</span>
          <span className="font-bold text-slate-900">{student.fullName}</span>
        </div>
        <div>
          <span className="text-slate-500 block">{isRtlArabic ? 'رقم القيد' : 'Admission No'}</span>
          <span className="font-mono font-bold text-slate-900">{student.admissionNo}</span>
        </div>
        <div>
          <span className="text-slate-500 block">{isRtlArabic ? 'الفصل' : 'Class'}</span>
          <span className="font-bold text-slate-900">{student.className}</span>
        </div>
        <div>
          <span className="text-slate-500 block">{isRtlArabic ? 'المعدل العام' : 'Term Average'}</span>
          <span className={`font-mono font-bold tabular-nums ${summary.grade.textColor}`}>
            {formatDisplayNumeral(summary.average, isMadrasah, gradingMode)}% ({summary.grade.grade})
          </span>
        </div>
      </div>

      {/* Mobile Subject Scores */}
      <div className="md:hidden divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
        {student.marks.map((m) => {
          const total = m.ca + m.exam;
          const info = getLocalizedGradeDetails(total, schoolType, gradingMode);
          return (
            <div key={m.subject} className="p-4 flex items-center justify-between gap-3 text-sm tabular-nums">
              <div>
                <p className="font-bold text-slate-900">{m.subject}</p>
                <p className="text-slate-500">
                  {isRtlArabic ? 'الأعمال' : 'CA'} {formatDisplayNumeral(m.ca, isMadrasah, gradingMode)} ·{' '}
                  {isRtlArabic ? 'الامتحان' : 'Exam'} {formatDisplayNumeral(m.exam, isMadrasah, gradingMode)}
                </p>
              </div>
              <div className={isRtlArabic ? 'text-left' : 'text-right'}>
                <p className="font-extrabold text-slate-900">
                  {formatDisplayNumeral(total, isMadrasah, gradingMode)}/{formatDisplayNumeral(100, isMadrasah, gradingMode)}
                </p>
                <p className={`font-bold ${info.textColor}`}>
                  {info.grade} ({info.remark})
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Subject Table */}
      <div className="hidden md:block border border-slate-200 rounded-2xl overflow-hidden">
        <table className={`w-full border-collapse text-sm ${isRtlArabic ? 'text-right' : 'text-left'}`}>
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="py-3 px-4">{isRtlArabic ? 'المادة' : 'Subject'}</th>
              <th className="py-3 px-4 text-center">
                {isRtlArabic ? 'الأعمال (٤٠)' : 'CA (40)'}
              </th>
              <th className="py-3 px-4 text-center">
                {isRtlArabic ? 'الامتحان (٦٠)' : 'Exam (60)'}
              </th>
              <th className="py-3 px-4 text-center">
                {isRtlArabic ? 'المجموع (١٠٠)' : 'Total'}
              </th>
              <th className="py-3 px-4 text-center">{isRtlArabic ? 'التقدير' : 'Grade'}</th>
              <th className="py-3 px-4">{isRtlArabic ? 'الملاحظة' : 'Remark'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {student.marks.map((m) => {
              const total = m.ca + m.exam;
              const info = getLocalizedGradeDetails(total, schoolType, gradingMode);
              return (
                <tr key={m.subject}>
                  <td className="py-3 px-4 font-medium text-slate-900">{m.subject}</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">
                    {formatDisplayNumeral(m.ca, isMadrasah, gradingMode)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">
                    {formatDisplayNumeral(m.exam, isMadrasah, gradingMode)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums font-bold">
                    {formatDisplayNumeral(total, isMadrasah, gradingMode)}
                  </td>
                  <td className={`py-3 px-4 text-center font-mono font-bold ${info.textColor}`}>
                    {info.grade}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{info.remark}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-slate-700 space-y-2 pt-1">
        {isMadrasah && student.tahfizProgress && (
          <p>
            <strong className="text-slate-900">
              {isRtlArabic ? 'متابعة الحفظ والتحفيظ:' : 'Tahfiz Milestone:'}
            </strong>{' '}
            {student.tahfizProgress}
          </p>
        )}
        <p>
          <strong className="text-slate-900">
            {isRtlArabic ? 'ملاحظة المعلم:' : 'Class Teacher Remark:'}
          </strong>{' '}
          {student.teacherRemark}
        </p>
        <p className="text-slate-500 pt-1 tabular-nums">
          {isRtlArabic ? 'المجموع الكلي:' : 'Total Score:'}{' '}
          {formatDisplayNumeral(summary.totalObtained, isMadrasah, gradingMode)} /{' '}
          {formatDisplayNumeral(summary.maxTotal, isMadrasah, gradingMode)} ·{' '}
          {isRtlArabic ? 'النتيجة العامة:' : 'Overall Result:'} {summary.grade.remark}
        </p>
      </div>
    </div>
  );
};
