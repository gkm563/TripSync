import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';

function App() {
  const { user, initialize } = useAuthStore();
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    // Initialize Auth Store on app startup
    initialize();
  }, [initialize]);

  return (
    <>
      {user ? (
        <Dashboard />
      ) : (
        <LandingPage onOpenAuth={(mode) => setAuthModal(mode)} />
      )}

      {/* Auth Popups */}
      {authModal && (
        <AuthModal 
          initialMode={authModal} 
          onClose={() => setAuthModal(null)} 
        />
      )}
    </>
  );
}

export default App;
