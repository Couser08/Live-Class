import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuthStore, MENTOR_EMAIL } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Mail, Lock, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, signIn, signUp, isLoading, user } = useAuthStore();
  const { addToast } = useUIStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSignUp = authModalMode === 'signup';
  const isNewUser = !user;

  const handleClose = () => {
    if (isNewUser) {
      addToast({
        type: 'info',
        title: 'Account Required',
        description: 'Please sign in or create an account to enter CodeBuddy classrooms.',
      });
      return;
    }
    closeAuthModal();
  };

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

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={handleClose}
      title={isSignUp ? 'Create your Account' : 'Welcome back'}
      description={
        isNewUser
          ? 'Please create an account or sign in to enter CodeBuddy Live Classrooms'
          : 'Connect to CodeBuddy Live Classrooms as a Mentor or Student'
      }
    >
      <div className="space-y-4 pt-2">
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

          <div className="pt-2">
            {!isNewUser ? (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
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
            ) : (
              <Button
                type="submit"
                size="md"
                disabled={isLoading}
                fullWidth
                className="rounded-xl py-3 font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/20"
              >
                {isLoading ? 'Please wait...' : isSignUp ? 'Create Student Account 🚀' : 'Sign In to Classroom'}
              </Button>
            )}
          </div>

          {/* Quick toggle link */}
          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to CodeBuddy?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
