import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { submitContactInquiry } from '../lib/leads';
import { formatPlainError } from '../lib/formatError';

interface ContactFormState {
  name: string;
  schoolName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface SubmittedContact extends ContactFormState {
  referenceId: string;
}

export const ContactPage: React.FC = () => {
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '2348135018044';

  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    schoolName: '',
    email: '',
    phone: '',
    subject: 'School Management System (SMS) Inquiry',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedContact | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length > 120) {
      newErrors.name = 'Full name must be 120 characters or fewer';
    }
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School / Madrasah name is required';
    } else if (formData.schoolName.trim().length > 160) {
      newErrors.schoolName = 'School name must be 160 characters or fewer';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim()) || formData.email.trim().length > 160) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 7 || formData.phone.trim().length > 30) {
      newErrors.phone = 'Please enter a valid phone number (7–30 characters)';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide inquiry details';
    } else if (formData.message.trim().length > 2000) {
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
      const payload = await submitContactInquiry(formData);
      setSubmitted({
        ...formData,
        referenceId: payload.referenceId
      });
    } catch (err) {
      setSubmitError(
        formatPlainError(
          err,
          'Unable to save your message right now. Please try email or WhatsApp below.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F8FAFC] to-white py-16 lg:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-bold uppercase tracking-wider text-[#6D28D9]">
              Contact Us
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Speak With the NUSMADE Onboarding Team
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Ask about our School Management System, school website setup, Madrasah grading schemes, or spreadsheet data migration.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Contact Info Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Contact Channels Left */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#F8FAFC] p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">
                    Direct Contact Channels
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Reach an onboarding advisor directly by email, phone, or WhatsApp.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Email Inquiries</span>
                      <a href="mailto:oyedele.nusroh@gmail.com" className="min-h-11 inline-flex items-center text-sm font-bold text-slate-900 hover:text-[#6D28D9]">
                        oyedele.nusroh@gmail.com
                      </a>
                      <span className="text-sm text-slate-500 block">
                        Direct Founder &amp; Support Inbox
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Phone &amp; WhatsApp</span>
                      <a href="tel:+2348135018044" className="min-h-11 inline-flex items-center text-sm font-bold text-slate-900 hover:text-[#6D28D9]">
                        08135018044
                      </a>
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-11 flex items-center gap-1 text-sm text-emerald-700 font-semibold hover:underline"
                      >
                        <span>Chat on WhatsApp</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Support Hours</span>
                      <span className="text-sm font-bold text-slate-900 block">Monday – Saturday</span>
                      <span className="text-sm text-slate-500 block">8:00 AM – 6:00 PM (WAT / GMT+1)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Office Location</span>
                      <span className="text-sm font-bold text-slate-900 block">Osun State, Nigeria</span>
                      <span className="text-sm text-slate-500 block">Serving Conventional Schools &amp; Madrasahs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#6D28D9] shrink-0" />
                <p className="text-sm text-purple-900">
                  Typical reply time: <strong>within 2 business hours</strong> during Mon – Sat support hours.
                </p>
              </div>
            </div>

            {/* Interactive Contact Form Right */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 font-display mb-2">
                  Send Us a Message
                </h3>
                <p className="text-slate-600 text-sm mb-6">
                  Fill out the form below and an advisor will reply to your school email or phone.
                </p>

                {submitted ? (
                  <div className="py-8 text-left sm:text-center space-y-6">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center sm:mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                        Reference ID: {submitted.referenceId}
                      </p>
                      <h4 className="text-2xl font-bold text-slate-900 font-display">Message Received</h4>
                      <p className="text-slate-600 text-sm max-w-md sm:mx-auto leading-relaxed">
                        Thank you, <span className="font-semibold text-slate-900">{submitted.name}</span>. Your message for{' '}
                        <span className="font-semibold text-slate-900">{submitted.schoolName}</span> has been recorded.
                      </p>
                    </div>

                    <div className="max-w-sm sm:mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 pt-2">
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                          `NUSMADE Inquiry (${submitted.referenceId})\nName: ${submitted.name}\nSchool: ${submitted.schoolName}\nTopic: ${submitted.subject}\nMessage: ${submitted.message}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-11 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <span>Continue on WhatsApp</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:oyedele.nusroh@gmail.com?subject=${encodeURIComponent(
                          `${submitted.subject} (${submitted.referenceId})`
                        )}&body=${encodeURIComponent(
                          `Name: ${submitted.name}\nSchool: ${submitted.schoolName}\nPhone: ${submitted.phone}\n\n${submitted.message}`
                        )}`}
                        className="min-h-11 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Open Email App</span>
                      </a>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(null);
                          setFormData({
                            name: '',
                            schoolName: '',
                            email: '',
                            phone: '',
                            subject: 'School Management System (SMS) Inquiry',
                            message: ''
                          });
                        }}
                        className="min-h-11 px-6 py-2.5 rounded-xl text-sm font-bold text-[#6D28D9] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {submitError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-2">
                          Your Full Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          placeholder="e.g. Dr. Aminu Bello"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: '' });
                          }}
                          className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                            errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contact-school" className="block text-sm font-semibold text-slate-700 mb-2">
                          School / Madrasah Name *
                        </label>
                        <input
                          id="contact-school"
                          type="text"
                          placeholder="e.g. Al-Hikmah Academy"
                          value={formData.schoolName}
                          onChange={(e) => {
                            setFormData({ ...formData, schoolName: e.target.value });
                            if (errors.schoolName) setErrors({ ...errors, schoolName: '' });
                          }}
                          className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                            errors.schoolName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                        />
                        {errors.schoolName && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.schoolName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          placeholder="principal@school.edu"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                            errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone / WhatsApp Number *
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          placeholder="+234 ... or local number"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          className={`w-full min-h-11 px-4 py-2.5 text-sm rounded-xl border ${
                            errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                          } focus:outline-none focus:ring-2 focus:ring-[#6D28D9]`}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-700 mb-2">
                        Inquiry Topic
                      </label>
                      <select
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full min-h-11 pl-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      >
                        <option value="School Management System (SMS) Inquiry">School Management System (SMS) Inquiry</option>
                        <option value="School Website Development (Ready / Custom)">School Website Development (Ready / Custom)</option>
                        <option value="Learning Management System (LMS) Setup">Learning Management System (LMS) Setup</option>
                        <option value="Madrasah & Dual Curriculum Integration">Madrasah &amp; Dual Curriculum Integration</option>
                        <option value="Group of Schools / Multi-Campus Setup">Group of Schools / Multi-Campus Setup</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-2">
                        How Can We Assist Your School? *
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        placeholder="Tell us about your student count, subjects, or questions..."
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value });
                          if (errors.message) setErrors({ ...errors, message: '' });
                        }}
                        className={`w-full px-4 py-3 text-sm rounded-xl border ${
                          errors.message ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                        } focus:outline-none focus:ring-2 focus:ring-[#6D28D9] resize-none`}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {errors.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full min-h-12 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-md shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>Sending Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
