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

function App() {
  const { user, initialize } = useAuthStore();
  const [page, setPage] = useState<string>('landing');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    // Initialize Auth Store on app startup
    initialize();
  }, [initialize]);

  // Dynamic SEO Page Title update
  useEffect(() => {
    if (user) {
      document.title = "TripSync Dashboard — Group Contribution Tracking Ledger";
      return;
    }
    
    const titles: Record<string, string> = {
      landing: "TripSync — Premium Group Contribution & Settlement Tracker by Gautam Kumar Maurya (gkm563)",
      pricing: "TripSync Pricing — Simple Free & Pro split budget tracking",
      desktop: "tripsyncDesktop — Manage collaborative travel lists on laptop & PC",
      mobile: "tripsyncMobile — Android APK & iOS App Store downloads",
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
        onNavigate={(p) => setPage(p)}
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
