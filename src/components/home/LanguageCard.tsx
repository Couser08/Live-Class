import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SupportedLanguage } from '../../types/session.types';
import { useUIStore } from '../../stores/uiStore';
import { useCodeStore } from '../../stores/codeStore';
import { useAuthStore } from '../../stores/authStore';

interface LanguageCardProps {
  id: SupportedLanguage;
  title: string;
  description: string;
  buttonVariant: 'peach' | 'cyan' | 'amber';
  icon: React.ReactNode;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  id,
  title,
  description,
  buttonVariant,
  icon,
}) => {
  const { openNewSessionModal, setActiveNavTab } = useUIStore();
  const { setLanguage } = useCodeStore();
  const { user } = useAuthStore();
  const isMentor = user?.role === 'mentor';

  const handleAction = () => {
    setLanguage(id);
    if (isMentor) {
      openNewSessionModal(id);
    } else {
      setActiveNavTab('languages');
    }
  };

  return (
    <Card className="p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        {/* Language Icon & Title Row */}
        <div className="flex items-start gap-4">
          <div className="shrink-0">{icon}</div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-6">
        <Button
          onClick={handleAction}
          variant={buttonVariant}
          size="md"
          fullWidth
          className="rounded-2xl py-3 text-xs font-bold"
        >
          {isMentor ? 'Start Teaching' : 'Explore Curriculum'}
        </Button>
      </div>
    </Card>
  );
};
