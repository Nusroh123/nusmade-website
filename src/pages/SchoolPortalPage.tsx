import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  LogIn,
  LogOut,
  Lock,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { ADMIN_EMAIL } from '../lib/firebase';

export const SchoolPortalPage: React.FC = () => {
  const { user, isAuthReady, isAdmin, isSigningIn, authError, signInWithGoogle, signOutUser } =
    useFirebaseAuth();

  return (
    <div className="bg-[#F8FAFC] min-h-[82vh] py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#6D28D9]">
              <Lock className="w-4 h-4 text-[#EC4899]" />
              <span>Role-Separated School Sign-In</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
              Choose Your School Portal
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Sign in with Google to open your school’s cloud workspace. Access stays strictly separated between the{' '}
              <strong className="text-slate-900">School Administrator</strong> and{' '}
              <strong className="text-slate-900">Assigned Class Teachers</strong>.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0 w-full lg:w-auto">
            {isAuthReady && user ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 w-full lg:min-w-[280px]">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Signed-in Google Account
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-1">{user.displayName || 'Staff User'}</p>
                  <p className="text-sm text-slate-600 break-all">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    disabled={isSigningIn}
                    className="min-h-11 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-800 hover:border-[#6D28D9] transition-colors cursor-pointer"
                  >
                    {isSigningIn ? 'Opening...' : 'Switch Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void signOutUser()}
                    className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={!isAuthReady || isSigningIn}
                className="w-full lg:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            )}
            {authError && <p className="text-sm text-red-600 font-medium">{authError}</p>}
          </div>
        </div>

        {/* Evaluating Without Signing In? Sandbox Demo Callout (Quiet Secondary Action) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Testing before setting up your school?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Try the no-login Sandbox Demo to test Admin, Class Teacher, and Parent screens with sample data.
              </p>
            </div>
          </div>
          <Link
            to="/live-demo"
            className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4 text-[#6D28D9]" />
            <span>Open Sandbox Demo</span>
          </Link>
        </div>

        {/* Two Separated Role Login Portals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* School Admin Portal Card (Primary CTA) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-purple-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6D28D9] border border-purple-100 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-[#6D28D9]">
                  Proprietor / Principal
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                  School Admin Portal
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full school workspace reserved for the verified School Administrator account (
                  <span className="font-semibold text-slate-900">{ADMIN_EMAIL}</span>).
                </p>
              </div>

              <ul className="space-y-2 text-sm text-slate-700 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                  <span>Configure school name, curriculum mode, classes, and subjects</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                  <span>Add teachers by Google email and lock each one to a class</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                  <span>Enroll students, print report cards, and track private fee receipts</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                to="/school/admin"
                className="w-full min-h-12 py-3 px-6 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{isAdmin ? 'Open School Admin Workspace' : 'Enter School Admin Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-slate-500 text-left sm:text-center">
                {isAdmin
                  ? 'Verified Admin session active.'
                  : 'Requires signing in with the School Administrator Google email.'}
              </p>
            </div>
          </div>

          {/* Class Teacher Portal Card (Quiet Outline Action) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-pink-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#EC4899] border border-pink-100 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-[#BE185D]">
                  Class-Scoped Staff
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                  Class Teacher Portal
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Focused classroom portal for teachers added by the School Admin. Each teacher sees{' '}
                  <strong className="text-slate-900">only their assigned class</strong>.
                </p>
              </div>

              <ul className="space-y-2 text-sm text-slate-700 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                  <span>Mark daily roll call (Present, Late, Absent) for your class</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                  <span>Enter CA (0–40) and Exam (0–60) scores in the class markbook</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                  <span>Tuition fees, guardian phone numbers, and other classes remain hidden</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                to="/school/teacher"
                className="w-full min-h-12 py-3 px-6 rounded-xl text-sm font-bold text-slate-900 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors flex items-center justify-center gap-2"
              >
                <span>Enter Class Teacher Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-slate-500 text-left sm:text-center">
                Sign in with the Gmail address your School Admin assigned to your class.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
