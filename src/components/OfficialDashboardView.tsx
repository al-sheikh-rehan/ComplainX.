import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  Filter,
  RefreshCcw,
  Printer,
  Download,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  User,
  Wrench,
  Send,
  X,
  Check,
  Flame,
  FileCheck2,
  ArrowUpDown,
  BadgeAlert,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  OfficialUser,
} from '../types';
import { CategoryBadge, StatusBadge, PriorityBadge } from './ComplaintBadges';
import { updateComplaintOfficialDetailsInFirebase, updateComplaintStatusInFirebase } from '../lib/firebase';

interface OfficialDashboardViewProps {
  officialUser: OfficialUser | null;
  complaints: Complaint[];
  onUpdateStatus: (id: string, newStatus: ComplaintStatus) => void;
  onDeleteComplaint: (id: string) => void;
  onNavigate: (tab: any) => void;
  onRefreshFromFirebase: () => void;
  onSelectComplaintToTrack?: (id: string) => void;
}

export const OfficialDashboardView: React.FC<OfficialDashboardViewProps> = ({
  officialUser,
  complaints,
  onUpdateStatus,
  onDeleteComplaint,
  onNavigate,
  onRefreshFromFirebase,
  onSelectComplaintToTrack,
}) => {
  // Navigation sub-tab within Official Dashboard: complaints list vs citizen directory
  const [activeSubTab, setActiveSubTab] = useState<'grievances' | 'citizens'>('grievances');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ComplaintCategory>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | ComplaintPriority>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Action Taken Report (ATR) Modal State
  const [atrComplaint, setAtrComplaint] = useState<Complaint | null>(null);
  const [atrStatus, setAtrStatus] = useState<ComplaintStatus>('In Progress');
  const [atrNote, setAtrNote] = useState('');
  const [atrAssignedOfficer, setAtrAssignedOfficer] = useState('');
  const [isSavingAtr, setIsSavingAtr] = useState(false);

  // Quick Citizen Contact Modal State
  const [contactCitizenComplaint, setContactCitizenComplaint] = useState<Complaint | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Officer identity defaults if viewer logged in via another session
  const officerName = officialUser?.name || 'Municipal Officer';
  const officerDept = officialUser?.department || 'Public Works & Civic Redressal';
  const officerDesignation = officialUser?.designation || 'Zonal Officer';
  const officerId = officialUser?.officialId || 'OFF-7721';
  const officerJurisdiction = officialUser?.jurisdiction || 'City Municipal Jurisdiction';

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c?.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c?.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c?.status === 'Resolved').length;
    const highPriority = complaints.filter((c) => c?.priority === 'High' && c?.status !== 'Resolved').length;

    // Unique Citizens
    const citizenPhones = new Set(
      complaints.map((c) => (c?.phone ? String(c.phone).trim() : '')).filter(Boolean)
    );
    const uniqueCitizensCount = citizenPhones.size;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      pending,
      inProgress,
      resolved,
      highPriority,
      uniqueCitizensCount,
      resolutionRate,
    };
  }, [complaints]);

  // Aggregate Citizens for Public Citizen Directory Tab
  const citizenDirectory = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        email: string;
        location: string;
        complaints: Complaint[];
      }
    >();

    complaints.forEach((c) => {
      if (!c) return;
      const phone = c.phone ? String(c.phone).trim() : '';
      const email = c.email ? String(c.email).trim() : '';
      const name = c.name ? String(c.name).trim() : '';
      const key = phone || email || name;
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          name: c.name || 'Citizen Complainant',
          phone: c.phone || 'N/A',
          email: c.email || '',
          location: c.location || 'Local Municipal Ward',
          complaints: [c],
        });
      } else {
        const item = map.get(key)!;
        item.complaints.push(c);
        if (!item.email && c.email) item.email = c.email;
        if (!item.location && c.location) item.location = c.location;
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.complaints.length - a.complaints.length
    );
  }, [complaints]);

  // Filtered & Sorted Complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        if (!c) return false;
        // Search term
        const q = (searchTerm || '').trim().toLowerCase();
        const matchesSearch =
          !q ||
          (c.complaintId || '').toLowerCase().includes(q) ||
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.title || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.location || '').toLowerCase().includes(q) ||
          Boolean(c.adminNotes && String(c.adminNotes).toLowerCase().includes(q));

        // Filters
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
        const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        }
        if (sortBy === 'priority') {
          const priorityScore = { High: 3, Medium: 2, Low: 1 };
          return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
        }
        return 0;
      });
  }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter, sortBy]);

  // Filtered Citizens in Directory
  const filteredCitizens = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return citizenDirectory;
    return citizenDirectory.filter(
      (cit) =>
        (cit.name || '').toLowerCase().includes(q) ||
        (cit.phone || '').toLowerCase().includes(q) ||
        (cit.email || '').toLowerCase().includes(q) ||
        (cit.location || '').toLowerCase().includes(q)
    );
  }, [citizenDirectory, searchTerm]);

  // Handle Quick Status Change
  const handleDirectStatusChange = async (
    complaintId: string,
    newStatus: ComplaintStatus
  ) => {
    onUpdateStatus(complaintId, newStatus);
    await updateComplaintStatusInFirebase(
      complaintId,
      newStatus,
      `Status changed to ${newStatus} by Officer ${officerName} (${officerDept})`
    );
  };

  // Open ATR modal
  const openAtrModal = (complaint: Complaint) => {
    setAtrComplaint(complaint);
    setAtrStatus(complaint.status);
    setAtrNote(complaint.adminNotes || complaint.resolutionRemark || '');
    setAtrAssignedOfficer(complaint.assignedOfficer || officerName);
  };

  // Save ATR modal
  const handleSaveAtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atrComplaint) return;

    setIsSavingAtr(true);
    try {
      await updateComplaintOfficialDetailsInFirebase(atrComplaint.complaintId, {
        status: atrStatus,
        adminNotes: atrNote.trim(),
        resolutionRemark: atrNote.trim(),
        assignedOfficer: atrAssignedOfficer.trim() || officerName,
      });
      onUpdateStatus(atrComplaint.complaintId, atrStatus);
      setAtrComplaint(null);
    } catch (err) {
      console.error('Failed to save ATR:', err);
    } finally {
      setIsSavingAtr(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Complaint ID',
      'Citizen Name',
      'Phone',
      'Email',
      'Location',
      'Category',
      'Title',
      'Priority',
      'Status',
      'Date',
      'Assigned Officer',
      'Official Remarks',
    ];

    const rows = filteredComplaints.map((c) => [
      c.complaintId,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.location.replace(/"/g, '""')}"`,
      c.category,
      `"${c.title.replace(/"/g, '""')}"`,
      c.priority,
      c.status,
      c.date,
      `"${c.assignedOfficer || ''}"`,
      `"${(c.adminNotes || c.resolutionRemark || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ComplainX_Public_Grievances_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate WhatsApp text for citizen
  const getCitizenWhatsAppUrl = (complaint: Complaint) => {
    const cleanPhone = complaint.phone.replace(/[^0-9]/g, '');
    const message = `Namaste ${complaint.name}, this is from the Municipal Grievance Office regarding your ComplainX grievance #${complaint.complaintId} (${complaint.title}). Current Status: ${complaint.status}. Attending Officer: ${officerName} (${officerDept}).`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Authority Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Municipal Authority Redressal Desk</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firestore Live Sync Active</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {officerDept}
              </h1>
              <p className="text-sm sm:text-base text-indigo-200 mt-1 font-medium">
                Officer In-Charge: <strong className="text-white">{officerName}</strong> ({officerDesignation}) • Staff ID: <code className="bg-indigo-900/80 px-2 py-0.5 rounded text-amber-300 font-mono text-xs">{officerId}</code>
              </p>
              <p className="text-xs text-indigo-300 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Jurisdiction: {officerJurisdiction}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onRefreshFromFirebase}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-700/80 text-white text-xs font-semibold border border-indigo-600/50 shadow-xs transition-all cursor-pointer"
              title="Pull latest live citizen complaints from Firebase Firestore"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-indigo-300" />
              <span>Sync Cloud</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs transition-all cursor-pointer"
              title="Download Citizen complaints as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
              title="Print official report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Grievances */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Grievances</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {metrics.total}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Municipal records</p>
          </div>
        </div>

        {/* Pending Action */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              {metrics.pending}
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Awaiting official dispatch</p>
          </div>
        </div>

        {/* In Progress Inspections */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
              {metrics.inProgress}
            </div>
            <p className="text-[11px] text-blue-700 mt-0.5 font-medium">Field work underway</p>
          </div>
        </div>

        {/* Resolved Successfully */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {metrics.resolved}
            </div>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">{metrics.resolutionRate}% closed rate</p>
          </div>
        </div>

        {/* Urgent High Priority */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Urgent / High</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
              {metrics.highPriority}
            </div>
            <p className="text-[11px] text-rose-700 mt-0.5 font-medium">Immediate hazard</p>
          </div>
        </div>

        {/* Registered Citizens */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200 shadow-xs flex flex-col justify-between bg-indigo-50/20">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Citizens</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono">
              {metrics.uniqueCitizensCount}
            </div>
            <p className="text-[11px] text-indigo-700 mt-0.5 font-medium">Distinct complainants</p>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sub-Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Sub-Tabs: Grievances vs Citizens */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('grievances')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'grievances'
                  ? 'bg-white text-indigo-900 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Public Grievance Records</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                {complaints.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('citizens')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'citizens'
                  ? 'bg-white text-indigo-900 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Public Citizen Directory</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {citizenDirectory.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium pb-2 sm:pb-0">
            Official Access Level: <strong className="text-slate-700">Full Zonal Authority</strong>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="official-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  activeSubTab === 'grievances'
                    ? "Search citizen name, phone number, complaint ID (e.g. CMP1001), locality, keyword..."
                    : "Search citizen directory by name, mobile, email, or ward..."
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

            {/* Dropdown Filters (only for Grievances tab) */}
            {activeSubTab === 'grievances' && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  id="official-category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Water">Water Supply</option>
                  <option value="Sanitation">Sanitation / Waste</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Road">Road & Potholes</option>
                  <option value="Street Light">Street Lights</option>
                  <option value="Other">Other Issues</option>
                </select>

                {/* Priority Filter */}
                <select
                  id="official-priority-filter"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High / Urgent</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Sort By */}
                <select
                  id="official-sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="priority">Sort: High Priority First</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Status Pill Bar (for Grievances) */}
          {activeSubTab === 'grievances' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </span>
              {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => {
                const isSelected = statusFilter === st;
                const count =
                  st === 'All'
                    ? complaints.length
                    : complaints.filter((c) => c.status === st).length;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SUB-TAB 1: GRIEVANCES & CITIZEN COMPLAINT DOSSIERS */}
        {activeSubTab === 'grievances' && (
          <div className="p-4 sm:p-6">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300">
                <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Citizen Grievances Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== 'All' || categoryFilter !== 'All'
                    ? 'No complaints matched your search or active filter parameters.'
                    : 'Currently there are no grievances registered in the municipal database.'}
                </p>
                {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('All');
                      setCategoryFilter('All');
                      setPriorityFilter('All');
                    }}
                    className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((c) => (
                  <div
                    key={c.complaintId}
                    id={`official-card-${c.complaintId}`}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all p-5 sm:p-6"
                  >
                    {/* Top Row: Complaint ID, Date, Priority, and Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200 flex items-center gap-1.5">
                          <span>#{c.complaintId}</span>
                        </span>
                        <CategoryBadge category={c.category} size="sm" />
                        <PriorityBadge priority={c.priority} size="sm" />
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Filed: {c.date}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>

                    {/* Middle Section: Citizen Details (PUBLIC INFORMATION) & Complaint Details */}
                    <div className="py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Column 1: Public Citizen Information */}
                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                              {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">
                                {c.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                Citizen Complainant
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Verified
                          </span>
                        </div>

                        {/* Citizen Contact Details */}
                        <div className="space-y-1.5 text-xs">
                          {/* Phone */}
                          <div className="flex items-center justify-between gap-1 text-slate-700">
                            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>Mobile:</span>
                            </span>
                            <div className="flex items-center gap-1.5 font-mono font-medium">
                              <span>{c.phone}</span>
                              <a
                                href={`tel:${c.phone}`}
                                className="text-blue-600 hover:text-blue-800 p-0.5 hover:bg-blue-50 rounded"
                                title="Call Citizen directly"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          {/* Email */}
                          {c.email && (
                            <div className="flex items-center justify-between gap-1 text-slate-700 truncate">
                              <span className="text-slate-500 flex items-center gap-1 text-[11px] shrink-0">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>Email:</span>
                              </span>
                              <a
                                href={`mailto:${c.email}`}
                                className="truncate font-mono text-[11px] text-blue-600 hover:underline"
                                title={`Email to ${c.email}`}
                              >
                                {c.email}
                              </a>
                            </div>
                          )}

                          {/* Location / Ward */}
                          <div className="flex items-start gap-1 text-slate-700 pt-1 border-t border-slate-200/50">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div className="text-[11px] leading-tight">
                              <span className="font-semibold text-slate-800">Locality: </span>
                              <span>{c.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Direct Citizen Outreach */}
                        <div className="pt-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setContactCitizenComplaint(c)}
                            className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border border-indigo-200"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Contact Citizen</span>
                          </button>

                          <a
                            href={getCitizenWhatsAppUrl(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-emerald-200"
                            title="Send WhatsApp Grievance update to citizen"
                          >
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      {/* Column 2 & 3: Problem Description & Official Remarks */}
                      <div className="lg:col-span-2 space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 mb-1">
                            {c.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                            {c.description}
                          </p>
                        </div>

                        {/* Action Taken Report (ATR) / Official Notes Banner */}
                        {(c.adminNotes || c.resolutionRemark || c.assignedOfficer) && (
                          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-amber-900 font-bold">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                <span>Official Action Taken Report (ATR):</span>
                              </span>
                              {c.assignedOfficer && (
                                <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                                  Inspector: {c.assignedOfficer}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 font-medium italic">
                              "{c.adminNotes || c.resolutionRemark}"
                            </p>
                            {c.lastUpdated && (
                              <div className="text-[10px] text-amber-800/80 pt-0.5">
                                Updated on: {new Date(c.lastUpdated).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Official Authority Controls */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      {/* Quick Status Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">
                          Change Status:
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDirectStatusChange(c.complaintId, 'Pending')}
                          disabled={c.status === 'Pending'}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            c.status === 'Pending'
                              ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                              : 'bg-white hover:bg-amber-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          Pending
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectStatusChange(c.complaintId, 'In Progress')}
                          disabled={c.status === 'In Progress'}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            c.status === 'In Progress'
                              ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold'
                              : 'bg-white hover:bg-blue-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          In Progress
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectStatusChange(c.complaintId, 'Resolved')}
                          disabled={c.status === 'Resolved'}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            c.status === 'Resolved'
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                              : 'bg-white hover:bg-emerald-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          Mark Resolved
                        </button>
                      </div>

                      {/* Official ATR Action & Track View */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openAtrModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Official ATR / Remark</span>
                        </button>

                        {onSelectComplaintToTrack && (
                          <button
                            type="button"
                            onClick={() => onSelectComplaintToTrack(c.complaintId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                            title="Open in Public Tracker"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden sm:inline">Track</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 2: PUBLIC CITIZEN DIRECTORY (Citizen information records) */}
        {activeSubTab === 'citizens' && (
          <div className="p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Registered Public Citizen Directory
              </h3>
              <p className="text-xs text-slate-500">
                Consolidated records of citizens who registered grievances in your municipal jurisdiction.
              </p>
            </div>

            {filteredCitizens.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No Citizens Found</p>
                <p className="text-xs text-slate-400 mt-1">No citizen records match the search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCitizens.map((cit, idx) => {
                  const activeCount = cit.complaints.filter((c) => c.status !== 'Resolved').length;
                  const resolvedCount = cit.complaints.filter((c) => c.status === 'Resolved').length;

                  return (
                    <div
                      key={`${cit.phone}-${idx}`}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                              {cit.name ? cit.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                {cit.name}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Citizen Record
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                            {cit.complaints.length} Grievance{cit.complaints.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="bg-slate-50/80 rounded-xl p-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3" />
                              <span>Phone:</span>
                            </span>
                            <span className="font-mono font-medium">{cit.phone}</span>
                          </div>

                          {cit.email && (
                            <div className="flex items-center justify-between text-slate-700 truncate">
                              <span className="text-slate-400 flex items-center gap-1 text-[11px] shrink-0">
                                <Mail className="w-3 h-3" />
                                <span>Email:</span>
                              </span>
                              <span className="font-mono text-[11px] truncate max-w-[170px]">
                                {cit.email}
                              </span>
                            </div>
                          )}

                          <div className="flex items-start gap-1 text-slate-700 pt-1 border-t border-slate-200/60">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-slate-600 truncate">{cit.location || 'Ward / Area recorded'}</span>
                          </div>
                        </div>

                        {/* Grievance Count summary */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            Active: {activeCount}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Resolved: {resolvedCount}
                          </span>
                        </div>
                      </div>

                      {/* Outreach Buttons */}
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
                        <a
                          href={`tel:${cit.phone}`}
                          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>Call Citizen</span>
                        </a>

                        <a
                          href={`https://wa.me/${cit.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-emerald-200"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: OFFICIAL ACTION TAKEN REPORT (ATR) & REMARK */}
      {atrComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Official Action Taken Report (ATR)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complaint #{atrComplaint.complaintId} • {atrComplaint.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAtrComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAtr} className="space-y-4">
              {/* Problem snippet */}
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-200">
                <div className="font-bold text-slate-800">{atrComplaint.title}</div>
                <p className="text-slate-600 line-clamp-2">{atrComplaint.description}</p>
                <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{atrComplaint.location}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Update Official Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pending', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAtrStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        atrStatus === st
                          ? st === 'Resolved'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : st === 'In Progress'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-amber-500 border-amber-500 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Officer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Field Engineer / Officer Name:
                </label>
                <input
                  type="text"
                  value={atrAssignedOfficer}
                  onChange={(e) => setAtrAssignedOfficer(e.target.value)}
                  placeholder="e.g. Er. Vikram Malhotra / Inspector Ramesh PWD"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Official ATR Remark / Action Taken */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Action Taken Report / Official Remark:
                </label>
                <textarea
                  rows={3}
                  value={atrNote}
                  onChange={(e) => setAtrNote(e.target.value)}
                  placeholder="e.g. Dispatched junior engineer with spare valves. Pipeline leak welded and pressure tested on site."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  This note will be saved in Firebase and visible when tracking this complaint.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAtrComplaint(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAtr}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingAtr ? (
                    <span>Saving to Firestore...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save & Sync Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK CITIZEN CONTACT OUTREACH */}
      {contactCitizenComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Citizen Public Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct Contact Outreach for #{contactCitizenComplaint.complaintId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContactCitizenComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Citizen Full Name
                </div>
                <div className="text-base font-bold text-slate-900">
                  {contactCitizenComplaint.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mobile Phone
                  </div>
                  <div className="text-sm font-mono font-bold text-blue-700">
                    {contactCitizenComplaint.phone}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Complaint Status
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {contactCitizenComplaint.status}
                  </div>
                </div>
              </div>

              {contactCitizenComplaint.email && (
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </div>
                  <div className="text-xs font-mono text-slate-700">
                    {contactCitizenComplaint.email}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/80">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Citizen Address / Ward
                </div>
                <div className="text-xs text-slate-700">
                  {contactCitizenComplaint.location}
                </div>
              </div>
            </div>

            {/* Direct Communication Channels */}
            <div className="space-y-2 pt-2">
              <a
                href={`tel:${contactCitizenComplaint.phone}`}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Citizen Directly ({contactCitizenComplaint.phone})</span>
              </a>

              <a
                href={getCitizenWhatsAppUrl(contactCitizenComplaint)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Official Grievance Update on WhatsApp</span>
              </a>

              {contactCitizenComplaint.email && (
                <a
                  href={`mailto:${contactCitizenComplaint.email}?subject=Official%20Update%20on%20Complaint%20${contactCitizenComplaint.complaintId}&body=Dear%20${encodeURIComponent(contactCitizenComplaint.name)},%0D%0A%0D%0AThis%20is%20an%20update%20from%20the%20Municipal%20Office%20regarding%20your%20complaint%20%23${contactCitizenComplaint.complaintId}.`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
