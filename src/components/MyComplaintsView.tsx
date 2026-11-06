import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Calendar,
  MapPin,
  RefreshCcw,
  Inbox,
  Database,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import { CategoryBadge, StatusBadge, PriorityBadge } from './ComplaintBadges';
import { ComplaintDetailsModal } from './ComplaintDetailsModal';

interface MyComplaintsViewProps {
  complaints: Complaint[];
  onNavigateToSubmit: () => void;
  onNavigateToTrack: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus) => void;
  onDeleteComplaint: (id: string) => void;
  onRefreshFromFirebase?: () => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  complaints,
  onNavigateToSubmit,
  onNavigateToTrack,
  onUpdateStatus,
  onDeleteComplaint,
  onRefreshFromFirebase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ComplaintCategory>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const statusTabs: ('All' | ComplaintStatus)[] = ['All', 'Pending', 'In Progress', 'Resolved'];

  const categories: ('All' | ComplaintCategory)[] = [
    'All',
    'Water',
    'Sanitation',
    'Electricity',
    'Road',
    'Street Light',
    'Other',
  ];

  const filteredComplaints = useMemo(() => {
    return (complaints || []).filter((c) => {
      if (!c || typeof c !== 'object') return false;

      // Search term match
      const q = (searchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (c.complaintId || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q);

      // Status match
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      // Category match
      const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, searchTerm, statusFilter, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>Realtime Cloud Database</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Community Grievance Records
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            Browse, monitor, and manage municipal problem reports registered across your city.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefreshFromFirebase && (
            <button
              type="button"
              onClick={onRefreshFromFirebase}
              title="Refresh from Firebase Firestore"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Sync Cloud</span>
            </button>
          )}

          <button
            id="complaints-new-report-btn"
            type="button"
            onClick={onNavigateToSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Complaint</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="complaint-list-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Complaint ID (e.g. CMP1001), keyword, citizen name, or location..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-500 shrink-0">Category:</span>
            <select
              id="complaint-list-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | ComplaintCategory)}
              className="px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Status:</span>
          {statusTabs.map((st) => {
            const isSelected = statusFilter === st;
            const count =
              st === 'All'
                ? complaints.length
                : complaints.filter((c) => c.status === st).length;

            return (
              <button
                key={st}
                id={`filter-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complaints Grid or Empty State */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Complaints Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {searchTerm || statusFilter !== 'All' || categoryFilter !== 'All'
              ? 'No registered community grievances matched your active filter or search criteria.'
              : 'There are currently no complaints registered in the database. Be the first to report an issue!'}
          </p>

          <div className="flex items-center justify-center gap-3">
            {searchTerm || statusFilter !== 'All' || categoryFilter !== 'All' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setCategoryFilter('All');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 cursor-pointer"
              >
                Clear Filters
              </button>
            ) : null}

            <button
              type="button"
              onClick={onNavigateToSubmit}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
            >
              Submit First Complaint
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComplaints.map((c) => (
            <div
              key={c.complaintId}
              id={`complaint-card-${c.complaintId}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                {/* Card Header with ID and Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {c.complaintId}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                {/* Problem Title */}
                <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-2">
                  {c.title}
                </h3>

                {/* Category & Priority Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <CategoryBadge category={c.category} size="sm" />
                  <PriorityBadge priority={c.priority} size="sm" />
                </div>

                {/* Description Snippet */}
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Card Footer with Location, Date, and View Details Button */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Date: {c.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    id={`btn-track-${c.complaintId}`}
                    type="button"
                    onClick={() => onNavigateToTrack(c.complaintId)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Track Live
                  </button>

                  <button
                    id={`btn-view-details-${c.complaintId}`}
                    type="button"
                    onClick={() => setSelectedComplaint(c)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <ComplaintDetailsModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateStatus={(id, st) => {
          onUpdateStatus(id, st);
          if (selectedComplaint && selectedComplaint.complaintId === id) {
            setSelectedComplaint((prev) => (prev ? { ...prev, status: st } : null));
          }
        }}
        onDeleteComplaint={(id) => {
          onDeleteComplaint(id);
          setSelectedComplaint(null);
        }}
        onTrackInTracker={(id) => {
          onNavigateToTrack(id);
        }}
      />
    </div>
  );
};
