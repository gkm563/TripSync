import React from 'react';
import { Check, Shield } from 'lucide-react';

interface PricingProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenAuth }) => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Simple, Transparent Pricing</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '600px', margin: '12px auto 0 auto' }}>
          Choose a plan that fits your travel style. From casual weekend tours to massive hacking teams and police forensics units.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'stretch', maxWidth: '1100px', margin: '0 auto' }}>
        {/* FREE PLAN */}
        <div className="glass" style={{ padding: '40px 30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', textAlign: 'left', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Free Basic</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px' }}>For weekend friends & student groups</p>
          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>₹0</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ lifetime free</span>
          </div>
          <button onClick={() => onOpenAuth('register')} className="btn-secondary" style={{ width: '100%', padding: '12px', marginBottom: '30px' }}>Get Started Free</button>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Up to 5 Active Trips</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> 10 Members per Trip</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Real-time Database Sync</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Consensus Voting & Review Queue</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Excel & PDF Exports</li>
          </ul>
        </div>

        {/* PRO PLAN */}
        <div className="glass" style={{ padding: '40px 30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', textAlign: 'left', border: '2px solid var(--primary-color)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 10px', borderRadius: '12px', background: 'var(--grad-primary)', color: 'white', fontSize: '0.72rem', fontWeight: 'bold' }}>POPULAR</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Pro Traveler</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px' }}>For frequent travelers & hackathon teams</p>
          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>₹99</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ month</span>
          </div>
          <button onClick={() => onOpenAuth('register')} className="btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '30px' }}>Upgrade to Pro</button>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Everything in Free</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Unlimited Active Trips</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Up to 50 Members per Trip</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Advanced Visual Analytics</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Automated WhatsApp Receipts</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> UPI Payment QR Generators</li>
          </ul>
        </div>

        {/* ENTERPRISE PLAN */}
        <div className="glass" style={{ padding: '40px 30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', textAlign: 'left', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Custom/Gov</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px' }}>For corporate travel & police cyber cells</p>
          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>Custom</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ enterprise</span>
          </div>
          <button onClick={() => window.open('mailto:gkmwin563@gmail.com')} className="btn-secondary" style={{ width: '100%', padding: '12px', marginBottom: '30px' }}>Contact Gautam (GKM)</button>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Custom Ledger Abstractions</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Local Air-Gapped Network Support</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Digital Forensics Expense Logging</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> Dedicated 24/7 Security Support</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={16} style={{ color: 'hsl(var(--green))' }} /> SSO / Active Directory Sign-in</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '60px', padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
        <Shield size={20} style={{ color: 'var(--primary-color)' }} />
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>All data stored in Firestore is encrypted. Payments processed safely via UPI channels.</span>
      </div>
    </div>
  );
};
