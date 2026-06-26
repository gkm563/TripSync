import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { useNotificationStore } from '../store/notificationStore';
import { calculateSettlement } from '../utils/settlementEngine';
import { AddExpenseModal } from './AddExpenseModal';
import { 
  Users, 
  Plus, 
  Bell, 
  FileSpreadsheet, 
  Printer, 
  Share2, 
  Check, 
  X, 
  LogOut, 
  Trash2, 
  Edit3, 
  Activity, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  History, 
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const Dashboard: React.FC = () => {
  const { user, usersList, logout, switchUser } = useAuthStore();
  const { trips, invitations, createTrip, inviteMember, respondToInvitation, requestEndTrip, cancelEndTrip, syncTrips, syncInvitations } = useTripStore();
  const { expenses, personalExpenses, activityLogs, addPersonalExpense, deletePersonalExpense, deleteExpense, voteExpense, forceApproveExpense, syncExpenses, syncPersonalExpenses, syncActivityLogs } = useExpenseStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearHistory, syncNotifications, activeBanner, hideBanner } = useNotificationStore();

  const [activeTripId, setActiveTripId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'expenses' | 'review' | 'activity' | 'personal' | 'export'>('expenses');

  // Modals state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(undefined);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Forms state
  const [newTripName, setNewTripName] = useState('');
  const [newTripDesc, setNewTripDesc] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripEnd, setNewTripEnd] = useState('');
  const [newTripCover, setNewTripCover] = useState('cover_1');
  const [inviteEmail, setInviteEmail] = useState('');

  // Reject dialog details
  const [rejectExpenseId, setRejectExpenseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Wrong Amount');
  const [rejectReasonOther, setRejectReasonOther] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Personal expense Form
  const [persTitle, setPersTitle] = useState('');
  const [persAmount, setPersAmount] = useState('');
  const [persCategory, setPersCategory] = useState('Food');

  // Notifications Popover Toggle
  const [showNotificationsList, setShowNotificationsList] = useState(false);

  // Active Trip Object
  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0];

  // Listeners syncing
  useEffect(() => {
    if (user) {
      const unsubTrips = syncTrips(user.uid);
      const unsubInvs = syncInvitations(user.email);
      const unsubNotifs = syncNotifications(user.uid);
      
      return () => {
        unsubTrips();
        unsubInvs();
        unsubNotifs();
      };
    }
  }, [user]);

  // Sync details when active trip changes
  useEffect(() => {
    if (activeTrip && user) {
      const unsubExpenses = syncExpenses(activeTrip.id);
      const unsubPersonal = syncPersonalExpenses(activeTrip.id, user.uid);
      const unsubLogs = syncActivityLogs(activeTrip.id);
      
      return () => {
        unsubExpenses();
        unsubPersonal();
        unsubLogs();
      };
    }
  }, [activeTripId, activeTrip, user]);

  // Set default active trip
  useEffect(() => {
    if (trips.length > 0 && !activeTripId) {
      setActiveTripId(trips[0].id);
    }
  }, [trips, activeTripId]);

  // Autoclose slide-down notification banner after 6 seconds
  useEffect(() => {
    if (activeBanner) {
      const timer = setTimeout(() => {
        hideBanner();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeBanner]);

  if (!user) return null;

  // Perform Settlement calculations
  const approvedExpenses = expenses.filter(e => e.status === 'approved' && e.tripId === (activeTrip?.id || ''));
  const settlement = activeTrip ? calculateSettlement(activeTrip.members, approvedExpenses) : {
    totalExpense: 0,
    perMember: 0,
    contributions: {},
    balances: {},
    transactions: []
  };

  const getMemberUser = (uid: string): any => {
    return usersList.find(u => u.uid === uid) || { name: 'Unknown User', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', email: '' };
  };

  const handleCreateTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName || !newTripStart || !newTripEnd) return;
    try {
      const newT = await createTrip(newTripName, newTripDesc, newTripStart, newTripEnd, newTripCover, user);
      setActiveTripId(newT.id);
      setShowCreateTrip(false);
      setNewTripName('');
      setNewTripDesc('');
      setNewTripStart('');
      setNewTripEnd('');
    } catch (err) {
      alert("Failed to create trip.");
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !activeTrip) return;
    try {
      await inviteMember(activeTrip.id, inviteEmail, user);
      alert(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to invite member.");
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pAmt = parseFloat(persAmount);
    if (!persTitle || isNaN(pAmt) || pAmt <= 0 || !activeTrip) return;
    
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    try {
      await addPersonalExpense(
        user.uid,
        activeTrip.id,
        persTitle,
        pAmt,
        persCategory,
        `${yyyy}-${mm}-${dd}`,
        `${hh}:${min}`
      );
      setPersTitle('');
      setPersAmount('');
    } catch (err) {
      alert("Failed to save personal expense.");
    }
  };

  const handleVoteSubmit = async (expenseId: string, vote: 1 | -1) => {
    if (!activeTrip) return;
    if (vote === -1) {
      // open reject reasons modal overlay
      setRejectExpenseId(expenseId);
      setRejectReason('Wrong Amount');
      setRejectReasonOther('');
      setRejectError(null);
      return;
    }
    
    try {
      await voteExpense(expenseId, user.uid, user.name, 1, '', activeTrip.members.length);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectReasonConfirm = async () => {
    if (!rejectExpenseId || !activeTrip) return;
    setRejectError(null);

    let finalReason = rejectReason;
    if (rejectReason === 'Other') {
      if (rejectReasonOther.trim().length < 20) {
        setRejectError("For 'Other' reasons, please provide at least 20 characters detail.");
        return;
      }
      finalReason = rejectReasonOther.trim();
    }

    try {
      await voteExpense(rejectExpenseId, user.uid, user.name, -1, finalReason, activeTrip.members.length);
      setRejectExpenseId(null);
    } catch (err: any) {
      setRejectError(err.message);
    }
  };

  const handleSwitchTripEnd = async () => {
    if (!activeTrip) return;
    try {
      if (activeTrip.endRequests.includes(user.uid)) {
        await cancelEndTrip(activeTrip.id, user.uid);
      } else {
        await requestEndTrip(activeTrip.id, user.uid);
      }
    } catch (err) {
      alert("Action failed.");
    }
  };

  // Excel Export
  const exportToExcel = () => {
    if (!activeTrip) return;
    const expenseData = expenses.filter(e => e.tripId === activeTrip.id).map(e => ({
      ID: e.id,
      Title: e.title,
      Amount: e.amount,
      Category: e.category,
      Date: e.date,
      Time: e.time,
      Status: e.status,
      Version: e.version,
      'Paid By Split': Object.entries(e.paidBy).map(([uid, val]) => `${getMemberUser(uid).name}: ₹${val}`).join(', ')
    }));

    const personalData = personalExpenses.map(p => ({
      Title: p.title,
      Amount: p.amount,
      Category: p.category,
      Date: p.date,
      Time: p.time
    }));

    const wb = XLSX.utils.book_new();
    const wsExpenses = XLSX.utils.json_to_sheet(expenseData);
    const wsPersonal = XLSX.utils.json_to_sheet(personalData);

    XLSX.utils.book_append_sheet(wb, wsExpenses, "Shared Expenses");
    XLSX.utils.book_append_sheet(wb, wsPersonal, "Personal Expenses");
    XLSX.writeFile(wb, `${activeTrip.name.replace(/\s+/g, '_')}_Summary.xlsx`);
  };

  // WhatsApp share
  const shareWhatsApp = () => {
    if (!activeTrip) return;
    let text = `*TripSync Report: ${activeTrip.name}*\n\n`;
    text += `*Total Shared Expense:* ₹${settlement.totalExpense}\n`;
    text += `*Per Member Share:* ₹${settlement.perMember}\n\n`;
    
    text += `*Contributions:*\n`;
    Object.entries(settlement.contributions).forEach(([uid, val]) => {
      text += `- ${getMemberUser(uid).name}: ₹${val}\n`;
    });

    text += `\n*Settlements:*\n`;
    if (settlement.transactions.length === 0) {
      text += `Everything is settled! 🎉\n`;
    } else {
      settlement.transactions.forEach((tx) => {
        text += `- ${getMemberUser(tx.from).name} pays ${getMemberUser(tx.to).name} *₹${tx.amount}*\n`;
      });
    }

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="dashboard-layout">
      {/* Slide-down Banner for new notifications */}
      {activeBanner && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '400px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-secondary)',
          border: '2px solid var(--primary-color)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 2000,
          animation: 'slideDown var(--transition-fast) forwards',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> {activeBanner.title}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{activeBanner.body}</p>
          </div>
          <button onClick={hideBanner} style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
      )}

      {/* Left Sidebar (Desktop) */}
      <aside className="sidebar">
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={26} style={{ stroke: 'url(#indTealGradSide)' }} />
          <h2 style={{ fontSize: '1.35rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TripSync Dashboard</h2>
        </div>

        {/* Quickswitch Demo Panel */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(99, 102, 241, 0.03)' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>💻 MOCK PROFILE SWITCHER</label>
          <select 
            className="form-control" 
            style={{ padding: '6px 12px', fontSize: '0.82rem', backgroundColor: 'var(--bg-tertiary)' }}
            value={user.uid}
            onChange={(e) => switchUser(e.target.value)}
          >
            {usersList.map(u => (
              <option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('expenses')} 
            className={`btn-text ${activeTab === 'expenses' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '10px' }}
          >
            <DollarSign size={18} /> Shared Expenses
          </button>
          <button 
            onClick={() => setActiveTab('review')} 
            className={`btn-text ${activeTab === 'review' ? 'active' : ''}`}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={18} /> Review Queue</span>
            {expenses.filter(e => e.status === 'pending' && e.tripId === (activeTrip?.id || '')).length > 0 && (
              <span style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>
                {expenses.filter(e => e.status === 'pending' && e.tripId === (activeTrip?.id || '')).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('activity')} 
            className={`btn-text ${activeTab === 'activity' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '10px' }}
          >
            <Activity size={18} /> Activity Logs
          </button>
          <button 
            onClick={() => setActiveTab('personal')} 
            className={`btn-text ${activeTab === 'personal' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '10px' }}
          >
            <Briefcase size={18} /> Personal Expenses
          </button>
          <button 
            onClick={() => setActiveTab('export')} 
            className={`btn-text ${activeTab === 'export' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '10px' }}
          >
            <Printer size={18} /> Export & Settlements
          </button>
        </nav>

        {/* User Card */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={user.photoURL} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.92rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.name}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
          <button onClick={logout} className="btn-text" style={{ padding: '8px', color: 'hsl(var(--red))' }} title="Log Out"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* Main dashboard content area */}
      <main className="main-content">
        {/* Top Navbar */}
        <div className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Select Trip:</h3>
            <select 
              className="form-control" 
              style={{ width: '220px', padding: '8px 16px', fontWeight: 600 }}
              value={activeTripId}
              onChange={(e) => setActiveTripId(e.target.value)}
            >
              {trips.length === 0 && <option value="">No Active Trips</option>}
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.status === 'completed' ? 'Completed' : 'Active'})</option>
              ))}
            </select>
            <button onClick={() => setShowCreateTrip(true)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}><Plus size={16} /> New Trip</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotificationsList(!showNotificationsList)}
              className="btn-secondary" 
              style={{ padding: '10px', borderRadius: '50%', position: 'relative' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '0', right: '0', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel Popover */}
            {showNotificationsList && (
              <div className="glass" style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '320px',
                maxHeight: '400px',
                borderRadius: '16px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.92rem' }}>Notifications Inbox</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => markAllAsRead(user.uid)} className="btn-text" style={{ fontSize: '0.72rem', padding: '2px 4px' }}>Mark read</button>
                    <button onClick={() => clearHistory(user.uid)} className="btn-text" style={{ fontSize: '0.72rem', padding: '2px 4px', color: 'hsl(var(--red))' }}>Clear</button>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {notifications.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No notifications</p>
                  )}
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => markAsRead(notif.id)}
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border-color)', 
                        backgroundColor: notif.status === 'unread' ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <p style={{ fontWeight: notif.status === 'unread' ? 700 : 500 }}>{notif.title}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>{notif.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invitations Inbox */}
        {invitations.length > 0 && (
          <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--primary-color)', marginBottom: '10px' }}>📬 Pending Trip Invitations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invitations.map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '10px 16px', borderRadius: '10px', fontSize: '0.88rem' }}>
                  <span>{inv.invitedBy} invited you to join a Trip Sync.</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => respondToInvitation(inv.id, user.uid, false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}><X size={14} /> Decline</button>
                    <button onClick={() => respondToInvitation(inv.id, user.uid, true)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}><Check size={14} /> Accept</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Trip Dashboard View */}
        {activeTrip ? (
          <div>
            {/* Trip Details Card with Cover Gradient */}
            <div className={`glass`} style={{
              background: `var(--grad-${activeTrip.coverImage || 'cover_1'})`,
              padding: '32px',
              borderRadius: '24px',
              color: 'black',
              position: 'relative',
              marginBottom: '32px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{activeTrip.name}</h1>
                  <p style={{ fontSize: '1rem', marginTop: '6px', opacity: 0.85 }}>{activeTrip.description || 'Track settlements and group payments in real time.'}</p>
                  
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.88rem', fontWeight: 500, opacity: 0.9 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Start: {activeTrip.startDate}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Target End: {activeTrip.expectedEndDate}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <span className="badge" style={{ backgroundColor: 'black', color: 'white', padding: '6px 12px', borderRadius: '20px' }}>{activeTrip.status}</span>
                  <button onClick={() => setShowInviteModal(true)} className="btn" style={{ backgroundColor: 'black', color: 'white', padding: '8px 14px', fontSize: '0.82rem', marginTop: '8px' }}><Plus size={14} /> Invite Friend</button>
                </div>
              </div>

              {/* Members Avatar list */}
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>MEMBERS:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {activeTrip.members.map(uid => {
                      const m = getMemberUser(uid);
                      return (
                        <div key={uid} style={{ position: 'relative' }} title={`${m.name} (${m.email})`}>
                          <img src={m.photoURL} alt={m.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* End Trip button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>({activeTrip.endRequests.length}/{activeTrip.members.length} agree to end)</span>
                  <button 
                    onClick={handleSwitchTripEnd} 
                    className="btn" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: 'black', border: '1px solid rgba(0,0,0,0.2)', padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    {activeTrip.endRequests.includes(user.uid) ? 'Cancel End Agreement' : 'Request End Trip'}
                  </button>
                </div>
              </div>
            </div>

            {/* Balances & Settlement Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '32px' }}>
              
              {/* Contributions & Share stats */}
              <div className="glass" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Trip Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TOTAL SHARED EXPENSES</span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>₹{settlement.totalExpense.toFixed(2)}</h2>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PER-MEMBER COST SHARE</span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary-color)' }}>₹{settlement.perMember.toFixed(2)}</h2>
                  </div>
                </div>

                {/* Member Net Balances visual table */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Member Balances Detail</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeTrip.members.map(uid => {
                      const m = getMemberUser(uid);
                      const contrib = settlement.contributions[uid] || 0;
                      const bal = settlement.balances[uid] || 0;
                      return (
                        <div key={uid} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr', alignItems: 'center', padding: '10px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={m.photoURL} alt={m.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{m.name}</span>
                          </div>
                          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Paid: ₹{contrib.toFixed(0)}</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, textAlign: 'right', color: bal >= 0 ? 'hsl(var(--green))' : 'hsl(var(--red))' }}>
                            {bal >= 0 ? `+₹${bal.toFixed(2)}` : `-₹${Math.abs(bal).toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Settlement minimizer result list */}
              <div className="glass" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Settlement Plan</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Calculated using the Greedy minimizer algorithm to resolve balances with the fewest payments.</p>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {settlement.transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '2.5rem' }}>🎉</span>
                      <h4 style={{ fontSize: '0.92rem', color: 'hsl(var(--green))' }}>Everyone is Settled!</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No transfers are required.</p>
                    </div>
                  ) : (
                    settlement.transactions.map((tx, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span>From: <b>{getMemberUser(tx.from).name}</b></span>
                          <span>To: <b>{getMemberUser(tx.to).name}</b></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-color)' }}>₹{tx.amount.toFixed(2)}</span>
                          <span className="badge" style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--primary-color)', fontSize: '0.65rem' }}>Pay directly</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Content Switching Tabs */}
            <div className="tabs-container">
              <button onClick={() => setActiveTab('expenses')} className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}>Shared Expenses</button>
              <button onClick={() => setActiveTab('review')} className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}>
                Review Queue ({expenses.filter(e => e.status === 'pending' && e.tripId === activeTrip.id).length})
              </button>
              <button onClick={() => setActiveTab('activity')} className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}>Activity Feed</button>
              <button onClick={() => setActiveTab('personal')} className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}>Personal Expenses</button>
              <button onClick={() => setActiveTab('export')} className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}>Exports Suite</button>
            </div>

            {/* TAB CONTENT panels */}
            <div>
              {/* TAB: Expenses */}
              {activeTab === 'expenses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Shared Expenses Summary</h3>
                    <button onClick={() => { setExpenseToEdit(undefined); setShowAddExpense(true); }} className="btn-primary"><Plus size={16} /> Add Shared Expense</button>
                  </div>

                  {expenses.filter(e => e.tripId === activeTrip.id).length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No expenses recorded for this trip yet. Click Add Expense to start.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {expenses.filter(e => e.tripId === activeTrip.id).map(exp => (
                        <div key={exp.id} className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span className={`badge badge-${exp.category.toLowerCase()}`}>{exp.category}</span>
                              <h4 style={{ fontSize: '1.15rem', marginTop: '6px' }}>{exp.title}</h4>
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{exp.amount.toFixed(2)}</span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <p>Paid by: {Object.entries(exp.paidBy).map(([uid, val]) => `${getMemberUser(uid).name} (₹${val})`).join(', ')}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Date: {exp.date} at {exp.time} | Version {exp.version}</p>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`status-indicator status-${exp.status}`}>
                              {exp.status.toUpperCase()}
                            </span>

                            {/* Options: Edit/Delete if approved or rejected */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {exp.status === 'rejected' && (
                                <button onClick={() => forceApproveExpense(exp.id, user.uid, user.name)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'hsl(var(--green))' }} title="Force Approve">Force Approve</button>
                              )}
                              <button onClick={() => { setExpenseToEdit(exp); setShowAddExpense(true); }} className="btn-secondary" style={{ padding: '6px 8px' }} title="Edit"><Edit3 size={14} /></button>
                              <button onClick={() => deleteExpense(exp.id)} className="btn-secondary" style={{ padding: '6px 8px', color: 'hsl(var(--red))' }} title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Review Queue */}
              {activeTab === 'review' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>Consensus Queue (Pending majority votes)</h3>
                  
                  {expenses.filter(e => e.status === 'pending' && e.tripId === activeTrip.id).length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No expenses are currently pending votes. Everyone is in agreement!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {expenses.filter(e => e.status === 'pending' && e.tripId === activeTrip.id).map(exp => {
                        const userVote = exp.votes[user.uid];
                        const countApproves = Object.values(exp.votes).filter(v => v === 1).length;
                        const countRejects = Object.values(exp.votes).filter(v => v === -1).length;
                        
                        return (
                          <div key={exp.id} className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                              <div>
                                <span className={`badge badge-${exp.category.toLowerCase()}`}>{exp.category}</span>
                                <h4 style={{ fontSize: '1.25rem', marginTop: '6px' }}>{exp.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  Added by {getMemberUser(exp.createdBy).name} on {exp.date} at {exp.time}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <h3 style={{ fontSize: '1.4rem' }}>₹{exp.amount.toFixed(2)}</h3>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Majority Target: {Math.floor(activeTrip.members.length / 2) + 1} approvals</span>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
                              <div>
                                <h5 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Approved By ({countApproves}):</h5>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {Object.entries(exp.votes).filter(([_, v]) => v === 1).map(([uid]) => (
                                    <span key={uid} className="badge" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'green', fontSize: '0.75rem' }}>{getMemberUser(uid).name}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Rejected By ({countRejects}):</h5>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {Object.entries(exp.votes).filter(([_, v]) => v === -1).map(([uid]) => (
                                    <div key={uid} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span className="badge" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'red', fontSize: '0.75rem', width: 'fit-content' }}>{getMemberUser(uid).name}</span>
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Reason: "{exp.rejectReasons[uid]}"</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {exp.createdBy === user.uid ? (
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>You added this expense. Awaiting group majority votes.</p>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button 
                                  onClick={() => handleVoteSubmit(exp.id, -1)} 
                                  className={`btn-secondary ${userVote === -1 ? 'active' : ''}`}
                                  style={{ color: 'hsl(var(--red))', border: userVote === -1 ? '1px solid hsl(var(--red))' : 'none' }}
                                >
                                  Reject Expense
                                </button>
                                <button 
                                  onClick={() => handleVoteSubmit(exp.id, 1)} 
                                  className={`btn-primary ${userVote === 1 ? 'active' : ''}`}
                                  style={{ background: userVote === 1 ? 'hsl(var(--green))' : 'var(--grad-primary)' }}
                                >
                                  Approve
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Activity logs */}
              {activeTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>Group Audit Feed</h3>
                  <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                    {activityLogs.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No activity logs recorded yet.</p>
                    )}
                    {activityLogs.map((log) => (
                      <div key={log.id} style={{ position: 'relative' }}>
                        {/* Dot indicator */}
                        <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', border: '2px solid var(--bg-primary)' }}></div>
                        
                        <div>
                          <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{log.action}</p>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: Personal Expenses */}
              {activeTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>Personal Expense Tracker</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      These expenses are strictly private to you. They are <b>NOT</b> included in the settle calculations and other members cannot view them.
                    </p>
                  </div>

                  <form onSubmit={handlePersonalSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 2, minWidth: '180px' }}>
                      <label className="form-label">Expense Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Personal Snacks" 
                        value={persTitle}
                        onChange={(e) => setPersTitle(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '100px' }}>
                      <label className="form-label">Amount (₹)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="120" 
                        value={persAmount}
                        onChange={(e) => setPersAmount(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label className="form-label">Category</label>
                      <select 
                        className="form-control" 
                        value={persCategory}
                        onChange={(e) => setPersCategory(e.target.value)}
                      >
                        <option value="Food">Food</option>
                        <option value="Travel">Travel</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', height: '45px' }}><Plus size={16} /> Add</button>
                  </form>

                  {/* Personal Expenses list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {personalExpenses.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No personal expenses added yet.</p>
                    ) : (
                      personalExpenses.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem' }}>{p.title}</h4>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.date} | Category: {p.category}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>₹{p.amount.toFixed(2)}</span>
                            <button onClick={() => deletePersonalExpense(p.id)} className="btn-text" style={{ color: 'hsl(var(--red))', padding: '6px' }}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: Exports */}
              {activeTab === 'export' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>Print & Data Export Center</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Generate printable PDF statements, compile structured Excel logs, or copy WhatsApp text summaries in a single tap.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                    {/* Excel Card */}
                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'green', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileSpreadsheet size={20} style={{ margin: 'auto' }} />
                        </div>
                        <h4 style={{ fontSize: '1.1rem' }}>Excel Spreadsheet</h4>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>
                        Compile a spreadsheet workbook containing separate worksheets for group shared expenses, paid distributions, and personal expenses.
                      </p>
                      <button onClick={exportToExcel} className="btn-secondary" style={{ width: '100%' }}>Export .xlsx Document</button>
                    </div>

                    {/* PDF Card */}
                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Printer size={20} style={{ margin: 'auto' }} />
                        </div>
                        <h4 style={{ fontSize: '1.1rem' }}>PDF Print Statement</h4>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>
                        Generate a customized statement layout that hides navigation controls and compiles all parameters to open standard browser PDF print tools.
                      </p>
                      <button onClick={() => window.print()} className="btn-secondary" style={{ width: '100%' }}>Print Summary PDF</button>
                    </div>

                    {/* WhatsApp Card */}
                    <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Share2 size={20} style={{ margin: 'auto' }} />
                        </div>
                        <h4 style={{ fontSize: '1.1rem' }}>WhatsApp Split Summary</h4>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>
                        Compile a readable plain-text report listing member totals and settle transfers. Instantly share via WhatsApp Web.
                      </p>
                      <button onClick={shareWhatsApp} className="btn-secondary" style={{ width: '100%' }}>Share on WhatsApp</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border-color)', borderRadius: '24px', margin: '40px 0' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No Active Trips Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create a trip first to start syncing shared expenses and calculating optimized balances.</p>
            <button onClick={() => setShowCreateTrip(true)} className="btn-primary"><Plus size={16} /> Create Trip</button>
          </div>
        )}
      </main>

      {/* MOBILE Bottom Navigation Bar (Visible only on viewport < 768px via CSS) */}
      <nav className="mobile-bottom-nav">
        <button onClick={() => setActiveTab('expenses')} className={`mobile-nav-item ${activeTab === 'expenses' ? 'active' : ''}`}>
          <DollarSign size={18} /><span>Expenses</span>
        </button>
        <button onClick={() => setActiveTab('review')} className={`mobile-nav-item ${activeTab === 'review' ? 'active' : ''}`}>
          <History size={18} /><span>Review</span>
        </button>
        <button onClick={() => { setExpenseToEdit(undefined); setShowAddExpense(true); }} className="mobile-nav-add-btn">
          <Plus size={20} />
        </button>
        <button onClick={() => setActiveTab('activity')} className={`mobile-nav-item ${activeTab === 'activity' ? 'active' : ''}`}>
          <Activity size={18} /><span>Activity</span>
        </button>
        <button onClick={() => setActiveTab('export')} className={`mobile-nav-item ${activeTab === 'export' ? 'active' : ''}`}>
          <Printer size={18} /><span>Export</span>
        </button>
      </nav>

      {/* MODAL: Add/Edit Expense */}
      {showAddExpense && activeTrip && (
        <AddExpenseModal 
          tripId={activeTrip.id} 
          tripMembers={activeTrip.members} 
          expenseToEdit={expenseToEdit} 
          onClose={() => setShowAddExpense(false)} 
        />
      )}

      {/* MODAL: Create Trip */}
      {showCreateTrip && (
        <div className="modal-overlay" onClick={() => setShowCreateTrip(false)}>
          <form onSubmit={handleCreateTripSubmit} className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Create New Trip</h3>
              <button type="button" onClick={() => setShowCreateTrip(false)} className="btn-text" style={{ padding: '4px', borderRadius: '50%' }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Trip Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="IIT Kanpur Internship" 
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description (Optional)</label>
                <textarea 
                  className="form-control" 
                  placeholder="Summer project settle details..." 
                  value={newTripDesc}
                  onChange={(e) => setNewTripDesc(e.target.value)}
                  rows={2}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={newTripStart}
                    onChange={(e) => setNewTripStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Expected End Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={newTripEnd}
                    onChange={(e) => setNewTripEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Cover Gradient selector */}
              <div>
                <label className="form-label">Choose Cover Theme</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['cover_1', 'cover_2', 'cover_3', 'cover_4', 'cover_5'].map(cover => (
                    <button 
                      key={cover} 
                      type="button" 
                      onClick={() => setNewTripCover(cover)}
                      style={{ 
                        width: '60px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        border: newTripCover === cover ? '3px solid black' : '1px solid rgba(0,0,0,0.2)',
                        background: `var(--grad-${cover})`,
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowCreateTrip(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create Trip</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Invite Member */}
      {showInviteModal && activeTrip && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <form onSubmit={handleInviteSubmit} className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Invite Member to Trip</h3>
              <button type="button" onClick={() => setShowInviteModal(false)} className="btn-text" style={{ padding: '4px', borderRadius: '50%' }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Member Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="friend@example.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Send Invite</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Reject Reason Input (Triggered when user clicks reject vote) */}
      {rejectExpenseId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--red))' }}>Reject Reason Required</h3>
              <button onClick={() => setRejectExpenseId(null)} className="btn-text" style={{ padding: '4px', borderRadius: '50%' }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {rejectError && (
                <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', color: 'hsl(var(--red))', fontSize: '0.82rem', fontWeight: 500 }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{rejectError}</span>
                </div>
              )}
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Rejection Reason</label>
                <select 
                  className="form-control" 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  <option value="Wrong Amount">Wrong Amount ❌</option>
                  <option value="Duplicate Expense">Duplicate Expense ⚠️</option>
                  <option value="Wrong Category">Wrong Category 📂</option>
                  <option value="Other">Other (Require explanation) 📝</option>
                </select>
              </div>

              {rejectReason === 'Other' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Reason Explanation (Min 20 characters)</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Provide details about why you reject this expense (e.g. This was actually personal expense or amount is double than actual receipt)..." 
                    value={rejectReasonOther}
                    onChange={(e) => setRejectReasonOther(e.target.value)}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: rejectReasonOther.trim().length >= 20 ? 'hsl(var(--green))' : 'var(--text-muted)' }}>
                    Current length: {rejectReasonOther.trim().length}/20 characters minimum
                  </span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setRejectExpenseId(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleRejectReasonConfirm} className="btn-primary" style={{ background: 'var(--grad-danger)' }}>Submit Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Gradient definitions for general icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="indTealGradSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(99, 102, 241)" />
            <stop offset="100%" stopColor="rgb(20, 184, 166)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
