import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  User,
  LogOut,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const LockScreenModal: React.FC = () => {
  const { currentUser, isLocked, unlockScreen, logout, switchRole, users } = useHospital();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockScreen(pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  const handleNumpadClick = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        setTimeout(() => {
          unlockScreen(nextPin);
        }, 150);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl mx-auto flex items-center justify-center text-amber-400 mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          Terminal Locked
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hospital security policy: Clinical session paused for data privacy.
        </p>

        {/* Active User Banner */}
        <div className="my-5 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center space-x-3 text-left">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-white truncate">
              {currentUser.name}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                {currentUser.department}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                PIN: {currentUser.pinCode || '1234'}
              </span>
            </div>
          </div>
        </div>

        {/* PIN Input & Interactive Numpad */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <div className="flex justify-center items-center gap-3 my-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    pin.length > idx
                      ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-500'
                      : error
                      ? 'border-rose-500 bg-rose-500/20 animate-shake'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium">
                Invalid Security PIN. Try {currentUser.pinCode || '1234'} or click Quick Unlock below.
              </p>
            )}
          </div>

          {/* Interactive Numpad */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') handleClear();
                  else if (key === '⌫') setPin((p) => p.slice(0, -1));
                  else handleNumpadClick(key);
                }}
                className="h-11 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700/60 active:scale-95 cursor-pointer"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Quick Unlock Action Button */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => unlockScreen(currentUser.pinCode || '1234')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Quick Unlock Session</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 border border-slate-700 text-slate-300 font-medium py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Completely</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
