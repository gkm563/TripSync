import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  FileText, 
  Lock, 
  Smartphone, 
  ChevronRight, 
  Play, 
  Moon, 
  Sun 
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { usersList, login } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Simulated Interactive Settlement calculations for the mock screen demo
  const [simExpenses, setSimExpenses] = useState<{title: string, amount: number, paidBy: string}[]>([
    { title: 'Train Tickets', amount: 3000, paidBy: 'Praveen' },
    { title: 'Hotel Booking', amount: 6000, paidBy: 'Rohit' },
    { title: 'Lunch Cafe', amount: 1500, paidBy: 'Gautam' }
  ]);
  
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpPaidBy, setNewExpPaidBy] = useState('Praveen');
  
  const addSimExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle || !newExpAmount) return;
    setSimExpenses([...simExpenses, {
      title: newExpTitle,
      amount: parseFloat(newExpAmount),
      paidBy: newExpPaidBy
    }]);
    setNewExpTitle('');
    setNewExpAmount('');
  };

  // Quick calculate for simulated data
  const totalSim = simExpenses.reduce((sum, item) => sum + item.amount, 0);
  const perMemberSim = totalSim / 3;
  const contribs: Record<string, number> = { Gautam: 0, Rohit: 0, Praveen: 0 };
  simExpenses.forEach(exp => {
    contribs[exp.paidBy] += exp.amount;
  });
  const balancesSim = {
    Gautam: contribs.Gautam - perMemberSim,
    Rohit: contribs.Rohit - perMemberSim,
    Praveen: contribs.Praveen - perMemberSim
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleQuickLogin = async (email: string) => {
    try {
      await login(email);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <header className="landing-nav" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="logo-container">
          <Users size={28} style={{ stroke: 'url(#indTealGrad)' }} />
          <span>TripSync</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={toggleTheme} 
            className="btn-secondary" 
            style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => onOpenAuth('login')} className="btn-secondary">Sign In</button>
          <button onClick={() => onOpenAuth('register')} className="btn-primary">Get Started</button>
        </div>
      </header>

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
                onClick={() => {
                  const demoSection = document.getElementById('demo-login-section');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn-secondary" 
                style={{ padding: '14px 28px', fontSize: '1.05rem' }}
              >
                <Play size={16} fill="currentColor" /> Try Demo Profiles
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

          {/* Interactive Phone Screen Mockup */}
          <div className="hero-visual">
            <div className="hero-mockup-frame animate-float">
              <div className="hero-mockup-screen">
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>📱 TripSync Demo</span>
                  <span className="badge" style={{ backgroundColor: 'rgba(20, 184, 166, 0.2)', color: '#14b8a6', fontSize: '0.65rem' }}>Active</span>
                </div>
                
                {/* Stats */}
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', padding: '12px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #312e81' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Shared</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Per Person</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6366f1' }}>₹{totalSim}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>₹{perMemberSim.toFixed(0)}</span>
                  </div>
                </div>

                {/* Balances list */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Group Net Balances</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(balancesSim).map(([name, bal]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#1e293b', fontSize: '0.75rem' }}>
                        <span>{name}</span>
                        <span style={{ fontWeight: 700, color: bal >= 0 ? '#10b981' : '#f43f5e' }}>
                          {bal >= 0 ? `+₹${bal.toFixed(0)}` : `-₹${Math.abs(bal).toFixed(0)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated additions */}
                <form onSubmit={addSimExpense} style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                  <input 
                    type="text" 
                    placeholder="Expense" 
                    value={newExpTitle}
                    onChange={(e) => setNewExpTitle(e.target.value)}
                    style={{ flex: 2, padding: '6px 8px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
                  />
                  <input 
                    type="number" 
                    placeholder="₹" 
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    style={{ flex: 1, padding: '6px 8px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
                  />
                  <select
                    value={newExpPaidBy}
                    onChange={(e) => setNewExpPaidBy(e.target.value)}
                    style={{ padding: '4px 6px', fontSize: '0.7rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white' }}
                  >
                    <option value="Praveen">Praveen</option>
                    <option value="Gautam">Gautam</option>
                    <option value="Rohit">Rohit</option>
                  </select>
                  <button type="submit" style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: '#6366f1', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 'bold' }}>+</button>
                </form>

                {/* Expenses History */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Expense History ({simExpenses.length})</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {simExpenses.slice(-3).reverse().map((exp, i) => (
                      <div key={i} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', padding: '8px', borderRadius: '8px', backgroundColor: '#111827', borderLeft: '3px solid #6366f1', fontSize: '0.7rem' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'white' }}>{exp.title}</p>
                          <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Paid by {exp.paidBy}</p>
                        </div>
                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>₹{exp.amount}</span>
                      </div>
                    ))}
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

        {/* Demo Profiles Section */}
        <section id="demo-login-section" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)', margin: '40px 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Try TripSync Instant Demo</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            No sign up required. Select one of the pre-loaded members below to log into the test environment. Open multiple browser tabs under different members to experience instant sync approvals live!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            {usersList.map((user) => (
              <div 
                key={user.uid} 
                className="glass" 
                style={{ 
                  padding: '24px', 
                  borderRadius: '16px', 
                  width: '180px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleQuickLogin(user.email)}
              >
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }} 
                />
                <h4 style={{ fontSize: '1.1rem' }}>{user.name}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</p>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', width: '100%', marginTop: '6px' }}>
                  Login as {user.name}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', padding: '60px 24px 30px 24px', marginTop: '80px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', gap: '40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="logo-container">
              <Users size={24} style={{ stroke: 'url(#indTealGrad)' }} />
              <span>TripSync</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              Premium real-time settlement tracking for hackathons, tours, and small collaborative travel projects.
            </p>
          </div>
          <div>
            <h5 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Application</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><a href="#" onClick={() => onOpenAuth('login')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sign In Portal</a></li>
              <li><a href="#" onClick={() => onOpenAuth('register')} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sign Up Portal</a></li>
              <li><a href="#demo-login-section" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Quick Switch Demo</a></li>
            </ul>
          </div>
          <div>
            <h5 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Features</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><span style={{ color: 'var(--text-secondary)' }}>Instant Sync</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Consensus Voting</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Greedy Debt Settler</span></li>
            </ul>
          </div>
          <div>
            <h5 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Legal</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><span style={{ color: 'var(--text-secondary)' }}>Privacy Policy</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>Terms of Service</span></li>
              <li><span style={{ color: 'var(--text-secondary)' }}>MIT License</span></li>
            </ul>
          </div>
        </div>

        <div className="container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} TripSync. Created with premium UX design.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> Secure Client Connections</span>
          </div>
        </div>
      </footer>

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
