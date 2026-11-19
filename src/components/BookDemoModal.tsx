import React, { useState } from 'react';
import { X, CheckCircle, Calendar, School, User, Mail, Phone, Users, Sparkles, Clock } from 'lucide-react';
import { DemoRequest } from '../types';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (info: DemoRequest) => void;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<DemoRequest>({
    fullName: '',
    schoolName: '',
    role: 'School Proprietor / Owner',
    email: '',
    phone: '',
    schoolType: 'conventional',
    studentCount: '250 - 500 Students',
    preferredDate: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSuccess(formData);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#EC4899] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" /> Free 30-Minute Live Demo
            </span>
          </div>
          <h3 className="text-2xl font-bold font-display">Experience NUSMADE in Action</h3>
          <p className="text-purple-100 text-sm mt-1">
            See how our SMS, LMS, and School Website solutions streamline administration for your school or Madrasah.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 font-display">Demo Request Received!</h4>
            <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
              Thank you, <span className="font-semibold text-slate-800">{formData.fullName}</span>. An education technology consultant from NUSMADE will reach out to you within 24 hours at <span className="font-semibold text-slate-800">{formData.email}</span> to confirm your walkthrough for <span className="font-semibold text-slate-800">{formData.schoolName}</span>.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left text-xs text-slate-700 space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-medium text-slate-900">{formData.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">School Type:</span>
                <span className="font-medium capitalize text-slate-900">{formData.schoolType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Size:</span>
                <span className="font-medium text-slate-900">{formData.studentCount}</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#6D28D9]" /> Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Aminu Bello"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-[#6D28D9]" /> School / Madrasah Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Bayan Premier College"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#6D28D9]" /> Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="principal@school.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#6D28D9]" /> Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234 or your country code"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                >
                  <option value="School Proprietor / Owner">School Proprietor / Owner</option>
                  <option value="Principal / Headteacher">Principal / Headteacher</option>
                  <option value="Madrasah Director / Mudir">Madrasah Director / Mudir</option>
                  <option value="School Administrator">School Administrator</option>
                  <option value="IT Coordinator / Teacher">IT Coordinator / Teacher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School Category
                </label>
                <select
                  value={formData.schoolType}
                  onChange={(e) => setFormData({ ...formData, schoolType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                >
                  <option value="conventional">Conventional Primary/Secondary</option>
                  <option value="madrasah">Madrasah / Islamic School</option>
                  <option value="combined">Combined (Western & Islamic)</option>
                  <option value="other">Higher Institution / College</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#6D28D9]" /> Approximate Student Body
                </label>
                <select
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                >
                  <option value="Under 150 Students">Under 150 Students</option>
                  <option value="150 - 500 Students">150 - 500 Students</option>
                  <option value="500 - 1,500 Students">500 - 1,500 Students</option>
                  <option value="1,500+ Students">1,500+ Students (Multi-Campus)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#6D28D9]" /> Preferred Demo Date
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Interests or Questions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. We need to automate our termly report cards and collect school fees via bank transfer."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" /> Scheduling Your Demo...
                  </>
                ) : (
                  <>
                    Schedule Personalized Demo
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                No credit card required. Includes a personalized walkthrough with your school curriculum.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
