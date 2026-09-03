import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Presentation,
  Code2,
  FileText,
  FolderKanban,
  Trophy,
  History,
  Settings,
  Diamond,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const currentUser = useSessionStore((state) => state.currentUser);
  const { user: authUser, openAuthModal, openProfileModal } = useAuthStore();
  const activeUser = authUser || currentUser;
  const {
    activeNavTab,
    setActiveNavTab,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useUIStore();

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'sessions', label: 'Sessions', icon: Presentation },
    { id: 'languages', label: 'Languages', icon: Code2 },
    { id: 'my-notes', label: 'My Notes', icon: FileText },
    { id: 'subscription', label: 'Pro Plans (₹0)', icon: Sparkles },
    { id: 'resources', label: 'Resources', icon: FolderKanban },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleProUpgrade = () => {
    setActiveNavTab('subscription');
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3.5 select-none overflow-x-hidden">
      {/* Top Header / Brand */}
      <div>
        <div className="flex items-center justify-between pb-4 pt-1 px-1">
          <div
            onClick={() => setActiveNavTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1"
              >
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  CodeBuddy
                </span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/40" />
              </motion.div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 mt-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNavTab(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer',
                  isSidebarCollapsed ? 'justify-center px-2' : 'justify-start',
                  isActive
                    ? 'bg-accent-light text-accent-primary font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-accent-primary' : 'text-slate-500 dark:text-slate-400'
                  )}
                />
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Pro Banner */}
      <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/70">
        {/* User Card */}
        <div
          onClick={() => {
            if (authUser) {
              openProfileModal();
            } else {
              openAuthModal('signin');
            }
          }}
          className={cn(
            'bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-xs flex items-center gap-2.5 transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 group/user',
            isSidebarCollapsed ? 'p-2 justify-center' : 'p-2.5'
          )}
          title={authUser ? "View Profile & Teaching Role" : "Click to Sign In"}
        >
          <Avatar
            src={activeUser.avatarUrl}
            name={activeUser.name}
            isOnline={activeUser.isOnline}
            size="sm"
          />
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeUser.name}
                </h4>
                <div className="flex items-center gap-1">
                  {activeUser.role === 'mentor' ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Mentor</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      <GraduationCap className="w-2.5 h-2.5" />
                      <span>Student</span>
                    </span>
                  )}
                  {activeUser.isPro && (
                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-2xs">
                      <Sparkles className="w-2 h-2" />
                      <span>PRO</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="truncate max-w-[110px]">{activeUser.email || 'Available'}</span>
                <span className="text-indigo-500 opacity-0 group-hover/user:opacity-100 transition-opacity font-semibold">
                  {authUser ? 'Profile' : 'Sign In'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Card / Pro Member Status */}
        {!isSidebarCollapsed ? (
          activeUser.isPro ? (
            <div className="rounded-2xl p-3 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/40 text-white shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-black tracking-tight">CodeBuddy PRO</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-indigo-200/90 leading-tight">
                12-Month Free Trial active with all Pro tools unlocked.
              </p>
              <button
                onClick={() => setActiveNavTab('subscription')}
                className="w-full bg-white/15 hover:bg-white/25 text-white font-bold text-[10px] py-1 px-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                View Pro Perks
              </button>
            </div>
          ) : (
            <div className="pro-card-gradient rounded-2xl p-3.5 text-white shadow-lg shadow-indigo-500/20 space-y-2.5">
              <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Diamond className="w-3.5 h-3.5 text-white" />
              </div>

              <div>
                <h5 className="font-bold text-xs tracking-tight">CodeBuddy Pro</h5>
                <p className="text-[10px] text-indigo-100/90 leading-snug mt-0.5">
                  Claim 12 Months 100% Free as Early Adopter Reward!
                </p>
              </div>

              <button
                onClick={handleProUpgrade}
                className="w-full bg-white text-[#4F46E5] hover:bg-slate-50 font-bold text-[11px] py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
              >
                <span>Claim 12 Mo Free</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )
        ) : (
          <button
            onClick={handleProUpgrade}
            title={activeUser.isPro ? "CodeBuddy Pro Active" : "Claim 12-Month Pro Free Trial"}
            className={cn(
              "w-full p-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer",
              activeUser.isPro ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            <Diamond className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 76 : 256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="hidden lg:flex bg-[#F8FAFD] dark:bg-[#0D1021] border-r border-slate-200/70 dark:border-slate-800/80 min-h-screen flex-col shrink-0 sticky top-0 h-screen z-30 transition-colors duration-150"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="relative w-64 bg-[#F8FAFD] dark:bg-[#0D1021] border-r border-slate-200/80 dark:border-slate-800/80 h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
