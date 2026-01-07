
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          mobile,
          createdAt: new Date().toISOString()
        });
        
        onAuthSuccess(user);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('api-key-not-valid')) {
        setError("Invalid Firebase API Key. Please update firebase.ts with your actual Project Credentials.");
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 to-violet-900 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="https://www.transparenttextures.com/patterns/cubes.png" alt="pattern" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 text-center animate-fadeIn">
            <div className="relative w-56 h-56 bg-white/10 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-md border border-white/20">
               <div className="flex flex-col items-center">
                  <i className="fa-solid fa-user-tie text-5xl mb-2 text-white"></i>
                  <i className="fa-solid fa-desktop text-6xl text-indigo-300"></i>
               </div>
               <i className="fa-solid fa-arrow-trend-up absolute top-4 right-4 text-indigo-300 animate-pulse"></i>
               <i className="fa-solid fa-chart-line absolute bottom-4 left-4 text-indigo-300 opacity-50"></i>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Elite Trading Journal</h2>
            <p className="text-indigo-100/80 text-lg max-w-sm mx-auto font-medium">Optimize your performance with data-driven psychology and execution tracking.</p>
          </div>
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-brain text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Braintrader</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">{isLogin ? 'Trader Access' : 'Create Account'}</h2>
            <p className="text-slate-500 font-medium">{isLogin ? 'Log back into your performance center.' : 'Start your journey to disciplined trading.'}</p>
          </div>

          <div className="flex gap-4 mb-8 p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >Login</button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >Register</button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold animate-fadeIn">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Trader Name</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" 
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mobile Number</label>
                  <input 
                    type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" 
                    placeholder="+1 234 567 890"
                  />
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Email Address</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" 
                placeholder="trader@braintrader.ai"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Secure Password</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" 
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                   <i className="fa-solid fa-circle-notch animate-spin"></i> Processing...
                </span>
              ) : (isLogin ? 'Launch Terminal' : 'Create My Journal')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
