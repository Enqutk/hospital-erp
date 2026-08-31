import React, { useState } from 'react';
import {
  Activity,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Stethoscope,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DEMO_USERS } from '../../data/mockData';

export const LoginScreen: React.FC = () => {
  const { login, loginAsUser } = useHospital();

  const [authTab, setAuthTab] = useState<'DEMO_ROLES' | 'CREDENTIALS'>('DEMO_ROLES');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchStaff, setSearchStaff] = useState('');

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setLoginError('Incorrect credentials. Please try again or select a role below.');
      }
      setLoading(false);
    }, 200);
  };

  const filteredUsers = DEMO_USERS.filter((u) => {
    const q = searchStaff.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans antialiased">
      
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-1.5">
              <span>VitalSync<span className="text-emerald-600">ERP</span></span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Hospital System
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Faya Primary Hospital Management Information System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-[11px]">System Online</span>
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header Title Area */}
          <div className="p-6 sm:p-8 pb-4 text-center border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Hospital Staff Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Authenticate into your clinical workstation or select a role to begin your shift.
            </p>

            {/* Clean Segmented Tab Switcher */}
            <div className="inline-flex items-center bg-slate-200/70 p-1 rounded-xl mt-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthTab('DEMO_ROLES')}
                className={`px-5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  authTab === 'DEMO_ROLES'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1-Click Role Login
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('CREDENTIALS')}
                className={`px-5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  authTab === 'CREDENTIALS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In with Credentials
              </button>
            </div>
          </div>

          {/* TAB 1: 1-CLICK ROLE LOGIN */}
          {authTab === 'DEMO_ROLES' && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-700">
                  Select Staff Role ({filteredUsers.length})
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search role or name..."
                    value={searchStaff}
                    onChange={(e) => setSearchStaff(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs outline-hidden text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto no-scrollbar pt-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => loginAsUser(user.id)}
                    className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {user.role.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {user.department}
                        </div>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS SIGN IN */}
          {authTab === 'CREDENTIALS' && (
            <div className="p-6 sm:p-8 max-w-md mx-auto">
              {loginError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleStandardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username or Staff ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 rounded-xl text-xs outline-hidden text-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Default: <code className="text-emerald-700 font-semibold">password123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password123"
                      required
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 rounded-xl text-xs outline-hidden text-slate-900 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to Terminal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer inside card */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Role-Based Access Control (RBAC) Active</span>
            </div>
            <span className="font-mono text-slate-400">HMIS v2.4</span>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        Faya Primary Hospital Management Information System • Secure Institutional Portal
      </footer>

    </div>
  );
};
