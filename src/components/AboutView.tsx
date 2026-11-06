import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
  Users,
  Building,
  Zap,
  Droplets,
  Trash2,
  Lightbulb,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { ComplainXLogo } from './ComplainXLogo';

interface AboutViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Spot & Document the Issue',
      desc: 'Notice a water leak, dark street light, broken asphalt, or piled garbage in your neighborhood.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Submit Intake Form',
      desc: 'Provide your contact details, select the category, specify the landmark location, and set priority.',
      icon: FileText,
    },
    {
      step: '03',
      title: 'Receive Unique Complaint ID',
      desc: 'The portal generates a unique ticket reference code (e.g., CMP1001) saved to local storage.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Track Resolution to Completion',
      desc: 'Follow the ticket milestones from Pending to In Progress through to verified Resolved status.',
      icon: CheckCircle2,
    },
  ];

  const benefits = [
    {
      title: 'Zero Bureaucratic Friction',
      desc: 'No long telephone wait lines or confusing municipal paperwork. Anyone can file a report in 2 minutes.',
    },
    {
      title: 'Instant Transparent Tracking',
      desc: 'Every issue has a verifiable status trail so citizens always know whether inspectors have been assigned.',
    },
    {
      title: 'Priority-Based Response',
      desc: 'Critical hazards like sparking transformers or gushing water mains are prioritized for immediate action.',
    },
    {
      title: 'Citizen Empowerment',
      desc: 'Brings neighborhood residents and municipal authorities together to maintain higher civic living standards.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Top Hero / Intro */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-3xl bg-white shadow-sm border border-slate-200 inline-flex">
            <ComplainXLogo size="lg" showTagline={true} showSlogan={true} />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200">
          <Building className="w-3.5 h-3.5" />
          <span>Civic Infrastructure & Public Works Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          About ComplainX
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          ComplainX is a next-generation civic engagement platform engineered
          to bridge communication between local neighborhood residents and public maintenance teams.
        </p>
      </div>

      {/* 1. What is ComplainX? & 2. Why it is useful */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
              <Building className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              What is ComplainX?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              It is a centralized community grievance management web portal that allows citizens
              to report everyday infrastructure failures directly from their phone or computer.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Whether it is a broken water main flooding a sidewalk, overflowing sanitation bins,
              hazardous electrical transformers, or unlit streets at night, the portal organizes
              these complaints into structured, actionable tickets.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Why Is It Useful?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Traditional complaint processes often vanish into unmonitored email boxes or call centers.
              ComplainX ensures complete digital traceability.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 mt-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant unique Complaint ID generation for every submission.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Live status tracking with transparent milestone stages.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Data stored reliably right in your browser local storage.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. How It Helps the Community */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white p-8 sm:p-10 shadow-lg">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How It Helps the Community
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mt-2">
            A resilient neighborhood begins with swift problem identification and collective civic pride.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-xs rounded-2xl p-5 border border-white/15"
            >
              <h3 className="text-base font-bold text-white mb-1.5">{b.title}</h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. How Users Can Report Problems (1-2-3-4 Guide) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How Users Can Report Problems
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Four simple steps to register and resolve any neighborhood issue.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-blue-600/30">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA to submit */}
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => onNavigate('submit')}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <span>Ready to Report a Problem?</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
