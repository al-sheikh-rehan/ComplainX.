import React, { useState, useEffect } from 'react';
import {
  X,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Database,
  Lock,
  Mail,
  Building,
  Server,
  Sparkles,
  AlertCircle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { OfficialAccount, Complaint } from '../types';
import { safeSessionStorage } from '../utils/safeStorage';
import {
  firebaseConfig,
  subscribeToOfficials,
  saveOfficialAccountToFirebase,
  deleteOfficialAccountFromFirebase,
  subscribeToComplaints,
  updateComplaintStatusInFirebase,
  deleteComplaintFromFirebase,
} from '../lib/firebase';

interface DeveloperConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

const MASTER_DEV_EMAIL = 'alsheikhrehan922@gmail.com';
const MASTER_DEV_PASS = '8969288@ab';

export const DeveloperConsoleModal: React.FC<DeveloperConsoleModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  // Master Developer Auth State
  const [isDevAuthenticated, setIsDevAuthenticated] = useState<boolean>(() => {
    return safeSessionStorage.getItem('complainx_dev_auth') === 'true';
  });
  const [inputEmail, setInputEmail] = useState(MASTER_DEV_EMAIL);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab inside Console
  const [activeTab, setActiveTab] = useState<'officials' | 'complaints' | 'firebase'>('officials');

  // Officials State
  const [officials, setOfficials] = useState<OfficialAccount[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPins, setShowPins] = useState<{ [id: string]: boolean }>({});

  // New Official Form State
  const [formOfficialId, setFormOfficialId] = useState(
    () => 'OFF-' + Math.floor(100 + Math.random() * 900)
  );
  const [formGovtEmail, setFormGovtEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('Zonal Grievance Officer');
  const [formDepartment, setFormDepartment] = useState('Public Works & Infrastructure');
  const [formBadge, setFormBadge] = useState(
    () => 'MCD-' + Math.floor(100 + Math.random() * 900)
  );
  const [formJurisdiction, setFormJurisdiction] = useState('Zone 1 (Central)');
  const [formPin, setFormPin] = useState(
    () => String(Math.floor(1000 + Math.random() * 9000))
  );
  const [isSubmittingOfficial, setIsSubmittingOfficial] = useState(false);
  const [officialSuccessMsg, setOfficialSuccessMsg] = useState('');

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Subscribe to live Firestore when modal is open and authenticated
  useEffect(() => {
    if (!isOpen || !isDevAuthenticated) return;

    const unsubOfficials = subscribeToOfficials((list) => {
      setOfficials(list);
    });

    const unsubComplaints = subscribeToComplaints((list) => {
      setComplaints(list);
    });

    return () => {
      unsubOfficials();
      unsubComplaints();
    };
  }, [isOpen, isDevAuthenticated]);

  if (!isOpen) return null;

  // Handle Developer Login
  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (
      inputEmail.trim().toLowerCase() === MASTER_DEV_EMAIL.toLowerCase() &&
      inputPassword === MASTER_DEV_PASS
    ) {
      setIsDevAuthenticated(true);
      safeSessionStorage.setItem('complainx_dev_auth', 'true');
      if (onNotify) onNotify('Developer Console unlocked successfully');
    } else {
      setAuthError('Invalid Master Developer credentials. Only authorized administrator access permitted.');
    }
  };

  const handleDevLogout = () => {
    setIsDevAuthenticated(false);
    safeSessionStorage.removeItem('complainx_dev_auth');
    setInputPassword('');
    if (onNotify) onNotify('Logged out from Developer Console');
  };

  // Handle Creating Official
  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficialSuccessMsg('');

    if (!formOfficialId.trim() || !formGovtEmail.trim() || !formName.trim() || !formPin.trim()) {
      alert('Please fill in Official ID, Govt Email, Officer Name, and Security PIN.');
      return;
    }

    setIsSubmittingOfficial(true);
    try {
      const newOfficial: OfficialAccount = {
        id: formOfficialId.trim().toUpperCase(),
        officialId: formOfficialId.trim().toUpperCase(),
        govtEmail: formGovtEmail.trim().toLowerCase(),
        name: formName.trim(),
        designation: formDesignation.trim(),
        department: formDepartment,
        badgeNumber: formBadge.trim() || 'MCD-000',
        jurisdiction: formJurisdiction.trim() || 'Zone 1',
        pin: formPin.trim(),
        createdAt: new Date().toISOString(),
        createdBy: MASTER_DEV_EMAIL,
        isActive: true,
      };

      await saveOfficialAccountToFirebase(newOfficial);

      setOfficialSuccessMsg(
        `Official account ${newOfficial.officialId} created! Login credentials: ${newOfficial.officialId} / PIN: ${newOfficial.pin}`
      );
      if (onNotify) onNotify(`Official ${newOfficial.name} (${newOfficial.officialId}) authorized`);

      // Reset form with new random values
      setFormOfficialId('OFF-' + Math.floor(100 + Math.random() * 900));
      setFormGovtEmail('');
      setFormName('');
      setFormBadge('MCD-' + Math.floor(100 + Math.random() * 900));
      setFormPin(String(Math.floor(1000 + Math.random() * 9000)));
    } catch (err) {
      console.error(err);
      alert('Failed to save official account.');
    } finally {
      setIsSubmittingOfficial(false);
    }
  };

  // Quick Seed Sample Official if list is empty
  const handleSeedDefaultOfficial = async () => {
    const defaultOfficial: OfficialAccount = {
      id: 'OFF-7721',
      officialId: 'OFF-7721',
      govtEmail: 'vikram.malhotra@mcd.gov.in',
      name: 'Er. Vikram Malhotra',
      designation: 'Zonal Chief Grievance Officer',
      department: 'Public Works & Infrastructure',
      badgeNumber: 'MCD-ENG-089',
      jurisdiction: 'Zone 4 (Central & West)',
      pin: '7721',
      createdAt: new Date().toISOString(),
      createdBy: MASTER_DEV_EMAIL,
      isActive: true,
    };
    await saveOfficialAccountToFirebase(defaultOfficial);
    if (onNotify) onNotify('Sample Official (Er. Vikram Malhotra, ID: OFF-7721, PIN: 7721) created');
  };

  const handleDeleteOfficial = async (officialId: string) => {
    if (confirm(`Are you sure you want to delete official account ${officialId}?`)) {
      await deleteOfficialAccountFromFirebase(officialId);
      if (onNotify) onNotify(`Official ${officialId} removed`);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePinVisibility = (id: string) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      id="dev-console-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="dev-console-modal"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Developer & Master Admin Console
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Firebase Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Staff Provisioning & Firebase Cloud Database Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDevAuthenticated && (
              <button
                id="dev-logout-btn"
                type="button"
                onClick={handleDevLogout}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Logout Developer Session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Logout Dev</span>
              </button>
            )}
            <button
              id="dev-console-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Developer Console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOT AUTHENTICATED: Master Login Gate */}
        {!isDevAuthenticated ? (
          <div className="p-6 sm:p-10 max-w-md mx-auto w-full my-auto">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Master Developer Authentication</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your authorized developer credentials to generate official accounts and inspect the real Firebase database.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleDevLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Developer Master Gmail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="dev-email-input"
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="alsheikhrehan922@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="dev-password-input"
                    type="password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="Enter master password"
                    required
                  />
                </div>
              </div>

              <button
                id="dev-login-submit-btn"
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                <span>Unlock Developer Console</span>
              </button>
            </form>

            <div className="mt-6 p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-slate-400 text-center">
              <span className="font-semibold text-slate-300">Authorized Developer:</span>{' '}
              alsheikhrehan922@gmail.com
            </div>
          </div>
        ) : (
          /* AUTHENTICATED: Full Developer Console Experience */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950 shrink-0">
              <button
                id="dev-tab-officials"
                type="button"
                onClick={() => setActiveTab('officials')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'officials'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Official Staff Generator ({officials.length})</span>
              </button>

              <button
                id="dev-tab-complaints"
                type="button"
                onClick={() => setActiveTab('complaints')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'complaints'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Complaints DB ({complaints.length})</span>
              </button>

              <button
                id="dev-tab-firebase"
                type="button"
                onClick={() => setActiveTab('firebase')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'firebase'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Firebase System</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: OFFICIAL STAFF GENERATOR & MANAGEMENT */}
              {activeTab === 'officials' && (
                <div className="space-y-6">
                  {/* Official Creator Form */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-emerald-400" />
                          <span>Generate New Official Staff Account</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          These credentials allow municipal officers to log in via the Official Login tab.
                        </p>
                      </div>

                      {officials.length === 0 && (
                        <button
                          type="button"
                          onClick={handleSeedDefaultOfficial}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Quick Seed Initial Officer</span>
                        </button>
                      )}
                    </div>

                    {officialSuccessMsg && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{officialSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateOfficial} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Official Staff ID *
                        </label>
                        <input
                          type="text"
                          value={formOfficialId}
                          onChange={(e) => setFormOfficialId(e.target.value.toUpperCase())}
                          placeholder="e.g. OFF-101"
                          className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Govt / Department Email *
                        </label>
                        <input
                          type="email"
                          value={formGovtEmail}
                          onChange={(e) => setFormGovtEmail(e.target.value)}
                          placeholder="e.g. officer.pwd@gov.in"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Officer Full Name *
                        </label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Er. Ananya Verma"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Department *
                        </label>
                        <select
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          <option value="Public Works & Infrastructure">Public Works & Infrastructure</option>
                          <option value="Water Supply & Sewerage Board">Water Supply & Sewerage Board</option>
                          <option value="Electricity & Street Lighting">Electricity & Street Lighting Corporation</option>
                          <option value="Municipal Sanitation & Waste">Municipal Sanitation & Solid Waste</option>
                          <option value="Zonal Grievance Redressal Cell">Zonal Grievance Redressal Cell</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={formDesignation}
                          onChange={(e) => setFormDesignation(e.target.value)}
                          placeholder="e.g. Assistant Engineer"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                          <span>Official Security PIN *</span>
                          <span className="text-[10px] text-slate-400 font-normal">Used to login</span>
                        </label>
                        <input
                          type="text"
                          value={formPin}
                          onChange={(e) => setFormPin(e.target.value)}
                          placeholder="e.g. 4821"
                          className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-900 border border-emerald-500/50 rounded-xl text-emerald-300 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingOfficial}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{isSubmittingOfficial ? 'Authorizing...' : 'Create Official Account'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Officials List */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>Active Official Accounts in Database ({officials.length})</span>
                      </div>
                      <span className="text-xs text-slate-400 font-normal">
                        Stored in Firestore collection: <code className="text-emerald-400 font-mono">officials</code>
                      </span>
                    </h3>

                    {officials.length === 0 ? (
                      <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                        <UserPlus className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-400">No Official Staff Accounts yet</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Use the generator above to create an official staff ID and security PIN for municipal personnel.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {officials.map((off) => {
                          const isPinVisible = showPins[off.officialId] || false;
                          const isCopied = copiedId === off.officialId;

                          return (
                            <div
                              key={off.officialId}
                              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-white">{off.name}</span>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                                        {off.officialId}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      {off.designation} • {off.department}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                      Govt Email: {off.govtEmail}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOfficial(off.officialId)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                    title="Delete official"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Credentials Box */}
                                <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-[11px]">Security PIN:</span>
                                    <span className="font-mono font-bold text-emerald-400">
                                      {isPinVisible ? off.pin : '••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => togglePinVisibility(off.officialId)}
                                      className="text-slate-400 hover:text-slate-200"
                                      title={isPinVisible ? 'Hide PIN' : 'Show PIN'}
                                    >
                                      {isPinVisible ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(
                                        `Staff ID: ${off.officialId}\nGovt Email: ${off.govtEmail}\nPIN: ${off.pin}`,
                                        off.officialId
                                      )
                                    }
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 cursor-pointer"
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span>Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-400" />
                                        <span>Copy Info</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: COMPLAINTS DATABASE INSPECTOR */}
              {activeTab === 'complaints' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <span>Real Complaints in Firestore ({complaints.length})</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Live real-time synced data from user submissions in Firestore collection: <code className="text-emerald-400 font-mono">complaints</code>
                      </p>
                    </div>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                      <Database className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-400">No complaints in database yet</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        When citizens or consumers submit a civic grievance via "Submit Complaint", it appears here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complaints.map((c) => (
                        <div
                          key={c.complaintId}
                          className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-400">
                                #{c.complaintId}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">
                                {c.category}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  c.status === 'Resolved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : c.status === 'In Progress'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white">{c.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
                            <p className="text-[11px] text-slate-500">
                              By {c.name || 'Anonymous'} • Location: {c.location} • Date: {c.date}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={c.status}
                              onChange={(e) =>
                                updateComplaintStatusInFirebase(
                                  c.complaintId,
                                  e.target.value as Complaint['status']
                                )
                              }
                              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete complaint #${c.complaintId}?`)) {
                                  deleteComplaintFromFirebase(c.complaintId);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Delete from database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FIREBASE SYSTEM & METRICS */}
              {activeTab === 'firebase' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <span>Connected Firebase Project Credentials</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase">Project ID</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{firebaseConfig.projectId}</div>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase">Auth Domain</div>
                        <div className="text-white mt-0.5">{firebaseConfig.authDomain}</div>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase">Storage Bucket</div>
                        <div className="text-white mt-0.5">{firebaseConfig.storageBucket}</div>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase">App ID</div>
                        <div className="text-white truncate mt-0.5">{firebaseConfig.appId}</div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Real Firebase Database Status:</span> Both Authentication and Firestore live synchronization are initialized and operational on <code className="font-mono">{firebaseConfig.projectId}</code>.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
