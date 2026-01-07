
import React, { useState } from 'react';
import { TradeEntry, OrderSide, TradeType } from '../types';

interface TradeModalProps {
  onClose: () => void;
  onSubmit: (trade: Omit<TradeEntry, 'id'>) => void;
}

const DEFAULT_SYMBOLS = ["XAUUSD", "EURUSD", "GBPUSD", "USDCHF", "USDJPY"];

const TradeModal: React.FC<TradeModalProps> = ({ onClose, onSubmit }) => {
  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const initialFormState = {
    date: getTodayString(),
    symbol: DEFAULT_SYMBOLS[0],
    lotSize: 0.01,
    side: OrderSide.LONG,
    type: TradeType.MARKET,
    strategy: '',
    entryPrice: 0,
    exitPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    reason: '',
    assumptions: '',
    isDisciplined: true,
    followedRules: true,
    rating: 5
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const multiplier = 100; 
    const profit = (formData.side === OrderSide.LONG 
      ? (formData.exitPrice - formData.entryPrice) 
      : (formData.entryPrice - formData.exitPrice)) * (formData.lotSize * multiplier);

    const newTradeData = {
      ...formData,
      positionSize: formData.lotSize,
      profit: parseFloat(profit.toFixed(2)),
      timestamp: new Date(formData.date).getTime()
    };
    
    onSubmit(newTradeData);
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto animate-fadeIn">
        <div className="relative h-40 bg-indigo-600 flex items-center px-10">
          <div className="absolute inset-0 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-1">New Trade Record</h2>
            <p className="text-indigo-100 font-medium">Log your execution and mental state.</p>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <i className="fa-solid fa-bolt-lightning"></i>
              <h3 className="font-bold uppercase tracking-widest text-xs">Execution Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Symbol</label>
                <select 
                  value={formData.symbol} 
                  onChange={e => setFormData({...formData, symbol: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold"
                >
                  {DEFAULT_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="CUSTOM">OTHER...</option>
                </select>
                {formData.symbol === "CUSTOM" && (
                  <input 
                    placeholder="Enter Symbol"
                    className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm"
                    onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Lot Size</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.01" 
                  required
                  value={formData.lotSize || ''} 
                  onChange={e => setFormData({...formData, lotSize: parseFloat(e.target.value)})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm font-mono" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Side</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, side: OrderSide.LONG})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.side === OrderSide.LONG ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >LONG</button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, side: OrderSide.SHORT})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.side === OrderSide.SHORT ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >SHORT</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Entry Price</label>
                <input type="number" step="any" required value={formData.entryPrice || ''} onChange={e => setFormData({...formData, entryPrice: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Exit Price</label>
                <input type="number" step="any" required value={formData.exitPrice || ''} onChange={e => setFormData({...formData, exitPrice: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm font-mono" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-indigo-600">
                <i className="fa-solid fa-brain"></i>
                <h3 className="font-bold uppercase tracking-widest text-xs">Analysis</h3>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Strategy Name</label>
                <input placeholder="e.g. Trend Continuation" value={formData.strategy} onChange={e => setFormData({...formData, strategy: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Reasoning</label>
                <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm h-24 resize-none" placeholder="What did you see in the charts?" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-amber-600">
                <i className="fa-solid fa-star"></i>
                <h3 className="font-bold uppercase tracking-widest text-xs">Self Review</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:bg-slate-100">
                    <span className="text-sm font-bold text-slate-700">Rules Followed</span>
                    <input type="checkbox" checked={formData.followedRules} onChange={e => setFormData({...formData, followedRules: e.target.checked})} className="w-5 h-5 rounded accent-indigo-600" />
                  </label>
                  <label className="flex-1 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:bg-slate-100">
                    <span className="text-sm font-bold text-slate-700">Disciplined</span>
                    <input type="checkbox" checked={formData.isDisciplined} onChange={e => setFormData({...formData, isDisciplined: e.target.checked})} className="w-5 h-5 rounded accent-indigo-600" />
                  </label>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <label className="text-xs font-bold text-indigo-600 uppercase mb-3 block">Overall Confidence</label>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className={`text-3xl transition-all transform hover:scale-110 ${star <= formData.rating ? 'text-amber-500' : 'text-slate-300'}`}>
                        <i className="fa-solid fa-star"></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
              Cancel
            </button>
            <button type="submit" className="px-12 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 transition-all">
              Save Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
