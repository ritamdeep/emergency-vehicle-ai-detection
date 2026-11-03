import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { TrafficProvider } from './context/TrafficContext';
import Navbar from './components/common/Navbar';
import EmergencyAlertStrip from './components/common/EmergencyAlertStrip';
import DemoDrawer from './components/common/DemoDrawer';

import Home from './pages/Home';
import LiveJunction from './pages/LiveJunction';
import Cameras from './pages/Cameras';
import Results from './pages/Results';
import Events from './pages/Events';
import LearnIndex from './pages/LearnIndex';
import LearnDetail from './pages/LearnDetail';

function AppRoutes() {
  const { currentPath } = useRouter();

  // Normalize path
  const path = currentPath.toLowerCase().replace(/\/+$/, '') || '/';

  // Routing Switch
  if (path === '/') return <Home />;
  if (path === '/junction') return <LiveJunction />;
  if (path === '/cameras') return <Cameras />;
  if (path === '/results') return <Results />;
  if (path === '/events') return <Events />;
  if (path.startsWith('/learn/')) return <LearnDetail />;
  if (path === '/learn') return <LearnIndex />;

  // Default fallback
  return <Home />;
}

export default function App() {
  return (
    <RouterProvider>
      <TrafficProvider>
        <div className="min-h-screen bg-[#FAFAFB] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
          {/* 1. Persistent Thin Emergency Status Strip */}
          <EmergencyAlertStrip />

          {/* 2. Top Navigation Bar */}
          <Navbar />

          {/* 3. Subpage Content */}
          <main className="flex-1">
            <AppRoutes />
          </main>

          {/* 4. Persistent Demo Drawer (Accessible from any route) */}
          <DemoDrawer />

          {/* 5. Minimal Light Footer */}
          <footer className="border-t border-slate-200/80 bg-white py-6 mt-16 text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                Emergency Vehicle Priority Project • AI Junction Management
              </p>
              <p className="font-mono text-[11px] text-slate-400">
                YOLOv11 Nano • HSV Strobe Verification • 4-Way Traffic Preemption
              </p>
            </div>
          </footer>
        </div>
      </TrafficProvider>
    </RouterProvider>
  );
}
