import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import {
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useUIStore } from '../../stores/uiStore';

interface SettingsRightSidebarProps {
  onOpenShortcuts: () => void;
  onRestoreDefaults: () => void;
}

export const SettingsRightSidebar: React.FC<SettingsRightSidebarProps> = ({
  onOpenShortcuts,
  onRestoreDefaults,
}) => {
  const currentUser = useSessionStore((state) => state.currentUser);
  const { addToast } = useUIStore();

  return (
    <div className="space-y-4">
      {/* Your Profile Card */}
      <Card className="p-4 space-y-3">
        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight">Your Profile</h3>
        <div className="flex items-center gap-3">
          <Avatar src={currentUser.avatarUrl} name={currentUser.name} isOnline={true} size="md" />
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{currentUser.name}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Active User</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => addToast({ type: 'info', title: 'Profile', description: 'User profile details.' })}
          className="rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
        >
          View Profile
        </Button>
      </Card>

      {/* Quick Settings Card */}
      <Card className="p-4 space-y-2">
        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight pb-1">Quick Settings</h3>
        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
          >
            <span>Keyboard Shortcuts</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => addToast({ type: 'info', title: 'Templates', description: 'Session code templates.' })}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
          >
            <span>Session Templates</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => addToast({ type: 'success', title: 'Settings Exported', description: 'JSON backup saved.' })}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer"
          >
            <span>Export Settings</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={onRestoreDefaults}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <span>Restore Defaults</span>
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Storage Progress Card */}
      <Card className="p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span>Storage</span>
          <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">Active Cache</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500 w-[24%]" />
        </div>
        <button
          onClick={() => addToast({ type: 'info', title: 'Storage Manager', description: 'Cloud storage breakdown.' })}
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer pt-1"
        >
          <span>Manage Storage</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </Card>

      {/* Need Help Card */}
      <Card className="p-4 space-y-2">
        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight">Need Help?</h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Visit our help center or contact support.</p>
        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pt-1">
          <a href="#" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70">
            <span>Help Center</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a href="#" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70">
            <span>Contact Support</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a href="#" className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70">
            <span>Feature Request</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </Card>

      {/* Did You Know Card */}
      <Card className="p-4 bg-[#F5F6FE] dark:bg-indigo-950/40 border-[#E8EAFF] dark:border-indigo-900/50 space-y-2">
        <div className="flex items-center gap-1.5 text-[#5551FF] dark:text-indigo-400">
          <Lightbulb className="w-3.5 h-3.5 fill-current" />
          <h4 className="font-extrabold text-xs tracking-tight">Did you know?</h4>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          You can use Markdown syntax to write professional lecture notes directly inside the live classroom.
        </p>
        <button
          onClick={() => addToast({ type: 'info', title: 'Editor Tips', description: 'Use Cmd+Enter to run code.' })}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5551FF] dark:text-indigo-400 hover:underline transition-colors cursor-pointer"
        >
          <span>Learn More</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </Card>
    </div>
  );
};
