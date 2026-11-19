import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  School,
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  GraduationCap,
  Download,
  ExternalLink
} from 'lucide-react';
import { submitDemoRequest } from '../lib/leads';
import { formatPlainError } from '../lib/formatError';

interface FormData {
  schoolName: string;
  fullName: string;
  email: string;
  phone: string;
  schoolType: string;
  numberOfStudents: string;
  preferredDate: string;
  selectedPlan: string;
  message: string;
}

interface SubmittedResult extends FormData {
  referenceId: string;
  receivedAt: string;
}

export const BookDemoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const todayISO = new Date().toISOString().split('T')[0];
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '2348135018044';

  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    fullName: '',
    email: '',
    phone: '',
    schoolType: 'School (Conventional)',
    numberOfStudents: '150 - 500 Students',
    preferredDate: '',
    selectedPlan: 'Growth Suite',
    message: ''
  });

  useEffect(() => {
    const planParam = searchParams.get('plan');
    const studentsParam = searchParams.get('students');
    const schoolNameParam = searchParams.get('schoolName');
    const notesParam = searchParams.get('notes');

    if (planParam || studentsParam || schoolNameParam || notesParam) {
      setFormData((prev) => ({
        ...prev,
        selectedPlan: planParam || prev.selectedPlan,
        numberOfStudents: studentsParam || prev.numberOfStudents,
        schoolName: schoolNameParam || prev.schoolName,
        message: notesParam || prev.message
      }));
    }
  }, [searchParams]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedResult | null>(null);
  const [briefSaved, setBriefSaved] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School or Madrasah name is required';
    } else if (formData.schoolName.trim().length > 160) {
      newErrors.schoolName = 'School name must be 160 characters or fewer';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Contact person's full name is required";
    } else if (formData.fullName.trim().length > 120) {
      newErrors.fullName = 'Full name must be 120 characters or fewer';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim()) || formData.email.trim().length > 160) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 7 || formData.phone.trim().length > 30) {
      newErrors.phone = 'Please enter a valid phone number (7–30 characters)';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select a preferred demo date';
    } else if (formData.preferredDate < todayISO) {
      newErrors.preferredDate = 'Please select today or a future date';
    }

    if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must be 2,000 characters or fewer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = await submitDemoRequest(formData);

      setSubmittedData({
        ...formData,
        referenceId: payload.referenceId,
        receivedAt: payload.receivedAt
      });
    } catch (err) {
      setSubmitError(
        formatPlainError(
          err,
          'Unable to save your demo request right now. Please try again or reach us by phone or WhatsApp.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setSubmitError(null);
    setBriefSaved(false);
    setFormData({
      schoolName: '',
      fullName: '',
      email: '',
      phone: '',
      schoolType: 'School (Conventional)',
      numberOfStudents: '150 - 500 Students',
      preferredDate: '',
      selectedPlan: 'Growth Suite',
      message: ''
    });
    setErrors({});
  };

  const buildBriefText = (data: SubmittedResult) => {
    return [
      `NUSMADE DEMO REQUEST (${data.referenceId})`,
      `School / Madrasah: ${data.schoolName}`,
      `Contact Person: ${data.fullName}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `School Type: ${data.schoolType}`,
      `Student Size: ${data.numberOfStudents}`,
      `Plan Interest: ${data.selectedPlan}`,
      `Preferred Date: ${data.preferredDate}`,
      data.message ? `Notes: ${data.message}` : ''
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleDownloadBrief = () => {
    if (!submittedData) return;
    const blob = new Blob([buildBriefText(submittedData)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${submittedData.referenceId}-demo-brief.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setBriefSaved(true);
    setTimeout(() => setBriefSaved(false), 3000);
  };

  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F8FAFC] to-white py-16 lg:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-bold uppercase tracking-wider text-[#6D28D9]">
              Personalized School Walkthrough
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Book a Demo with NUSMADE
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              See how your school or Madrasah will run daily attendance, class-scoped teacher logins, numbered fee receipts, and automated report cards.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Form Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Form Column Left (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
                {submittedData ? (
                  <div className="text-left sm:text-center py-4 space-y-6">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center sm:mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                        Reference ID: {submittedData.referenceId}
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                        Demo Request Recorded
                      </h2>
                      <p className="text-sm text-slate-600 max-w-lg sm:mx-auto">
                        Thank you, <span className="font-semibold text-slate-900">{submittedData.fullName}</span>. Your walkthrough request for{' '}
                        <span className="font-semibold text-slate-900">{submittedData.schoolName}</span> has been saved.
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 text-left text-sm space-y-2 max-w-md sm:mx-auto">
                      <div className="flex justify-between gap-4 py-2 border-b border-slate-200">
                        <span className="text-slate-500">School / Madrasah</span>
                        <span className="font-bold text-slate-900 text-right">{submittedData.schoolName}</span>
                      </div>
                      <div className="flex justify-between gap-4 py-2 border-b border-slate-200">
                        <span className="text-slate-500">Contact Person</span>
                        <span className="font-bold text-slate-900 text-right">{submittedData.fullName}</span>
                      </div>
                      <div className="flex justify-between gap-4 py-2 border-b border-slate-200">
                        <span className="text-slate-500">Email</span>
                        <span className="font-bold text-slate-900 text-right break-all">{submittedData.email}</span>
                      </div>
                      <div className="flex justify-between gap-4 py-2 border-b border-slate-200">
                        <span className="text-slate-500">Phone Number</span>
                        <span className="font-bold text-slate-900 text-right">{submittedData.phone}</span>
                      </div>
                      <div className="flex justify-between gap-4 py-2 border-b border-slate-200">
                        <span className="text-slate-500">School Type</span>
                        <span className="font-bold text-slate-900 text-right">{submittedData.schoolType}</span>
                      </div>
                      <div className="flex justify-between gap-4 py-2 border-b border-slate-200">
                        <span className="text-slate-500">Plan Interest</span>
                        <span className="font-bold text-[#6D28D9] text-right">{submittedData.selectedPlan}</span>
                      </div>
                      <div className="flex justify-between gap-4 py-2 border-b border-slate-200">
                        <span className="text-slate-500">Student Size</span>
                        <span className="font-bold text-slate-900 text-right">{submittedData.numberOfStudents}</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-2">
                        <span className="text-slate-500">Preferred Date</span>
                        <span className="font-bold text-slate-900 text-right">{submittedData.preferredDate}</span>
                      </div>
                    </div>

                    {/* Direct Handoff Actions */}
                    <div className="max-w-md sm:mx-auto space-y-4">
                      <p className="text-sm font-semibold text-slate-600">
                        Want faster slot confirmation? Send this brief directly:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                            buildBriefText(submittedData)
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-11 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-2"
                        >
                          <span>WhatsApp</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <a
                          href={`mailto:oyedele.nusroh@gmail.com?subject=${encodeURIComponent(
                            `Demo Request: ${submittedData.schoolName} (${submittedData.referenceId})`
                          )}&body=${encodeURIComponent(buildBriefText(submittedData))}`}
                          className="min-h-11 py-2.5 px-4 rounded-xl font-bold text-sm text-slate-800 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Email App</span>
                        </a>

                        <button
                          type="button"
                          onClick={handleDownloadBrief}
                          className="min-h-11 py-2.5 px-4 rounded-xl font-bold text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>{briefSaved ? 'Downloaded!' : 'Save Brief'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="min-h-11 px-6 py-2.5 rounded-xl font-bold text-sm text-[#6D28D9] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        Submit Another Demo Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-display mb-1">
                        School Information & Contact
                      </h2>
                      <p className="text-sm text-slate-600">
                        Share your school details so we prepare sample subjects for your walkthrough.
                      </p>
                    </div>

                    {submitError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* School Name */}
                    <div>
                      <label htmlFor="demo-school-name" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <School className="w-4 h-4 text-[#6D28D9]" />
                        <span>School Name *</span>
                      </label>
                      <input
                        id="demo-school-name"
                        type="text"
                        placeholder="e.g. Al-Hikmah International Academy"
                        value={formData.schoolName}
                        onChange={(e) => {
                          setFormData({ ...formData, schoolName: e.target.value });
                          if (errors.schoolName) setErrors({ ...errors, schoolName: '' });
                        }}
                        className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                          errors.schoolName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                        } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                      />
                      {errors.schoolName && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {errors.schoolName}
                        </p>
                      )}
                    </div>

                    {/* Contact Person's Full Name */}
                    <div>
                      <label htmlFor="demo-full-name" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#6D28D9]" />
                        <span>Contact Person’s Full Name *</span>
                      </label>
                      <input
                        id="demo-full-name"
                        type="text"
                        placeholder="e.g. Alhaji Aminu Bello (Proprietor / Principal)"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: '' });
                        }}
                        className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                          errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                        } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email Address & Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="demo-email" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#6D28D9]" />
                          <span>Email Address *</span>
                        </label>
                        <input
                          id="demo-email"
                          type="email"
                          placeholder="principal@school.edu"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                            errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="demo-phone" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#6D28D9]" />
                          <span>Phone Number *</span>
                        </label>
                        <input
                          id="demo-phone"
                          type="tel"
                          placeholder="+234 or local number"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                            errors.phone ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* School Type & Number of Students */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="demo-school-type" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-[#6D28D9]" />
                          <span>School Type *</span>
                        </label>
                        <select
                          id="demo-school-type"
                          value={formData.schoolType}
                          onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                          className="w-full min-h-11 pl-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                        >
                          <option value="School (Conventional)">School (Conventional Primary/Secondary)</option>
                          <option value="Madrasah (Islamic Institution)">Madrasah (Islamic Institution / Tahfiz)</option>
                          <option value="Combined (Western & Madrasah)">Combined (Western & Madrasah)</option>
                          <option value="College / Higher Institution">College / Higher Institution</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="demo-students" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#6D28D9]" />
                          <span>Number of Students *</span>
                        </label>
                        <select
                          id="demo-students"
                          value={formData.numberOfStudents}
                          onChange={(e) => setFormData({ ...formData, numberOfStudents: e.target.value })}
                          className="w-full min-h-11 pl-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                        >
                          <option value="Under 150 Students">Under 150 Students</option>
                          <option value="150 - 500 Students">150 - 500 Students</option>
                          <option value="500 - 1,500 Students">500 - 1,500 Students</option>
                          <option value="1,500+ Students">1,500+ Students (Multi-Campus)</option>
                        </select>
                      </div>
                    </div>

                    {/* Preferred Demo Date & Plan Interest */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="demo-date" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6D28D9]" />
                          <span>Preferred Demo Date *</span>
                        </label>
                        <input
                          id="demo-date"
                          type="date"
                          min={todayISO}
                          value={formData.preferredDate}
                          onChange={(e) => {
                            setFormData({ ...formData, preferredDate: e.target.value });
                            if (errors.preferredDate) setErrors({ ...errors, preferredDate: '' });
                          }}
                          className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                            errors.preferredDate ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                        />
                        {errors.preferredDate && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.preferredDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="demo-plan" className="block text-sm font-semibold text-slate-700 mb-2">
                          Plan / Package Interest
                        </label>
                        <select
                          id="demo-plan"
                          value={formData.selectedPlan}
                          onChange={(e) => setFormData({ ...formData, selectedPlan: e.target.value })}
                          className="w-full min-h-11 pl-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                        >
                          <option value="Starter Plan">Starter Plan (Website + Core SMS)</option>
                          <option value="Growth Suite">Growth Suite (Full SMS + LMS + Website)</option>
                          <option value="Multi-Campus / Bespoke">Multi-Campus / Bespoke Website</option>
                          <option value="Not sure yet">Not sure yet — help us choose</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Message */}
                    <div>
                      <label htmlFor="demo-notes" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#6D28D9]" />
                        <span>Additional Message (Optional)</span>
                      </label>
                      <textarea
                        id="demo-notes"
                        rows={3}
                        placeholder="Share specific needs (e.g. terminal report layout, Arabic grading, spreadsheet import)..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full min-h-12 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-md shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>Recording Request...</span>
                          </>
                        ) : (
                          <>
                            <span>Schedule My 30-Minute Demo</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-left sm:text-center text-sm text-slate-500">
                      No commitment required. Built for school owners, principals, and administrators.
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* Right Side: What to Expect Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#F8FAFC] p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-[#EC4899] mb-1">
                    What to Expect
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 font-display">
                    During Your 30-Minute Live Walkthrough
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Matched to Your School Curriculum</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Whether Western, Madrasah, or Combined, we configure sample subjects around your classes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Automated Report Card Generation</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        See CA (40) and Exam (60) marks calculate totals, grades, and attendance percentages automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Fee Ledger & Numbered Receipts</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        See how bank transfer, POS/card, and cash fee payments update balances and issue printable numbered receipts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Direct Q&amp;A on Data Migration</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Ask about spreadsheet student imports, assigning class teachers, and staff training.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">
                  Prefer to Call Directly?
                </span>
                <p className="text-sm font-bold text-slate-900">
                  School Onboarding Hotline
                </p>
                <a href="tel:+2348135018044" className="min-h-11 inline-flex items-center text-base font-extrabold text-[#6D28D9] hover:underline">
                  08135018044
                </a>
                <p className="text-sm text-slate-500">
                  Monday – Saturday: 8:00 AM – 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
