import React, { useState } from 'react';
import {
  UserRole,
  AuthUser,
  ConsumerUser,
  OfficialUser,
} from '../types';
import { ComplainXLogo } from './ComplainXLogo';
import {
  loginConsumerWithFirebase,
  registerConsumerWithFirebase,
  authenticateOfficial,
} from '../lib/firebase';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Loader2,
  UserPlus,
  LogIn,
  MapPin,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onOpenDevConsole?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'consumer',
  onClose,
  onLoginSuccess,
  onOpenDevConsole,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);

  // Consumer mode: 'signin' | 'signup'
  const [consumerMode, setConsumerMode] = useState<'signin' | 'signup'>('signin');
  const [consumerName, setConsumerName] = useState('');
  const [consumerEmail, setConsumerEmail] = useState('');
  const [consumerPassword, setConsumerPassword] = useState('');
  const [consumerPhone, setConsumerPhone] = useState('');
  const [consumerAddress, setConsumerAddress] = useState('');
  const [consumerWard, setConsumerWard] = useState('');
  const [isConsumerSubmitting, setIsConsumerSubmitting] = useState(false);
  const [consumerError, setConsumerError] = useState('');

  // Official form state
  const [officialIdentifier, setOfficialIdentifier] = useState('');
  const [officialPin, setOfficialPin] = useState('');
  const [isOfficialSubmitting, setIsOfficialSubmitting] = useState(false);
  const [officialError, setOfficialError] = useState('');

  if (!isOpen) return null;

  // Real Consumer Login or Register via Firebase Auth
  const handleConsumerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsumerError('');

    if (!consumerEmail.trim()) {
      setConsumerError('Please enter your email address.');
      return;
    }
    if (!consumerPassword || consumerPassword.length < 6) {
      setConsumerError('Password must be at least 6 characters long.');
      return;
    }

    setIsConsumerSubmitting(true);
    try {
      if (consumerMode === 'signup') {
        if (!consumerName.trim()) {
          setConsumerError('Please enter your full name.');
          setIsConsumerSubmitting(false);
          return;
        }
        const user = await registerConsumerWithFirebase(
          consumerName,
          consumerEmail,
          consumerPassword,
          consumerPhone,
          consumerAddress,
          consumerWard
        );
        onLoginSuccess(user);
        onClose();
      } else {
        const user = await loginConsumerWithFirebase(consumerEmail, consumerPassword);
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let msg = err?.message || 'Authentication failed. Please check your credentials.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please try again or create a new account.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setConsumerError(msg);
    } finally {
      setIsConsumerSubmitting(false);
    }
  };

  // Real Official Login via Firestore Official Accounts
  const handleOfficialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficialError('');

    if (!officialIdentifier.trim()) {
      setOfficialError('Please enter your Official Staff ID or Govt Email.');
      return;
    }
    if (!officialPin.trim()) {
      setOfficialError('Please enter your official Security PIN.');
      return;
    }

    setIsOfficialSubmitting(true);
    try {
      const match = await authenticateOfficial(officialIdentifier, officialPin);

      if (match) {
        const officialUser: OfficialUser = {
          role: 'official',
          officialId: match.officialId,
          name: match.name,
          govtEmail: match.govtEmail,
          designation: match.designation,
          department: match.department,
          badgeNumber: match.badgeNumber,
          jurisdiction: match.jurisdiction,
        };
        onLoginSuccess(officialUser);
        onClose();
      } else {
        setOfficialError(
          'Official credentials not recognized. Official Staff ID / Govt Email and Security PIN must be authorized via the Developer Console.'
        );
      }
    } catch (err) {
      console.error('Official login error:', err);
      setOfficialError('Failed to verify official credentials. Please try again.');
    } finally {
      setIsOfficialSubmitting(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ComplainXLogo size="xs" showText={false} textColor="light" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight">ComplainX</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Firebase Real Auth
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {activeRole === 'consumer' ? 'Citizen & Consumer Portal' : 'Municipal Official Authority'}
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
          <button
            id="auth-tab-consumer"
            type="button"
            onClick={() => {
              setActiveRole('consumer');
              setConsumerError('');
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeRole === 'consumer'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>Consumer Login</span>
          </button>

          <button
            id="auth-tab-official"
            type="button"
            onClick={() => {
              setActiveRole('official');
              setOfficialError('');
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeRole === 'official'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Official Login</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* ========================================================= */}
          {/* CONSUMER LOGIN / REGISTER FORM (REAL FIREBASE AUTH)       */}
          {/* ========================================================= */}
          {activeRole === 'consumer' && (
            <div>
              {/* Toggle Sign In / Create Account */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {consumerMode === 'signin' ? 'Sign In to Consumer Account' : 'Register Citizen Consumer Account'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {consumerMode === 'signin'
                      ? 'Secure Firebase email sign in to track your grievances.'
                      : 'Create your verified citizen profile to file complaints.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConsumerMode(consumerMode === 'signin' ? 'signup' : 'signin');
                    setConsumerError('');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0 cursor-pointer"
                >
                  {consumerMode === 'signin' ? 'New? Sign Up' : 'Existing? Sign In'}
                </button>
              </div>

              {consumerError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{consumerError}</span>
                </div>
              )}

              <form onSubmit={handleConsumerSubmit} className="space-y-3.5">
                {consumerMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={consumerName}
                        onChange={(e) => setConsumerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="consumer-email-input"
                      type="email"
                      value={consumerEmail}
                      onChange={(e) => setConsumerEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {consumerMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={consumerPhone}
                        onChange={(e) => setConsumerPhone(e.target.value)}
                        placeholder="98765-43210"
                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="consumer-password-input"
                      type="password"
                      value={consumerPassword}
                      onChange={(e) => setConsumerPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {consumerMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ward / District
                      </label>
                      <input
                        type="text"
                        value={consumerWard}
                        onChange={(e) => setConsumerWard(e.target.value)}
                        placeholder="Ward 14"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Address / Locality
                      </label>
                      <input
                        type="text"
                        value={consumerAddress}
                        onChange={(e) => setConsumerAddress(e.target.value)}
                        placeholder="Sector 12"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  id="consumer-submit-btn"
                  type="submit"
                  disabled={isConsumerSubmitting}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isConsumerSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating with Firebase...</span>
                    </>
                  ) : consumerMode === 'signin' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In as Consumer</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Real Consumer Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* OFFICIAL LOGIN FORM (VALIDATED VIA DEVELOPER CONSOLE)     */}
          {/* ========================================================= */}
          {activeRole === 'official' && (
            <div>
              <div className="mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Municipal Official Login</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorized personnel access using Official Staff ID or Govt Email and Developer-issued Security PIN.
                </p>
              </div>

              {officialError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{officialError}</span>
                </div>
              )}

              <form onSubmit={handleOfficialSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Staff ID or Govt Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="official-id-input"
                      type="text"
                      value={officialIdentifier}
                      onChange={(e) => setOfficialIdentifier(e.target.value)}
                      placeholder="e.g. OFF-101 or officer@mcd.gov.in"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Security PIN (from Dev Console) *</span>
                    <span className="text-[10px] text-slate-400">Created by Administrator</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="official-pin-input"
                      type="password"
                      value={officialPin}
                      onChange={(e) => setOfficialPin(e.target.value)}
                      placeholder="Enter security PIN"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
                      required
                    />
                  </div>
                </div>

                <button
                  id="official-submit-btn"
                  type="submit"
                  disabled={isOfficialSubmitting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isOfficialSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Official Authorization...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Login to Official Authority Portal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Developer Console Link for Official Creation */}
              {onOpenDevConsole && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Need to create or reset an official account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDevConsole();
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open Dev Console</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
