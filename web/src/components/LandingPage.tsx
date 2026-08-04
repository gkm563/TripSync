import React from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  FileText, 
  Smartphone, 
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ height: '40px' }}></div>

      {/* Hero Section */}
      <main className="container">
        <section className="landing-hero">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--primary-color)',
              fontWeight: 600,
              fontSize: '0.85rem',
              width: 'fit-content'
            }}>
              <Smartphone size={14} /> Mobile App + Web Synchronized
            </div>
            
            <h1 style={{ fontSize: '3.6rem', lineHeight: '1.15', color: 'var(--text-primary)' }}>
              Group Contributions,<br/>
              <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Synced Instantly.
              </span>
            </h1>
            
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              Track group contributions for internships, hackathons, and trips. No ownership, no admin hierarchy. Every expense requires a consensus. Settled with a single click.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
              <button onClick={() => onOpenAuth('register')} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
                Create Free Account <ChevronRight size={18} />
              </button>
              <button 
                onClick={() => onOpenAuth('login')} 
                className="btn-secondary" 
                style={{ padding: '14px 28px', fontSize: '1.05rem' }}
              >
                Sign In to Dashboard
              </button>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '40px', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>100%</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Realtime Database Synced</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)' }}>&lt; 5s</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Settlement Optimization</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: 'hsl(var(--green))' }}>0</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Math Stress/Conflicts</p>
              </div>
            </div>
          </div>

          {/* App Preview Card */}
          <div className="hero-visual">
            <div className="hero-mockup-frame animate-float">
              <div className="hero-mockup-screen">
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>⚡ TripSync Dashboard</span>
                  <span className="badge" style={{ backgroundColor: 'rgba(20, 184, 166, 0.2)', color: '#14b8a6', fontSize: '0.7rem' }}>Synchronized</span>
                </div>
                
                {/* Stats */}
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #312e81' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Trip Ledger</span>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Zero Math Stress</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' }}>₹10,500</span>
                    <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>3 Members Settled</span>
                  </div>
                </div>

                {/* Balances list */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Consensus Approved Ledger</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', fontSize: '0.8rem' }}>
                      <span>Praveen</span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>+₹1,500</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', fontSize: '0.8rem' }}>
                      <span>Rohit</span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>+₹2,000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', fontSize: '0.8rem' }}>
                      <span>Gautam</span>
                      <span style={{ fontWeight: 700, color: '#f43f5e' }}>-₹3,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="landing-features">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Engineered for Group Trips</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Say goodbye to awkward budget sheets and endless calculation arguments.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', marginBottom: '20px' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Real-Time Synchronization</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                When someone adds an expense, edits a detail, or registers a payment, all connected devices update instantly without manual refreshes.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-color)', marginBottom: '20px' }}>
                <CheckCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Consensus Approval Queue</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Expenses are only validated in the balance when a majority of members approve. Rejection flags require concrete notes to ensure full team trust.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--orange))', marginBottom: '20px' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Greedy Debts Simplifier</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                The engine processes balances and matches creditors to debtors. It reduces final settlements to the absolute minimum possible transaction paths.
              </p>
            </div>

            <div className="feature-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899', marginBottom: '20px' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Comprehensive Exporting</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Export complete travel summaries to Excel spreadsheets, print professionally designed PDF statements, or share settlement text updates via WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section id="demo-login-section" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)', margin: '40px 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Start Splitting Expenses Effortlessly</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Join thousands of travelers, internship groups, and teams. Create your account in seconds or sign in to access your synchronized trips across mobile and web!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onOpenAuth('register')} 
              className="btn-primary" 
              style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 700 }}
            >
              Create Free Account <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => onOpenAuth('login')} 
              className="btn-secondary" 
              style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 700 }}
            >
              Sign In to Dashboard
            </button>
          </div>
        </section>
      </main>



      {/* SVG Gradient definitions for general icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="indTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(99, 102, 241)" />
            <stop offset="100%" stopColor="rgb(20, 184, 166)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
