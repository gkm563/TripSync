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
                <button onClick={() => handleLinkClick('desktop')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>TripSync Desktop</button>
                <button onClick={() => handleLinkClick('mobile')} className="btn-text" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', padding: '8px' }}>TripSync Mobile</button>
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
        <div className="mobile-menu-drawer">
          <div className="mobile-menu-inner">
            {/* Primary Navigation links */}
            <nav className="mobile-menu-nav">
              <button onClick={() => handleLinkClick('features')} className="mobile-menu-link-wrapper" style={{ '--delay': 1 } as React.CSSProperties}>
                <span className="mobile-menu-number">01</span>
                <span className="mobile-menu-large-link">Features</span>
              </button>
              
              <button onClick={() => handleLinkClick('pricing')} className="mobile-menu-link-wrapper" style={{ '--delay': 2 } as React.CSSProperties}>
                <span className="mobile-menu-number">02</span>
                <span className="mobile-menu-large-link">Pricing Plans</span>
              </button>

              <button onClick={() => handleLinkClick('desktop')} className="mobile-menu-link-wrapper" style={{ '--delay': 3 } as React.CSSProperties}>
                <span className="mobile-menu-number">03</span>
                <span className="mobile-menu-large-link">TripSync Desktop</span>
              </button>

              <button onClick={() => handleLinkClick('mobile')} className="mobile-menu-link-wrapper" style={{ '--delay': 4 } as React.CSSProperties}>
                <span className="mobile-menu-number">04</span>
                <span className="mobile-menu-large-link">TripSync Mobile</span>
              </button>

              <button onClick={() => handleLinkClick('developers')} className="mobile-menu-link-wrapper" style={{ '--delay': 5 } as React.CSSProperties}>
                <span className="mobile-menu-number">05</span>
                <span className="mobile-menu-large-link" style={{ color: 'var(--primary-color)' }}>Developers</span>
              </button>
            </nav>

            {/* Secondary navigation subsections */}
            <div className="mobile-menu-subsections">
              <div className="mobile-menu-subcol">
                <h5 className="mobile-menu-subcol-title">Solutions</h5>
                <button onClick={() => handleLinkClick('business')} className="mobile-menu-sublink">Corporate Travel</button>
                <button onClick={() => handleLinkClick('education')} className="mobile-menu-sublink">Education Groups</button>
              </div>

              <div className="mobile-menu-subcol">
                <h5 className="mobile-menu-subcol-title">Company</h5>
                <button onClick={() => handleLinkClick('about')} className="mobile-menu-sublink">About Us</button>
                <button onClick={() => handleLinkClick('story')} className="mobile-menu-sublink">Our Story</button>
                <button onClick={() => handleLinkClick('blog')} className="mobile-menu-sublink">Tech Blog</button>
                <button onClick={() => handleLinkClick('press')} className="mobile-menu-sublink">Press Kits</button>
                <button onClick={() => handleLinkClick('legal')} className="mobile-menu-sublink">Legal & Terms</button>
                <button onClick={() => handleLinkClick('contact')} className="mobile-menu-sublink">Contact Support</button>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="mobile-menu-footer-actions">
              <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="btn btn-secondary">Sign In</button>
              <button onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }} className="btn btn-primary">Get Started</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

      {/* Sitemap Footer */}
      <footer className="site-footer">
        <div className="footer-inner container">
          
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-col">
              <div className="footer-brand-logo" style={{ cursor: 'pointer' }} onClick={() => handleLinkClick('landing')}>
                <Users size={26} style={{ stroke: 'url(#menuGrad)', marginRight: '6px' }} />
                <span>TripSync</span>
              </div>
              <p className="footer-description">
                Premium real-time settlement tracking for hackathons, tours, and small collaborative travel projects. Fully secure, audited, and optimized for instant peer-to-peer verification.
              </p>
              
              {/* Social Media Link Buttons */}
              <div className="footer-socials">
                <a href="https://github.com/gkm563" target="_blank" rel="noreferrer" className="footer-social-icon" title="GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
                <a href="https://linkedin.com/in/gkm563" target="_blank" rel="noreferrer" className="footer-social-icon" title="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a href="https://gkm563.github.io" target="_blank" rel="noreferrer" className="footer-social-icon" title="Portfolio Website">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
                <a href="mailto:gkmwin563@gmail.com" className="footer-social-icon" title="Email Developer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div className="footer-col">
              <h5 className="footer-heading">PRODUCT</h5>
              <ul className="footer-links-list">
                <li><button onClick={() => handleLinkClick('features')} className="footer-link">Features</button></li>
                <li><button onClick={() => handleLinkClick('pricing')} className="footer-link">Pricing</button></li>
                <li><button onClick={() => handleLinkClick('desktop')} className="footer-link">TripSync Desktop</button></li>
                <li><button onClick={() => handleLinkClick('mobile')} className="footer-link">TripSync Mobile</button></li>
                <li><button onClick={() => handleLinkClick('developers')} className="footer-link" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Developers</button></li>
              </ul>
            </div>

            {/* Solutions Column */}
            <div className="footer-col">
              <h5 className="footer-heading">SOLUTIONS</h5>
              <ul className="footer-links-list">
                <li><button onClick={() => handleLinkClick('business')} className="footer-link">Business Trips</button></li>
                <li><button onClick={() => handleLinkClick('education')} className="footer-link">Education Groups</button></li>
              </ul>
            </div>

            {/* Downloads / App Store Badge Column */}
            <div className="footer-col">
              <h5 className="footer-heading">DOWNLOADS</h5>
              <div className="footer-badge-container">
                {/* Google Play Styled Button */}
                <a href="#" className="footer-badge-link" onClick={(e) => e.preventDefault()} title="Get it on Google Play">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0d9488' }}>
                    <path d="M3.609 1.814L13.78 12 3.609 22.186c-.18.18-.328.087-.328-.168V1.982c0-.255.148-.348.328-.168zM14.654 11.127l2.843-1.636c.465-.267.465-.705 0-.972l-2.843-1.636-.88 1.134 2.106 1.474-2.106 1.474.88 1.162zM3.86 1.579l10.971 7.747 1.096-1.41L4.956.169c-.279-.161-.599-.074-.712.193L3.86 1.579zm10.971 13.101L3.86 22.421l.384 1.217c.113.267.433.354.712.193l10.971-7.576-1.096-1.576z"/>
                  </svg>
                  <div className="badge-text-container">
                    <span className="badge-subtitle">GET IT ON</span>
                    <span className="badge-title">Google Play</span>
                  </div>
                </a>
                
                {/* App Store Styled Button */}
                <a href="#" className="footer-badge-link" onClick={(e) => e.preventDefault()} title="Download on the App Store">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-primary)' }}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08 2.15.48 2.81-1.33z"/>
                  </svg>
                  <div className="badge-text-container">
                    <span className="badge-subtitle">DOWNLOAD ON THE</span>
                    <span className="badge-title">App Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Dynamic SEO Block */}
          <div className="footer-seo-block">
            <strong>TripSync</strong> by <span className="footer-seo-keywords">Gautam Kumar Maurya (gkm563)</span> is a premium, secure expense splitting application and consensus-based settlement ledger. Originally sparked at <span className="footer-seo-keywords">IIT Delhi</span>, it has been developed to adhere to cyber forensics standards for the <span className="footer-seo-keywords">APCSIP-2026 Cyber Security Internship Program</span> with the <span className="footer-seo-keywords">Amroha Police (Uttar Pradesh Police) Cyber Crime Cell</span>. Designed for multi-platform synchronization across both web and mobile clients (TripSync Mobile, TripSync Desktop), it streamlines group spending verification, audit trails, and settlement minimization.
          </div>

          {/* Bottom Copyright & Badges */}
          <div className="footer-bottom-row">
            <p>© {new Date().getFullYear()} TripSync. Created with premium UI/UX design by <b>Gautam Kumar Maurya (gkm563)</b>. All rights reserved.</p>
            <div className="footer-bottom-badges">
              <span className="footer-status-pill">
                <ShieldCheck size={14} style={{ color: '#0d9488' }} /> Cyber-Safe Ledger
              </span>
              <span className="footer-status-pill">
                <Sparkles size={14} style={{ color: '#6366f1' }} /> APCSIP-2026
              </span>
            </div>
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
