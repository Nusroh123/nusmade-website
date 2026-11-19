import { getMadrasahSubjectsPreset, type MadrasahGradingMode } from './madrasahGrading';

export type SchoolPresetKey = 'conventional' | 'madrasah';
export type { MadrasahGradingMode };
export type AttendanceStatus = 'present' | 'late' | 'absent';
export type PaymentMethod = 'Bank Transfer' | 'Online Card' | 'Cash';

export const WEEKLY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
export type WeeklyDay = (typeof WEEKLY_DAYS)[number];

export interface SubjectMark {
  subject: string;
  ca: number; // 0-40
  exam: number; // 0-60
}

export interface FeeTransaction {
  receiptNo: string;
  date: string;
  amountNgn: number;
  method: PaymentMethod;
  note: string;
}

export interface DemoStudent {
  id: string;
  admissionNo: string;
  fullName: string;
  className: string;
  gender: 'Male' | 'Female';
  guardianName: string;
  guardianPhone: string;
  attendanceToday: AttendanceStatus;
  weeklyAttendance?: Record<WeeklyDay, AttendanceStatus>;
  termFeeNgn: number;
  amountPaidNgn: number;
  marks: SubjectMark[];
  teacherRemark: string;
  tahfizProgress?: string;
  payments: FeeTransaction[];
}

export interface DemoTeacher {
  id: string;
  name: string;
  assignedClass: string;
  assignedSubject: string;
}

export interface DemoSchoolState {
  preset: SchoolPresetKey;
  madrasahGradingMode: MadrasahGradingMode;
  schoolName: string;
  termLabel: string;
  attendanceDate: string;
  classes: string[];
  subjects: string[];
  teachers: DemoTeacher[];
  students: DemoStudent[];
}

export const STORAGE_KEY = 'nusmade_live_school_demo_v2';

export function getDefaultWeeklyAttendance(
  attendanceToday: AttendanceStatus,
  studentId?: string
): Record<WeeklyDay, AttendanceStatus> {
  if (studentId === 'mad-4') {
    return { Mon: 'present', Tue: 'absent', Wed: 'absent', Thu: 'late', Fri: attendanceToday };
  }
  if (studentId === 'mad-3') {
    return { Mon: 'late', Tue: 'present', Wed: 'present', Thu: 'late', Fri: attendanceToday };
  }
  if (studentId === 'con-4') {
    return { Mon: 'absent', Tue: 'present', Wed: 'absent', Thu: 'absent', Fri: attendanceToday };
  }
  if (studentId === 'con-2') {
    return { Mon: 'present', Tue: 'late', Wed: 'present', Thu: 'late', Fri: attendanceToday };
  }
  return {
    Mon: 'present',
    Tue: 'present',
    Wed: 'present',
    Thu: 'present',
    Fri: attendanceToday,
  };
}

export function getTodayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function createInitialSchoolState(
  preset: SchoolPresetKey,
  madrasahGradingMode: MadrasahGradingMode = 'english'
): DemoSchoolState {
  const today = getTodayIso();

  if (preset === 'madrasah') {
    const subjects = getMadrasahSubjectsPreset(madrasahGradingMode);
    return {
      preset: 'madrasah',
      madrasahGradingMode,
      schoolName:
        madrasahGradingMode === 'arabic'
          ? 'مدرسة دار العلوم والتحفيظ'
          : 'Darul-Uloom Academy & Tahfiz',
      termLabel:
        madrasahGradingMode === 'arabic'
          ? 'الفصل الدراسي الأول · ٢٠٢٦/٢٠٢٧'
          : 'First Term · 2026/2027',
      attendanceDate: today,
      classes: ["Ibtida'iyyah 2", "I'dadiyyah 1", 'Tahfiz Halqah A'],
      subjects,
      teachers: [
        {
          id: 'tch-m1',
          name: 'Ustadh AbdulRahman',
          assignedClass: 'Tahfiz Halqah A',
          assignedSubject: subjects[0],
        },
        {
          id: 'tch-m2',
          name: 'Ustadha Maryam',
          assignedClass: "I'dadiyyah 1",
          assignedSubject: subjects[1],
        },
        {
          id: 'tch-m3',
          name: 'Ustadh Sulaiman',
          assignedClass: "Ibtida'iyyah 2",
          assignedSubject: subjects[2],
        },
      ],
      students: [
        {
          id: 'mad-1',
          admissionNo: 'DUA-2026-001',
          fullName: 'Abdullah Ibrahim',
          className: 'Tahfiz Halqah A',
          gender: 'Male',
          guardianName: 'Ustadh Ibrahim Adeyemi',
          guardianPhone: '08031124455',
          attendanceToday: 'present',
          weeklyAttendance: {
            Mon: 'present',
            Tue: 'present',
            Wed: 'present',
            Thu: 'present',
            Fri: 'present',
          },
          termFeeNgn: 65000,
          amountPaidNgn: 65000,
          tahfizProgress: 'Completed Juz 18 (Surah Al-Kahf – Al-Mu’minun) with Tajwid',
          teacherRemark: 'Exemplary memorization retention and punctuality during morning halqah.',
          marks: [
            { subject: subjects[0], ca: 38, exam: 56 },
            { subject: subjects[1], ca: 33, exam: 49 },
            { subject: subjects[2], ca: 35, exam: 52 },
            { subject: subjects[3], ca: 30, exam: 45 },
            { subject: subjects[4], ca: 32, exam: 48 },
          ],
          payments: [
            {
              receiptNo: 'RCP-DUA-1041',
              date: today,
              amountNgn: 65000,
              method: 'Bank Transfer',
              note: 'Full term Madrasah & Tahfiz tuition',
            },
          ],
        },
        {
          id: 'mad-2',
          admissionNo: 'DUA-2026-002',
          fullName: 'Aisha Muhammad',
          className: "I'dadiyyah 1",
          gender: 'Female',
          guardianName: 'Hajiya Zainab Muhammad',
          guardianPhone: '08057789012',
          attendanceToday: 'present',
          weeklyAttendance: {
            Mon: 'present',
            Tue: 'present',
            Wed: 'present',
            Thu: 'present',
            Fri: 'present',
          },
          termFeeNgn: 65000,
          amountPaidNgn: 40000,
          tahfizProgress: 'Reviewing Juz 10 – Juz 12; strong Makharij fluency',
          teacherRemark: 'Consistent effort in Arabic composition and Fiqh class discussions.',
          marks: [
            { subject: subjects[0], ca: 35, exam: 53 },
            { subject: subjects[1], ca: 34, exam: 51 },
            { subject: subjects[2], ca: 32, exam: 48 },
            { subject: subjects[3], ca: 33, exam: 49 },
            { subject: subjects[4], ca: 29, exam: 44 },
          ],
          payments: [
            {
              receiptNo: 'RCP-DUA-1038',
              date: today,
              amountNgn: 40000,
              method: 'Online Card',
              note: 'Part payment (First installment)',
            },
          ],
        },
        {
          id: 'mad-3',
          admissionNo: 'DUA-2026-003',
          fullName: 'Yusuf Sulaiman',
          className: "Ibtida'iyyah 2",
          gender: 'Male',
          guardianName: 'Alhaji Sulaiman Olatunji',
          guardianPhone: '08123456789',
          attendanceToday: 'late',
          weeklyAttendance: {
            Mon: 'late',
            Tue: 'present',
            Wed: 'present',
            Thu: 'late',
            Fri: 'late',
          },
          termFeeNgn: 55000,
          amountPaidNgn: 55000,
          tahfizProgress: 'Memorizing Juz Amma (Surah An-Naba to Al-Infitar)',
          teacherRemark: 'Bright student; encouraged to arrive earlier for morning revision.',
          marks: [
            { subject: subjects[0], ca: 31, exam: 46 },
            { subject: subjects[1], ca: 28, exam: 43 },
            { subject: subjects[2], ca: 30, exam: 45 },
            { subject: subjects[3], ca: 31, exam: 47 },
            { subject: subjects[4], ca: 33, exam: 50 },
          ],
          payments: [
            {
              receiptNo: 'RCP-DUA-1029',
              date: today,
              amountNgn: 55000,
              method: 'Cash',
              note: 'Full term fee settled at bursary',
            },
          ],
        },
        {
          id: 'mad-4',
          admissionNo: 'DUA-2026-004',
          fullName: 'Fatimah Lawal',
          className: 'Tahfiz Halqah A',
          gender: 'Female',
          guardianName: 'Mallam Idris Lawal',
          guardianPhone: '08098871122',
          attendanceToday: 'absent',
          weeklyAttendance: {
            Mon: 'present',
            Tue: 'absent',
            Wed: 'absent',
            Thu: 'late',
            Fri: 'absent',
          },
          termFeeNgn: 65000,
          amountPaidNgn: 0,
          tahfizProgress: 'Completed Juz 14; preparing for mid-term Muraja’ah',
          teacherRemark: 'Strong written Hadith work; follow up on attendance this week.',
          marks: [
            { subject: subjects[0], ca: 36, exam: 52 },
            { subject: subjects[1], ca: 30, exam: 46 },
            { subject: subjects[2], ca: 34, exam: 50 },
            { subject: subjects[3], ca: 28, exam: 42 },
            { subject: subjects[4], ca: 27, exam: 40 },
          ],
          payments: [],
        },
      ],
    };
  }

  const subjects = [
    'Mathematics',
    'English Language',
    'Basic Science',
    'Civic Education',
    'Computer Studies',
  ];

  return {
    preset: 'conventional',
    madrasahGradingMode: 'english',
    schoolName: 'Al-Hikmah Model College',
    termLabel: 'First Term · 2026/2027',
    attendanceDate: today,
    classes: ['JSS 1A', 'JSS 2A', 'SSS 1 Science'],
    subjects,
    teachers: [
      {
        id: 'tch-c1',
        name: 'Mr. Adebayo Adeleke',
        assignedClass: 'JSS 2A',
        assignedSubject: 'Mathematics',
      },
      {
        id: 'tch-c2',
        name: 'Mrs. Ngozi Eze',
        assignedClass: 'SSS 1 Science',
        assignedSubject: 'Basic Science',
      },
      {
        id: 'tch-c3',
        name: 'Mr. Musa Danjuma',
        assignedClass: 'JSS 1A',
        assignedSubject: 'English Language',
      },
    ],
    students: [
      {
        id: 'con-1',
        admissionNo: 'AMC-2026-101',
        fullName: 'Toluwanimi Adeyemo',
        className: 'SSS 1 Science',
        gender: 'Female',
        guardianName: 'Mrs. Folake Adeyemo',
        guardianPhone: '08034451120',
        attendanceToday: 'present',
        weeklyAttendance: {
          Mon: 'present',
          Tue: 'present',
          Wed: 'present',
          Thu: 'present',
          Fri: 'present',
        },
        termFeeNgn: 85000,
        amountPaidNgn: 85000,
        teacherRemark: 'Outstanding analytical skills in Mathematics and Computer Studies.',
        marks: [
          { subject: 'Mathematics', ca: 36, exam: 54 },
          { subject: 'English Language', ca: 32, exam: 49 },
          { subject: 'Basic Science', ca: 35, exam: 53 },
          { subject: 'Civic Education', ca: 33, exam: 50 },
          { subject: 'Computer Studies', ca: 37, exam: 55 },
        ],
        payments: [
          {
            receiptNo: 'RCP-AMC-4012',
            date: today,
            amountNgn: 85000,
            method: 'Online Card',
            note: 'Full term tuition & lab levy',
          },
        ],
      },
      {
        id: 'con-2',
        admissionNo: 'AMC-2026-102',
        fullName: 'Chukwudi Okafor',
        className: 'JSS 2A',
        gender: 'Male',
        guardianName: 'Engr. Emeka Okafor',
        guardianPhone: '08065543318',
        attendanceToday: 'present',
        weeklyAttendance: {
          Mon: 'present',
          Tue: 'late',
          Wed: 'present',
          Thu: 'late',
          Fri: 'present',
        },
        termFeeNgn: 75000,
        amountPaidNgn: 50000,
        teacherRemark: 'Very attentive in class; keep practicing algebra word problems.',
        marks: [
          { subject: 'Mathematics', ca: 30, exam: 47 },
          { subject: 'English Language', ca: 31, exam: 48 },
          { subject: 'Basic Science', ca: 33, exam: 51 },
          { subject: 'Civic Education', ca: 34, exam: 49 },
          { subject: 'Computer Studies', ca: 35, exam: 52 },
        ],
        payments: [
          {
            receiptNo: 'RCP-AMC-4009',
            date: today,
            amountNgn: 50000,
            method: 'Bank Transfer',
            note: 'Initial tuition deposit',
          },
        ],
      },
      {
        id: 'con-3',
        admissionNo: 'AMC-2026-103',
        fullName: 'Amina Bello',
        className: 'JSS 1A',
        gender: 'Female',
        guardianName: 'Alhaji Musa Bello',
        guardianPhone: '08139982244',
        attendanceToday: 'present',
        weeklyAttendance: {
          Mon: 'present',
          Tue: 'present',
          Wed: 'present',
          Thu: 'present',
          Fri: 'present',
        },
        termFeeNgn: 75000,
        amountPaidNgn: 75000,
        teacherRemark: 'Polite, articulate, and excels in English reading comprehension.',
        marks: [
          { subject: 'Mathematics', ca: 29, exam: 44 },
          { subject: 'English Language', ca: 37, exam: 55 },
          { subject: 'Basic Science', ca: 31, exam: 46 },
          { subject: 'Civic Education', ca: 36, exam: 53 },
          { subject: 'Computer Studies', ca: 30, exam: 48 },
        ],
        payments: [
          {
            receiptNo: 'RCP-AMC-3995',
            date: today,
            amountNgn: 75000,
            method: 'Bank Transfer',
            note: 'Full term tuition',
          },
        ],
      },
      {
        id: 'con-4',
        admissionNo: 'AMC-2026-104',
        fullName: 'Ibrahim Ogunleye',
        className: 'JSS 2A',
        gender: 'Male',
        guardianName: 'Mr. Rasheed Ogunleye',
        guardianPhone: '08023319904',
        attendanceToday: 'absent',
        weeklyAttendance: {
          Mon: 'absent',
          Tue: 'present',
          Wed: 'absent',
          Thu: 'absent',
          Fri: 'absent',
        },
        termFeeNgn: 75000,
        amountPaidNgn: 25000,
        teacherRemark: 'Good practical science aptitude; encourage regular homework submission.',
        marks: [
          { subject: 'Mathematics', ca: 26, exam: 40 },
          { subject: 'English Language', ca: 27, exam: 42 },
          { subject: 'Basic Science', ca: 32, exam: 48 },
          { subject: 'Civic Education', ca: 28, exam: 43 },
          { subject: 'Computer Studies', ca: 31, exam: 46 },
        ],
        payments: [
          {
            receiptNo: 'RCP-AMC-3980',
            date: today,
            amountNgn: 25000,
            method: 'Cash',
            note: 'Registration & first fee installment',
          },
        ],
      },
    ],
  };
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
