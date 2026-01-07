
import React, { useState, useEffect } from 'react';

const tips = [
  { title: "Avoid FOMO", body: "The market will always be there tomorrow. Don't chase a trade that has already left the station.", icon: "https://cdn-icons-png.flaticon.com/512/1356/1356479.png" },
  { title: "Risk First", body: "Never enter a trade without knowing exactly where you will exit if you are wrong.", icon: "https://cdn-icons-png.flaticon.com/512/2620/2620611.png" },
  { title: "Detach from Outcome", body: "Focus on the process, not the money. A losing trade can still be a 'good' trade if you followed your plan.", icon: "https://cdn-icons-png.flaticon.com/512/1045/1045239.png" },
  { title: "Revenge Trading", body: "If you feel angry after a loss, close your platform. Your emotions are now your biggest liability.", icon: "https://cdn-icons-png.flaticon.com/512/9131/9131546.png" },
  { title: "Size Matters", body: "If you can't sleep because of a position, your size is too big. Scale down until you are indifferent.", icon: "https://cdn-icons-png.flaticon.com/512/2534/2534351.png" }
];

const PsychologyTips: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass rounded-[2rem] p-8 border border-indigo-200 bg-white relative overflow-hidden group shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform duration-700 group-hover:scale-110 pointer-events-none">
         <img src={tips[index].icon} alt="Mindset Icon" className="w-32 h-32" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-indigo-600 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center animate-pulse">
            <i className="fa-solid fa-brain"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mindset Coach</span>
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">
          {tips[index].title}
        </h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed min-h-[60px] max-w-[80%]">
          {tips[index].body}
        </p>
        <div className="flex gap-2 mt-8">
          {tips.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${i === index ? 'w-10 bg-indigo-500 shadow-md' : 'w-2 bg-slate-100'}`}
              onClick={() => setIndex(i)}
            ></div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
         <div 
           className="h-full bg-indigo-500 transition-all duration-[10000ms] ease-linear"
           style={{ width: '100%', transformOrigin: 'left' }}
           key={index}
         ></div>
      </div>
    </div>
  );
};

export default PsychologyTips;
