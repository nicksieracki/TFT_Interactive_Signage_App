import React, { useMemo, useState, useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SignagePlayer } from './components/SignagePlayer';
import { Icon } from './components/Icon';
import { AuthProvider } from './AuthContext';
import { PlaceOSProvider } from './PlaceOSContext';
import { SettingsProvider } from './SettingsContext';
import { SystemProvider, useSystem } from './SystemContext';
// import { useIdle } from './hooks/useIdle';  // Commented out - no automatic return to signage
import { DirectoryPage } from './pages/DirectoryPage';
import { EventsPage } from './pages/EventsPage';
import { GamePage } from './pages/GamePage';
import { InstagramPage } from './pages/InstagramPage';
import { SignagePage } from './pages/SignagePage';
import { WayfindingPage } from './pages/WayfindingPage';

// Define valid pages as a constant for cleaner logic
const VALID_PAGES = ['directory', 'wayfinding', 'events', 'instagram', 'game'] as const;
type ValidPage = typeof VALID_PAGES[number];

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { system } = useSystem();
  // useIdle();  // Disabled - no automatic return to signage

  // Nav is always visible when not in signage mode, no need for show/hide state

  // Detect if screen is horizontal (landscape)
  const [isHorizontal, setIsHorizontal] = useState(() => window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsHorizontal(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parse route - HashRouter provides route in pathname
  const activeTab = useMemo((): string => {
    const path = location.pathname.replace(/^\//, '').replace(/\/$/, '');
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return ''; // Root route
    } else if (segments.length === 1) {
      // Either a page or system ID
      const firstSegment = segments[0];
      return firstSegment && VALID_PAGES.includes(firstSegment as ValidPage) ? firstSegment : '';
    } else {
      // System ID + page
      const secondSegment = segments[1];
      return secondSegment && VALID_PAGES.includes(secondSegment as ValidPage) ? secondSegment : '';
    }
  }, [location.pathname]);

  const hideSignage = useMemo(
    () => VALID_PAGES.includes(activeTab as ValidPage),
    [activeTab],
  );

  // No longer needed - nav visibility is controlled by whether we're in signage mode

  // Simple navigation with system ID in path
  const navigateToPage = (page: string) => {
    const path = page === ''
      ? (system ? `/${system}` : '/')
      : (system ? `/${system}/${page}` : `/${page}`);

    navigate(path, { replace: true });
  };

  // No longer need touch-to-reveal logic since nav is always visible when needed

  // No touch-to-reveal logic needed anymore - nav is always visible when in navigation mode

  // In horizontal mode, signage is never hidden
  const shouldHideSignage = isHorizontal ? false : hideSignage;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--mat-sys-surface)]">
      {isHorizontal ? (
        // Horizontal split-screen layout
        <div className="flex h-full w-full">
          {/* Left half - Always shows signage (960x1080) */}
          <div className="w-1/2 h-full relative">
            <SignagePlayer hide={false} />
          </div>

          {/* Right half - Shows current route (960x1080) */}
          <div className="w-1/2 h-full relative flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Routes>
                {/* Routes without system */}
                <Route path="/" element={<div className="h-full w-full bg-black flex items-center justify-center text-white text-2xl">Select a page from the navigation</div>} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/wayfinding" element={<WayfindingPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/instagram" element={<InstagramPage />} />
                <Route path="/game" element={<GamePage />} />

                {/* Routes with system */}
                <Route path="/:system" element={<div className="h-full w-full bg-black flex items-center justify-center text-white text-2xl">Select a page from the navigation</div>} />
                <Route path="/:system/directory" element={<DirectoryPage />} />
                <Route path="/:system/wayfinding" element={<WayfindingPage />} />
                <Route path="/:system/events" element={<EventsPage />} />
                <Route path="/:system/instagram" element={<InstagramPage />} />
                <Route path="/:system/game" element={<GamePage />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        // Vertical full-screen layout
        <>
          <SignagePlayer hide={shouldHideSignage} />
          <div className={`absolute inset-0 z-10 ${!shouldHideSignage ? 'pointer-events-none' : ''}`}>
              <Routes>
                {/* Routes without system */}
                <Route path="/" element={<SignagePage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/wayfinding" element={<WayfindingPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/instagram" element={<InstagramPage />} />
                <Route path="/game" element={<GamePage />} />

                {/* Routes with system */}
                <Route path="/:system" element={<SignagePage />} />
                <Route path="/:system/directory" element={<DirectoryPage />} />
                <Route path="/:system/wayfinding" element={<WayfindingPage />} />
                <Route path="/:system/events" element={<EventsPage />} />
                <Route path="/:system/instagram" element={<InstagramPage />} />
                <Route path="/:system/game" element={<GamePage />} />
              </Routes>
          </div>
        </>
      )}

      {/* Navigation bar - absolute position, floating overlay, always visible */}
      <div
        className={`absolute bottom-0 ${isHorizontal ? 'left-1/2 right-0' : 'left-0 right-0'} flex items-center justify-center p-4 z-50 translate-y-0 opacity-100`}
      >
        <nav
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 px-3 py-2 text-white shadow-2xl backdrop-blur-xl select-none"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 100px rgba(3, 138, 237, 0.1)',
          }}
          aria-label="Wayfinder controls"
        >
          {hideSignage && !isHorizontal && (
            <button
              onClick={() => navigateToPage('')}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-2 text-white/80 transition-all duration-300 hover:scale-110 hover:from-gray-600/50 hover:to-gray-700/50 hover:text-white hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#FFD100] focus-visible:outline-none sm:h-18 sm:w-18 mr-2"
              aria-label="Back to signage"
            >
              <Icon className="text-3xl sm:text-4xl drop-shadow-lg">arrow_back</Icon>
            </button>
          )}
        <NavButton onClick={() => navigateToPage('directory')} active={activeTab === 'directory'} icon="list_alt">
          Directory
        </NavButton>
        <NavButton onClick={() => navigateToPage('wayfinding')} active={activeTab === 'wayfinding'} icon="explore">
          Wayfinding
        </NavButton>
        <NavButton onClick={() => navigateToPage('events')} active={activeTab === 'events'} icon="event">
          Events
        </NavButton>
        <NavButton
          onClick={() => navigateToPage('instagram')}
          active={activeTab === 'instagram'}
          icon="photo_camera"
        >
          Instagram
        </NavButton>
        <NavButton onClick={() => navigateToPage('game')} active={activeTab === 'game'} icon="sports_esports">
          Game
        </NavButton>
        </nav>
      </div>
    </div>
  );
};

interface NavButtonProps {
  onClick: () => void;
  active: boolean;
  icon: string;
  children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ onClick, active, icon, children }) => {
  return (
    <button
      onClick={onClick}
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
    </button>
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
