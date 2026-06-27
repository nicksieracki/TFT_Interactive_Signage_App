import React, { useMemo } from 'react';
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { SignagePlayer } from './components/SignagePlayer';
import { Icon } from './components/Icon';
import { AuthProvider } from './AuthContext';
import { PlaceOSProvider } from './PlaceOSContext';
import { SettingsProvider } from './SettingsContext';
import { SystemProvider, useSystem } from './SystemContext';
import { useIdle } from './hooks/useIdle';
import { DirectoryPage } from './pages/DirectoryPage';
import { EventsPage } from './pages/EventsPage';
import { GamePage } from './pages/GamePage';
import { InstagramPage } from './pages/InstagramPage';
import { SignagePage } from './pages/SignagePage';
import { WayfindingPage } from './pages/WayfindingPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { system } = useSystem();
  useIdle();

  const activeTab = useMemo(() => {
    const path = location.pathname.split('?')[0]?.replace(/^\//, '') ?? '';
    const segments = path.split('/').filter(Boolean);
    return segments[segments.length - 1] ?? '';
  }, [location]);

  const hideSignage = useMemo(
    () => ['directory', 'wayfinding', 'events', 'instagram', 'game'].includes(activeTab),
    [activeTab],
  );

  const getLink = (page: string) => {
    return system ? `/${system}/${page}` : `/${page}`;
  };

  const signageLink = system ? `/${system}` : '/';

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--mat-sys-surface)]">
      {/* Main content area - takes remaining space */}
      <div className="relative flex-1 min-h-0">
        <SignagePlayer hide={hideSignage} />
        <div className={`absolute inset-0 z-10 ${!hideSignage ? 'pointer-events-none' : ''}`}>
          <Routes>
            <Route path="/" element={<SignagePage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/wayfinding" element={<WayfindingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/instagram" element={<InstagramPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/:system" element={<SignagePage />} />
            <Route path="/:system/directory" element={<DirectoryPage />} />
            <Route path="/:system/wayfinding" element={<WayfindingPage />} />
            <Route path="/:system/events" element={<EventsPage />} />
            <Route path="/:system/instagram" element={<InstagramPage />} />
            <Route path="/:system/game" element={<GamePage />} />
          </Routes>
        </div>
      </div>

      {/* Navigation bar container - fixed height at bottom */}
      <div className="flex-shrink-0 flex items-center justify-center p-4">
        <nav
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 px-3 py-2 text-white shadow-2xl backdrop-blur-xl select-none"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 100px rgba(3, 138, 237, 0.1)',
          }}
          aria-label="Wayfinder controls"
        >
          {hideSignage && (
            <Link
              to={signageLink}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-2 text-white/80 transition-all duration-300 hover:scale-110 hover:from-gray-600/50 hover:to-gray-700/50 hover:text-white hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-18 sm:w-18 mr-2"
              aria-label="Back to signage"
            >
              <Icon className="text-3xl sm:text-4xl drop-shadow-lg">arrow_back</Icon>
            </Link>
          )}
        <NavButton to={getLink('directory')} active={activeTab === 'directory'} icon="list_alt">
          Directory
        </NavButton>
        <NavButton to={getLink('wayfinding')} active={activeTab === 'wayfinding'} icon="explore">
          Wayfinding
        </NavButton>
        <NavButton to={getLink('events')} active={activeTab === 'events'} icon="event">
          Events
        </NavButton>
        <NavButton
          to={getLink('instagram')}
          active={activeTab === 'instagram'}
          icon="photo_camera"
        >
          Instagram
        </NavButton>
        <NavButton to={getLink('game')} active={activeTab === 'game'} icon="sports_esports">
          Game
        </NavButton>
        </nav>
      </div>
    </div>
  );
};

interface NavButtonProps {
  to: string;
  active: boolean;
  icon: string;
  children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ to, active, icon, children }) => {
  return (
    <Link
      to={to}
      className={`relative flex h-16 min-w-[5rem] flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-18 sm:min-w-28 sm:px-5 ${
        active
          ? 'bg-gradient-to-br from-[#038AED] to-[#0066CC] text-white shadow-lg shadow-[#038AED]/30 scale-105'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/20 to-transparent opacity-50" />
      )}
      <Icon className={`text-3xl sm:text-4xl ${active ? 'drop-shadow-lg' : ''}`}>{icon}</Icon>
      <span className={`text-xs font-semibold sm:text-sm ${active ? 'text-white' : 'text-white/80'}`}>
        {children}
      </span>
    </Link>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <PlaceOSProvider>
          <SettingsProvider>
            <SystemProvider>
              <AppContent />
            </SystemProvider>
          </SettingsProvider>
        </PlaceOSProvider>
      </AuthProvider>
    </HashRouter>
  );
};
