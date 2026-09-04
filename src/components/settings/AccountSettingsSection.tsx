import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Camera, Check, ShieldCheck, KeyRound } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const AccountSettingsSection: React.FC = () => {
  const { account, updateAccount } = useSettingsStore();
  const { setCurrentUser } = useSessionStore();
  const { user: authUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    name: account.name || authUser?.name || 'Rahul Sharma',
    email: account.email || authUser?.email || 'tungariyarahul08@gmail.com',
    bio: account.bio,
    role: account.role,
    avatarUrl: account.avatarUrl || authUser?.avatarUrl || AVATAR_PRESETS[0],
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccount(formData);
    setCurrentUser({
      name: formData.name,
      avatarUrl: formData.avatarUrl,
    });

    // Synchronize across authStore and localStorage
    const currentAuth = useAuthStore.getState().user;
    if (currentAuth) {
      const updatedAuth = {
        ...currentAuth,
        name: formData.name,
        avatarUrl: formData.avatarUrl,
      };
      useAuthStore.setState({ user: updatedAuth });
      localStorage.setItem('codebuddy_auth_user', JSON.stringify(updatedAuth));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('codebuddy_auth_change', { detail: updatedAuth }));
      }
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    addToast({
      type: 'success',
      title: 'Profile Updated',
      description: 'Your account profile changes have been saved.',
    });
  };

  const handleResetPassword = async () => {
    if (!formData.email) return;
    setIsResettingPassword(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) throw error;
        addToast({
          type: 'success',
          title: 'Password Reset Sent',
          description: `Password recovery link sent to ${formData.email}.`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Offline / Demo Mode',
          description: `Password recovery link simulated for ${formData.email}.`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        description: err.message || 'Could not send reset link.',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your public mentor identity, contact details, and security.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/80">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Mentor</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            <Avatar src={formData.avatarUrl} name={formData.name} size="lg" isOnline={true} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs cursor-pointer">
              <Camera className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Choose Profile Avatar</h4>
            <div className="flex items-center gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, avatarUrl: preset })}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                    formData.avatarUrl === preset ? 'border-indigo-600 scale-110 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bio / Teaching Motto</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Security / Password Action */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Password & Authentication</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Secure Supabase Auth</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isResettingPassword}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isResettingPassword ? 'Sending...' : 'Change Password'}
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="md"
            className="rounded-xl px-5 font-bold"
            icon={isSaved ? <Check className="w-4 h-4 text-emerald-200" /> : undefined}
          >
            {isSaved ? 'Saved Successfully!' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
