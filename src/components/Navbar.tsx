import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ArrowRight, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Features', path: '/features' },
    { name: 'Sandbox Demo', path: '/live-demo' },
    { name: 'Staff Login', path: '/school' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-3 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 min-h-11 group cursor-pointer shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#EC4899] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-display text-slate-900 leading-none">
              NUS<span className="text-[#6D28D9]">MADE</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `inline-flex items-center min-h-11 px-3 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#6D28D9] bg-purple-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Primary CTA: Book a Demo */}
          <div className="hidden sm:flex items-center">
            <Link
              to="/book-demo"
              className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Action & Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/book-demo"
              className="sm:hidden inline-flex items-center justify-center min-h-11 px-4 text-sm font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] rounded-xl whitespace-nowrap"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Demo
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D28D9] cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-4 pb-6 shadow-xl animate-fade-in">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center min-h-11 px-4 py-2.5 text-base font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'text-[#6D28D9] bg-purple-50 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link
              to="/book-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-12 py-3 px-4 rounded-xl text-center font-semibold text-base text-white bg-[#6D28D9] hover:bg-[#5B21B6] shadow-sm flex items-center justify-center gap-2"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-sm text-slate-500">
              Inquiries: oyedele.nusroh@gmail.com
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
