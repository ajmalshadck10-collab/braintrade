
import React, { useState } from 'react';
import { TradeEntry, OrderSide } from '../types';

interface DashboardProps {
  trades: TradeEntry[];
}

type FilterPeriod = 'all' | 'today' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | '3-month' | '6-month' | 'this-year' | 'last-year';

const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>('all');

  const getFilteredTrades = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return trades.filter(t => {
      const tradeDate = new Date(t.date).getTime();
      switch (filter) {
        case 'today': return tradeDate >= today;
        case 'this-week': {
          const startOfWeek = now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000);
          return tradeDate >= startOfWeek;
        }
        case 'this-month': return new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear();
        default: return true;
      }
    });
  };

  const filteredTrades = getFilteredTrades();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden bg-white shadow-xl">
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Trade Journal</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">History of Execution</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <i className="fa-solid fa-filter text-slate-300 mr-2 text-sm"></i>
          {(['all', 'today', 'this-week', 'this-month'] as FilterPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
                filter === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-widest">
              <th className="px-8 py-4 font-black">Instrument / Date</th>
              <th className="px-6 py-4 font-black">Action</th>
              <th className="px-6 py-4 font-black text-center">Lot</th>
              <th className="px-6 py-4 font-black">Levels</th>
              <th className="px-6 py-4 font-black">Net P/L</th>
              <th className="px-8 py-4 font-black text-right">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                  <div className="animate-bounce mb-4">
                    <i className="fa-solid fa-magnifying-glass text-5xl opacity-10"></i>
                  </div>
                  <p className="font-bold">No trades found in this timeframe.</p>
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => (
                <React.Fragment key={trade.id}>
                  <tr 
                    onClick={() => toggleExpand(trade.id)}
                    className={`cursor-pointer transition-all ${expandedId === trade.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-900">{trade.symbol}</div>
                      <div className="text-[10px] font-bold text-slate-400">{trade.date}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                        trade.side === OrderSide.LONG 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                      }`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono font-bold text-slate-600">
                      {trade.lotSize.toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-black text-slate-700">${trade.entryPrice}</div>
                      <div className="text-[10px] font-bold text-slate-400">→ ${trade.exitPrice}</div>
                    </td>
                    <td className={`px-6 py-5 font-mono font-black text-sm ${trade.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <i className={`fa-solid fa-chevron-down text-slate-300 transition-transform duration-300 ${expandedId === trade.id ? 'rotate-180 text-indigo-500' : ''}`}></i>
                    </td>
                  </tr>
                  {expandedId === trade.id && (
                    <tr className="bg-slate-50/30">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Execution Analysis</h4>
                              <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                {trade.reason || "No technical reasoning documented."}
                              </p>
                            </div>
                            <div className="flex gap-4">
                              <div className={`flex-1 p-3 rounded-2xl border ${trade.followedRules ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} text-center`}>
                                <i className={`fa-solid ${trade.followedRules ? 'fa-check-circle' : 'fa-times-circle'} mb-1`}></i>
                                <div className="text-[10px] font-black uppercase">Edge Followed</div>
                              </div>
                              <div className={`flex-1 p-3 rounded-2xl border ${trade.isDisciplined ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'} text-center`}>
                                <i className={`fa-solid fa-brain mb-1`}></i>
                                <div className="text-[10px] font-black uppercase">Focus</div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Trader Rating</h4>
                              <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <i key={s} className={`fa-solid fa-star ${s <= trade.rating ? 'text-amber-400' : 'text-slate-200'}`}></i>
                                ))}
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Setup Type</h4>
                               <div className="text-sm font-bold text-slate-800">{trade.strategy || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
