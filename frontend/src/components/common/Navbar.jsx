import React, { useState } from 'react';
import { Link, useRouter } from '../../context/RouterContext';
import { useTraffic } from '../../context/TrafficContext';
import { 
  Radio, 
  Sparkles, 
  Compass, 
  Video, 
  BarChart3, 
  Clock, 
  BookOpen, 
  Home,
  Menu,
  X
} from 'lucide-react';

/**
 * Main Navigation Bar
 * 
 * Clean, lightweight top navigation.
 * Features links for Home, Junction, Cameras, Results, Events, and Learn,
 * plus a persistent Demo Mode toggle button.
 */
export default function Navbar() {
  const { currentPath, navigate } = useRouter();
  const { openDemoDrawer, mode, backendStatus } = useTraffic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEmergency = mode === 'EMERGENCY';

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/junction', label: 'Junction', icon: Compass },
    { to: '/cameras', label: 'Cameras', icon: Video },
    { to: '/results', label: 'Analysis', icon: BarChart3 },
    { to: '/events', label: 'Activity', icon: Clock },
    { to: '/learn', label: 'Guide', icon: BookOpen },
  ];

  const handleMobileNav = (to) => {
    navigate(to);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold text-slate-900 hover:text-blue-600 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-bold tracking-tight text-slate-900 leading-tight">
                Emergency Signal Priority
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                AI Traffic Preemption
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label }) => {
              const isActive = to === '/' 
                ? currentPath === '/' 
                : currentPath === to || currentPath.startsWith(`${to}/`);

              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions: Backend Status, Demo Mode Toggle & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Backend Status Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'offline'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={
                backendStatus === 'online'
                  ? 'AI backend is online'
                  : backendStatus === 'offline'
                  ? 'AI backend is unreachable'
                  : 'Backend URL not configured'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'offline'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="hidden sm:inline">
                {backendStatus === 'online'
                  ? 'Backend: Online'
                  : backendStatus === 'offline'
                  ? 'Backend: Offline'
                  : 'Backend: Not configured'}
              </span>
              <span className="sm:hidden">
                {backendStatus === 'online'
                  ? 'Online'
                  : backendStatus === 'offline'
                  ? 'Offline'
                  : 'No API'}
              </span>
            </div>

            <button
              type="button"
              onClick={openDemoDrawer}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isEmergency
                  ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Mode</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-slideDown">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' 
              ? currentPath === '/' 
              : currentPath === to || currentPath.startsWith(`${to}/`);

            return (
              <button
                key={to}
                type="button"
                onClick={() => handleMobileNav(to)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
