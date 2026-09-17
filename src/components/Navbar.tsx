import React, { useState } from 'react';
import { Shield, Menu, X, User, Bell, AlertOctagon } from 'lucide-react';

export type NavTab = 'Home' | 'Safe Routes' | 'Report Hazard' | 'Admin Dashboard';

export interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  className?: string;
  id?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  className = '',
  id = 'routesafe-navbar',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavTab[] = [
    'Home',
    'Safe Routes',
    'Report Hazard',
    'Admin Dashboard',
  ];

  const handleNavClick = (item: NavTab) => {
    onSelectTab(item);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id={id}
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNavClick('Home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              aria-label="RouteSafe AI Home"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-slate-800 transition-colors">
                <span className="text-xl select-none">🛡️</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    RouteSafe AI
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wider">
                    Beta
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Student Safety Navigation
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentTab === item;
                return (
                  <button
                    key={item}
                    id={`nav-item-${item.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleNavClick(item)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Student Profile & Online Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-[11px] text-slate-600">Online</span>
            </div>

            {/* Student User Chip */}
            <div
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
              title="Signed in as Student"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none">
                  Student
                </span>
                <span className="text-[10px] text-slate-500 leading-none mt-0.5">
                  ID: #8492
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-[11px] text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Student</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item;
            return (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item}</span>
                {isActive && (
                  <span className="text-xs font-normal opacity-80">Active</span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-700">Safety Network Online</span>
            </div>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
              Student Mode
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
