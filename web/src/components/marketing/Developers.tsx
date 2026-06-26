import React, { useEffect, useState, useRef } from 'react';
import { 
  Mail, 
  Globe, 
  Shield, 
  Code, 
  Server, 
  Heart, 
  Calendar, 
  Terminal, 
  Cpu, 
  Award 
} from 'lucide-react';

export const Developers: React.FC = () => {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "gkm563@tripsync-cyber:~$ ./verify_ledger_integrity.sh --quick",
    "[SYSTEM] Host: Prayagraj, UP, India Cyber Crime Cell",
    "[SYSTEM] Forensic Integrity Module version 1.0.4-stable loaded.",
    "[INFO] Ready. Click 'Run Forensic Audit' to verify decentralized blocks."
  ]);
  const [isAuditing, setIsAuditing] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const runForensicAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    
    const logs = [
      "gkm563@tripsync-cyber:~$ ./verify_ledger_integrity.sh --full --visualize",
      "[INIT] Spawning forensic verification sub-routines...",
      "[DB] Connecting to Firestore encrypted state channel... [CONNECTED]",
      "[OSINT] Querying local and remote ledger databases...",
      "[OSINT] Synchronizing offline cache checkpoints... [OK]",
      "[OSINT] Scanning network IPDR (Internet Protocol Detail Record) logs...",
      "[OSINT] IPDR audit trail matches ledger history exactly.",
      "[ALGO] Running Greedy Settlement graph optimizer...",
      "       - 5 active members found in travel block",
      "       - Total initial debt: 3,450 INR (12 transactions)",
      "       - Minimized transactions: 3 (settlement optimized by 75%)",
      "       - Optimality verification: PASS",
      "[CONSENSUS] Validating block consensus checks...",
      "            - Peer 1 (gkm563): APPROVED [Signature OK]",
      "            - Peer 2 (Co-investigator): APPROVED [Signature OK]",
      "            - Peer 3 (UP Police Cyber Cell): APPROVED [Signature OK]",
      "[INTEGRITY] SHA-256: 4f7c89a05b38cfde882f0c77a112df67 [MATCH]",
      "[SUCCESS] Forensic ledger integrity verified.",
      "[SUCCESS] Status: SECURE & TAMPER-PROOF."
    ];

    setTerminalLogs([logs[0]]);
    
    let currentIndex = 1;
    const interval = setInterval(() => {
      if (currentIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsAuditing(false);
      }
    }, 280);
  };

  useEffect(() => {
    // Dynamic SEO Metadata updates
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Meet Gautam Kumar Maurya (gkm563), the lead full-stack systems architect of TripSync. Read about the developmental origin of the consensus expense ledger at IIT Delhi and APCSIP-2026.');

    // Inject JSON-LD Schema.org Structured Data to enable rich snippet indexing in Google Search
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'json-ld-developers';
    schemaScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Gautam Kumar Maurya",
      "alternateName": "gkm563",
      "url": "https://gkm563.github.io",
      "image": "https://gkm563.github.io/Gautam_Kumar_Maurya.jpg",
      "sameAs": [
        "https://github.com/gkm563",
        "https://linkedin.com/in/gkm563"
      ],
      "jobTitle": "Full-Stack Software Engineer & Cyber Security Specialist",
      "knowsAbout": [
        "Software Engineering", 
        "Cyber Security", 
        "React Native", 
        "Expo SDK", 
        "Forensic Ledger Split Algorithms"
      ],
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "IIT Delhi"
      },
      "description": "Developer of TripSync, a secure decentralized group expense ledger designed during the APCSIP-2026 Cyber Crime Cell Internship."
    });
    document.head.appendChild(schemaScript);

    return () => {
      // Cleanup on unmount to prevent duplicate scripts
      const existingScript = document.getElementById('json-ld-developers');
      if (existingScript) existingScript.remove();
    };
  }, []);

  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      
      {/* Header Bio Profile Card */}
      <div className="dev-profile-card" style={{ marginBottom: '80px' }}>
        
        {/* Left avatar segment */}
        <div className="dev-avatar-container">
          <div className="dev-avatar-glow">
            <img 
              src="/Gautam_Kumar_Maurya.jpg" 
              alt="Gautam Kumar Maurya (gkm563)" 
              className="dev-avatar-img"
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Gautam Kumar Maurya
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--primary-color)', fontWeight: 700, marginTop: '2px' }}>
              gkm / gkm563
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Prayagraj, Uttar Pradesh, India
            </p>
          </div>
          
          {/* Social Links pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
            <a href="https://github.com/gkm563" target="_blank" rel="noreferrer" className="dev-social-pill" title="GitHub Profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </a>
            <a href="https://linkedin.com/in/gkm563" target="_blank" rel="noreferrer" className="dev-social-pill" title="LinkedIn Profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>
            <a href="https://gkm563.github.io" target="_blank" rel="noreferrer" className="dev-social-pill" title="Personal Portfolio Website">
              <Globe size={16} />
              Portfolio
            </a>
            <a href="mailto:gkmwin563@gmail.com" className="dev-social-pill" title="Direct Email Support">
              <Mail size={16} />
              Email
            </a>
          </div>
        </div>

        {/* Right bio segment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              LEAD CREATOR & ARCHITECT
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '4px', lineHeight: '1.2' }}>
              Gautam Kumar Maurya
            </h2>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '6px' }}>
              Specialist in Secure Decentralized Shared Ledgers
            </h3>
          </div>
          
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            I am a **Full-Stack Software Engineer** and **Cyber Security Forensics Researcher** specializing in zero-trust state channels, real-time sync systems, and security investigations audits.
          </p>
          
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            As a developer, my core focus is building clean, high-integrity consumer tools. I designed and engineered **TripSync** to eliminate centralized hierarchies in group expense sharing, utilizing structured majority consensus protocols to secure peer ledger updates.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }}>
                <Code size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Full-Stack Systems</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>React Native, Expo router ecosystems, Node.js, and multi-platform viewports.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary-color)' }}>
                <Shield size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Digital Forensics</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Vulnerability checks, digital ledger records auditing, and OSINT sorting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Milestones / Timeline */}
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px', textAlign: 'center' }}>
        The Development Journey of TripSync
      </h3>
      
      <div style={{ maxWidth: '800px', margin: '0 auto 80px auto' }}>
        <div className="dev-timeline">
          
          <div className="dev-timeline-item">
            <div className="dev-timeline-dot"></div>
            <div className="dev-timeline-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> February 2026</span>
            </div>
            <h4 className="dev-timeline-title">Stage 1: The Concept Spark at IIT Delhi</h4>
            <p className="dev-timeline-content">
              During a 5-day event at **IIT Delhi**, the idea for TripSync was conceived. Watching developers, coordinators, and students try to balance collaborative bills highlighted a massive UX gap: standard ledger apps rely heavily on individual splits, which create math stress. We brainstormed a cleaner approach focused strictly on tracking **"who contributed money for the group as a whole."**
            </p>
          </div>

          <div className="dev-timeline-item">
            <div className="dev-timeline-dot"></div>
            <div className="dev-timeline-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Award size={12} /> May 2026</span>
            </div>
            <h4 className="dev-timeline-title">Stage 2: UP Police Cyber Cell (APCSIP-2026) Design Standards</h4>
            <p className="dev-timeline-content">
              The project was re-engineered and built for production during the **Amroha Police Cyber Security Internship Program 2026 (APCSIP-2026)** with the **Uttar Pradesh Police Cyber Crime Cell**. Police investigative cells travel in collaborative teams and need secure, hierarchy-free expense trackers. We refined the ledger with a **Greedy settlement logic** and **real-time consensus check voting** to match cyber forensic audit guidelines.
            </p>
          </div>

          <div className="dev-timeline-item">
            <div className="dev-timeline-dot"></div>
            <div className="dev-timeline-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Cpu size={12} /> June 2026</span>
            </div>
            <h4 className="dev-timeline-title">Stage 3: Cross-Platform Core Architecture</h4>
            <p className="dev-timeline-content">
              Developed a unified cross-platform backend using Firestore snapshot listeners and local device databases. Built **TripSync Desktop** (React) and **TripSync Mobile** (React Native, Expo SDK) to keep ledger data instantly synchronized between field smartphones and office computers.
            </p>
          </div>
          
        </div>
      </div>

      {/* Stack & Technology Section */}
      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px', textAlign: 'center' }}>
        TripSync Tech Stack Architecture
      </h3>
      
      <div className="dev-stack-grid" style={{ marginBottom: '80px' }}>
        
        <div className="dev-stack-card">
          <Terminal size={26} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Frontend Layer</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            React Native + Expo SDK for mobile clients, and React + custom responsive CSS styling for wide-screen desktop panels. Designed to adapt perfectly to all viewport sizes.
          </p>
        </div>

        <div className="dev-stack-card">
          <Server size={26} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Real-time Storage</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Firebase Auth for secure entry points and Firestore listeners to synchronize contributions, approvals, and transaction logs across all clients within 2 seconds.
          </p>
        </div>

        <div className="dev-stack-card">
          <Cpu size={26} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Settlement Engine</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            A TypeScript settlement logic implementing a greedy graph minimization solver. Simplifies multi-member travel balances into the fewest possible debt transactions.
          </p>
        </div>

        <div className="dev-stack-card">
          <Shield size={26} style={{ color: 'var(--primary-color)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Security & Audits</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Structured consensus voting (requires member approvals to add/edit expenses) and digital report generators (Excel, PDF templates) matching cyber cell forensics guidelines.
          </p>
        </div>
        
      </div>

      {/* Official Log highlight card / Cybersecurity Section */}
      <section className="cyber-section">
        <div className="cyber-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="cyber-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
              Internship Highlight
            </span>
            <span className="cyber-badge">
              APCSIP-2026
            </span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.2' }}>
            <Shield size={26} style={{ color: 'var(--secondary-color)' }} /> 
            APCSIP-2026 Cybersecurity Log
          </h3>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            TripSync was refined according to cybersecurity design standards formulated during Gautam Kumar Maurya's **Amroha Police Cyber Security Internship Program (APCSIP-2026)**. The engine enforces forensic integrity checks, secure P2P consensus voting, and decentralized data minimization algorithms to secure group logistics.
          </p>
          
          <div className="cyber-badges">
            <span className="cyber-badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)', textTransform: 'none' }}>🛡️ IPDR Forensic Logs</span>
            <span className="cyber-badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)', textTransform: 'none' }}>🔑 P2P Consensus Check</span>
            <span className="cyber-badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)', textTransform: 'none' }}>📊 Graph Debt Simplifier</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
            <a href="https://gkm563.github.io/up-police-internship.html" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '12px 22px', fontSize: '0.9rem' }}>
              Read Official Internship Log
            </a>
            <button 
              onClick={runForensicAudit} 
              disabled={isAuditing}
              className="btn-secondary" 
              style={{ 
                padding: '12px 22px', 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isAuditing ? 'not-allowed' : 'pointer',
                opacity: isAuditing ? 0.7 : 1,
                borderColor: 'var(--secondary-color)',
                color: 'var(--secondary-color)',
                background: 'rgba(20, 184, 166, 0.05)'
              }}
            >
              <Terminal size={16} style={{ animation: isAuditing ? 'pulse 1s infinite' : 'none' }} />
              {isAuditing ? 'Running Scan...' : 'Run Forensic Audit'}
            </button>
          </div>
        </div>

        {/* Console simulator widget */}
        <div className="cyber-terminal">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <span className="terminal-title">tripsync-forensic-audit.sh</span>
            <span style={{ width: '40px' }}></span>
          </div>
          <div className="terminal-body" ref={terminalBodyRef}>
            {terminalLogs.map((log, index) => (
              <div 
                key={index} 
                className={`terminal-line ${
                  log.startsWith('$') || log.startsWith('gkm563') ? 'command' :
                  log.includes('[SUCCESS]') || log.includes('[OK]') || log.includes('Verified') || log.includes('APPROVED') || log.includes('PASS') ? 'success' :
                  log.includes('[INFO]') || log.includes('[SYSTEM]') ? 'info' :
                  log.includes('[INIT]') || log.includes('[DB]') || log.includes('[OSINT]') || log.includes('[ALGO]') || log.includes('[CONSENSUS]') || log.includes('[INTEGRITY]') ? 'accent' :
                  'normal'
                }`}
              >
                {log}
              </div>
            ))}
            <div className="terminal-line command">
              gkm563@tripsync-cyber:~$ <span className="terminal-cursor"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Heart footer signature */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        Made with <Heart size={14} style={{ fill: 'hsl(var(--red))', color: 'hsl(var(--red))' }} /> by Gautam Kumar Maurya (gkm563) © {new Date().getFullYear()}
      </div>
    </div>
  );
};
