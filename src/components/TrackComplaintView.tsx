import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { findComplaintById, updateComplaintStatusInStorage } from '../utils/storage';
import { updateComplaintStatusInFirebase } from '../lib/firebase';
import { CategoryBadge, StatusBadge, PriorityBadge } from './ComplaintBadges';

interface TrackComplaintViewProps {
  initialSearchId?: string;
  allComplaints: Complaint[];
  onRefreshComplaints: () => void;
  onNavigateToSubmit: () => void;
}

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  initialSearchId = '',
  allComplaints,
  onRefreshComplaints,
  onNavigateToSubmit,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearchId);
  const [searchedId, setSearchedId] = useState(initialSearchId);
  const [foundComplaint, setFoundComplaint] = useState<Complaint | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search
  const handleSearch = (idToSearch: string) => {
    const term = idToSearch.trim();
    if (!term) return;

    setSearchedId(term);
    setHasSearched(true);
    const liveMatch = (allComplaints || []).find(
      (c) => c && c.complaintId && c.complaintId.toUpperCase() === term.toUpperCase()
    );
    const result = liveMatch || findComplaintById(term);
    setFoundComplaint(result || null);
  };

  useEffect(() => {
    if (initialSearchId) {
      setSearchInput(initialSearchId);
      handleSearch(initialSearchId);
    }
  }, [initialSearchId]);

  // If live complaints list updates, refresh foundComplaint
  useEffect(() => {
    if (searchedId) {
      const liveMatch = (allComplaints || []).find(
        (c) => c && c.complaintId && c.complaintId.toUpperCase() === searchedId.toUpperCase()
      );
      if (liveMatch) {
        setFoundComplaint(liveMatch);
      }
    }
  }, [allComplaints, searchedId]);

  // Status progression helper
  const statusSteps: {
    status: ComplaintStatus;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      status: 'Pending',
      title: '1. Ticket Logged',
      description: 'Complaint verified and registered in municipal dispatch queue.',
      icon: Clock,
    },
    {
      status: 'In Progress',
      title: '2. Inspection & Work',
      description: 'Civic personnel assigned and maintenance work actively underway.',
      icon: Wrench,
    },
    {
      status: 'Resolved',
      title: '3. Issue Resolved',
      description: 'Repairs completed, inspected, and verified by local coordinator.',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'In Progress':
        return 1;
      case 'Resolved':
        return 2;
    }
  };

  const handleUpdateStatus = async (newStatus: ComplaintStatus) => {
    if (!foundComplaint) return;
    const note = newStatus === 'Resolved' ? 'Marked as completed and verified.' : undefined;
    await updateComplaintStatusInFirebase(foundComplaint.complaintId, newStatus, note);
    const updated = updateComplaintStatusInStorage(
      foundComplaint.complaintId,
      newStatus,
      note
    );
    if (updated) {
      setFoundComplaint(updated);
      onRefreshComplaints();
    }
  };

  const currentStep = foundComplaint ? getStepIndex(foundComplaint.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200">
          <Search className="w-3.5 h-3.5" />
          <span>Real-time Public Resolution Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Your Complaint
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
          Enter your unique Complaint ID (e.g., <span className="font-mono font-semibold text-blue-600">CMP1001</span>)
          to see live stage progression and repair notes.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
        <form
          id="track-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchInput);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="track-complaint-id-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CMP1001, CMP1002)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-base font-mono uppercase tracking-wider text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            id="track-search-button"
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Track Progress</span>
          </button>
        </form>

        {/* Quick Sample IDs Clickable Chips */}
        {allComplaints.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Available Tickets to Test:</span>
            {allComplaints.slice(0, 5).map((c) => (
              <button
                key={c.complaintId}
                type="button"
                onClick={() => {
                  setSearchInput(c.complaintId);
                  handleSearch(c.complaintId);
                }}
                className={`font-mono px-2 py-0.5 rounded-md border text-xs font-semibold transition-colors ${
                  searchInput.toUpperCase() === c.complaintId.toUpperCase()
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                }`}
              >
                {c.complaintId}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results View */}
      {hasSearched && foundComplaint && (
        <div id="tracking-result-card" className="space-y-6">
          {/* Main Status & Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-mono text-base sm:text-lg font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    {foundComplaint.complaintId}
                  </span>
                  <CategoryBadge category={foundComplaint.category} />
                  <PriorityBadge priority={foundComplaint.priority} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                  {foundComplaint.title}
                </h2>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  Current Status
                </span>
                <StatusBadge status={foundComplaint.status} size="md" />
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-8">
              <div className="relative">
                {/* Connecting background line */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0 hidden sm:block" />
                {/* Connecting active line */}
                <div
                  className="absolute top-5 left-8 h-1 bg-blue-600 -z-0 transition-all duration-500 hidden sm:block"
                  style={{
                    width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : 'calc(100% - 4rem)',
                  }}
                />

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-2 relative z-10">
                  {statusSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx < currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={step.status}
                        className={`flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2 p-3 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-blue-50/50 sm:bg-transparent border sm:border-0 border-blue-200'
                            : ''
                        }`}
                      >
                        {/* Circle marker */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all font-bold text-sm ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                              : 'bg-slate-100 text-slate-400 border border-slate-300'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>

                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-blue-700'
                                : isCompleted
                                ? 'text-emerald-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Complaint Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Ticket Information
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-slate-500 block">Location</span>
                      <span className="font-semibold text-slate-800">{foundComplaint.location}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-slate-500 block">Submission Date</span>
                      <span className="font-semibold text-slate-800">{foundComplaint.date}</span>
                    </div>
                  </div>
                  {foundComplaint.lastUpdated && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-500 block">Last Activity</span>
                        <span className="font-semibold text-slate-800">{foundComplaint.lastUpdated}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <span className="text-xs text-slate-500 block mb-1">Problem Description</span>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed">
                    {foundComplaint.description}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Citizen Contact & Action Notes
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">{foundComplaint.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{foundComplaint.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{foundComplaint.phone}</span>
                  </div>
                </div>

                {/* Municipal Dispatch Notes */}
                <div>
                  <span className="text-xs text-slate-500 block mb-1">
                    Municipal Coordinator Notes
                  </span>
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 text-blue-900 text-xs sm:text-sm">
                    {foundComplaint.adminNotes ||
                      'Standard intake complete. Scheduled for field team inspection according to priority tier.'}
                  </div>
                </div>

                {/* Status Simulator/Updater for Testing */}
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Interactive Status Simulator</span>
                    </span>
                    <span className="text-[11px] text-amber-700">Test status progression</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(st)}
                        className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                          foundComplaint.status === st
                            ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                            : 'bg-white hover:bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Not Found View */}
      {hasSearched && !foundComplaint && (
        <div
          id="tracking-not-found-card"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center"
        >
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
            We could not find any complaint matching ID{' '}
            <span className="font-mono font-bold text-rose-600">"{searchedId}"</span>.
            Please verify the complaint number format (e.g. CMP1001) or check the registry.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToSubmit()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Submit New Complaint
            </button>
            {allComplaints.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput(allComplaints[0].complaintId);
                  handleSearch(allComplaints[0].complaintId);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300"
              >
                Try Sample: {allComplaints[0].complaintId}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
