import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Send,
  Droplets,
  Trash2,
  Zap,
  Footprints,
  Lightbulb,
  HelpCircle,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintFormData,
  ComplaintPriority,
  FormErrors,
  AuthUser,
  UserRole,
} from '../types';
import { addComplaintToStorage } from '../utils/storage';

interface SubmitComplaintViewProps {
  initialCategory?: ComplaintCategory | '';
  onComplaintSubmitted: (newComplaint: Complaint) => void;
  onNavigateToTrack: (complaintId: string) => void;
  authUser?: AuthUser | null;
  onOpenAuth?: (role: UserRole) => void;
}

export const SubmitComplaintView: React.FC<SubmitComplaintViewProps> = ({
  initialCategory = '',
  onComplaintSubmitted,
  onNavigateToTrack,
  authUser,
  onOpenAuth,
}) => {
  const initialFormState: ComplaintFormData = {
    name: authUser?.role === 'consumer' ? authUser.name : '',
    email: authUser?.role === 'consumer' ? authUser.email : '',
    phone: authUser?.role === 'consumer' ? authUser.phone : '',
    category: (initialCategory as ComplaintCategory | '') || '',
    title: '',
    description: '',
    location: '',
    priority: 'Medium',
  };

  const [formData, setFormData] = useState<ComplaintFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setFormData((prev) => ({ ...prev, category: initialCategory as ComplaintCategory }));
    }
  }, [initialCategory]);

  useEffect(() => {
    if (authUser?.role === 'consumer') {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || authUser.name,
        email: prev.email || authUser.email,
        phone: prev.phone || authUser.phone,
      }));
    }
  }, [authUser]);

  const categories: { label: ComplaintCategory; icon: React.ElementType; color: string }[] = [
    { label: 'Water', icon: Droplets, color: 'text-sky-600' },
    { label: 'Sanitation', icon: Trash2, color: 'text-emerald-600' },
    { label: 'Electricity', icon: Zap, color: 'text-amber-600' },
    { label: 'Road', icon: Footprints, color: 'text-orange-600' },
    { label: 'Street Light', icon: Lightbulb, color: 'text-indigo-600' },
    { label: 'Other', icon: HelpCircle, color: 'text-slate-600' },
  ];

  const priorities: { label: ComplaintPriority; desc: string; color: string }[] = [
    { label: 'Low', desc: 'Minor inconvenience, non-hazardous', color: 'border-slate-300 text-slate-700 peer-checked:border-slate-600 peer-checked:bg-slate-50' },
    { label: 'Medium', desc: 'Disrupts daily routine or transit', color: 'border-amber-300 text-amber-800 peer-checked:border-amber-600 peer-checked:bg-amber-50' },
    { label: 'High', desc: 'Urgent hazard, safety/public risk', color: 'border-rose-300 text-rose-800 peer-checked:border-rose-600 peer-checked:bg-rose-50' },
  ];

  const validate = (): boolean => {
    const errs: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Please enter your real full name (at least 2 characters).';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email format (e.g. name@example.com).';
    }

    // Phone validation
    const phoneClean = formData.phone.replace(/[\s\-()+.]/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (phoneClean.length < 7 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
      errs.phone = 'Please enter a valid phone number (7 to 15 digits).';
    }

    // Category validation
    if (!formData.category) {
      errs.category = 'Please select a complaint category.';
    }

    // Title validation
    if (!formData.title.trim()) {
      errs.title = 'Problem title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Please provide a clear title (at least 5 characters).';
    }

    // Description validation
    if (!formData.description.trim()) {
      errs.description = 'Problem description cannot be empty.';
    } else if (formData.description.trim().length < 15) {
      errs.description = 'Please describe the problem in more detail (at least 15 characters).';
    }

    // Location validation
    if (!formData.location.trim()) {
      errs.location = 'Location is required (street, neighborhood, or landmark).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = <K extends keyof ComplaintFormData>(
    field: K,
    value: ComplaintFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear individual field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const saved = addComplaintToStorage(formData);
        setSubmittedComplaint(saved);
        onComplaintSubmitted(saved);
        setFormData(initialFormState);
        setErrors({});
      } catch (err) {
        console.error('Submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleResetForNew = () => {
    setSubmittedComplaint(null);
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200">
          <FileText className="w-3.5 h-3.5" />
          <span>Official Civic Intake Form</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Submit a Community Complaint
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Report municipal infrastructure breakdowns, sanitation issues, or utility failures.
          Our team logs each complaint directly into the public resolution queue.
        </p>
      </div>

      {/* Success Banner / Modal */}
      {submittedComplaint && (
        <div
          id="submission-success-banner"
          className="mb-8 bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 rounded-full mb-1">
                Complaint Registered Successfully
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Your Complaint Has Been Logged!
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                Thank you, <span className="font-semibold">{submittedComplaint.name}</span>.
                Your issue has been saved to the municipal registry under the tracking ID below.
              </p>

              {/* ID Box */}
              <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">
                    Your Unique Complaint ID
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-blue-700 tracking-wider">
                    {submittedComplaint.complaintId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="copy-complaint-id-btn"
                    type="button"
                    onClick={() => handleCopyId(submittedComplaint.complaintId)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-300"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>

                  <button
                    id="track-new-complaint-btn"
                    type="button"
                    onClick={() => onNavigateToTrack(submittedComplaint.complaintId)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Track Status Now</span>
                  </button>
                </div>
              </div>

              {/* Quick Details Card */}
              <div className="mt-4 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-emerald-200">
                <div>
                  <span className="text-slate-400 block">Category:</span>
                  <span className="font-semibold text-slate-800">{submittedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Priority:</span>
                  <span className="font-semibold text-slate-800">{submittedComplaint.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-semibold text-amber-700">{submittedComplaint.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Submission Date:</span>
                  <span className="font-semibold text-slate-800">{submittedComplaint.date}</span>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleResetForNew}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                >
                  + Submit another complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Form */}
      <form
        id="submit-complaint-form"
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* Contact Info Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Citizen Contact Information</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Used by civic coordinators for verification and status updates.
            </p>
          </div>

          {authUser?.role === 'consumer' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Consumer Verified ({authUser.consumerId})</span>
            </div>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('consumer')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline self-start sm:self-auto flex items-center gap-1"
              >
                <span>Have a Consumer Account? Login</span>
              </button>
            )
          )}
        </div>

        {/* Full Name */}
        <div id="field-name">
          <label htmlFor="input-name" className="block text-sm font-semibold text-slate-800 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Maria Gonzalez"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
              errors.name
                ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email and Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div id="field-email">
            <label htmlFor="input-email" className="block text-sm font-semibold text-slate-800 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. maria@example.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div id="field-phone">
            <label htmlFor="input-phone" className="block text-sm font-semibold text-slate-800 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. 555-0143 or +1 234 567 8900"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                errors.phone
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Complaint Details Header */}
        <div className="border-b border-slate-200 pb-4 pt-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>Problem Categorization & Description</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Classify and describe the community problem accurately.
          </p>
        </div>

        {/* Complaint Category */}
        <div id="field-category">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Complaint Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  id={`btn-category-${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleChange('category', cat.label)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : cat.color}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>

        {/* Problem Title */}
        <div id="field-title">
          <label htmlFor="input-title" className="block text-sm font-semibold text-slate-800 mb-1">
            Problem Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Broken water valve flooding sidewalk"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
              errors.title
                ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Problem Description */}
        <div id="field-description">
          <label htmlFor="input-description" className="block text-sm font-semibold text-slate-800 mb-1">
            Problem Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="input-description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Provide specific details about the issue: when it started, extent of damage, risks, and any relevant context..."
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
              errors.description
                ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* Location */}
        <div id="field-location">
          <label htmlFor="input-location" className="block text-sm font-semibold text-slate-800 mb-1">
            Location / Landmark <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="input-location"
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. 142 Elm Street, corner of 4th Ave, near City Library"
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                errors.location
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
          </div>
          {errors.location && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.location}</span>
            </p>
          )}
        </div>

        {/* Priority Level */}
        <div id="field-priority">
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Priority Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {priorities.map((p) => {
              const isSelected = formData.priority === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  id={`btn-priority-${p.label.toLowerCase()}`}
                  onClick={() => handleChange('priority', p.label)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{p.label}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        p.label === 'High'
                          ? 'bg-rose-500'
                          : p.label === 'Medium'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            Your report is permanently recorded in your browser local storage and tagged with a
            unique tracking number for community inspection and transparency.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            id="submit-form-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                <span>Validating & Registering...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
