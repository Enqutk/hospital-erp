import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DEMO_USERS } from '../../data/mockData';

export const LoginScreen: React.FC = () => {
  const { login, loginAsUser } = useHospital();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setLoginError('Invalid credentials. Try "admin" / "password123" or select a staff profile.');
      }
      setLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans">
      {/* Simple Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                FAYA PRIMARY HOSPITAL
              </h1>
              <p className="text-[11px] text-slate-400">
                Hospital Management Information System (HMIS)
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Server Online</span>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 flex flex-col lg:flex-row items-center justify-center gap-8">
        
        {/* Left: Sign In Form */}
        <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Staff Sign In
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials or click a role to sign in.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username or Staff ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">
                  Default: <code className="text-emerald-400">password123</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control enforced</span>
          </div>
        </div>

        {/* Right: Clean Staff Profiles List */}
        <div className="w-full max-w-xl">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-white">
              Instant Staff Profiles (1-Click Login)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a staff member to authenticate into their assigned station:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto no-scrollbar">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => loginAsUser(user.id)}
                className="text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {user.role.replace('_', ' ')} • {user.department}
                    </div>
                  </div>
                </div>

                <div className="w-6 h-6 rounded bg-slate-800 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 px-6 py-2.5 text-center text-xs text-slate-500">
        Faya Primary Hospital Management System • Data Privacy Protected
      </footer>
    </div>
  );
};
