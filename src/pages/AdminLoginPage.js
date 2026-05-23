import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Attempting admin login with email:', email);
      
      // Call admin login API
      const response = await API.post('/simple-auth/admin/login', {
        email: email.trim(),
        password: password
      });

      console.log('✅ Login response:', response.data);

      if (response.data && response.data.success) {
        setSuccess('✅ Login successful! Redirecting to admin dashboard...');
        
        // Store admin data - MUST store 'user' for SimpleProtectedRoute to work
        const adminData = response.data.user || response.data;
        const userObject = {
          _id: adminData._id || adminData.id,
          id: adminData._id || adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: 'admin'
        };
        
        // Store full user object for route protection
        localStorage.setItem('user', JSON.stringify(userObject));
        localStorage.setItem('adminToken', response.data.token);
        // Also save as the generic `token` so API client picks it up
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('✅ Saved JWT to localStorage.token for API client');
        }
        localStorage.setItem('adminId', adminData._id || adminData.id);
        localStorage.setItem('adminEmail', adminData.email);
        localStorage.setItem('adminName', adminData.name);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('isAdminLoggedIn', 'true');

        console.log('✅ Admin data stored in localStorage:', userObject);
        console.log('📍 Redirecting to /admin/dashboard...');

        // Redirect after short delay
        setTimeout(() => {
          console.log('🚀 Navigating to admin dashboard');
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        setError(response.data?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Admin login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to login. Please check your email and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0d0d20 0%, #1e1050 50%, #3b0764 100%)' }}
      >
        {/* Decorative glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.2), transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>E</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">EduPlatform</p>
            <p className="text-purple-300 text-xs leading-tight opacity-80">Admin Portal</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 text-purple-200 text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Control Centre
          </span>
          <h2 className="text-[2.2rem] font-bold text-white leading-snug mb-4">
            University<br />Management<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #a78bfa, #c4b5fd)' }}>
              Dashboard
            </span>
          </h2>
          <p className="text-purple-200/65 text-sm leading-relaxed max-w-xs">
            Administer users, courses, analytics, and platform operations from a single unified interface.
          </p>

          <ul className="mt-8 space-y-3.5">
            {[
              'Real-time student & lecturer analytics',
              'Full course and content management',
              'System logs & audit trail',
              'Live session monitoring',
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-accent-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span className="text-purple-100/80 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-purple-400/40 text-xs">© 2026 EduPlatform. All rights reserved.</p>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] animate-fadeIn">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>E</div>
            <span className="font-bold text-gray-900">EduPlatform</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Administrator Sign In</h1>
          <p className="text-gray-400 text-sm mb-8">Access the university management system</p>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent flex-shrink-0" />
              <p className="text-emerald-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@university.edu"
                required
                disabled={isLoading}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="btn-primary w-full mt-2"
              style={(!isLoading && email && password) ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' } : {}}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Signing in…
                </>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Credentials hint */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-xs font-bold mb-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Default Admin Credentials
            </p>
            <p className="text-amber-700 text-xs font-mono">admin@educationplatform.com</p>
            <p className="text-amber-700 text-xs font-mono">Change@123</p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <a href="https://online-class-sigma.vercel.app/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              ← Return to student / lecturer login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
