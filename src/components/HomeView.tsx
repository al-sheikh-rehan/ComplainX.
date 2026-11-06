import React from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  Users,
  Clock,
  ArrowRight,
  Droplets,
  Trash2,
  Zap,
  Footprints,
  Lightbulb,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, Complaint, ComplaintCategory, AuthUser, UserRole } from '../types';
import { DashboardStats } from './DashboardStats';
import { CategoryBadge, StatusBadge, PriorityBadge } from './ComplaintBadges';
import { ComplainXLogo } from './ComplainXLogo';
import { ShieldCheck, User } from 'lucide-react';

interface HomeViewProps {
  complaints: Complaint[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectComplaintToTrack: (id: string) => void;
  onPreselectCategory: (category: ComplaintCategory) => void;
  authUser?: AuthUser | null;
  onOpenAuth?: (role: UserRole) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  complaints = [],
  onNavigate,
  onSelectComplaintToTrack,
  onPreselectCategory,
  authUser,
  onOpenAuth,
}) => {
  const validComplaints = Array.isArray(complaints)
    ? complaints.filter((c): c is Complaint => Boolean(c && typeof c === 'object' && c.complaintId))
    : [];
  const recentComplaints = validComplaints.slice(0, 4);

  const categories: { name: ComplaintCategory; icon: React.ElementType; color: string; desc: string }[] = [
    { name: 'Water', icon: Droplets, color: 'text-sky-600 bg-sky-50 border-sky-200', desc: 'Leaks, low pressure, contamination' },
    { name: 'Sanitation', icon: Trash2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Garbage dump, sewage, street cleaning' },
    { name: 'Electricity', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Power cuts, sparks, transformer issues' },
    { name: 'Road', icon: Footprints, color: 'text-orange-600 bg-orange-50 border-orange-200', desc: 'Potholes, broken asphalt, sidewalks' },
    { name: 'Street Light', icon: Lightbulb, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: 'Dark poles, flickering lamps, timed off' },
    { name: 'Other', icon: HelpCircle, color: 'text-slate-600 bg-slate-50 border-slate-200', desc: 'Parks, noise, civic infrastructure' },
  ];

  const featureCards = [
    {
      id: 'feature-card-1',
      icon: FileText,
      iconBg: 'bg-blue-100 text-blue-700',
      title: 'Easy Complaint Registration',
      description:
        'Submit detailed issues in under two minutes with category tagging, location landmarks, and priority indicators with instant ID generation.',
    },
    {
      id: 'feature-card-2',
      icon: Search,
      iconBg: 'bg-indigo-100 text-indigo-700',
      title: 'Quick Tracking',
      description:
        'Check live progress on your complaint at any time. Monitor milestones through Pending, In Progress, and Resolved with verified inspection notes.',
    },
    {
      id: 'feature-card-3',
      icon: Users,
      iconBg: 'bg-emerald-100 text-emerald-700',
      title: 'Community Improvement',
      description:
        'Strengthen civic accountability by highlighting urgent neighborhood repairs, reducing municipal response times, and creating safer communities.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 border-b border-slate-200/80 pt-10 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* ComplainX Brand Emblem from user request */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="p-3 sm:p-4 rounded-3xl bg-white shadow-md border border-slate-200/80 mb-3 flex items-center justify-center">
                <ComplainXLogo size="lg" showTagline={true} showSlogan={true} />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs sm:text-sm font-semibold border border-blue-200 shadow-2xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Direct Citizen Engagement & Municipal Action Portal</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Report Problems.{' '}
              <span className="text-blue-600">Improve Your Community.</span>
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Encountering water leaks, broken street lights, potholes, or uncollected waste?
              Submit your report in seconds, receive a unique tracking ID, and watch municipal
              teams resolve issues with full transparency.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="hero-submit-complaint-btn"
                type="button"
                onClick={() => onNavigate('submit')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>Submit Complaint</span>
              </button>

              <button
                id="hero-track-complaint-btn"
                type="button"
                onClick={() => onNavigate('track')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
              >
                <Search className="w-5 h-5 text-slate-500" />
                <span>Track Complaint</span>
              </button>
            </div>

            {/* Official login | Consumer login hero banner / Official Dashboard quick link */}
            {!authUser && onOpenAuth ? (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-slate-200 shadow-xs text-xs">
                <span className="text-slate-500 font-medium">Quick Access:</span>
                <button
                  type="button"
                  onClick={() => onOpenAuth('official')}
                  className="font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Official login</span>
                </button>
                <span className="text-slate-300 font-bold">|</span>
                <button
                  type="button"
                  onClick={() => onOpenAuth('consumer')}
                  className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Consumer login</span>
                </button>
              </div>
            ) : authUser?.role === 'official' ? (
              <div className="mt-6 inline-flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-900 text-white shadow-md border border-indigo-700 text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Officer {authUser.name}:</span>
                  <span className="text-indigo-200">Municipal grievances need review</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('official_dashboard')}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Open Office Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Embedded Live Dashboard in Hero */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                  Live Community Dashboard
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time status of civic complaints in your area
                </p>
              </div>
              <button
                id="hero-view-all-dashboard-link"
                type="button"
                onClick={() => onNavigate('complaints')}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View Full Registry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <DashboardStats
              complaints={validComplaints}
              onFilterClick={() => onNavigate('complaints')}
            />
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How The Portal Powers Civic Change
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Designed for transparent, swift, and accountable community maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                id={feat.id}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feat.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Common Issue Categories Quick-Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Select an Issue Category to Report Immediately
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 mb-6">
              Pick the service department directly to jump into the pre-filled submission form.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  id={`cat-quick-btn-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => onPreselectCategory(cat.name)}
                  className="bg-slate-800/90 hover:bg-blue-600 active:bg-blue-700 border border-slate-700 hover:border-blue-500 rounded-xl p-4 text-center group transition-all flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700/80 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-blue-400 group-hover:text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Complaints Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Recent Community Complaints
            </h2>
            <p className="text-sm text-slate-500">
              Latest municipal complaints submitted by neighborhood residents
            </p>
          </div>
          <button
            id="home-view-all-complaints-btn"
            type="button"
            onClick={() => onNavigate('complaints')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>Browse All ({validComplaints.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentComplaints.map((c) => (
            <div
              key={c.complaintId}
              id={`recent-complaint-${c.complaintId}`}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {c.complaintId}
                  </span>
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={c.category} size="sm" />
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 line-clamp-1 mb-1.5">
                  {c.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-3">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[200px]">📍 {c.location}</span>
                <button
                  type="button"
                  onClick={() => onSelectComplaintToTrack(c.complaintId)}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
