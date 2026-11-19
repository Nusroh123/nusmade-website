export type MadrasahGradingMode = 'arabic' | 'english' | 'both';

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

export function toArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);
}

export function toWesternDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0));
}

export function parseScoreInput(raw: string, max: number): number {
  const western = toWesternDigits(raw).replace(/[^0-9.-]/g, '').trim();
  if (!western) return 0;
  const parsed = Number(western);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(max, Math.max(0, Math.round(parsed)));
}

export function formatInputScore(
  value: number,
  isMadrasah: boolean,
  mode: MadrasahGradingMode = 'english'
): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  if (isMadrasah && mode === 'arabic') {
    return toArabicDigits(safe);
  }
  return String(safe);
}

export function formatDisplayNumeral(
  value: number | string,
  isMadrasah: boolean,
  mode: MadrasahGradingMode = 'english'
): string {
  if (!isMadrasah || mode === 'english') {
    return String(value);
  }
  if (mode === 'arabic') {
    return toArabicDigits(value);
  }
  return `${value} (${toArabicDigits(value)})`;
}

export function getLocalizedGradeDetails(
  total: number,
  schoolType: 'conventional' | 'madrasah',
  mode: MadrasahGradingMode = 'english'
): {
  grade: string;
  remark: string;
  textColor: string;
  badge: string;
} {
  if (schoolType === 'madrasah' && mode === 'arabic') {
    if (total >= 85) {
      return {
        grade: 'ممتاز',
        remark: 'تقدير ممتاز',
        textColor: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700',
      };
    }
    if (total >= 75) {
      return {
        grade: 'جيد جداً',
        remark: 'تقدير جيد جداً',
        textColor: 'text-[#6D28D9]',
        badge: 'bg-purple-50 text-[#6D28D9]',
      };
    }
    if (total >= 60) {
      return {
        grade: 'جيد',
        remark: 'تقدير جيد',
        textColor: 'text-amber-700',
        badge: 'bg-amber-50 text-amber-700',
      };
    }
    if (total >= 50) {
      return {
        grade: 'مقبول',
        remark: 'ناجح · مقبول',
        textColor: 'text-slate-700',
        badge: 'bg-slate-100 text-slate-700',
      };
    }
    return {
      grade: 'ضعيف',
      remark: 'يحتاج إلى دعم',
      textColor: 'text-red-700',
      badge: 'bg-red-50 text-red-700',
    };
  }

  if (schoolType === 'madrasah' && mode === 'both') {
    if (total >= 85) {
      return {
        grade: 'ممتاز / A1',
        remark: 'Mumtaz · Distinction',
        textColor: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700',
      };
    }
    if (total >= 75) {
      return {
        grade: 'جيد جداً / A1',
        remark: 'Jayyid Jiddan · Distinction',
        textColor: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700',
      };
    }
    if (total >= 65) {
      return {
        grade: 'جيد / B2',
        remark: 'Jayyid · Very Good',
        textColor: 'text-[#6D28D9]',
        badge: 'bg-purple-50 text-[#6D28D9]',
      };
    }
    if (total >= 50) {
      return {
        grade: 'مقبول / C4',
        remark: 'Maqbul · Credit',
        textColor: 'text-amber-700',
        badge: 'bg-amber-50 text-amber-700',
      };
    }
    return {
      grade: 'ضعيف / F9',
      remark: 'Da‘if · Needs Support',
      textColor: 'text-red-700',
      badge: 'bg-red-50 text-red-700',
    };
  }

  if (total >= 75) {
    return {
      grade: 'A1',
      remark: 'Distinction',
      textColor: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700',
    };
  }
  if (total >= 65) {
    return {
      grade: 'B2',
      remark: 'Very Good',
      textColor: 'text-[#6D28D9]',
      badge: 'bg-purple-50 text-[#6D28D9]',
    };
  }
  if (total >= 50) {
    return {
      grade: 'C4',
      remark: 'Credit',
      textColor: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-700',
    };
  }
  if (total >= 40) {
    return {
      grade: 'D7',
      remark: 'Pass',
      textColor: 'text-slate-700',
      badge: 'bg-slate-100 text-slate-700',
    };
  }
  return {
    grade: 'F9',
    remark: 'Needs Support',
    textColor: 'text-red-700',
    badge: 'bg-red-50 text-red-700',
  };
}

export function getMadrasahSubjectsPreset(mode: MadrasahGradingMode): string[] {
  if (mode === 'arabic') {
    return [
      'القرآن الكريم والتحفيظ',
      'النحو والصرف',
      'الفقه والحديث',
      'التفسير والسيرة',
      'الرياضيات',
    ];
  }
  if (mode === 'both') {
    return [
      'القرآن الكريم · Quranic Tahfiz',
      'النحو · Arabic Grammar',
      'الفقه والحديث · Fiqh & Hadith',
      'English Language',
      'Mathematics',
    ];
  }
  return [
    'Quranic Tahfiz',
    'Arabic Grammar (Nahw)',
    'Fiqh & Hadith',
    'English Language',
    'Mathematics',
  ];
}

export function getMadrasahModeShortLabel(mode: MadrasahGradingMode): string {
  if (mode === 'arabic') return 'Arabic Only (٠–٩ · ممتاز)';
  if (mode === 'both') return 'Both (Arabic & English)';
  return 'English Only (0–9 · A1–F9)';
}

export const MADRASAH_GRADING_OPTIONS: {
  mode: MadrasahGradingMode;
  title: string;
  badgeText: string;
  description: string;
}[] = [
  {
    mode: 'arabic',
    title: 'Arabic Madrasa Grading & Numerals Only',
    badgeText: '٠–٩ · ممتاز',
    description:
      'Enter scores in Eastern Arabic numerals (٠–٩), Arabic subjects, Arabic grades (ممتاز، جيد جداً، جيد، مقبول، ضعيف), and right-to-left report sheets.',
  },
  {
    mode: 'english',
    title: 'English Grading & Numerals Only',
    badgeText: '0–9 · A1–F9',
    description:
      'Enter scores in standard numerals (0–9), A1–F9 grading scale, and English Madrasah subjects like Quranic Tahfiz and Fiqh & Hadith.',
  },
  {
    mode: 'both',
    title: 'Both (Arabic & English Combined)',
    badgeText: '٠–٩ & 0–9 · ممتاز / A1',
    description:
      'Teachers can type scores in either Arabic (٣٥) or English (35) numerals, with bilingual subjects and dual Arabic + English grades on report cards.',
  },
];
