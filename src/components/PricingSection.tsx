import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Calculator } from 'lucide-react';

type Currency = 'NGN' | 'USD';
type BillingCycle = 'term' | 'annual';

export const PricingSection: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [billing, setBilling] = useState<BillingCycle>('term');
  const [studentCount, setStudentCount] = useState<number>(350);
  const [customWebsite, setCustomWebsite] = useState<boolean>(false);
  const [includeLms, setIncludeLms] = useState<boolean>(true);
  const [includeSmsAlerts, setIncludeSmsAlerts] = useState<boolean>(true);

  const formatMoney = (ngnAmount: number) => {
    if (currency === 'NGN') {
      return `₦${ngnAmount.toLocaleString()}`;
    }
    const usdAmount = Math.round(ngnAmount / 1500);
    return `$${usdAmount.toLocaleString()}`;
  };

  const applyBillingDiscount = (termAmount: number) => {
    if (billing === 'term') return termAmount;
    return Math.round(termAmount * 3 * 0.85);
  };

  const tiers = [
    {
      id: 'starter',
      name: 'Starter Plan',
      subtitle: 'Website Template + Core SMS',
      capacity: 'Up to 250 Students',
      baseTermNgn: 75000,
      badge: 'Growing Schools',
      popular: false,
      features: [
        'Ready-made responsive school website',
        'Student & staff digital records',
        'Daily roll call attendance tracking',
        'Automated termly report cards',
        'Fee ledger & printable numbered receipts',
        'Email & phone support (Mon – Sat)'
      ]
    },
    {
      id: 'growth',
      name: 'Growth Suite',
      subtitle: 'Full SMS + LMS & CBT + Website',
      capacity: 'Up to 800 Students',
      baseTermNgn: 165000,
      badge: 'Most Popular',
      popular: true,
      features: [
        'Everything in Starter Plan',
        'Learning Management System (LMS) & CBT add-on',
        'Madrasah Tahfiz & Arabic grading support',
        'Class-scoped teacher logins & parent summary sheets',
        'Receipt & outstanding fee tracking workflows',
        'Free Excel data migration & live staff training'
      ]
    },
    {
      id: 'enterprise',
      name: 'Multi-Campus / Bespoke',
      subtitle: 'Custom Website + Unlimited Branches',
      capacity: '1,000+ Students',
      baseTermNgn: 320000,
      badge: 'Multi-Branch',
      popular: false,
      features: [
        'Bespoke custom-designed school website',
        'Centralized multi-campus owner dashboard',
        'Unlimited staff, subjects & class arms',
        'Dedicated onboarding & account specialist',
        'Custom report card branding & certificates',
        'Priority technical support (Mon – Sat)'
      ]
    }
  ];

  const basePerStudentNgn = studentCount <= 250 ? 280 : studentCount <= 800 ? 240 : 200;
  const lmsPerStudentNgn = includeLms ? 80 : 0;
  const smsPackNgn = includeSmsAlerts ? 18000 : 0;
  const estimatedTermNgn = Math.max(
    75000,
    studentCount * (basePerStudentNgn + lmsPerStudentNgn) + smsPackNgn
  );
  const displayedEstimateNgn = applyBillingDiscount(estimatedTermNgn);
  const oneTimeSetupNgn = customWebsite ? 180000 : 45000;
  const perStudentTermNgn = Math.round(estimatedTermNgn / studentCount);

  const recommendedPlan =
    studentCount <= 250
      ? 'Starter Plan'
      : studentCount <= 800
      ? 'Growth Suite'
      : 'Multi-Campus / Bespoke';

  const studentRangeLabel =
    studentCount < 150
      ? 'Under 150 Students'
      : studentCount <= 500
      ? '150 - 500 Students'
      : studentCount <= 1500
      ? '500 - 1,500 Students'
      : '1,500+ Students';

  const quoteNotes = `Quote Estimate: ${studentCount} students (${billing === 'term' ? 'Per Term' : 'Annual'}), ${
    customWebsite ? 'Custom-Designed Website' : 'Ready-Made Website Template'
  }${includeLms ? ', LMS & CBT Portal' : ''}${includeSmsAlerts ? ', Parent SMS Pack' : ''}. Est: ${formatMoney(
    displayedEstimateNgn
  )}/${billing === 'term' ? 'term' : 'year'}.`;

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-[#F8FAFC] border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Controls */}
        <div className="text-left md:text-center max-w-3xl md:mx-auto mb-12 space-y-4">
          <p className="text-sm font-bold text-[#6D28D9] uppercase tracking-wider">
            Transparent Starting Plans
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Pricing Scaled to Your Student Count
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            Illustrative starting plans for schools and Madrasahs. Every plan includes setup assistance and staff training.
          </p>

          {/* Currency & Billing Toggles */}
          <div className="pt-2 flex flex-wrap items-center justify-start md:justify-center gap-4">
            <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 text-sm font-bold">
              <button
                type="button"
                onClick={() => setCurrency('NGN')}
                className={`min-h-11 px-4 rounded-lg transition-colors cursor-pointer ${
                  currency === 'NGN' ? 'bg-[#6D28D9] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₦ NGN
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`min-h-11 px-4 rounded-lg transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-[#6D28D9] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ USD
              </button>
            </div>

            <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 text-sm font-bold">
              <button
                type="button"
                onClick={() => setBilling('term')}
                className={`min-h-11 px-4 rounded-lg transition-colors cursor-pointer ${
                  billing === 'term' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per Term
              </button>
              <button
                type="button"
                onClick={() => setBilling('annual')}
                className={`min-h-11 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  billing === 'annual' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual</span>
                <span className="px-2 py-0.5 rounded text-sm bg-pink-100 text-[#EC4899]">-15%</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const displayPrice = formatMoney(applyBillingDiscount(tier.baseTermNgn));
            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl bg-white p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                  tier.popular
                    ? 'border-[#6D28D9] shadow-xl shadow-purple-100/70 ring-1 ring-[#6D28D9]/20'
                    : 'border-slate-200 shadow-xs hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-sm font-bold text-[#6D28D9]">
                      {tier.capacity}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        tier.popular ? 'text-[#EC4899]' : 'text-slate-500'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 font-display">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 mb-6">{tier.subtitle}</p>

                  <div className="pb-6 mb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-slate-500">From</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                        {displayPrice}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">
                        / {billing === 'term' ? 'term' : 'year'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={`/book-demo?plan=${encodeURIComponent(tier.name)}&students=${encodeURIComponent(
                    tier.id === 'starter'
                      ? '150 - 500 Students'
                      : tier.id === 'growth'
                      ? '500 - 1,500 Students'
                      : '1,500+ Students'
                  )}`}
                  className={`w-full min-h-12 py-3 px-4 rounded-xl font-bold text-sm text-center transition-colors flex items-center justify-center gap-2 ${
                    tier.popular
                      ? 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-sm'
                      : 'bg-white border border-slate-300 hover:border-[#6D28D9] text-slate-900'
                  }`}
                >
                  <span>Select {tier.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Interactive Quote Builder */}
        <div className="bg-white rounded-3xl border border-purple-200 shadow-md p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
                  <Calculator className="w-4 h-4 text-[#EC4899]" />
                  <span>Interactive School Quote Builder</span>
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  Estimate Your {billing === 'term' ? 'Termly' : 'Annual'} Budget
                </h3>
              </div>

              {/* Student slider */}
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                  <label htmlFor="pricing-student-slider" className="text-slate-700">
                    Total Student Population
                  </label>
                  <span className="text-[#6D28D9] text-base">{studentCount.toLocaleString()} Students</span>
                </div>
                <div className="min-h-11 flex items-center">
                  <input
                    id="pricing-student-slider"
                    type="range"
                    min={50}
                    max={2500}
                    step={50}
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full h-2.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-[#6D28D9]"
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-1">
                  <span>50</span>
                  <span>650</span>
                  <span>1,250</span>
                  <span>2,500+</span>
                </div>
              </div>

              {/* Module checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setCustomWebsite(!customWebsite)}
                  className={`min-h-16 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    customWebsite
                      ? 'bg-purple-50 border-[#6D28D9] text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold block">
                    {customWebsite ? '✓ Custom Website' : 'Ready-Made Website'}
                  </span>
                  <span className="text-sm text-slate-500 mt-1 block">
                    {customWebsite ? 'Bespoke design included' : 'Tap to upgrade to custom'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeLms(!includeLms)}
                  className={`min-h-16 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    includeLms
                      ? 'bg-purple-50 border-[#6D28D9] text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold block">
                    {includeLms ? '✓ LMS & CBT Exams' : '+ Add LMS & CBT'}
                  </span>
                  <span className="text-sm text-slate-500 mt-1 block">
                    Digital homework & online exams
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeSmsAlerts(!includeSmsAlerts)}
                  className={`min-h-16 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    includeSmsAlerts
                      ? 'bg-purple-50 border-[#6D28D9] text-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold block">
                    {includeSmsAlerts ? '✓ Parent SMS Pack' : '+ Add Parent SMS'}
                  </span>
                  <span className="text-sm text-slate-500 mt-1 block">
                    Term notice & fee alerts
                  </span>
                </button>
              </div>
            </div>

            {/* Live Quote Output Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-200 font-semibold">Recommended Plan:</span>
                <span className="text-white font-bold">{recommendedPlan}</span>
              </div>

              <div>
                <span className="text-sm text-slate-300 block">
                  Estimated {billing === 'term' ? 'Termly' : 'Annual'} Subscription
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">
                  {formatMoney(displayedEstimateNgn)}
                  <span className="text-sm font-normal text-slate-300">
                    {' '}
                    / {billing === 'term' ? 'term' : 'year'}
                  </span>
                </div>
                <p className="text-sm text-pink-300 font-semibold mt-1">
                  ≈ {formatMoney(perStudentTermNgn)} per student / term
                </p>
              </div>

              <div className="border-t border-slate-700 pt-4 flex justify-between text-sm text-slate-300">
                <span>One-time Setup & Data Migration:</span>
                <span className="font-bold text-white">{formatMoney(oneTimeSetupNgn)}</span>
              </div>

              <Link
                to={`/book-demo?plan=${encodeURIComponent(recommendedPlan)}&students=${encodeURIComponent(
                  studentRangeLabel
                )}&notes=${encodeURIComponent(quoteNotes)}`}
                className="w-full min-h-12 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Lock Estimate & Book Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-slate-400">
                Budget estimate only. Exact pricing is confirmed after a quick school discovery call.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
