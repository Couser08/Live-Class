import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuthStore, MENTOR_EMAIL } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Mail, Lock, User, ShieldCheck, GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, signIn, signUp, demoLogin, isLoading } = useAuthStore();
  const { addToast } = useUIStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSignUp = authModalMode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Fields',
        description: 'Please enter both your email and password.',
      });
      return;
    }

    if (isSignUp && !name.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Name',
        description: 'Please enter your full name.',
      });
      return;
    }

    if (isSignUp) {
      const res = await signUp(name, email, password);
      if (res.success) {
        const isMentor = email.trim().toLowerCase() === MENTOR_EMAIL.toLowerCase();
        addToast({
          type: 'success',
          title: `Welcome to CodeBuddy, ${name}!`,
          description: isMentor ? 'Logged in as Mentor with full teaching permissions.' : 'Logged in as Student. Ready to learn!',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Sign Up Failed',
          description: res.error || 'Please try again.',
        });
      }
    } else {
      const res = await signIn(email, password);
      if (res.success) {
        const isMentor = email.trim().toLowerCase() === MENTOR_EMAIL.toLowerCase();
        addToast({
          type: 'success',
          title: 'Signed in successfully!',
          description: isMentor ? 'Logged in as Mentor with full broadcast privileges.' : 'Logged in as Student.',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Sign In Failed',
          description: res.error || 'Invalid email or password.',
        });
      }
    }
  };

  const handleDemo = (role: 'mentor' | 'student') => {
    demoLogin(role);
    addToast({
      type: 'success',
      title: role === 'mentor' ? 'Logged in as Mentor' : 'Logged in as Student',
      description: role === 'mentor' ? `Using ${MENTOR_EMAIL}` : 'Using student@codebuddy.app',
    });
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={isSignUp ? 'Create your Account' : 'Welcome back'}
      description="Connect to CodeBuddy Live Classrooms as a Mentor or Student"
    >
      <div className="space-y-4 pt-2">
        {/* Quick 1-Click Demo Login Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Instant 1-Click Demo Logins</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('mentor')}
              className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-2xs transition-all cursor-pointer hover:scale-[1.01]"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div className="text-left leading-tight truncate">
                <div>Mentor Mode</div>
                <div className="text-[9px] font-normal text-slate-400 truncate">Rahul (Broadcast)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('student')}
              className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs transition-all cursor-pointer hover:scale-[1.01]"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-left leading-tight truncate">
                <div>Student Mode</div>
                <div className="text-[9px] font-normal text-slate-400 truncate">Aarav (Follower)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className={cn(
              'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
              !isSignUp ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className={cn(
              'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
              isSignUp ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            Create Account
          </button>
        </div>

        {/* Info Note on Mentor vs Student email rule */}
        <div className="text-[11px] p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
          💡 Email <span className="font-bold font-mono">{MENTOR_EMAIL}</span> automatically receives <span className="font-bold">Mentor</span> privileges. All other emails join as <span className="font-bold">Students</span>.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeAuthModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="px-5 font-bold"
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
