import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { MarketingLayout } from './components/marketing/MarketingLayout';
import { Pricing } from './components/marketing/Pricing';
import { DesktopPage } from './components/marketing/DesktopPage';
import { MobilePage } from './components/marketing/MobilePage';
import { Developers } from './components/marketing/Developers';
import { Features } from './components/marketing/Features';
import { Business } from './components/marketing/Business';
import { Education } from './components/marketing/Education';
import { AboutUs } from './components/marketing/AboutUs';
import { Story } from './components/marketing/Story';
import { Blog } from './components/marketing/Blog';
import { Press } from './components/marketing/Press';
import { LegalPrivacy } from './components/marketing/LegalPrivacy';
import { Contact } from './components/marketing/Contact';

export const getBasePath = () => {
  return window.location.pathname.startsWith('/TripSync') ? '/TripSync' : '';
};

const getInitialPage = () => {
  const base = getBasePath();
  let path = window.location.pathname;
  
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  
  path = path.replace(/^\/|\/$/g, '');
  
  // Check hash for GitHub Pages redirects / hash routes
  if (window.location.hash) {
    const hashPath = window.location.hash.replace(/^#\/?|\/$/g, '');
    if (hashPath) path = hashPath;
  }
  
  if (!path) return 'landing';
  
  const validPages = [
    'landing', 'pricing', 'desktop', 'mobile', 'developers', 
    'features', 'business', 'education', 'about', 'story', 
    'blog', 'press', 'legal', 'contact'
  ];
  
  if (validPages.includes(path)) {
    return path;
  }
  
  if (path === 'developer') return 'developers';
  if (path === 'privacy' || path === 'terms') return 'legal';
  
  return 'landing';
};

function App() {
  const { user, initialize } = useAuthStore();
  const [page, setPage] = useState<string>(getInitialPage());
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    // Initialize Auth Store on app startup
    initialize();
  }, [initialize]);

  // Synchronize browser history and popstate navigation (Back / Forward)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setPage(event.state.page);
      } else {
        setPage(getInitialPage());
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (p: string) => {
    setPage(p);
    const base = getBasePath();
    const targetPath = p === 'landing' ? `${base}/` : `${base}/${p}`;
    window.history.pushState({ page: p }, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic SEO Page Title update
  useEffect(() => {
    if (user) {
      document.title = "TripSync Dashboard — Group Contribution Tracking Ledger";
      return;
    }

    const titles: Record<string, string> = {
      landing: "TripSync — Premium Group Contribution & Settlement Tracker by Gautam Kumar Maurya (gkm563)",
      pricing: "TripSync Pricing — Simple Free & Pro split budget tracking",
      desktop: "TripSync Desktop — Manage collaborative travel lists on laptop & PC",
      mobile: "TripSync Mobile — Android APK & iOS App Store downloads",
      developers: "Gautam Kumar Maurya (gkm563) — Lead systems architect biography",
      features: "TripSync Features — Consensus queues, audit logs & duplicate checks",
      business: "TripSync Solutions — Secure audits & travel ledger splits for business teams",
      education: "TripSync Solutions — Budget tracking for hackathons & IIT Delhi event stories",
      about: "About TripSync — Creator biography and open-source product values",
      story: "TripSync Origin Story — University event sparks & APCSIP-2026 logs",
      blog: "TripSync Blog — Digital ledger forensics & TypeScript split algorithms",
      press: "Press releases and official media announcements — Gautam Kumar Maurya",
      legal: "TripSync Legal & Privacy — Encryption, data policies, and MIT license",
      contact: "Contact Gautam Kumar Maurya (gkm563) — TripSync support and integrations"
    };

    document.title = titles[page] || "TripSync — Premium Group Contribution & Settlement Tracker";
  }, [page, user]);

  if (user) {
    return <Dashboard />;
  }

  const renderMarketingPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage onOpenAuth={(mode) => setAuthModal(mode)} />;
      case 'pricing':
        return <Pricing onOpenAuth={(mode) => setAuthModal(mode)} />;
      case 'desktop':
        return <DesktopPage />;
      case 'mobile':
        return <MobilePage />;
      case 'developers':
        return <Developers />;
      case 'features':
        return <Features />;
      case 'business':
        return <Business />;
      case 'education':
        return <Education />;
      case 'about':
        return <AboutUs />;
      case 'story':
        return <Story />;
      case 'blog':
        return <Blog />;
      case 'press':
        return <Press />;
      case 'legal':
        return <LegalPrivacy />;
      case 'contact':
        return <Contact />;
      default:
        return <LandingPage onOpenAuth={(mode) => setAuthModal(mode)} />;
    }
  };

  return (
    <>
      <MarketingLayout 
        onNavigate={navigateTo}
        onOpenAuth={(mode) => setAuthModal(mode)}
      >
        {renderMarketingPage()}
      </MarketingLayout>

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
