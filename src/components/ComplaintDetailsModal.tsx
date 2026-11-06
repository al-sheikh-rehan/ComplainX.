import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { CategoryBadge, StatusBadge, PriorityBadge } from './ComplaintBadges';

interface ComplaintDetailsModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus) => void;
  onDeleteComplaint: (id: string) => void;
  onTrackInTracker: (id: string) => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus,
  onDeleteComplaint,
  onTrackInTracker,
}) => {
  if (!complaint) return null;

  return (
    <div
      id="complaint-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="complaint-details-modal-box"
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {complaint.complaintId}
              </span>
              <CategoryBadge category={complaint.category} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {complaint.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Current Status Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Resolution State
            </span>
            <StatusBadge status={complaint.status} size="md" />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Problem Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              {complaint.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Location & Schedule
              </h4>
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{complaint.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Logged on: {complaint.date}</span>
              </div>
              {complaint.lastUpdated && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Last status change: {complaint.lastUpdated}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Reporter Details
              </h4>
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold">{complaint.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{complaint.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{complaint.phone}</span>
              </div>
            </div>
          </div>

          {/* Status Update Quick Bar */}
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200">
            <span className="text-xs font-bold text-blue-900 block mb-2">
              Update Status:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStatus(complaint.complaintId, st)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    complaint.status === st
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete complaint ${complaint.complaintId}?`)) {
                onDeleteComplaint(complaint.complaintId);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Ticket</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onTrackInTracker(complaint.complaintId);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Tracker</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
