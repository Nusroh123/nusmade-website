import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  LogIn,
  LogOut,
  Calendar,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  Trash2,
  AlertCircle,
  Users
} from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { ADMIN_EMAIL } from '../lib/firebase';
import { formatPlainError } from '../lib/formatError';
import {
  deleteLeadRecord,
  subscribeContactInquiries,
  subscribeDemoRequests,
  updateLeadStatus,
  type ContactInquiryRecord,
  type DemoRequestRecord,
  type LeadStatus
} from '../lib/leads';

const STATUS_OPTIONS: { value: LeadStatus; label: string; badgeClass: string }[] = [
  { value: 'new', label: 'New', badgeClass: 'bg-purple-100 text-[#6D28D9] border-purple-200' },
  { value: 'contacted', label: 'Contacted', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'scheduled', label: 'Scheduled', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'archived', label: 'Archived', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' }
];

function formatTimestamp(ts: { toDate?: () => Date } | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Just now';
  return ts.toDate().toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusBadge(status: LeadStatus): string {
  return STATUS_OPTIONS.find((opt) => opt.value === status)?.badgeClass ?? STATUS_OPTIONS[0].badgeClass;
}

export const AdminPage: React.FC = () => {
  const { user, isAuthReady, isAdmin, authError, isSigningIn, signInWithGoogle, signOutUser } =
    useFirebaseAuth();

  const [activeTab, setActiveTab] = useState<'demos' | 'contacts'>('demos');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [demos, setDemos] = useState<DemoRequestRecord[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiryRecord[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    if (!isAuthReady || !isAdmin) {
      setDemos([]);
      setInquiries([]);
      return;
    }

    setDataError(null);
    const unsubDemos = subscribeDemoRequests(
      (items) => setDemos(items),
      (msg) => setDataError(formatPlainError(msg, 'Unable to load demo requests right now.'))
    );
    const unsubContacts = subscribeContactInquiries(
      (items) => setInquiries(items),
      (msg) => setDataError(formatPlainError(msg, 'Unable to load contact inquiries right now.'))
    );

    return () => {
      unsubDemos();
      unsubContacts();
    };
  }, [isAuthReady, isAdmin]);

  const filteredDemos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return demos.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.schoolName.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.referenceId.toLowerCase().includes(q)
      );
    });
  }, [demos, statusFilter, searchQuery]);

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return inquiries.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.schoolName.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.referenceId.toLowerCase().includes(q)
      );
    });
  }, [inquiries, statusFilter, searchQuery]);

  const newLeadsCount = useMemo(
    () =>
      demos.filter((d) => d.status === 'new').length +
      inquiries.filter((c) => c.status === 'new').length,
    [demos, inquiries]
  );

  const handleStatusChange = async (
    collectionName: 'demo_requests' | 'contact_inquiries',
    id: string,
    nextStatus: LeadStatus
  ) => {
    setUpdatingId(id);
    setDataError(null);
    try {
      await updateLeadStatus(collectionName, id, nextStatus);
      const label = STATUS_OPTIONS.find((s) => s.value === nextStatus)?.label ?? nextStatus;
      showToast(`Status updated to ${label}.`);
    } catch (err) {
      setDataError(formatPlainError(err, 'Unable to update status. Please try again.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (collectionName: 'demo_requests' | 'contact_inquiries', id: string) => {
    setUpdatingId(id);
    setDataError(null);
    try {
      await deleteLeadRecord(collectionName, id);
      setConfirmDeleteId(null);
      showToast('Lead removed from inbox.');
    } catch (err) {
      setDataError(formatPlainError(err, 'Unable to delete lead. Please try again.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const hasFiltersActive = searchQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="bg-[#F8FAFC] min-h-[75vh] py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-wider text-[#6D28D9]">
              Private Leads Inbox
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              School Demo &amp; Inquiry Inbox
            </h1>
            <p className="text-sm text-slate-600">
              Review incoming demo bookings and inquiries from prospective schools.
            </p>
          </div>

          {user && (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <Link
                to="/school/admin"
                className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:border-[#6D28D9] transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#6D28D9]" />
                <span>Open School Admin</span>
              </Link>
              <div className="text-right hidden md:block px-2">
                <span className="text-sm font-bold text-slate-900 block">{user.displayName || 'Admin'}</span>
                <span className="text-sm text-slate-500 block">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Auth Loading */}
        {!isAuthReady && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <Clock className="w-8 h-8 text-[#6D28D9] animate-spin mx-auto" />
            <p className="text-base font-semibold text-slate-700">Checking administrator session...</p>
          </div>
        )}

        {/* Sign-In Prompt */}
        {isAuthReady && !user && (
          <div className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-left sm:text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6D28D9] flex items-center justify-center sm:mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-display">Administrator Sign-In Required</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                School contact details are private. Sign in with the authorized Google account (
                <span className="font-semibold text-slate-900">{ADMIN_EMAIL}</span>) to open the leads inbox.
              </p>
            </div>

            {authError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={isSigningIn}
              className="w-full min-h-12 py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSigningIn ? 'Opening Google Sign-In...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}

        {/* Signed in, but not authorized admin */}
        {isAuthReady && user && !isAdmin && (
          <div className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-red-200 shadow-sm text-left sm:text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center sm:mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Access Restricted</h2>
            <p className="text-sm text-slate-600">
              You are signed in as <span className="font-bold text-slate-900">{user.email}</span>. Only the authorized administrator email can view school leads.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors cursor-pointer"
              >
                Switch Google Account
              </button>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="min-h-11 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Authorized Admin Workspace */}
        {isAuthReady && isAdmin && (
          <>
            {dataError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{dataError}</span>
              </div>
            )}

            {statusToast && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{statusToast}</span>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500 block">Total Leads</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900 font-display">
                    {demos.length + inquiries.length}
                  </span>
                  <Users className="w-5 h-5 text-[#6D28D9]" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500 block">Awaiting Follow-Up</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-[#EC4899] font-display">{newLeadsCount}</span>
                  <Clock className="w-5 h-5 text-[#EC4899]" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500 block">Demo Bookings</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900 font-display">{demos.length}</span>
                  <Calendar className="w-5 h-5 text-[#6D28D9]" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-500 block">Contact Inquiries</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900 font-display">{inquiries.length}</span>
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Filter Toolbar & Tabs */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('demos')}
                  className={`min-h-11 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'demos'
                      ? 'bg-[#6D28D9] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Demo Bookings ({demos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contacts')}
                  className={`min-h-11 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'contacts'
                      ? 'bg-[#6D28D9] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact Inquiries ({inquiries.length})</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search school, name, ref..."
                    className="w-full sm:w-64 min-h-11 pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                  />
                </div>

                <select
                  aria-label="Filter by lead status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)}
                  className="min-h-11 pl-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                >
                  <option value="all">All Statuses</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lead List */}
            {activeTab === 'demos' ? (
              filteredDemos.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-left sm:text-center space-y-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 sm:mx-auto" />
                  <p className="text-base font-bold text-slate-800">
                    {hasFiltersActive ? 'No demo requests match your filter' : 'No demo requests yet'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {hasFiltersActive
                      ? 'Clear your search text or reset the status dropdown to view all saved requests.'
                      : 'Submissions from the Book a Demo page will appear here immediately.'}
                  </p>
                  {hasFiltersActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="min-h-11 px-5 py-2 rounded-xl bg-[#6D28D9] text-white text-sm font-bold cursor-pointer"
                    >
                      Clear Search &amp; Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredDemos.map((lead) => (
                    <div
                      key={lead.referenceId}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {lead.referenceId}
                            </span>
                            <span
                              className={`text-sm font-bold px-3 py-0.5 rounded-full border ${getStatusBadge(
                                lead.status
                              )}`}
                            >
                              {lead.status}
                            </span>
                            <span className="text-sm font-semibold text-[#6D28D9]">
                              {lead.selectedPlan}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 font-display">{lead.schoolName}</h3>
                          <p className="text-sm text-slate-600">
                            Contact: <span className="font-semibold text-slate-900">{lead.fullName}</span> •{' '}
                            {lead.schoolType} • {lead.numberOfStudents}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {updatingId === lead.referenceId && (
                            <span className="text-sm font-semibold text-[#6D28D9]">Saving...</span>
                          )}
                          <select
                            aria-label={`Status for ${lead.schoolName}`}
                            value={lead.status}
                            disabled={updatingId === lead.referenceId}
                            onChange={(e) =>
                              void handleStatusChange(
                                'demo_requests',
                                lead.referenceId,
                                e.target.value as LeadStatus
                              )
                            }
                            className="min-h-11 pl-4 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {confirmDeleteId === lead.referenceId ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={updatingId === lead.referenceId}
                                onClick={() => void handleDelete('demo_requests', lead.referenceId)}
                                className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                              >
                                {updatingId === lead.referenceId ? 'Deleting...' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(lead.referenceId)}
                              className="w-11 h-11 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
                              aria-label={`Delete lead ${lead.schoolName}`}
                              title="Delete lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 text-sm">
                        <div className="flex items-center gap-2 text-slate-700 min-w-0">
                          <Mail className="w-4 h-4 text-[#6D28D9] shrink-0" />
                          <a href={`mailto:${lead.email}`} className="font-semibold hover:underline truncate">
                            {lead.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-4 h-4 text-[#EC4899] shrink-0" />
                          <a href={`tel:${lead.phone}`} className="font-semibold hover:underline">
                            {lead.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Date: <strong className="text-slate-900">{lead.preferredDate}</strong>
                          </span>
                        </div>
                      </div>

                      {lead.message && (
                        <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                          {lead.message}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-sm text-slate-500">
                        <span>Submitted: {formatTimestamp(lead.createdAt)}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Assalamu alaykum / Hello ${lead.fullName}, thank you for booking a NUSMADE demo for ${lead.schoolName} (${lead.referenceId}).`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <span>WhatsApp Reply</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${lead.email}?subject=${encodeURIComponent(
                              `Your NUSMADE Demo Request (${lead.referenceId})`
                            )}`}
                            className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-[#6D28D9] font-bold hover:bg-purple-100 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            <span>Email Reply</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredInquiries.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-left sm:text-center space-y-4">
                <CheckCircle2 className="w-8 h-8 text-slate-300 sm:mx-auto" />
                <p className="text-base font-bold text-slate-800">
                  {hasFiltersActive ? 'No contact inquiries match your filter' : 'No contact inquiries yet'}
                </p>
                <p className="text-sm text-slate-600">
                  {hasFiltersActive
                    ? 'Clear your search text or reset the status dropdown to view all inquiries.'
                    : 'Messages submitted on the Contact page will appear here automatically.'}
                </p>
                {hasFiltersActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="min-h-11 px-5 py-2 rounded-xl bg-[#6D28D9] text-white text-sm font-bold cursor-pointer"
                  >
                    Clear Search &amp; Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredInquiries.map((lead) => (
                  <div
                    key={lead.referenceId}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {lead.referenceId}
                          </span>
                          <span
                            className={`text-sm font-bold px-3 py-0.5 rounded-full border ${getStatusBadge(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {lead.subject}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 font-display">{lead.schoolName}</h3>
                        <p className="text-sm text-slate-600">
                          From: <span className="font-semibold text-slate-900">{lead.name}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {updatingId === lead.referenceId && (
                          <span className="text-sm font-semibold text-[#6D28D9]">Saving...</span>
                        )}
                        <select
                          aria-label={`Status for ${lead.schoolName}`}
                          value={lead.status}
                          disabled={updatingId === lead.referenceId}
                          onChange={(e) =>
                            void handleStatusChange(
                              'contact_inquiries',
                              lead.referenceId,
                              e.target.value as LeadStatus
                            )
                          }
                          className="min-h-11 pl-4 py-2 text-sm font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {confirmDeleteId === lead.referenceId ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={updatingId === lead.referenceId}
                              onClick={() => void handleDelete('contact_inquiries', lead.referenceId)}
                              className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                            >
                              {updatingId === lead.referenceId ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(lead.referenceId)}
                            className="w-11 h-11 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
                            aria-label={`Delete inquiry from ${lead.schoolName}`}
                            title="Delete inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 text-sm">
                      <div className="flex items-center gap-2 text-slate-700 min-w-0">
                        <Mail className="w-4 h-4 text-[#6D28D9] shrink-0" />
                        <a href={`mailto:${lead.email}`} className="font-semibold hover:underline truncate">
                          {lead.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-4 h-4 text-[#EC4899] shrink-0" />
                        <a href={`tel:${lead.phone}`} className="font-semibold hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                      {lead.message}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-sm text-slate-500">
                      <span>Submitted: {formatTimestamp(lead.createdAt)}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Assalamu alaykum / Hello ${lead.name}, following up on your NUSMADE inquiry (${lead.referenceId}) for ${lead.schoolName}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                        >
                          <span>WhatsApp Reply</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(
                            `Re: ${lead.subject} (${lead.referenceId})`
                          )}`}
                          className="min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-[#6D28D9] font-bold hover:bg-purple-100 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Email Reply</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
