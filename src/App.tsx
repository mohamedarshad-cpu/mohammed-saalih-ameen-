import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Home } from './pages/Home';
import { Routes } from './pages/Routes';
import { ReportHazard } from './pages/ReportHazard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShieldCheck, PhoneCall, HeartHandshake, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('Home');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'Home' && (
          <Home
            onNavigateToRoutes={() => setCurrentTab('Safe Routes')}
            onNavigateToReport={() => setCurrentTab('Report Hazard')}
          />
        )}

        {currentTab === 'Safe Routes' && <Routes />}

        {currentTab === 'Report Hazard' && (
          <ReportHazard onViewOnMap={() => setCurrentTab('Home')} />
        )}

        {currentTab === 'Admin Dashboard' && <AdminDashboard />}
      </main>

      {/* Student Safety Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                🛡️
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">
                  RouteSafe AI
                </div>
                <div className="text-xs text-slate-500">
                  Student Safety Navigation Platform • Connected Intelligence
                </div>
              </div>
            </div>

            {/* Quick Emergency Assistance Pill */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>Campus Escort Service: (555) 234-SAFE</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Blue Light Call Boxes Active</span>
              </div>
            </div>

            {/* Bottom Nav Links */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <button
                onClick={() => setCurrentTab('Home')}
                className="hover:text-slate-900 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => setCurrentTab('Safe Routes')}
                className="hover:text-slate-900 transition-colors"
              >
                Safe Routes
              </button>
              <button
                onClick={() => setCurrentTab('Report Hazard')}
                className="hover:text-slate-900 transition-colors"
              >
                Report Hazard
              </button>
              <button
                onClick={() => setCurrentTab('Admin Dashboard')}
                className="hover:text-slate-900 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>© 2026 RouteSafe AI. OpenStreetMap data contributors.</span>
            <span>Designed for student safety and campus pedestrian peace of mind.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

