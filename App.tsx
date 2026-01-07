
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Dashboard from './components/Dashboard';
import TradeModal from './components/TradeModal';
import ReportOverlay from './components/ReportOverlay';
import PsychologyTips from './components/PsychologyTips';
import Auth from './components/Auth';
import { TradeEntry, ReportPeriod } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    }, (error) => {
      console.error("Auth error:", error);
      setConnectionError("Failed to connect to authentication service. Check your Firebase API key.");
      setLoading(false);
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setTrades([]);
      return;
    }

    try {
      const q = query(
        collection(db, "trades"), 
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribeTrades = onSnapshot(q, (snapshot) => {
        const tradesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TradeEntry[];
        setTrades(tradesList);
        setConnectionError(null);
      }, (error) => {
        console.error("Firestore error:", error);
        if (error.code === 'permission-denied') {
          setConnectionError("Access denied. Ensure Firestore rules are set to allow authenticated users.");
        } else {
          setConnectionError("Database connection issue. Verify your Firebase configuration.");
        }
      });

      return () => unsubscribeTrades();
    } catch (e) {
      console.error("Setup query error:", e);
    }
  }, [user]);

  const handleAddTrade = async (newTrade: Omit<TradeEntry, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "trades"), {
        ...newTrade,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error adding trade: ", e);
      alert("Failed to save trade. Check your database permissions.");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter(t => t.profit > 0).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const totalProfit = trades.reduce((acc, t) => acc + t.profit, 0);
    const disciplineRate = total > 0 ? (trades.filter(t => t.isDisciplined).length / total) * 100 : 0;

    return { total, winRate, totalProfit, disciplineRate };
  }, [trades]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest text-center">Synchronizing with the markets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {connectionError && (
        <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-4 text-center sticky top-0 z-[60] flex items-center justify-center gap-4">
          <i className="fa-solid fa-circle-exclamation"></i>
          {connectionError}
          <button onClick={() => window.location.reload()} className="underline hover:text-rose-100">Retry</button>
        </div>
      )}
      
      {!user ? (
        <Auth onAuthSuccess={() => {}} />
      ) : (
        <>
          <nav className="glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <i className="fa-solid fa-brain text-white text-xl"></i>
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Braintrader</h1>
                 <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Mindful Edge</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Welcome</p>
                    <p className="text-sm font-black text-slate-800">Hi, {user.displayName || user.email.split('@')[0]}</p>
                 </div>
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                   alt="Profile" 
                   className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 p-0.5"
                 />
              </div>
              
              <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

              <button 
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all font-bold text-slate-700 text-sm shadow-sm"
              >
                <i className="fa-solid fa-chart-pie text-indigo-500"></i>
                Analyze
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all font-bold text-white shadow-lg shadow-indigo-500/30 text-sm"
              >
                <i className="fa-solid fa-plus"></i>
                New Entry
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <i className="fa-solid fa-power-off"></i>
              </button>
            </div>
          </nav>

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon="fa-bullseye" color="text-white" bg="bg-gradient-to-br from-indigo-500 to-blue-700" />
              <StatCard label="Net Profit" value={`$${stats.totalProfit.toLocaleString()}`} icon="fa-wallet" color="text-white" bg="bg-gradient-to-br from-violet-500 to-indigo-700" />
              <StatCard label="Discipline" value={`${stats.disciplineRate.toFixed(1)}%`} icon="fa-brain" color="text-white" bg="bg-gradient-to-br from-indigo-600 to-violet-800" />
              <StatCard label="Total Trades" value={stats.total.toString()} icon="fa-list-check" color="text-white" bg="bg-gradient-to-br from-slate-700 to-slate-900" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Dashboard trades={trades} />
              </div>

              <div className="space-y-6">
                <PsychologyTips />
                <div className="glass rounded-3xl p-8 border border-slate-200 bg-white shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-800">
                      <i className="fa-solid fa-lightbulb text-amber-500"></i>
                      Daily Mantra
                    </h3>
                    <p className="text-slate-600 italic leading-relaxed text-sm font-medium">
                      "I am a professional risk manager who happens to trade. I follow my plan, manage my emotions, and accept that outcomes are probabilistic."
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000"></div>
                </div>
              </div>
            </div>
          </main>

          {isModalOpen && <TradeModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddTrade} />}
          {isReportOpen && <ReportOverlay trades={trades} onClose={() => setIsReportOpen(false)} onExport={() => {}} userName={user.displayName || user.email} initialPeriod={reportPeriod} />}
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: string, color: string, bg: string }> = ({ label, value, icon, color, bg }) => (
  <div className={`${bg} rounded-[2rem] p-6 transition-all hover:scale-[1.03] hover:shadow-2xl border border-white/20 relative overflow-hidden group shadow-lg`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/80 font-black text-xs uppercase tracking-widest">{label}</span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/20 ${color}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>
      <div className="text-3xl font-black text-white tracking-tight">{value}</div>
    </div>
    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
  </div>
);

export default App;
