import React from 'react';
import { FileText, Clock, Wrench, CheckCircle2 } from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface DashboardStatsProps {
  complaints: Complaint[];
  onFilterClick?: (status: ComplaintStatus | 'All') => void;
  activeStatusFilter?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  complaints = [],
  onFilterClick,
  activeStatusFilter,
}) => {
  const validComplaints = Array.isArray(complaints)
    ? complaints.filter((c): c is Complaint => Boolean(c && typeof c === 'object'))
    : [];

  const total = validComplaints.length;
  const pending = validComplaints.filter((c) => c.status === 'Pending').length;
  const inProgress = validComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = validComplaints.filter((c) => c.status === 'Resolved').length;

  const stats = [
    {
      id: 'stat-total',
      filterKey: 'All' as const,
      label: 'Total Complaints',
      value: total,
      icon: FileText,
      textColor: 'text-slate-900',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      description: 'Total community tickets registered',
    },
    {
      id: 'stat-pending',
      filterKey: 'Pending' as const,
      label: 'Pending',
      value: pending,
      icon: Clock,
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/60',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
      description: 'Awaiting civic inspection',
    },
    {
      id: 'stat-inprogress',
      filterKey: 'In Progress' as const,
      label: 'In Progress',
      value: inProgress,
      icon: Wrench,
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50/60',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
      description: 'Under active repair or review',
    },
    {
      id: 'stat-resolved',
      filterKey: 'Resolved' as const,
      label: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50/60',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      description: 'Completed and verified',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isSelected = activeStatusFilter === stat.filterKey;

        return (
          <div
            key={stat.id}
            id={stat.id}
            onClick={() => onFilterClick && onFilterClick(stat.filterKey)}
            className={`p-4 sm:p-5 rounded-xl border bg-white shadow-xs transition-all ${
              stat.borderColor
            } ${onFilterClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} ${
              isSelected ? 'ring-2 ring-blue-500 shadow-sm' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-600">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${stat.textColor}`}>
                {stat.value}
              </span>
              {total > 0 && stat.filterKey !== 'All' && (
                <span className="text-xs text-slate-500 font-medium">
                  ({Math.round((stat.value / total) * 100)}%)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 hidden sm:block truncate">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
