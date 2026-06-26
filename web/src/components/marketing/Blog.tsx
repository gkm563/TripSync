import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, User, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string[];
  date: string;
  readTime: string;
  author: string;
  category: string;
}

export const Blog: React.FC = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: 'hackathon-splits',
      title: 'How TripSync Simplifies Hackathon Group Expense Splits',
      summary: 'Observing student budgeting challenges during a 5-day event at IIT Delhi led Gautam Kumar Maurya (gkm563) to design a new form of collaborative expense tracking.',
      date: 'April 14, 2026',
      readTime: '4 min read',
      author: 'Gautam Kumar Maurya',
      category: 'Case Studies',
      content: [
        "Hackathons are intense, fast-paced events. At a typical 36-hour or 5-day hackathon like those hosted at IIT Delhi, students and developers focus heavily on building compilers, testing APIs, and scripting code. However, managing lodging booking, team fuel, and collective pizza orders usually turns into an accounting headache.",
        "Traditional expense split applications force users to create a transaction list and assign individual splits. This requires continuous micro-management and manual divisions throughout the event itself, introducing friction in collaborative environments.",
        "Designed by Gautam Kumar Maurya (gkm563), TripSync solves this by removing individual billing records. Instead, it operates on a singular contribution ledger: it tracks 'who paid money to cover the group's collective costs'. By simply recording Praveen contributed ₹600 or Gautam contributed ₹1,000, the system removes micro-split calculations. At completion, a greedy flow minimizer calculates the net transfers in a single click, keeping students stress-free.",
        "Whether you are building at an IIT Kanpur event, a GDG hackathon, or traveling on college tours, simplifying the math lets you focus on creating product software instead of debugging balance sheets."
      ]
    },
    {
      id: 'greedy-minimizer',
      title: 'Implementing a Transaction Minimizer (Greedy Algorithm) in TypeScript',
      summary: 'A deep-dive analysis of the greedy debt simplification algorithm utilized by the TripSync core settlement engine to reduce bank transfers.',
      date: 'April 20, 2026',
      readTime: '6 min read',
      author: 'Gautam Kumar Maurya',
      category: 'Computer Science',
      content: [
        "In group budget ledgers, the goal of settlement is to return every member's balance to zero. While a naive settlement would have every debtor pay every creditor directly, this leads to an unnecessary loop of transactions (e.g. Gautam pays Praveen ₹100, Praveen pays Rohit ₹100).",
        "To minimize transactions, TripSync implements a greedy flow-simplification algorithm. The logic separates users into two groups: debtors (with negative balances) and creditors (with positive balances), sorting both sets in descending order of absolute balances.",
        "The engine recursively matches the largest debtor with the largest creditor. It transfers the minimum of the debt or credit, updates their balances, and repeats the process. Rounding tolerances are kept at two decimal places to ensure precision.",
        "With a complexity of O(N log N), where N is the number of active members, this engine computes optimized transfers instantly. Gautam Kumar Maurya (gkm563) verified this core TypeScript module against Jest test suites, confirming it resolves even complex multi-payer networks in minimal paths, lowering transaction cycles for mobile and desktop clients."
      ]
    },
    {
      id: 'consensus-voting',
      title: 'Why Consensus Voting is Safer than Admin-Led Ledger Systems',
      summary: 'Traditional ledgers rely on group administrators, leading to dispute entries. We discuss why TripSync implements a democratic floor(N/2)+1 vote system.',
      date: 'May 02, 2026',
      readTime: '5 min read',
      author: 'Gautam Kumar Maurya',
      category: 'Product Design',
      content: [
        "Many financial ledgers are hierarchical, designating a single member as the 'admin' or 'creator' who holds editing power. While this structure is standard, it creates significant friction in cooperative small groups: accidental entry overstatements or duplicate bills trigger disputes that are difficult to resolve.",
        "TripSync operates on a non-hierarchical, democratic system. All invited members are equal. When an expense is created, it is held in a 'Pending' review queue and is not calculated in the active settlement balances.",
        "To prevent disputes, the app requires a majority consensus: floor(Total Members / 2) + 1 positive votes. The creator of the entry receives an automatic +1 vote. Rejections require selecting a reason (Duplicate, Wrong Amount, or Other with a minimum 20-character description).",
        "This vote gate keeps the ledger clean. Edits automatically reset the vote gate and version count, starting a new consensus cycle. This ensures complete transparency across all user devices."
      ]
    },
    {
      id: 'cybersecurity-ledgers',
      title: 'Cybersecurity Auditing & Shared Ledgers for Police Investigations',
      summary: 'Explaining how TripSync was designed and tested during the Uttar Pradesh Police Cyber Crime Cell Amroha Internship Program APCSIP-2026.',
      date: 'May 10, 2026',
      readTime: '7 min read',
      author: 'Gautam Kumar Maurya',
      category: 'Cyber Security',
      content: [
        "During field operations, digital forensics analysis, and mobile tracking operations, security units and local police cells travel in groups. Tracking local fuel, boarding, and forensics operations logistics expenses requires a secure, non-centralized ledger that preserves data integrity.",
        "Built during the Amroha Police Cyber Security Internship Program 2026 (APCSIP-2026) under the UP Police Cyber Crime Cell, TripSync incorporates cybersecurity best practices.",
        "Specifically, the application implements strict data retention protocols: it is impossible to permanently delete an expense without logging an audit trail, keeping past revisions archived in Firestore. When users sign out, Zustand cache flows are completely cleared, preventing unauthorized session exposures.",
        "Gautam Kumar Maurya (gkm563) designed these ledger models to support operational integrity during forensics field research. This demonstrates how consumer splitting tools can be hardened into high-integrity systems."
      ]
    }
  ];

  const activePost = blogPosts.find(post => post.id === selectedPostId);

  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      {activePost ? (
        /* Blog Article View */
        <article style={{ maxWidth: '720px', margin: '0 auto' }}>
          <button 
            onClick={() => setSelectedPostId(null)} 
            className="btn-secondary" 
            style={{ marginBottom: '32px', padding: '8px 16px' }}
          >
            <ArrowLeft size={16} /> Back to Blog List
          </button>
          
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.78rem' }}>
              {activePost.category}
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '12px', lineHeight: '1.2' }}>{activePost.title}</h1>
            
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0', fontSize: '0.88rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> By {activePost.author}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {activePost.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {activePost.readTime}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            {activePost.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* About Author Footer */}
          <div style={{ marginTop: '60px', padding: '30px', borderRadius: '18px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img 
              src="/Gautam_Kumar_Maurya.jpg" 
              alt={activePost.author} 
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
            />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>About Gautam Kumar Maurya</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Full-Stack Engineer & Cyber Security Specialist. Lead creator of TripSync. Graduate of the APCSIP-2026 program at UP Police Cyber crime Cell.
              </p>
            </div>
          </div>
        </article>
      ) : (
        /* Blog Index Grid View */
        <div>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>The TripSync Blog</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
              Deep dives on collaborative ledgers, split algorithm math, and cybersecurity audits.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
            {blogPosts.map(post => (
              <div 
                key={post.id} 
                className="glass" 
                style={{ 
                  padding: '30px', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border-color)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => {
                  setSelectedPostId(post.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div>
                  <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }}>
                    {post.category}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '8px', lineHeight: '1.3' }}>{post.title}</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>{post.summary}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <span>{post.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {post.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
