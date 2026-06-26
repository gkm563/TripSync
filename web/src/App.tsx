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
      landing: "TripSync — Premium Group Contribution & Settlement Tracker",
      pricing: "Pricing — TripSync",
      desktop: "Desktop App — TripSync",
      mobile: "Mobile App — TripSync",
      developers: "API & Developers — TripSync",
      features: "Features — TripSync",
      business: "TripSync for Business",
      education: "TripSync for Education",
      about: "About Us — TripSync",
      story: "Our Story — TripSync",
      blog: "Blog — TripSync",
      press: "Press — TripSync",
      legal: "Legal & Privacy — TripSync",
      contact: "Contact Us — TripSync",
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
