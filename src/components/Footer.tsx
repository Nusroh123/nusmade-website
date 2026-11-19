import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ShieldCheck,
  MessageSquare,
  Calendar,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0F172A] text-slate-300 pt-16 pb-12 border-t border-slate-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Info & Mission (Col 1 - 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 min-h-11">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight font-display text-white">
                NUS<span className="text-[#6D28D9]">MADE</span>
              </span>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed">
              NUSMADE builds school websites, attendance and 40/60 markbook portals, tuition ledgers, and learning tools for conventional schools and Madrasahs.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="mailto:oyedele.nusroh@gmail.com"
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl bg-slate-800 hover:bg-[#6D28D9] text-sm font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Email Us</span>
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl bg-slate-800 hover:bg-[#6D28D9] text-sm font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Inquiry</span>
              </Link>
              <Link
                to="/book-demo"
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl bg-slate-800 hover:bg-[#6D28D9] text-sm font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Demo</span>
              </Link>
            </div>
          </div>

          {/* Quick Links (Col 5 - 6) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/features" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/live-demo" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Sandbox Demo
                </Link>
              </li>
              <li>
                <Link to="/school" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Staff Login
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Solutions (Col 7 - 9) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Our Solutions
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/solutions#website-solution" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  School Website Development
                </Link>
              </li>
              <li>
                <Link to="/solutions#sms-solution" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  School Management System (SMS)
                </Link>
              </li>
              <li>
                <Link to="/solutions#lms-solution" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Learning Management System (LMS)
                </Link>
              </li>
              <li>
                <Link to="/solutions#pricing" className="inline-flex items-center min-h-11 py-1 hover:text-white transition-colors">
                  Plans &amp; Quote Estimator
                </Link>
              </li>
              <li>
                <Link
                  to="/book-demo"
                  className="text-pink-400 hover:text-pink-300 font-semibold transition-colors inline-flex items-center min-h-11 py-1"
                >
                  Schedule Guided Demo &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (Col 10 - 12) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Contact &amp; Inquiries
            </h4>
            <div className="space-y-1 text-sm text-slate-300">
              <div className="flex items-center gap-2 min-h-11">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <a
                  href="mailto:oyedele.nusroh@gmail.com"
                  className="inline-flex items-center min-h-11 hover:text-white break-all"
                >
                  oyedele.nusroh@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 min-h-11">
                <Phone className="w-4 h-4 text-[#EC4899] shrink-0" />
                <a
                  href="tel:+2348135018044"
                  className="inline-flex items-center min-h-11 hover:text-white"
                >
                  08135018044
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Osun State, Nigeria · Mon – Sat (8:00 AM – 6:00 PM)</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/book-demo"
                className="w-full inline-flex items-center justify-center min-h-11 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} NUSMADE Technologies. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400 inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cloud-hosted with role-based school security</span>
            </span>
            <Link to="/school" className="inline-flex items-center min-h-11 text-slate-300 hover:text-white transition-colors">
              Staff Login
            </Link>
            <Link to="/admin" className="inline-flex items-center min-h-11 text-slate-300 hover:text-white transition-colors">
              Leads Inbox
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 min-h-11 px-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
