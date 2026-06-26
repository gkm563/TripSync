import React from 'react';
import { Users, Shield, Eye } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>About TripSync</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '600px', margin: '12px auto 0 auto' }}>
          Restoring harmony to group travels. We believe that tracking expenses should be democratic, simple, and secure.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <Eye size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Our Mission</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            To simplify group expense logistics by shifting from complex personal bill splits to collective contribution ledgers, freeing users to focus on travel, hackathons, and research events.
          </p>
        </div>

        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <Shield size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Our Values</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            We values democracy, transparency, and data integrity. With zero-hierarchy design, real-time Firestore sync, and tamper-proof version trails, every participant has an equal voice.
          </p>
        </div>

        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <Users size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Lead Architect</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            TripSync was created, designed, and coded by **Gautam Kumar Maurya (gkm563)**, a Full-Stack Engineer and Cyber Security Intern, as part of Uttar Pradesh Police Cyber Crime Cell program.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Interested in Contributing?</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
          TripSync is a secure, open-source project licensed under the MIT License. Contributions to our React Native core mobile app or Vite web dashboard repositories are always welcome!
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="https://github.com/gkm563/TripSync" target="_blank" rel="noreferrer" className="btn-primary">View GitHub Repository</a>
          <a href="mailto:gkmwin563@gmail.com" className="btn-secondary">Email Support Team</a>
        </div>
      </div>
    </div>
  );
};
