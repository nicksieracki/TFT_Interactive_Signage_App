import React, { useMemo, useState, useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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

// Define valid pages as a constant for cleaner logic
const VALID_PAGES = ['directory', 'wayfinding', 'events', 'instagram', 'game'] as const;
type ValidPage = typeof VALID_PAGES[number];

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { system } = useSystem();
  useIdle();

  const [showNav, setShowNav] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchRef = useRef<number>(0);
  const hasInitialized = useRef(false);

  // Simple route parsing - BrowserRouter paths are predictable
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

  // Pages with iframes should always show nav for better UX
  const alwaysShowNav = useMemo(
    () => activeTab !== '' && (['directory', 'events', 'game'] as readonly string[]).includes(activeTab),
    [activeTab],
  );

  // Pages with immersive content use touch-to-reveal nav
  const touchToRevealNav = useMemo(
    () => activeTab === '' || (['instagram', 'wayfinding'] as readonly string[]).includes(activeTab),
    [activeTab],
  );

  // Simple navigation with system ID in path
  const navigateToPage = (page: string) => {
    const path = page === ''
      ? (system ? `/${system}` : '/')
      : (system ? `/${system}/${page}` : `/${page}`);

    navigate(path, { replace: true });
  };

  // Show nav on touch, with debouncing to prevent interference
  const handleTouch = () => {
    const now = Date.now();
    // Debounce rapid touches
    if (now - lastTouchRef.current < 100) return;
    lastTouchRef.current = now;

    setShowNav(true);

    // Clear existing timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    // Auto-hide after 5 seconds
    hideTimerRef.current = setTimeout(() => {
      setShowNav(false);
    }, 5000);
  };

  // Touch-to-reveal nav logic (only for immersive content pages)
  useEffect(() => {
    // If on iframe page, nav should always be visible
    if (alwaysShowNav) {
      setShowNav(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      return;
    }

    // Only apply touch-to-reveal on immersive content pages
    if (!touchToRevealNav) {
      setShowNav(true);
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwiping = false;

    // Add touch listener to show nav
    const handleTouchStart = (e: TouchEvent) => {
      // Don't show nav if touching the nav itself or interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('nav')) return;
      if (target.closest('button')) return;
      if (target.closest('a')) return;
      if (target.closest('input')) return;
      if (target.closest('textarea')) return;
      if (target.closest('select')) return;

      const touch = e.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      isSwiping = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartTime) return;

      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);

      // If moved more than 10px, consider it a swipe/drag
      if (deltaX > 10 || deltaY > 10) {
        isSwiping = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartTime) return;

      const touchDuration = Date.now() - touchStartTime;
      const target = e.target as HTMLElement;

      // Only show nav for quick taps (not swipes or long presses)
      // and not on interactive elements
      if (!isSwiping && touchDuration < 500 && !target.closest('nav')) {
        handleTouch();
      }

      touchStartTime = 0;
    };

    // Also support mouse click for non-touch devices
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('nav')) return;
      if (target.closest('button')) return;
      if (target.closest('a')) return;
      if (target.closest('input')) return;
      if (target.closest('textarea')) return;
      if (target.closest('select')) return;

      handleTouch();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });

    // Show nav initially for 3 seconds on immersive pages (first time only)
    if (!hasInitialized.current) {
      setShowNav(true);
      hideTimerRef.current = setTimeout(() => {
        setShowNav(false);
      }, 3000);
      hasInitialized.current = true;
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('click', handleClick);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [alwaysShowNav, touchToRevealNav]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--mat-sys-surface)]">
      {/* Main content area - full screen */}
      <SignagePlayer hide={hideSignage} />
      <div className={`absolute inset-0 z-10 ${!hideSignage ? 'pointer-events-none' : ''}`}>
        <Routes>
          {/* Routes without system */}
          <Route path="/" element={<SignagePage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/wayfinding" element={<WayfindingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/instagram" element={<InstagramPage />} />
          <Route path="/game" element={<GamePage />} />

          {/* Routes with system - :system parameter will be picked up by SystemContext */}
          <Route path="/:system" element={<SignagePage />} />
          <Route path="/:system/directory" element={<DirectoryPage />} />
          <Route path="/:system/wayfinding" element={<WayfindingPage />} />
          <Route path="/:system/events" element={<EventsPage />} />
          <Route path="/:system/instagram" element={<InstagramPage />} />
          <Route path="/:system/game" element={<GamePage />} />
        </Routes>
      </div>

      {/* Navigation bar - absolute positioned overlay with animation */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex items-center justify-center p-4 z-50 transition-all duration-500 ease-in-out ${
          showNav || alwaysShowNav ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ pointerEvents: showNav || alwaysShowNav ? 'auto' : 'none' }}
      >
        <nav
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 px-3 py-2 text-white shadow-2xl backdrop-blur-xl select-none"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 100px rgba(3, 138, 237, 0.1)',
          }}
          aria-label="Wayfinder controls"
        >
          {hideSignage && (
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
