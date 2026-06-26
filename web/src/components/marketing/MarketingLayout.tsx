import React, { useState } from 'react';
import { 
  Users, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface MarketingLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ 
  children, 
  onNavigate, 
  onOpenAuth 
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'product' | 'solutions' | 'company' | null>(null);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLinkClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDropdown = (dropdown: 'product' | 'solutions' | 'company') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header Navigation */}
      <header className="landing-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          className="logo-container" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => handleLinkClick('landing')}
        >
          <Users size={26} style={{ stroke: 'url(#menuGrad)' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>TripSync</span>
        </div>

        {/* Desktop Menu links */}
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="desktop-only-flex">
          {/* PRODUCT DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => toggleDropdown('product')}
              className="btn-text" 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', fontWeight: 600, color: activeDropdown === 'product' ? 'var(--primary-color)' : 'var(--text-primary)' }}
            >
              Product <ChevronDown size={14} />
            </button>
            {activeDropdown === 'product' && (
              <div className="glass" style={{ position: 'absolute', top: '45px', left: 0, width: '200px', borderRadius: '12px', padding: '8px', zIndex: 150, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={() => handleLinkClick('features')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Features</button>
                <button onClick={() => handleLinkClick('pricing')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Pricing</button>
                <button onClick={() => handleLinkClick('desktop')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>tripsyncDesktop</button>
                <button onClick={() => handleLinkClick('mobile')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>tripsyncMobile</button>
                <button onClick={() => handleLinkClick('developers')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px', fontWeight: 700, color: 'var(--primary-color)' }}>Developers</button>
              </div>
            )}
          </div>

          {/* SOLUTIONS DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => toggleDropdown('solutions')}
              className="btn-text" 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', fontWeight: 600, color: activeDropdown === 'solutions' ? 'var(--primary-color)' : 'var(--text-primary)' }}
            >
              Solutions <ChevronDown size={14} />
            </button>
            {activeDropdown === 'solutions' && (
              <div className="glass" style={{ position: 'absolute', top: '45px', left: 0, width: '180px', borderRadius: '12px', padding: '8px', zIndex: 150, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={() => handleLinkClick('business')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Business</button>
                <button onClick={() => handleLinkClick('education')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Education</button>
              </div>
            )}
          </div>

          {/* COMPANY DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => toggleDropdown('company')}
              className="btn-text" 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', fontWeight: 600, color: activeDropdown === 'company' ? 'var(--primary-color)' : 'var(--text-primary)' }}
            >
              Company <ChevronDown size={14} />
            </button>
            {activeDropdown === 'company' && (
              <div className="glass" style={{ position: 'absolute', top: '45px', right: 0, width: '180px', borderRadius: '12px', padding: '8px', zIndex: 150, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={() => handleLinkClick('about')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>About Us</button>
                <button onClick={() => handleLinkClick('story')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Our Story</button>
                <button onClick={() => handleLinkClick('blog')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Blog Feed</button>
                <button onClick={() => handleLinkClick('press')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Press Releases</button>
                <button onClick={() => handleLinkClick('legal')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Legal & Privacy</button>
                <button onClick={() => handleLinkClick('contact')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>Contact</button>
              </div>
            )}
          </div>
        </nav>

        {/* Buttons & Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleTheme} 
            className="btn-secondary" 
            style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle Light/Dark"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button onClick={() => onOpenAuth('login')} className="btn-secondary desktop-only">Sign In</button>
          <button onClick={() => onOpenAuth('register')} className="btn-primary desktop-only">Get Started</button>
          
          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="btn-secondary mobile-only" 
            style={{ padding: '8px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="glass animate-slide-up" style={{ position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0, zIndex: 90, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px' }}>
              <button onClick={() => handleLinkClick('features')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Features</button>
              <button onClick={() => handleLinkClick('pricing')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Pricing</button>
              <button onClick={() => handleLinkClick('desktop')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>tripsyncDesktop</button>
              <button onClick={() => handleLinkClick('mobile')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>tripsyncMobile</button>
              <button onClick={() => handleLinkClick('developers')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0, color: 'var(--primary-color)', fontWeight: 'bold' }}>Developers (Gautam Kumar Maurya)</button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Solutions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px' }}>
              <button onClick={() => handleLinkClick('business')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Business Operations</button>
              <button onClick={() => handleLinkClick('education')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Education Groups</button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px' }}>
              <button onClick={() => handleLinkClick('about')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>About Us</button>
              <button onClick={() => handleLinkClick('story')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Our Story</button>
              <button onClick={() => handleLinkClick('blog')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Blog Feed</button>
              <button onClick={() => handleLinkClick('press')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Press Releases</button>
              <button onClick={() => handleLinkClick('legal')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Legal & Privacy</button>
              <button onClick={() => handleLinkClick('contact')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', padding: 0 }}>Contact</button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="btn-secondary" style={{ width: '100%' }}>Sign In</button>
            <button onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }} className="btn-primary" style={{ width: '100%' }}>Get Started</button>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

      {/* Sitemap Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', padding: '60px 24px 30px 24px', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => handleLinkClick('landing')}>
              <Users size={24} style={{ stroke: 'url(#menuGrad)' }} />
              <span>TripSync</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Premium real-time settlement tracking for hackathons, tours, and small collaborative travel projects.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {/* Google Play Styled Button */}
              <a href="#" className="btn-secondary" style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', justifyContent: 'flex-start', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.78 12 3.609 22.186c-.18.18-.328.087-.328-.168V1.982c0-.255.148-.348.328-.168zM14.654 11.127l2.843-1.636c.465-.267.465-.705 0-.972l-2.843-1.636-.88 1.134 2.106 1.474-2.106 1.474.88 1.162zM3.86 1.579l10.971 7.747 1.096-1.41L4.956.169c-.279-.161-.599-.074-.712.193L3.86 1.579zm10.971 13.101L3.86 22.421l.384 1.217c.113.267.433.354.712.193l10.971-7.576-1.096-1.576z"/>
                </svg>
                Get it on Google Play
              </a>
              {/* App Store Styled Button */}
              <a href="#" className="btn-secondary" style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', justifyContent: 'flex-start', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08 2.15.48 2.81-1.33z"/>
                </svg>
                Download on App Store
              </a>
            </div>
          </div>

          <div>
            <h5 style={{ fontSize: '0.92rem', marginBottom: '16px', color: 'var(--text-primary)' }}>PRODUCT</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><a href="#" onClick={() => handleLinkClick('features')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a></li>
              <li><a href="#" onClick={() => handleLinkClick('pricing')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing</a></li>
              <li><a href="#" onClick={() => handleLinkClick('desktop')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>tripsyncDesktop</a></li>
              <li><a href="#" onClick={() => handleLinkClick('mobile')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>tripsyncMobile</a></li>
              <li><a href="#" onClick={() => handleLinkClick('developers')} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Developers</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '0.92rem', marginBottom: '16px', color: 'var(--text-primary)' }}>SOLUTIONS</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><a href="#" onClick={() => handleLinkClick('business')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Business Trips</a></li>
              <li><a href="#" onClick={() => handleLinkClick('education')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Education Groups</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '0.92rem', marginBottom: '16px', color: 'var(--text-primary)' }}>COMPANY</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><a href="#" onClick={() => handleLinkClick('about')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Us</a></li>
              <li><a href="#" onClick={() => handleLinkClick('story')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Our Story</a></li>
              <li><a href="#" onClick={() => handleLinkClick('blog')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Blog Feed</a></li>
              <li><a href="#" onClick={() => handleLinkClick('press')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Press Releases</a></li>
              <li><a href="#" onClick={() => handleLinkClick('legal')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Legal & Privacy</a></li>
              <li><a href="#" onClick={() => handleLinkClick('contact')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '10px' }}>
          <p>© {new Date().getFullYear()} TripSync. Created with premium UI/UX by <b>Gautam Kumar Maurya (gkm563)</b>.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> Cyber-Safe Ledger</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={14} /> APCSIP-2026</span>
          </div>
        </div>
      </footer>

      {/* SVG Gradient definitions for menu icon */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="menuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(99, 102, 241)" />
            <stop offset="100%" stopColor="rgb(20, 184, 166)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
