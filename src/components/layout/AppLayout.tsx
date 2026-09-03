import React from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { AuthModal } from '../auth/AuthModal';
import { UserProfileModal } from '../auth/UserProfileModal';
import { ClaimRewardModal } from '../subscription/ClaimRewardModal';
import { ProductTourModal } from '../subscription/ProductTourModal';
import { useUIStore } from '../../stores/uiStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFD] dark:bg-[#0D1021] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-150">
      {/* Collapsible / Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative">
        {/* Mobile Hamburger Button (Standalone) */}
        <button
          onClick={() => {
            useUIStore.getState().setMobileMenuOpen(true);
          }}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
          aria-label="Open mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Floating Toasts */}
      <ToastContainer />

      {/* Global Modals */}
      <AuthModal />
      <UserProfileModal />
      <ClaimRewardModal />
      <ProductTourModal />
    </div>
  );
};
