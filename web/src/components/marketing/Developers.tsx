import { Mail, Globe, Shield, Code, Server, Heart } from 'lucide-react';

export const Developers: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      
      {/* Header Bio Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '50px', alignItems: 'center', marginBottom: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <img 
            src="/Gautam_Kumar_Maurya.jpg" 
            alt="Gautam Kumar Maurya (gkm563)" 
            style={{ width: '220px', height: '220px', borderRadius: '50%', objectFit: 'cover', border: '5px solid var(--primary-color)', boxShadow: 'var(--shadow-lg)' }} 
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Gautam Kumar Maurya</h1>
            <p style={{ fontSize: '1rem', color: 'var(--primary-color)', fontWeight: 600 }}>gkm / gkm563</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>Amroha, Uttar Pradesh, India</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <a href="https://github.com/gkm563" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            </a>
            <a href="https://linkedin.com/in/gkm563" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://gkm563.github.io" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Portfolio"><Globe size={18} /></a>
            <a href="mailto:gkmwin563@gmail.com" className="btn-secondary" style={{ padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Email"><Mail size={18} /></a>
          </div>
        </div>

        {/* Biography & Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-color)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>MEET THE DEVELOPER</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '4px' }}>Gautam Kumar Maurya</h2>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Lead Creator & Systems Architect of TripSync</h3>
          </div>
          
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            I am **Gautam Kumar Maurya** (globally known as **gkm563**), a passionate **Full-Stack Software Engineer** and **Cyber Security Specialist**. I specialize in creating high-integrity, real-time cooperative applications (like React Native and Firestore ledger syncing) and auditing network vulnerabilities. 
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            My development philosophy centers on creating premium, user-first mobile-responsive applications with zero-trust database transactions, minimal typing, and highly optimized mathematics. The idea for TripSync was sparked during a university hackathon at **IIT Delhi** and turned into a production app during my security investigations work with local cells.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Code size={18} style={{ color: 'var(--primary-color)', marginTop: '3px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Full-Stack Engineering</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TypeScript, React Native, Expo SDK, Node.js, Zustand state channels.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Shield size={18} style={{ color: 'var(--primary-color)', marginTop: '3px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Cyber Security & Forensics</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vulnerability audits, OSINT, CDR analysis, and investigative logs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amroha Police Internship Highlight Section */}
      <section className="glass" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', marginBottom: '60px' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} style={{ color: 'var(--primary-color)' }} /> 
          APCSIP-2026 Cyber Security Internship Origin
        </h3>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
          TripSync was built and tested during the official **Amroha Police Cyber Security Internship Program 2026 (APCSIP-2026)**, organized by the **Uttar Pradesh Police Cyber Crime Cell**. During field operations, investigative camps, and OSINT digital forensics missions, officers travel in collaborative groups. TripSync was designed to serve as a tamper-proof shared ledger to settle travel fuel, boarding, and local logistics expenses with complete transparency and zero admin hierarchy.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a href="https://gkm563.github.io/up-police-internship.html" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '12px 24px' }}>
            Read Gautam's Official Internship Log Journal
          </a>
          <a href="https://github.com/gkm563/TripSync" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '12px 24px' }}>
            Star on GitHub
          </a>
        </div>
      </section>

      {/* Developer Skills Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <Code size={24} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Frontend Dev</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Advanced React Native structures, Expo routers, web viewport breakpoints, CSS grid variables, and modular components.</p>
        </div>

        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <Server size={24} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Backend Sync</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Realtime synchronization databases via Firestore collections, Firebase Auth popup mechanisms, and FCM push notifications routing.</p>
        </div>

        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <Shield size={24} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Security Specialist</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>OSINT analysis, CDR data filtering, threat prevention vectors, and zero-trust cache clearance on system logout.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        Made with <Heart size={14} style={{ fill: 'hsl(var(--red))', color: 'hsl(var(--red))' }} /> by Gautam Kumar Maurya (gkm563) © {new Date().getFullYear()}
      </div>
    </div>
  );
};
