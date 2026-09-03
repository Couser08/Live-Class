import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useAuthStore, isMentorEmail } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useUIStore } from '../../stores/uiStore';
import { ShieldCheck, GraduationCap, Mail, LogOut, Settings, RefreshCw, Radio, CheckCircle2, Sparkles, Gift } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, closeProfileModal, openAuthModal, signOut } = useAuthStore();
  const { currentUser } = useSessionStore();
  const { setActiveNavTab, addToast, openClaimRewardModal } = useUIStore();

  const activeUser = user || currentUser;
  const isMentor = isMentorEmail(activeUser?.email);
  const isPro = activeUser?.isPro || false;

  if (!activeUser) return null;

  const handleSignOut = async () => {
    await signOut();
    closeProfileModal();
    addToast({
      type: 'info',
      title: 'Signed Out',
      description: 'You have been signed out of CodeBuddy.',
    });
  };

  const handleOpenSettings = () => {
    closeProfileModal();
    setActiveNavTab('settings');
  };

  const handleSwitchAccount = () => {
    closeProfileModal();
    openAuthModal('signin');
  };

  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
      title="User Account Profile"
      description="Manage your account, teaching status, and authentication credentials"
    >
      <div className="space-y-5 pt-2">
        {/* Profile Card Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/30 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-4">
          <Avatar
            src={activeUser.avatarUrl}
            name={activeUser.name}
            isOnline={activeUser.isOnline}
            size="lg"
            className="ring-2 ring-indigo-500/30 shadow-md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white truncate">
                {activeUser.name}
              </h3>
              {isMentor ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Mentor</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Learner</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px] truncate">{activeUser.email}</span>
              <span title="Verified email" className="inline-flex items-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              </span>
            </div>
          </div>
        </div>

        {/* Pro Membership Banner */}
        {isPro ? (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>CodeBuddy Pro Member</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">PRO</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {activeUser.proPlan || '12-Month Free Trial Reward'} • Valid till Sep 2027
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeProfileModal();
                setActiveNavTab('subscription');
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Perks
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Claim 12-Month Pro Free Trial
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Beta Launch Reward: 100% Free for 1 Year
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeProfileModal();
                openClaimRewardModal();
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              Claim ₹0
            </button>
          </div>
        )}

        {/* Status & Privileges Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Teaching Role
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {isMentor ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Full Mentor Access</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Student Follower</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Classroom Privileges
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {isMentor ? 'Live Broadcast & Notes' : 'Interactive Sandbox'}
            </div>
          </div>
        </div>

        {/* Actions List */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleOpenSettings}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Account Settings
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Appearance, profile info & preferences
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">→</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchAccount}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Switch Account
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Log in with another email or demo user
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">→</span>
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl py-2.5 font-bold text-xs"
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign Out of CodeBuddy
          </Button>
        </div>
      </div>
    </Modal>
  );
};
