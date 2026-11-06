import React from 'react';
import { ShieldCheck, Heart, ArrowUp } from 'lucide-react';
import { ActiveTab, ComplaintCategory } from '../types';
import { ComplainXLogo } from './ComplainXLogo';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onPreselectCategory: (category: ComplaintCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onPreselectCategory }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories: ComplaintCategory[] = [
    'Water',
    'Sanitation',
    'Electricity',
    'Road',
    'Street Light',
    'Other',
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 inline-block">
              <ComplainXLogo size="sm" showTagline={true} textColor="light" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering citizens to report local civic issues and track resolutions in real-time.
              Built for responsive municipal governance.
            </p>
            <div className="pt-1">
              <span className="inline-block px-2.5 py-1 text-[11px] font-medium bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                💾 Browser LocalStorage Persistence
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('submit')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Submit Complaint
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('track')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Track Complaint by ID
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('complaints')}
                  className="hover:text-blue-400 transition-colors"
                >
                  My Complaints Registry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-blue-400 transition-colors"
                >
                  About Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Problem Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Problem Categories
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onPreselectCategory(cat)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Important Advisory & Back to Top */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Emergency Advisory
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For acute life-threatening situations, active gas leaks, or fire emergencies,
              contact your local emergency response line immediately.
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium pt-2"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to top</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} ComplainX. Dedicated to cleaner, safer communities.</p>
          <div className="flex items-center gap-1">
            <span>Built for civic impact</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" />
            <span>and public accountability</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
