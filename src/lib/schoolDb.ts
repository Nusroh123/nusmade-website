import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  getMadrasahSubjectsPreset,
  type MadrasahGradingMode,
} from './madrasahGrading';

export type SchoolCurriculumType = 'conventional' | 'madrasah';
export type { MadrasahGradingMode };
export type TeacherStatus = 'active' | 'inactive';
export type AttendanceStatus = 'present' | 'late' | 'absent';
export type FeePaymentMethod = 'Bank Transfer' | 'Online Card' | 'Cash';

export const MAIN_SCHOOL_ID = 'main';

export interface SchoolMark {
  subject: string;
  ca: number;
  exam: number;
}

export interface FeePaymentItem {
  receiptNo: string;
  date: string;
  amountNgn: number;
  method: FeePaymentMethod;
  note: string;
}

export interface SchoolSettingsRecord {
  schoolId: string;
  schoolName: string;
  schoolType: SchoolCurriculumType;
  madrasahGradingMode: MadrasahGradingMode;
  termLabel: string;
  classes: string[];
  subjects: string[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SchoolTeacherRecord {
  teacherId: string;
  fullName: string;
  email: string;
  assignedClass: string;
  assignedSubject: string;
  status: TeacherStatus;
  schoolName: string;
  schoolType: SchoolCurriculumType;
  madrasahGradingMode: MadrasahGradingMode;
  termLabel: string;
  subjects: string[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SchoolStudentRecord {
  studentId: string;
  admissionNo: string;
  fullName: string;
  className: string;
  gender: 'Male' | 'Female';
  classTeacherEmail: string;
  attendanceDate: string;
  attendanceToday: AttendanceStatus;
  attendanceHistory: Record<string, AttendanceStatus>;
  marks: SchoolMark[];
  teacherRemark: string;
  tahfizProgress: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SchoolStudentFeeRecord {
  studentId: string;
  fullName: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  termFeeNgn: number;
  amountPaidNgn: number;
  payments: FeePaymentItem[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

function clamp(val: string, maxLen: number, fallback = ''): string {
  const t = val.trim();
  if (!t) return fallback;
  return t.slice(0, maxLen);
}

function parseGradingMode(val: unknown): MadrasahGradingMode {
  return val === 'arabic' || val === 'both' ? val : 'english';
}

export function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function makeEntityId(prefix: 'tch' | 'stu'): string {
  const rand = Math.random().toString(36).slice(2, 7);
  const ts = Date.now().toString(36).slice(-5);
  return `${prefix}_${ts}${rand}`;
}

export function getGradeDetails(total: number): {
  grade: string;
  remark: string;
  textColor: string;
} {
  if (total >= 75) return { grade: 'A1', remark: 'Distinction', textColor: 'text-emerald-700' };
  if (total >= 65) return { grade: 'B2', remark: 'Very Good', textColor: 'text-[#6D28D9]' };
  if (total >= 50) return { grade: 'C4', remark: 'Credit', textColor: 'text-amber-700' };
  if (total >= 40) return { grade: 'D7', remark: 'Pass', textColor: 'text-slate-700' };
  return { grade: 'F9', remark: 'Needs Support', textColor: 'text-red-700' };
}

export function getStudentAttendanceForDate(
  student: SchoolStudentRecord,
  date: string
): AttendanceStatus | null {
  if (student.attendanceHistory && student.attendanceHistory[date]) {
    return student.attendanceHistory[date];
  }
  if (student.attendanceDate === date) {
    return student.attendanceToday;
  }
  return null;
}

export function getStudentAttendanceSummary(student: SchoolStudentRecord): {
  present: number;
  late: number;
  absent: number;
  totalDays: number;
  attendancePct: number;
} {
  const entries: Record<string, AttendanceStatus> = {
    ...(student.attendanceDate ? { [student.attendanceDate]: student.attendanceToday } : {}),
    ...(student.attendanceHistory || {}),
  };
  const values = Object.values(entries);
  const present = values.filter((v) => v === 'present').length;
  const late = values.filter((v) => v === 'late').length;
  const absent = values.filter((v) => v === 'absent').length;
  const totalDays = values.length;
  const attendancePct = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 100;
  return { present, late, absent, totalDays, attendancePct };
}

function mergeAttendanceHistory(
  existingHistory: Record<string, AttendanceStatus>,
  existingDate: string,
  existingToday: AttendanceStatus,
  targetDate: string,
  status: AttendanceStatus
): Record<string, AttendanceStatus> {
  const merged: Record<string, AttendanceStatus> = {
    ...(existingDate ? { [existingDate]: existingToday } : {}),
    ...existingHistory,
    [targetDate]: status,
  };
  const sortedKeys = Object.keys(merged).sort().slice(-120);
  const bounded: Record<string, AttendanceStatus> = {};
  for (const key of sortedKeys) {
    bounded[key] = merged[key];
  }
  return bounded;
}

// ============================================================================
// ADMIN SUBSCRIPTIONS
// ============================================================================

export function subscribeSchoolSettings(
  onData: (settings: SchoolSettingsRecord | null) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = `school_settings/${MAIN_SCHOOL_ID}`;
  return onSnapshot(
    doc(db, 'school_settings', MAIN_SCHOOL_ID),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const d = snap.data();
      onData({
        schoolId: String(d.schoolId ?? MAIN_SCHOOL_ID),
        schoolName: String(d.schoolName ?? ''),
        schoolType: d.schoolType === 'madrasah' ? 'madrasah' : 'conventional',
        madrasahGradingMode: parseGradingMode(d.madrasahGradingMode),
        termLabel: String(d.termLabel ?? 'First Term · 2026/2027'),
        classes: Array.isArray(d.classes) ? d.classes.map(String) : [],
        subjects: Array.isArray(d.subjects) ? d.subjects.map(String) : [],
        createdAt: (d.createdAt as Timestamp) ?? null,
        updatedAt: (d.updatedAt as Timestamp) ?? null,
      });
    },
    (error) => {
      onUiError?.(error.message || 'Unable to load school settings.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllTeachers(
  onData: (teachers: SchoolTeacherRecord[]) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = 'school_teachers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: SchoolTeacherRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          teacherId: String(d.teacherId ?? docSnap.id),
          fullName: String(d.fullName ?? ''),
          email: String(d.email ?? '').toLowerCase(),
          assignedClass: String(d.assignedClass ?? ''),
          assignedSubject: String(d.assignedSubject ?? ''),
          status: d.status === 'inactive' ? 'inactive' : 'active',
          schoolName: String(d.schoolName ?? ''),
          schoolType: d.schoolType === 'madrasah' ? 'madrasah' : 'conventional',
          madrasahGradingMode: parseGradingMode(d.madrasahGradingMode),
          termLabel: String(d.termLabel ?? ''),
          subjects: Array.isArray(d.subjects) ? d.subjects.map(String) : [],
          createdAt: (d.createdAt as Timestamp) ?? null,
          updatedAt: (d.updatedAt as Timestamp) ?? null,
        };
      });
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onData(list);
    },
    (error) => {
      onUiError?.(error.message || 'Unable to load teachers.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllStudents(
  onData: (students: SchoolStudentRecord[]) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = 'school_students';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: SchoolStudentRecord[] = snapshot.docs.map((docSnap) => mapStudentDoc(docSnap.id, docSnap.data()));
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onData(list);
    },
    (error) => {
      onUiError?.(error.message || 'Unable to load students.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllStudentFees(
  onData: (fees: SchoolStudentFeeRecord[]) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = 'school_student_fees';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: SchoolStudentFeeRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          studentId: String(d.studentId ?? docSnap.id),
          fullName: String(d.fullName ?? ''),
          className: String(d.className ?? ''),
          guardianName: String(d.guardianName ?? ''),
          guardianPhone: String(d.guardianPhone ?? ''),
          termFeeNgn: Number(d.termFeeNgn ?? 0),
          amountPaidNgn: Number(d.amountPaidNgn ?? 0),
          payments: Array.isArray(d.payments)
            ? d.payments.map((p: Record<string, unknown>) => ({
                receiptNo: String(p.receiptNo ?? ''),
                date: String(p.date ?? ''),
                amountNgn: Number(p.amountNgn ?? 0),
                method: (p.method as FeePaymentMethod) || 'Bank Transfer',
                note: String(p.note ?? ''),
              }))
            : [],
          createdAt: (d.createdAt as Timestamp) ?? null,
          updatedAt: (d.updatedAt as Timestamp) ?? null,
        };
      });
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onData(list);
    },
    (error) => {
      onUiError?.(error.message || 'Unable to load fee records.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

function mapStudentDoc(id: string, d: Record<string, unknown>): SchoolStudentRecord {
  const attendanceDate = String(d.attendanceDate ?? getTodayIsoDate());
  const attendanceToday: AttendanceStatus =
    d.attendanceToday === 'late' || d.attendanceToday === 'absent' ? d.attendanceToday : 'present';

  const rawHistory =
    d.attendanceHistory && typeof d.attendanceHistory === 'object'
      ? (d.attendanceHistory as Record<string, unknown>)
      : {};
  const attendanceHistory: Record<string, AttendanceStatus> = {};
  for (const [k, v] of Object.entries(rawHistory)) {
    if (v === 'present' || v === 'late' || v === 'absent') {
      attendanceHistory[k] = v;
    }
  }
  if (!attendanceHistory[attendanceDate]) {
    attendanceHistory[attendanceDate] = attendanceToday;
  }

  return {
    studentId: String(d.studentId ?? id),
    admissionNo: String(d.admissionNo ?? ''),
    fullName: String(d.fullName ?? ''),
    className: String(d.className ?? ''),
    gender: d.gender === 'Male' ? 'Male' : 'Female',
    classTeacherEmail: String(d.classTeacherEmail ?? '').toLowerCase(),
    attendanceDate,
    attendanceToday,
    attendanceHistory,
    marks: Array.isArray(d.marks)
      ? d.marks.map((m: Record<string, unknown>) => ({
          subject: String(m.subject ?? ''),
          ca: Number(m.ca ?? 0),
          exam: Number(m.exam ?? 0),
        }))
      : [],
    teacherRemark: String(d.teacherRemark ?? ''),
    tahfizProgress: String(d.tahfizProgress ?? ''),
    createdAt: (d.createdAt as Timestamp) ?? null,
    updatedAt: (d.updatedAt as Timestamp) ?? null,
  };
}

// ============================================================================
// TEACHER SUBSCRIPTIONS (STRICTLY SCOPED BY VERIFIED GOOGLE EMAIL)
// ============================================================================

export function subscribeMyTeacherProfile(
  teacherEmail: string,
  onData: (teacher: SchoolTeacherRecord | null) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = 'school_teachers';
  const normalized = teacherEmail.trim().toLowerCase();
  const q = query(collection(db, path), where('email', '==', normalized));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(null);
        return;
      }
      const docSnap = snapshot.docs[0];
      const d = docSnap.data();
      onData({
        teacherId: String(d.teacherId ?? docSnap.id),
        fullName: String(d.fullName ?? ''),
        email: String(d.email ?? '').toLowerCase(),
        assignedClass: String(d.assignedClass ?? ''),
        assignedSubject: String(d.assignedSubject ?? ''),
        status: d.status === 'inactive' ? 'inactive' : 'active',
        schoolName: String(d.schoolName ?? ''),
        schoolType: d.schoolType === 'madrasah' ? 'madrasah' : 'conventional',
        madrasahGradingMode: parseGradingMode(d.madrasahGradingMode),
        termLabel: String(d.termLabel ?? ''),
        subjects: Array.isArray(d.subjects) ? d.subjects.map(String) : [],
        createdAt: (d.createdAt as Timestamp) ?? null,
        updatedAt: (d.updatedAt as Timestamp) ?? null,
      });
    },
    (error) => {
      onUiError?.(error.message || 'Unable to verify teacher assignment.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeMyClassStudents(
  teacherEmail: string,
  onData: (students: SchoolStudentRecord[]) => void,
  onUiError?: (message: string) => void
): Unsubscribe {
  const path = 'school_students';
  const normalized = teacherEmail.trim().toLowerCase();
  const q = query(collection(db, path), where('classTeacherEmail', '==', normalized));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => mapStudentDoc(docSnap.id, docSnap.data()));
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onData(list);
    },
    (error) => {
      onUiError?.(error.message || 'Unable to load assigned class students.');
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ============================================================================
// ADMIN MUTATIONS
// ============================================================================

export async function initializeSchoolSystem(params: {
  schoolName: string;
  schoolType: SchoolCurriculumType;
  madrasahGradingMode?: MadrasahGradingMode;
  termLabel: string;
  seedSampleStudents: boolean;
}): Promise<void> {
  const gradingMode: MadrasahGradingMode =
    params.schoolType === 'madrasah' ? params.madrasahGradingMode ?? 'english' : 'english';

  const classes =
    params.schoolType === 'madrasah'
      ? ["Ibtida'iyyah 2", "I'dadiyyah 1", 'Tahfiz Halqah A']
      : ['JSS 1A', 'JSS 2A', 'SSS 1 Science'];

  const subjects =
    params.schoolType === 'madrasah'
      ? getMadrasahSubjectsPreset(gradingMode)
      : ['Mathematics', 'English Language', 'Basic Science', 'Civic Education', 'Computer Studies'];

  const batch = writeBatch(db);
  batch.set(doc(db, 'school_settings', MAIN_SCHOOL_ID), {
    schoolId: MAIN_SCHOOL_ID,
    schoolName: clamp(params.schoolName, 160, 'Al-Hikmah Model College'),
    schoolType: params.schoolType,
    madrasahGradingMode: gradingMode,
    termLabel: clamp(params.termLabel, 80, 'First Term · 2026/2027'),
    classes,
    subjects,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (params.seedSampleStudents) {
    const today = getTodayIsoDate();
    const starters =
      params.schoolType === 'madrasah'
        ? [
            {
              admissionNo: 'DUA-2026-001',
              fullName: 'Abdullah Ibrahim',
              className: classes[2],
              gender: 'Male' as const,
              guardianName: 'Ustadh Ibrahim Adeyemi',
              guardianPhone: '08031124455',
              termFeeNgn: 65000,
              amountPaidNgn: 65000,
              tahfizProgress: 'Completed Juz 18 with Tajwid',
            },
            {
              admissionNo: 'DUA-2026-002',
              fullName: 'Aisha Muhammad',
              className: classes[1],
              gender: 'Female' as const,
              guardianName: 'Hajiya Zainab Muhammad',
              guardianPhone: '08057789012',
              termFeeNgn: 65000,
              amountPaidNgn: 40000,
              tahfizProgress: 'Reviewing Juz 10 – Juz 12',
            },
            {
              admissionNo: 'DUA-2026-003',
              fullName: 'Yusuf Sulaiman',
              className: classes[0],
              gender: 'Male' as const,
              guardianName: 'Alhaji Sulaiman Olatunji',
              guardianPhone: '08123456789',
              termFeeNgn: 55000,
              amountPaidNgn: 0,
              tahfizProgress: 'Memorizing Juz Amma',
            },
          ]
        : [
            {
              admissionNo: 'AMC-2026-101',
              fullName: 'Toluwanimi Adeyemo',
              className: classes[2],
              gender: 'Female' as const,
              guardianName: 'Mrs. Folake Adeyemo',
              guardianPhone: '08034451120',
              termFeeNgn: 85000,
              amountPaidNgn: 85000,
              tahfizProgress: '',
            },
            {
              admissionNo: 'AMC-2026-102',
              fullName: 'Chukwudi Okafor',
              className: classes[1],
              gender: 'Male' as const,
              guardianName: 'Engr. Emeka Okafor',
              guardianPhone: '08065543318',
              termFeeNgn: 75000,
              amountPaidNgn: 50000,
              tahfizProgress: '',
            },
            {
              admissionNo: 'AMC-2026-103',
              fullName: 'Amina Bello',
              className: classes[0],
              gender: 'Female' as const,
              guardianName: 'Alhaji Musa Bello',
              guardianPhone: '08139982244',
              termFeeNgn: 75000,
              amountPaidNgn: 0,
              tahfizProgress: '',
            },
          ];

    for (const s of starters) {
      const studentId = makeEntityId('stu');
      batch.set(doc(db, 'school_students', studentId), {
        studentId,
        admissionNo: s.admissionNo,
        fullName: s.fullName,
        className: s.className,
        gender: s.gender,
        classTeacherEmail: '',
        attendanceDate: today,
        attendanceToday: 'present',
        attendanceHistory: { [today]: 'present' },
        marks: subjects.map((subj) => ({ subject: subj, ca: 32, exam: 48 })),
        teacherRemark: 'Showing steady progress this term.',
        tahfizProgress: s.tahfizProgress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(db, 'school_student_fees', studentId), {
        studentId,
        fullName: s.fullName,
        className: s.className,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        termFeeNgn: s.termFeeNgn,
        amountPaidNgn: s.amountPaidNgn,
        payments:
          s.amountPaidNgn > 0
            ? [
                {
                  receiptNo: `RCP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                  date: today,
                  amountNgn: s.amountPaidNgn,
                  method: 'Bank Transfer',
                  note: 'Initial term tuition record',
                },
              ]
            : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `school_settings/${MAIN_SCHOOL_ID}`);
  }
}

export async function updateSchoolSettingsAndSyncTeachers(
  settings: {
    schoolName: string;
    schoolType: SchoolCurriculumType;
    madrasahGradingMode?: MadrasahGradingMode;
    termLabel: string;
    classes: string[];
    subjects: string[];
  },
  existingTeachers: SchoolTeacherRecord[]
): Promise<void> {
  const cleanName = clamp(settings.schoolName, 160);
  const cleanTerm = clamp(settings.termLabel, 80);
  const cleanClasses = settings.classes.slice(0, 30).map((c) => clamp(c, 80)).filter(Boolean);
  const cleanSubjects = settings.subjects.slice(0, 25).map((s) => clamp(s, 80)).filter(Boolean);
  const gradingMode: MadrasahGradingMode =
    settings.schoolType === 'madrasah' ? settings.madrasahGradingMode ?? 'english' : 'english';

  const batch = writeBatch(db);
  batch.update(doc(db, 'school_settings', MAIN_SCHOOL_ID), {
    schoolName: cleanName,
    schoolType: settings.schoolType,
    madrasahGradingMode: gradingMode,
    termLabel: cleanTerm,
    classes: cleanClasses,
    subjects: cleanSubjects,
    updatedAt: serverTimestamp(),
  });

  for (const tch of existingTeachers) {
    batch.update(doc(db, 'school_teachers', tch.teacherId), {
      schoolName: cleanName,
      schoolType: settings.schoolType,
      madrasahGradingMode: gradingMode,
      termLabel: cleanTerm,
      subjects: cleanSubjects,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `school_settings/${MAIN_SCHOOL_ID}`);
  }
}

export async function createTeacherAndSyncClass(params: {
  fullName: string;
  email: string;
  assignedClass: string;
  assignedSubject: string;
  settings: SchoolSettingsRecord;
  allStudents: SchoolStudentRecord[];
}): Promise<void> {
  const teacherId = makeEntityId('tch');
  const cleanEmail = clamp(params.email.toLowerCase(), 160);

  const batch = writeBatch(db);
  batch.set(doc(db, 'school_teachers', teacherId), {
    teacherId,
    fullName: clamp(params.fullName, 120),
    email: cleanEmail,
    assignedClass: clamp(params.assignedClass, 80),
    assignedSubject: clamp(params.assignedSubject, 80),
    status: 'active',
    schoolName: params.settings.schoolName,
    schoolType: params.settings.schoolType,
    madrasahGradingMode: params.settings.madrasahGradingMode,
    termLabel: params.settings.termLabel,
    subjects: params.settings.subjects.slice(0, 25),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  for (const stu of params.allStudents) {
    if (stu.className === params.assignedClass) {
      batch.update(doc(db, 'school_students', stu.studentId), {
        classTeacherEmail: cleanEmail,
        updatedAt: serverTimestamp(),
      });
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `school_teachers/${teacherId}`);
  }
}

export async function updateTeacherAndSyncClass(params: {
  teacher: SchoolTeacherRecord;
  nextStatus: TeacherStatus;
  nextClass: string;
  nextSubject: string;
  allStudents: SchoolStudentRecord[];
}): Promise<void> {
  const batch = writeBatch(db);
  const teacherRef = doc(db, 'school_teachers', params.teacher.teacherId);

  batch.update(teacherRef, {
    status: params.nextStatus,
    assignedClass: clamp(params.nextClass, 80),
    assignedSubject: clamp(params.nextSubject, 80),
    updatedAt: serverTimestamp(),
  });

  const activeEmail = params.nextStatus === 'active' ? params.teacher.email.toLowerCase() : '';

  for (const stu of params.allStudents) {
    if (stu.className === params.nextClass) {
      batch.update(doc(db, 'school_students', stu.studentId), {
        classTeacherEmail: activeEmail,
        updatedAt: serverTimestamp(),
      });
    } else if (
      stu.className === params.teacher.assignedClass &&
      stu.classTeacherEmail === params.teacher.email.toLowerCase()
    ) {
      // Unassign students from previous class if teacher moved or was deactivated
      batch.update(doc(db, 'school_students', stu.studentId), {
        classTeacherEmail: '',
        updatedAt: serverTimestamp(),
      });
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `school_teachers/${params.teacher.teacherId}`);
  }
}

export async function deleteTeacherAndClearStudents(
  teacher: SchoolTeacherRecord,
  allStudents: SchoolStudentRecord[]
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'school_teachers', teacher.teacherId));

  for (const stu of allStudents) {
    if (stu.classTeacherEmail === teacher.email.toLowerCase()) {
      batch.update(doc(db, 'school_students', stu.studentId), {
        classTeacherEmail: '',
        updatedAt: serverTimestamp(),
      });
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `school_teachers/${teacher.teacherId}`);
  }
}

export async function enrollNewStudent(params: {
  fullName: string;
  admissionNo: string;
  className: string;
  gender: 'Male' | 'Female';
  guardianName: string;
  guardianPhone: string;
  termFeeNgn: number;
  settings: SchoolSettingsRecord;
  teachers: SchoolTeacherRecord[];
}): Promise<void> {
  const studentId = makeEntityId('stu');
  const assignedTeacher = params.teachers.find(
    (t) => t.status === 'active' && t.assignedClass === params.className
  );
  const classTeacherEmail = assignedTeacher ? assignedTeacher.email.toLowerCase() : '';
  const today = getTodayIsoDate();

  const batch = writeBatch(db);
  batch.set(doc(db, 'school_students', studentId), {
    studentId,
    admissionNo: clamp(params.admissionNo, 40),
    fullName: clamp(params.fullName, 120),
    className: clamp(params.className, 80),
    gender: params.gender,
    classTeacherEmail,
    attendanceDate: today,
    attendanceToday: 'present',
    attendanceHistory: { [today]: 'present' },
    marks: params.settings.subjects.slice(0, 20).map((subject) => ({ subject, ca: 0, exam: 0 })),
    teacherRemark: '',
    tahfizProgress: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(db, 'school_student_fees', studentId), {
    studentId,
    fullName: clamp(params.fullName, 120),
    className: clamp(params.className, 80),
    guardianName: clamp(params.guardianName, 120),
    guardianPhone: clamp(params.guardianPhone, 30),
    termFeeNgn: Math.max(0, Number(params.termFeeNgn) || 0),
    amountPaidNgn: 0,
    payments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `school_students/${studentId}`);
  }
}

export async function updateStudentClassInDb(params: {
  student: SchoolStudentRecord;
  nextClass: string;
  teachers: SchoolTeacherRecord[];
  hasFeeRecord: boolean;
}): Promise<void> {
  const cleanClass = clamp(params.nextClass, 80);
  if (!cleanClass) return;

  const assignedTeacher = params.teachers.find(
    (t) => t.status === 'active' && t.assignedClass === cleanClass
  );
  const classTeacherEmail = assignedTeacher ? assignedTeacher.email.toLowerCase() : '';

  const batch = writeBatch(db);
  batch.update(doc(db, 'school_students', params.student.studentId), {
    className: cleanClass,
    classTeacherEmail,
    updatedAt: serverTimestamp(),
  });

  if (params.hasFeeRecord) {
    batch.update(doc(db, 'school_student_fees', params.student.studentId), {
      className: cleanClass,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `school_students/${params.student.studentId}`);
  }
}

export async function recordStudentTuitionPayment(params: {
  feeRecord: SchoolStudentFeeRecord;
  amountNgn: number;
  method: FeePaymentMethod;
  note: string;
}): Promise<FeePaymentItem> {
  const path = `school_student_fees/${params.feeRecord.studentId}`;
  const tx: FeePaymentItem = {
    receiptNo: `RCP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
      .toString()
      .slice(-3)}`,
    date: getTodayIsoDate(),
    amountNgn: params.amountNgn,
    method: params.method,
    note: clamp(params.note, 200, 'Termly tuition payment'),
  };

  const nextPayments = [tx, ...params.feeRecord.payments].slice(0, 50);
  const nextPaid = params.feeRecord.amountPaidNgn + params.amountNgn;

  try {
    await updateDoc(doc(db, 'school_student_fees', params.feeRecord.studentId), {
      amountPaidNgn: nextPaid,
      payments: nextPayments,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }

  return tx;
}

export async function deleteSchoolStudent(studentId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'school_students', studentId));
  batch.delete(doc(db, 'school_student_fees', studentId));

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `school_students/${studentId}`);
  }
}

// ============================================================================
// TEACHER & SHARED ACADEMIC MUTATIONS (ATTENDANCE, MARKS, REMARKS)
// ============================================================================

export async function updateStudentAttendanceInDb(
  student: SchoolStudentRecord,
  attendanceStatus: AttendanceStatus,
  attendanceDate: string
): Promise<void> {
  const path = `school_students/${student.studentId}`;
  const nextHistory = mergeAttendanceHistory(
    student.attendanceHistory,
    student.attendanceDate,
    student.attendanceToday,
    attendanceDate,
    attendanceStatus
  );
  const shouldUpdateLatest = attendanceDate >= student.attendanceDate;

  try {
    await updateDoc(doc(db, 'school_students', student.studentId), {
      attendanceHistory: nextHistory,
      attendanceToday: shouldUpdateLatest ? attendanceStatus : student.attendanceToday,
      attendanceDate: shouldUpdateLatest ? attendanceDate : student.attendanceDate,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function markStudentsPresentBatchInDb(
  students: SchoolStudentRecord[],
  attendanceDate: string
): Promise<void> {
  if (students.length === 0) return;
  const batch = writeBatch(db);
  for (const stu of students) {
    const nextHistory = mergeAttendanceHistory(
      stu.attendanceHistory,
      stu.attendanceDate,
      stu.attendanceToday,
      attendanceDate,
      'present'
    );
    const shouldUpdateLatest = attendanceDate >= stu.attendanceDate;
    batch.update(doc(db, 'school_students', stu.studentId), {
      attendanceHistory: nextHistory,
      attendanceToday: shouldUpdateLatest ? 'present' : stu.attendanceToday,
      attendanceDate: shouldUpdateLatest ? attendanceDate : stu.attendanceDate,
      updatedAt: serverTimestamp(),
    });
  }
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'school_students');
  }
}

export async function saveStudentMarksAndRemarksInDb(params: {
  studentId: string;
  marks: SchoolMark[];
  teacherRemark: string;
  tahfizProgress: string;
}): Promise<void> {
  const path = `school_students/${params.studentId}`;
  try {
    await updateDoc(doc(db, 'school_students', params.studentId), {
      marks: params.marks.slice(0, 20),
      teacherRemark: clamp(params.teacherRemark, 500, ''),
      tahfizProgress: clamp(params.tahfizProgress, 500, ''),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveClassMarksBatchInDb(
  updates: {
    studentId: string;
    marks: SchoolMark[];
    teacherRemark: string;
    tahfizProgress: string;
  }[]
): Promise<void> {
  if (updates.length === 0) return;
  const batch = writeBatch(db);
  for (const item of updates) {
    batch.update(doc(db, 'school_students', item.studentId), {
      marks: item.marks.slice(0, 20),
      teacherRemark: clamp(item.teacherRemark, 500, ''),
      tahfizProgress: clamp(item.tahfizProgress, 500, ''),
      updatedAt: serverTimestamp(),
    });
  }
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'school_students');
  }
}
