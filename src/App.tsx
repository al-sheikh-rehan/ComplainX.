import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { SubmitComplaintView } from './components/SubmitComplaintView';
import { TrackComplaintView } from './components/TrackComplaintView';
import { MyComplaintsView } from './components/MyComplaintsView';
import { AboutView } from './components/AboutView';
import { OfficialDashboardView } from './components/OfficialDashboardView';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DeveloperConsoleModal } from './components/DeveloperConsoleModal';
import {
  ActiveTab,
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  AuthUser,
  UserRole,
  OfficialUser,
} from './types';
import {
  getStoredAuthUser,
  setStoredAuthUser,
  INITIAL_SEED_COMPLAINTS,
} from './utils/storage';
import {
  subscribeToComplaints,
  addComplaintToFirebase,
  updateComplaintStatusInFirebase,
  deleteComplaintFromFirebase,
  logoutUserFromFirebase,
  getLocalCachedComplaints,
} from './lib/firebase';
import { safeLocalStorage, safeSessionStorage } from './utils/safeStorage';
import { CheckCircle2, ShieldCheck, User, Terminal, LayoutDashboard, AlertCircle } from 'lucide-react';

export default function App() {
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const cached = getLocalCachedComplaints();
      return Array.isArray(cached) && cached.length > 0 ? cached : INITIAL_SEED_COMPLAINTS;
    } catch {
      return INITIAL_SEED_COMPLAINTS;
    }
  });
  const [trackTargetId, setTrackTargetId] = useState<string>('');
  const [preselectedCategory, setPreselectedCategory] = useState<ComplaintCategory | ''>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      return getStoredAuthUser();
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<UserRole>('consumer');

  // Developer Console State
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState<boolean>(false);

  // Safe startup verification
  useEffect(() => {
    try {
      const cached = getLocalCachedComplaints();
      if (Array.isArray(cached) && cached.length > 0) {
        setComplaints(cached);
      } else {
        setComplaints(INITIAL_SEED_COMPLAINTS);
      }
      setIsAppReady(true);
    } catch (err: any) {
      console.error('ComplainX App startup error:', err);
      setStartupError(err?.message || String(err));
      setIsAppReady(true);
    }
  }, []);

  // Subscribe to real-time Firebase complaints
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToComplaints(
        (liveComplaints) => {
          if (Array.isArray(liveComplaints) && liveComplaints.length > 0) {
            setComplaints(liveComplaints);
          }
        },
        (err) => {
          console.warn('Real-time listener notice (safe fallback mode active):', err);
        }
      );
    } catch (err) {
      console.warn('Could not register Firebase live complaints listener:', err);
    }

    return () => {
      try {
        unsubscribe();
      } catch {
        // Safe unmount
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (role: UserRole) => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setStoredAuthUser(user);
    if (user.role === 'official') {
      setActiveTab('official_dashboard');
      showToast(
        `Welcome Officer ${user.name}! Municipal Office Dashboard opened.`
      );
    } else {
      showToast(
        `Welcome Citizen Consumer: ${user.name}`
      );
    }
  };

  const handleLogout = async () => {
    await logoutUserFromFirebase();
    setAuthUser(null);
    setStoredAuthUser(null);
    showToast('Signed out of ComplainX session');
  };

  const handleComplaintSubmitted = async (newComplaint: Complaint) => {
    await addComplaintToFirebase(newComplaint);
    showToast(`Complaint registered with ID: ${newComplaint.complaintId}`);
  };

  const handleSelectComplaintToTrack = (id: string) => {
    setTrackTargetId(id);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreselectCategory = (category: ComplaintCategory) => {
    setPreselectedCategory(category);
    setActiveTab('submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus) => {
    await updateComplaintStatusInFirebase(id, newStatus);
    showToast(`Complaint #${id} status updated to "${newStatus}"`);
  };

  const handleDeleteComplaint = async (id: string) => {
    await deleteComplaintFromFirebase(id);
    showToast(`Complaint #${id} deleted`);
  };

  // Visible diagnostic fallback if critical startup error
  if (startupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans p-6">
        <div className="max-w-md w-full bg-slate-800 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span>ComplainX Startup Diagnostic</span>
          </div>
          <p className="text-xs text-slate-300">
            A startup exception was caught. Emergency offline data is loaded:
          </p>
          <pre className="p-3 bg-slate-950 border border-slate-700 rounded-lg text-red-300 text-xs font-mono overflow-auto whitespace-pre-wrap max-h-48">
            {startupError}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStartupError(null);
                setIsAppReady(true);
              }}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              Continue to Portal
            </button>
            <button
              onClick={() => {
                try {
                  safeLocalStorage.clear();
                  safeSessionStorage.clear();
                } catch {}
                window.location.reload();
              }}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              Reset Storage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe complaints array guaranteeing no null/undefined values
  const safeComplaints = Array.isArray(complaints)
    ? complaints.filter((c): c is Complaint => Boolean(c && typeof c === 'object' && c.complaintId))
    : INITIAL_SEED_COMPLAINTS;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans antialiased">
      {/* Navbar with Official login | Consumer login & Dev Console */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        complaintCount={safeComplaints.length}
        authUser={authUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenDevConsole={() => setIsDevConsoleOpen(true)}
      />

      {/* Official Privilege Notice when logged in as Official */}
      {authUser?.role === 'official' && (
        <div className="bg-indigo-900 text-indigo-100 text-xs py-2 px-4 border-b border-indigo-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-between max-w-7xl mx-auto w-full gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-white">
                Official Authority Active:
              </span>
              <span>
                Logged in as {authUser.name} ({authUser.department || 'Municipal Dept'} • {authUser.designation || 'Officer'}). Administrative privileges enabled.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange('official_dashboard')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'official_dashboard'
                    ? 'bg-amber-400 text-slate-950 shadow-xs ring-2 ring-amber-300'
                    : 'bg-indigo-800 hover:bg-indigo-700 text-amber-300 border border-indigo-600/70'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Office Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDevConsoleOpen(true)}
                className="text-amber-300 hover:text-amber-100 text-xs underline flex items-center gap-1 shrink-0 cursor-pointer px-1 py-1"
              >
                <Terminal className="w-3 h-3" />
                <span>Dev Console</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consumer Banner when logged in as Consumer */}
      {authUser?.role === 'consumer' && (
        <div className="bg-blue-900 text-blue-100 text-xs py-2 px-4 border-b border-blue-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-white">
              Verified Citizen Account:
            </span>
            <span>
              Logged in as {authUser.name} (Consumer ID: {authUser.consumerId}). Submissions attach your verified contact details.
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-sm font-medium animate-bounce"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            complaints={safeComplaints}
            onNavigate={handleTabChange}
            onSelectComplaintToTrack={handleSelectComplaintToTrack}
            onPreselectCategory={handlePreselectCategory}
            authUser={authUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'submit' && (
          <SubmitComplaintView
            initialCategory={preselectedCategory}
            onComplaintSubmitted={handleComplaintSubmitted}
            onNavigateToTrack={handleSelectComplaintToTrack}
            authUser={authUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'track' && (
          <TrackComplaintView
            initialSearchId={trackTargetId}
            allComplaints={safeComplaints}
            onRefreshComplaints={() => {
              setComplaints(getLocalCachedComplaints());
            }}
            onNavigateToSubmit={() => handleTabChange('submit')}
          />
        )}

        {activeTab === 'complaints' && (
          <MyComplaintsView
            complaints={safeComplaints}
            onNavigateToSubmit={() => handleTabChange('submit')}
            onNavigateToTrack={handleSelectComplaintToTrack}
            onUpdateStatus={handleUpdateStatus}
            onDeleteComplaint={handleDeleteComplaint}
            onRefreshFromFirebase={() => {
              setComplaints(getLocalCachedComplaints());
              showToast('Refreshed complaints records');
            }}
          />
        )}

        {activeTab === 'official_dashboard' && (
          <OfficialDashboardView
            officialUser={authUser?.role === 'official' ? (authUser as OfficialUser) : null}
            complaints={safeComplaints}
            onUpdateStatus={handleUpdateStatus}
            onDeleteComplaint={handleDeleteComplaint}
            onNavigate={handleTabChange}
            onRefreshFromFirebase={() => {
              setComplaints(getLocalCachedComplaints());
              showToast('Refreshed complaints records');
            }}
            onSelectComplaintToTrack={handleSelectComplaintToTrack}
          />
        )}

        {activeTab === 'about' && (
          <AboutView onNavigate={handleTabChange} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleTabChange}
        onPreselectCategory={handlePreselectCategory}
      />

      {/* Official & Consumer Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialRole={authModalInitialRole}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenDevConsole={() => {
          setIsAuthModalOpen(false);
          setIsDevConsoleOpen(true);
        }}
      />

      {/* Developer & Master Admin Console */}
      <DeveloperConsoleModal
        isOpen={isDevConsoleOpen}
        onClose={() => setIsDevConsoleOpen(false)}
        onNotify={(msg) => showToast(msg)}
      />
    </div>
  );
}
