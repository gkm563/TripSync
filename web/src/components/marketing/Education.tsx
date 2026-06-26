import React from 'react';
import { Award, BookOpen, GraduationCap, Star, Sparkles } from 'lucide-react';

export const Education: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center', minHeight: '60vh', marginBottom: '60px' }}>
        
        {/* Visual graphic card */}
        <div style={{ display: 'flex', justifyContent: 'center', order: 1 }}>
          <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid var(--border-color)', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} style={{ color: 'var(--primary-color)' }} /> Born at IIT Delhi</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              The idea for TripSync was born during an intense **5-day event at IIT Delhi**. Dozens of hacking teams, college students, and volunteer coordinators struggled with complex expense splits after ordering joint meals and booking shared accommodation. TripSync resolved this by removing individual expense splitting and replacing it with a group-wide contribution ledger.
            </p>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Star size={16} style={{ color: 'var(--secondary-color)', fill: 'var(--secondary-color)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>100% Free Plan for Students</span>
            </div>
          </div>
        </div>

        {/* Text descriptions */}
        <div style={{ order: 0 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            backgroundColor: 'rgba(20, 184, 166, 0.1)', 
            color: 'var(--secondary-color)',
            fontWeight: 600,
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <GraduationCap size={14} /> Student Groups & Hackathons
          </div>
          
          <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2' }}>
            TripSync for <br/>
            <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Students & Hackathon Teams
            </span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.6' }}>
            Coordinate accommodation, joint meals, travel ticketing, and event supplies during hackathons, college tours, and student projects without any budget friction.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <BookOpen size={16} style={{ color: 'var(--primary-color)', marginTop: '4px' }} />
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}><b>Simplifying College Travels:</b> Focus on the learning and events, not on who ordered what snack. The ledger keeps splits completely democratic.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Award size={16} style={{ color: 'var(--primary-color)', marginTop: '4px' }} />
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}><b>Consensus Bill Validation:</b> Student group budgets are tight. Prevent accidental entry overstatements with standard majority approvals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
