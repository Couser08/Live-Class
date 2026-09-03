import React from 'react';
import { LanguageCard } from './LanguageCard';

export const LanguageSection: React.FC = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        Choose a language to teach or learn
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* HTML5 Card */}
        <LanguageCard
          id="html"
          title="HTML"
          description="Structure the web with modern semantic markup."
          buttonVariant="peach"
          icon={
            <div className="w-13 h-13 rounded-2xl bg-[#FFF3EC] dark:bg-orange-950/50 flex items-center justify-center p-2 shadow-xs border border-orange-100/60 dark:border-orange-900/50">
              <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
                <path d="M4 2L6.5 28L16 31L25.5 28L28 2H4Z" fill="#E44D26"/>
                <path d="M16 28.5L23.5 26.2L25.5 4H16V28.5Z" fill="#F16529"/>
                <path d="M16 11.5H11.5L11.8 15H16V18.5H12.1L12.4 22L16 23V25.5L9.5 23.5L8.5 7.5H23.5L23.2 11.5H16Z" fill="#EBEBEB"/>
                <path d="M16 11.5V15H20L19.6 19.5L16 20.6V23.1L20.5 21.9L21.2 15H16V11.5H23.2L23.5 7.5H16V11.5Z" fill="white"/>
              </svg>
            </div>
          }
        />

        {/* C Language Card */}
        <LanguageCard
          id="c"
          title="C Language"
          description="Teach the fundamentals of C programming."
          buttonVariant="cyan"
          icon={
            <div className="w-13 h-13 rounded-2xl bg-[#EBF8FF] dark:bg-sky-950/50 flex items-center justify-center p-2 shadow-xs border border-sky-100/60 dark:border-sky-900/50">
              <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#00599C"/>
                <path d="M16 4.5L25.5 10.5V21.5L16 27.5L6.5 21.5V10.5L16 4.5Z" fill="#004482"/>
                <path d="M21 12.5C19.8 11.2 18 10.5 16 10.5C12.7 10.5 10 13 10 16C10 19 12.7 21.5 16 21.5C18 21.5 19.8 20.8 21 19.5" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          }
        />

        {/* JavaScript Card */}
        <LanguageCard
          id="javascript"
          title="JavaScript"
          description="Make the web interactive with JavaScript."
          buttonVariant="amber"
          icon={
            <div className="w-13 h-13 rounded-2xl bg-[#FEFCE8] dark:bg-amber-950/50 flex items-center justify-center p-2 shadow-xs border border-amber-100/60 dark:border-amber-900/50">
              <div className="w-9 h-9 rounded-xl bg-[#F7DF1E] flex items-end justify-end p-1 shadow-xs">
                <span className="font-extrabold text-slate-950 text-xs tracking-tighter">JS</span>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
};
