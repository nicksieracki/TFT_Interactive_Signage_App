import React, { useMemo } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { SignagePlayer } from './components/SignagePlayer';
import { Icon } from './components/Icon';
import { PlaceOSProvider } from './contexts/PlaceOSContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SystemProvider, useSystem } from './contexts/SystemContext';
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
    <div className="relative h-full w-full overflow-hidden bg-[var(--mat-sys-surface)]">
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

      <nav
        className="absolute bottom-3 left-1/2 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-lg border border-[#038AED]/30 bg-[#03121E]/95 p-1.5 text-white shadow-[0_18px_45px_rgba(0,11,19,0.45)] backdrop-blur-md select-none"
        aria-label="Wayfinder controls"
      >
        {hideSignage && (
          <Link
            to={signageLink}
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:w-15"
            aria-label="Back to signage"
          >
            <Icon className="text-3xl">arrow_back</Icon>
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
      className={`flex h-14 min-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-15 sm:min-w-24 sm:px-3 ${
        active ? 'bg-[#038AED] text-white shadow-[0_8px_24px_rgba(3,138,237,0.35)]' : ''
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="text-3xl">{icon}</Icon>
      <span className="text-[0.7rem] font-medium sm:text-xs">{children}</span>
    </Link>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PlaceOSProvider>
        <SettingsProvider>
          <SystemProvider>
            <AppContent />
          </SystemProvider>
        </SettingsProvider>
      </PlaceOSProvider>
    </BrowserRouter>
  );
};
