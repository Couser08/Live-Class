import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Code2,
  Bell,
  MessageSquare,
  Shield,
  Database,
  Sliders,
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useSessionStore } from '../stores/sessionStore';
import { useUIStore } from '../stores/uiStore';
import { GeneralSettingsSection } from '../components/settings/GeneralSettingsSection';
import { AccountSettingsSection } from '../components/settings/AccountSettingsSection';
import { AppearanceSettingsSection } from '../components/settings/AppearanceSettingsSection';
import { EditorSettingsSection } from '../components/settings/EditorSettingsSection';
import { NotificationsSettingsSection } from '../components/settings/NotificationsSettingsSection';
import { ChatSettingsSection } from '../components/settings/ChatSettingsSection';
import { PrivacySettingsSection } from '../components/settings/PrivacySettingsSection';
import { StorageSettingsSection } from '../components/settings/StorageSettingsSection';
import { AdvancedSettingsSection } from '../components/settings/AdvancedSettingsSection';
import { SettingsRightSidebar } from '../components/settings/SettingsRightSidebar';
import { cn } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const settings = useSettingsStore();
  const currentUser = useSessionStore((state) => state.currentUser);
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Code2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'chat', label: 'Chat & Q&A', icon: MessageSquare },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'storage', label: 'Data & Storage', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ];

  const handleRestoreDefaults = () => {
    settings.resetDefaults();
    addToast({
      type: 'success',
      title: 'Settings Reset',
      description: 'Restored all preferences to default values.',
    });
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettingsSection />;
      case 'account':
        return <AccountSettingsSection />;
      case 'appearance':
        return <AppearanceSettingsSection />;
      case 'editor':
        return <EditorSettingsSection />;
      case 'notifications':
        return <NotificationsSettingsSection />;
      case 'chat':
        return <ChatSettingsSection />;
      case 'privacy':
        return <PrivacySettingsSection />;
      case 'storage':
        return <StorageSettingsSection />;
      case 'advanced':
        return <AdvancedSettingsSection />;
      default:
        return <GeneralSettingsSection />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your preferences and account settings.
          </p>
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl px-3 py-1.5 shadow-2xs">
            <Avatar
              src={currentUser.avatarUrl}
              name={currentUser.name}
              isOnline={true}
              size="sm"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Mentor</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. Left Tabs Sidebar (3 cols) */}
        <Card className="lg:col-span-3 p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Settings
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left',
                  isActive
                    ? 'bg-[#EEF0FF] dark:bg-indigo-950/70 text-[#5551FF] dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-[#5551FF] dark:text-indigo-400' : 'text-slate-400')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </Card>

        {/* 2. Center Dynamic Settings Form Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {renderActiveSection()}
        </div>

        {/* 3. Right Sidebar Tools & Storage (3 cols) */}
        <div className="lg:col-span-3">
          <SettingsRightSidebar
            onOpenShortcuts={() => setIsKeyboardModalOpen(true)}
            onRestoreDefaults={handleRestoreDefaults}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={isKeyboardModalOpen}
        onClose={() => setIsKeyboardModalOpen(false)}
        title="Keyboard Shortcuts"
        description="Boost your live teaching workflow"
      >
        <div className="space-y-2.5 text-xs py-2">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Run Code & Update Preview</span>
            <kbd className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
              ⌘ + Enter / Ctrl + Enter
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Insert Tab Indent (2 spaces)</span>
            <kbd className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
              Tab
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Toggle Sidebar Collapse</span>
            <kbd className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
              ⌘ + B / Ctrl + B
            </kbd>
          </div>
        </div>
      </Modal>
    </div>
  );
};
