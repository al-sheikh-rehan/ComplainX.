import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Search,
  FileText,
  Info,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  Terminal,
  LayoutDashboard,
} from 'lucide-react';
import { ActiveTab, AuthUser, UserRole, ConsumerUser, OfficialUser } from '../types';
import { ComplainXLogo } from './ComplainXLogo';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  complaintCount: number;
  authUser?: AuthUser | null;
  onOpenAuth: (role: UserRole) => void;
  onLogout: () => void;
  onOpenDevConsole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  complaintCount,
  authUser,
  onOpenAuth,
  onLogout,
  onOpenDevConsole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    ...(authUser?.role === 'official'
      ? [
          {
            id: 'official_dashboard' as ActiveTab,
            label: 'Office Dashboard',
            icon: LayoutDashboard,
          },
        ]
      : []),
    { id: 'home', label: 'Home', icon: Building2 },
    { id: 'submit', label: 'Submit Complaint', icon: PlusCircle },
    { id: 'track', label: 'Track Complaint', icon: Search },
    { id: 'complaints', label: 'My Complaints', icon: FileText },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Top Utility Bar with Official login | Consumer login & Developer Console */}
      <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300 hidden sm:inline">
              Citizen Redressal & Public Grievance Network • Firebase Realtime
            </span>
            <span className="font-medium text-slate-300 sm:hidden">
              ComplainX
            </span>
          </div>

          {/* Action Links: Developer Console & Logins */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Requested Official login | Consumer login */}
            {!authUser ? (
              <div className="flex items-center font-medium">
                <button
                  id="topbar-official-login"
                  type="button"
                  onClick={() => onOpenAuth('official')}
                  className="px-2 sm:px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Official login</span>
                </button>
                <span className="text-slate-600 font-bold px-1 select-none">|</span>
                <button
                  id="topbar-consumer-login"
                  type="button"
                  onClick={() => onOpenAuth('consumer')}
                  className="px-2 sm:px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Consumer login</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                {authUser.role === 'consumer' ? (
                  <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[110px] sm:max-w-xs">{authUser.name}</span>
                    <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">
                      ({(authUser as ConsumerUser).consumerId || 'Citizen'})
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNavClick('official_dashboard')}
                    className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-medium cursor-pointer transition-colors"
                    title="Open Municipal Office Dashboard"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate max-w-[110px] sm:max-w-xs">{authUser.name}</span>
                    <span className="px-1.5 py-0.2 rounded-sm bg-indigo-500/30 text-indigo-200 text-[10px] uppercase font-bold border border-indigo-400/30 hidden sm:inline">
                      {((authUser as OfficialUser).department || 'Municipal').split(' ')[0]}
                    </span>
                  </button>
                )}
                <button
                  id="topbar-logout-button"
                  type="button"
                  onClick={onLogout}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 hover:underline underline-offset-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Requested Developer Console Icon & Button */}
            <button
              id="topbar-dev-console-btn"
              type="button"
              onClick={onOpenDevConsole}
              className="px-2 py-0.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ml-1"
              title="Developer Console (Official Staff Generator & DB)"
            >
              <Terminal className="w-3 h-3" />
              <span>Dev Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ComplainX Logo */}
            <button
              id="nav-logo-button"
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center text-left group focus:outline-hidden cursor-pointer"
            >
              <ComplainXLogo size="sm" showTagline={true} />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isOfficialDash = item.id === 'official_dashboard';

                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? isOfficialDash
                          ? 'bg-indigo-900 text-white font-bold shadow-xs'
                          : 'bg-blue-50 text-blue-700 font-semibold'
                        : isOfficialDash
                        ? 'text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-bold border border-indigo-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? (isOfficialDash ? 'text-amber-400' : 'text-blue-600') : isOfficialDash ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {isOfficialDash && (
                      <span className="text-[10px] bg-amber-400 text-indigo-950 font-black px-1.5 py-0.2 rounded uppercase">
                        Gov
                      </span>
                    )}
                    {item.id === 'complaints' && complaintCount > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {complaintCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Desktop Action Area: Logins Pill, Dev Console & Report Issue Button */}
            <div className="hidden md:flex items-center gap-2.5">
              {!authUser ? (
                <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-semibold">
                  <button
                    id="nav-official-login-btn"
                    type="button"
                    onClick={() => onOpenAuth('official')}
                    className="px-2.5 py-1 text-indigo-700 hover:text-indigo-900 hover:bg-white rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Official login</span>
                  </button>
                  <span className="text-slate-300 font-normal px-0.5">|</span>
                  <button
                    id="nav-consumer-login-btn"
                    type="button"
                    onClick={() => onOpenAuth('consumer')}
                    className="px-2.5 py-1 text-blue-700 hover:text-blue-900 hover:bg-white rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Consumer login</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {authUser.role === 'consumer' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-800">{authUser.name}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNavClick('official_dashboard')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs transition-colors cursor-pointer"
                      title="Click to open Official Dashboard"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-semibold text-indigo-900">{authUser.name}</span>
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                        OFFICE
                      </span>
                    </button>
                  )}
                </div>
              )}

              <button
                id="nav-dev-console-btn"
                type="button"
                onClick={onOpenDevConsole}
                className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                title="Developer Console (Official Staff ID Generator & Firebase Inspector)"
              >
                <Terminal className="w-4 h-4" />
              </button>

              <button
                id="nav-quick-submit-cta"
                type="button"
                onClick={() => handleNavClick('submit')}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue</span>
              </button>
            </div>

            {/* Mobile menu hamburger toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                id="mobile-dev-console-btn"
                type="button"
                onClick={onOpenDevConsole}
                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                title="Dev Console"
              >
                <Terminal className="w-4 h-4" />
              </button>

              <button
                id="nav-mobile-toggle-btn"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {/* Mobile Login Row */}
          {!authUser ? (
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <button
                id="mobile-official-login"
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('official');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Official login</span>
              </button>

              <button
                id="mobile-consumer-login"
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('consumer');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Consumer login</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                {authUser.role === 'consumer' ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                )}
                <div>
                  <div className="font-semibold text-slate-900">{authUser.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {authUser.role === 'consumer'
                      ? `Consumer ID: ${(authUser as ConsumerUser).consumerId || 'Citizen'}`
                      : `Official: ${(authUser as OfficialUser).designation || 'Officer'}`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold"
              >
                Logout
              </button>
            </div>
          )}

          {/* Dev Console shortcut for mobile */}
          <div className="pb-1">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDevConsole();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>Developer Console (Official Generator & DB)</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">
                Admin
              </span>
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'complaints' && complaintCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                    {complaintCount}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2">
            <button
              id="mobile-nav-submit-btn"
              type="button"
              onClick={() => handleNavClick('submit')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Community Issue</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
