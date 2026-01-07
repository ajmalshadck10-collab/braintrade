
import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TradeEntry, ReportPeriod } from '../types';

interface ReportOverlayProps {
  trades: TradeEntry[];
  onClose: () => void;
  onExport: () => void;
  userName?: string;
  initialPeriod?: ReportPeriod;
}

const ReportOverlay: React.FC<ReportOverlayProps> = ({ trades, onClose, onExport, userName, initialPeriod }) => {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod || 'monthly');

  useEffect(() => {
    if (initialPeriod) {
      setPeriod(initialPeriod);
    }
  }, [initialPeriod]);

  const filteredData = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    let cutoff: number;
    switch(period) {
      case 'daily': cutoff = now - dayMs; break;
      case 'weekly': cutoff = now - (7 * dayMs); break;
      case 'monthly': cutoff = now - (30 * dayMs); break;
      case '3month': cutoff = now - (90 * dayMs); break;
      case '6month': cutoff = now - (180 * dayMs); break;
      case 'year': cutoff = now - (365 * dayMs); break;
      default: cutoff = 0;
    }

    const periodTrades = trades
      .filter(t => t.timestamp >= cutoff)
      .sort((a, b) => a.timestamp - b.timestamp);

    let cumulative = 0;
    return periodTrades.map(t => {
      cumulative += t.profit;
      return {
        date: new Date(t.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        profit: t.profit,
        equity: cumulative,
        symbol: t.symbol
      };
    });
  }, [trades, period]);

  const metrics = useMemo(() => {
    if (filteredData.length === 0) return null;
    const wins = filteredData.filter(d => d.profit > 0);
    const losses = filteredData.filter(d => d.profit < 0);
    const avgWin = wins.length ? wins.reduce((a, b) => a + b.profit, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, b) => a + b.profit, 0) / losses.length) : 0;
    const profitFactor = avgLoss === 0 ? wins.reduce((a, b) => a + b.profit, 0) : (wins.reduce((a, b) => a + b.profit, 0) / Math.abs(losses.reduce((a, b) => a + b.profit, 0)));

    return {
      totalPnl: filteredData[filteredData.length - 1].equity,
      winRate: (wins.length / filteredData.length) * 100,
      count: filteredData.length,
      profitFactor: isFinite(profitFactor) ? profitFactor.toFixed(2) : 'N/A'
    };
  }, [filteredData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 overflow-y-auto">
      <div id="report-content" className="bg-white w-full max-w-6xl h-fit min-h-[85vh] rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden my-auto animate-fadeIn">
        
        {/* Updated Header Background: Elegant Indigo-to-Purple Gradient */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-12 overflow-hidden flex items-end">
           <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-black/20 z-10"></div>
              <img src="https://www.transparenttextures.com/patterns/cubes.png" className="w-full h-full object-repeat opacity-40" alt="pattern" />
           </div>
           <div className="relative z-10 flex items-center justify-between w-full">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/20">
                      <i className="fa-solid fa-chart-line text-2xl"></i>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Performance <span className="text-indigo-300">Terminal</span></h1>
                 </div>
                 <p className="text-indigo-200/80 font-bold uppercase tracking-[0.25em] text-[9px]">Analytical Intelligence Engine</p>
              </div>
              <div className="text-right text-white">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Account Owner</p>
                 <p className="text-xl font-bold">{userName || 'Master Trader'}</p>
                 <p className="text-[10px] font-medium opacity-60">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
           </div>
           
           <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md border border-white/10">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="px-12 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
            {(['daily', 'weekly', 'monthly', '3month', '6month', 'year'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  period === p ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-12 space-y-12 bg-slate-50/50">
          {metrics ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 <StatBox label="Net Profit" value={`$${metrics.totalPnl.toLocaleString()}`} icon="fa-wallet" color="bg-emerald-50 text-emerald-600" />
                 <StatBox label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} icon="fa-bullseye" color="bg-indigo-50 text-indigo-600" />
                 <StatBox label="Profit Factor" value={metrics.profitFactor.toString()} icon="fa-scale-balanced" color="bg-amber-50 text-amber-600" />
                 <StatBox label="Trades Count" value={metrics.count.toString()} icon="fa-hashtag" color="bg-slate-50 text-slate-600" />
              </div>

              <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-chart-area text-indigo-600"></i> Equity Curve Evolution
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Growth</span>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                      <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickMargin={15} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                        itemStyle={{ color: '#6366f1', fontWeight: '800', fontSize: '14px' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}
                      />
                      <Area type="monotone" dataKey="equity" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorEquity)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-10">
                 <p>Braintrader Proprietary Analytics</p>
                 <p>© {new Date().getFullYear()} Braintrader Journal</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-300">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <i className="fa-solid fa-chart-simple text-4xl opacity-20"></i>
              </div>
              <p className="text-xl font-bold text-slate-400">Insufficient Data</p>
              <p className="text-sm font-medium mt-1">Log more trades to visualize your {period} performance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: string, icon: string, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
     </div>
     <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
     </div>
  </div>
);

export default ReportOverlay;