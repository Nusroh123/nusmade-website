import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, School } from 'lucide-react';

interface ContactSectionProps {
  onSuccessMessage: (msg: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onSuccessMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    email: '',
    phone: '',
    subject: 'School Management System (SMS) Inquiry',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      onSuccessMessage('Your message has been sent successfully! Our team will respond shortly.');
    }, 600);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>Get in Touch</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Contact NUSMADE
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Have questions about our School Management System, custom website pricing, or Madrasah onboarding? Speak directly with our education technology advisors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F8FAFC] p-7 rounded-2xl border border-slate-200/80 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Communication Channels
              </h3>
              <p className="text-sm text-slate-600">
                We are ready to schedule an on-site visit or virtual demonstration for your governing board.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Email Inquiries</span>
                    <a href="mailto:oyedele.nusroh@gmail.com" className="text-sm font-bold text-slate-900 hover:text-[#6D28D9]">
                      oyedele.nusroh@gmail.com
                    </a>
                    <span className="text-xs text-slate-500 block">Direct School Support</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#EC4899] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Phone & WhatsApp Hotline</span>
                    <a href="tel:+2348135018044" className="text-sm font-bold text-slate-900 hover:text-[#6D28D9] block">08135018044</a>
                    <span className="text-xs text-slate-500 block">WhatsApp: 08135018044</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Consultation Hours</span>
                    <span className="text-sm font-bold text-slate-900 block">Monday – Saturday</span>
                    <span className="text-xs text-slate-500 block">8:00 AM – 6:00 PM (West Africa & GMT)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Office Location</span>
                    <span className="text-sm font-bold text-slate-900 block">Osun State, Nigeria</span>
                    <span className="text-xs text-slate-500 block">Serving Conventional Schools & Madrasahs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response time badge */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#6D28D9] shrink-0" />
              <p className="text-xs text-purple-900 font-medium">
                Average inquiry response time: <strong>under 2 business hours</strong>.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-7 sm:p-9 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 font-display mb-2">
                Send Us a Message
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Tell us about your school needs and an education consultant will get in touch.
              </p>

              {submitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 font-display">Message Dispatched!</h4>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    Thank you, {formData.name}. We have received your inquiry for {formData.schoolName || 'your school'}. One of our specialists will reply shortly via {formData.email}.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        schoolName: '',
                        email: '',
                        phone: '',
                        subject: 'School Management System (SMS) Inquiry',
                        message: ''
                      });
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-[#6D28D9] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hajiya Maryam Yusuf"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        School / Madrasah Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Al-Ihsan Model College"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="admin@school.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 ... or phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                    >
                      <option value="School Management System (SMS) Inquiry">School Management System (SMS) Inquiry</option>
                      <option value="School Website Development (Templates / Custom)">School Website Development (Templates / Custom)</option>
                      <option value="Learning Management System (LMS) Setup">Learning Management System (LMS) Setup</option>
                      <option value="Madrasah & Dual Curriculum Integration">Madrasah & Dual Curriculum Integration</option>
                      <option value="Multi-Campus Institution Pricing">Multi-Campus Institution Pricing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      How Can We Help You? *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please share details such as student population, current pain points with report cards or fee management..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Education Specialist</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
