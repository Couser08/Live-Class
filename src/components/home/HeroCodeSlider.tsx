import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Terminal, Globe, Code2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface SlideItem {
  id: string;
  tabLabel: string;
  fileName: string;
  langTag: string;
  icon: React.ReactNode;
  codeLines: { num: number; text: React.ReactNode }[];
  outputType: 'browser' | 'terminal' | 'console';
  outputTitle: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 'html',
    tabLabel: 'HTML / CSS',
    fileName: 'index.html',
    langTag: 'HTML5',
    icon: <Globe className="w-3.5 h-3.5 text-emerald-500" />,
    outputType: 'browser',
    outputTitle: 'Live Browser Preview',
    codeLines: [
      { num: 1, text: <> &lt;<span className="text-indigo-400">!DOCTYPE</span> <span className="text-amber-300">html</span>&gt;</> },
      { num: 2, text: <> &lt;<span className="text-indigo-400">html</span> <span className="text-amber-300">lang</span>=<span className="text-emerald-300">"en"</span>&gt;</> },
      { num: 3, text: <> &lt;<span className="text-indigo-400">head</span>&gt;</> },
      { num: 4, text: <>   &lt;<span className="text-indigo-400">meta</span> <span className="text-amber-300">charset</span>=<span className="text-emerald-300">"UTF-8"</span> /&gt;</> },
      { num: 5, text: <>   &lt;<span className="text-indigo-400">title</span>&gt;Live Class Demo&lt;/<span className="text-indigo-400">title</span>&gt;</> },
      { num: 6, text: <>   &lt;<span className="text-indigo-400">link</span> <span className="text-amber-300">rel</span>=<span className="text-emerald-300">"stylesheet"</span> <span className="text-amber-300">href</span>=<span className="text-emerald-300">"style.css"</span> /&gt;</> },
      { num: 7, text: <> &lt;/<span className="text-indigo-400">head</span>&gt;</> },
      { num: 8, text: <> &lt;<span className="text-indigo-400">body</span>&gt;</> },
      { num: 9, text: <>   &lt;<span className="text-indigo-400">div</span> <span className="text-amber-300">class</span>=<span className="text-emerald-300">"card"</span>&gt;</> },
      { num: 10, text: <>     &lt;<span className="text-indigo-400">h1</span>&gt;Hello, World!&lt;/<span className="text-indigo-400">h1</span>&gt;</> },
      { num: 11, text: <>     &lt;<span className="text-indigo-400">p</span>&gt;Learning HTML is fun 🚀&lt;/<span className="text-indigo-400">p</span>&gt;</> },
      { num: 12, text: <>   &lt;/<span className="text-indigo-400">div</span>&gt;</> },
      { num: 13, text: <> &lt;/<span className="text-indigo-400">body</span>&gt;</> },
    ],
  },
  {
    id: 'c',
    tabLabel: 'C Language',
    fileName: 'main.c',
    langTag: 'C11 GCC',
    icon: <Terminal className="w-3.5 h-3.5 text-indigo-500" />,
    outputType: 'terminal',
    outputTitle: 'GCC Native Execution',
    codeLines: [
      { num: 1, text: <> <span className="text-purple-400">#include</span> &lt;<span className="text-emerald-300">stdio.h</span>&gt;</> },
      { num: 2, text: <> <span className="text-purple-400">#include</span> &lt;<span className="text-emerald-300">stdlib.h</span>&gt;</> },
      { num: 3, text: <> </> },
      { num: 4, text: <> <span className="text-blue-400">int</span> <span className="text-amber-300">main</span>() &#123;</> },
      { num: 5, text: <>     <span className="text-blue-400">int</span> score = <span className="text-orange-400">98</span>;</> },
      { num: 6, text: <>     <span className="text-blue-400">int</span> *ptr = &amp;score;</> },
      { num: 7, text: <>     <span className="text-slate-500">// Memory pointer inspection</span></> },
      { num: 8, text: <>     <span className="text-amber-300">printf</span>(<span className="text-emerald-300">"Pointer Address: %p\\n"</span>, (<span className="text-blue-400">void</span>*)ptr);</> },
      { num: 9, text: <>     <span className="text-amber-300">printf</span>(<span className="text-emerald-300">"Value via Pointer: %d\\n"</span>, *ptr);</> },
      { num: 10, text: <>     <span className="text-purple-400">return</span> <span className="text-orange-400">0</span>;</> },
      { num: 11, text: <> &#125;</> },
    ],
  },
  {
    id: 'js',
    tabLabel: 'JavaScript',
    fileName: 'app.js',
    langTag: 'ES6+ Runtime',
    icon: <Code2 className="w-3.5 h-3.5 text-amber-500" />,
    outputType: 'console',
    outputTitle: 'Console Diagnostics',
    codeLines: [
      { num: 1, text: <> <span className="text-purple-400">const</span> <span className="text-amber-300">learners</span> = [</> },
      { num: 2, text: <>   &#123; <span className="text-blue-300">name</span>: <span className="text-emerald-300">'Amit'</span>, <span className="text-blue-300">score</span>: <span className="text-orange-400">96</span> &#125;,</> },
      { num: 3, text: <>   &#123; <span className="text-blue-300">name</span>: <span className="text-emerald-300">'Rahul'</span>, <span className="text-blue-300">score</span>: <span className="text-orange-400">99</span> &#125;</> },
      { num: 4, text: <> ];</> },
      { num: 5, text: <> </> },
      { num: 6, text: <> <span className="text-purple-400">const</span> top = learners.<span className="text-amber-300">reduce</span>((a, b) =&gt;</> },
      { num: 7, text: <>   b.score &gt; a.score ? b : a</> },
      { num: 8, text: <> );</> },
      { num: 9, text: <> console.<span className="text-amber-300">log</span>(<span className="text-emerald-300">"Top Performer:"</span>, top);</> },
    ],
  },
];

export const HeroCodeSlider: React.FC = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSlide = SLIDES[activeSlideIndex];

  // Dynamically measure container width so code and preview never get squeezed or cut off
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Smooth drag handler: full 0% to 100% range without getting stuck
  const handleDrag = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
      setSliderPosition(Math.round(percentage));
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDrag(e.clientX);
      }
    };
    const onMouseUp = () => setIsDragging(false);

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleDrag(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDrag]);

  // Click anywhere on container to move slider directly
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderPosition(Math.round(percentage));
  };

  const handleNext = () => {
    setActiveSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setActiveSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="w-full flex flex-col space-y-3 select-none">
      {/* Top Slide Switcher Tabs & Quick Actions */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlideIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSlideIndex === idx
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {slide.icon}
              <span>{slide.tabLabel}</span>
            </button>
          ))}
        </div>

        {/* Slide navigation controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            title="Previous language"
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            title="Next language"
            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Split Slider Container */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-[#0D121D] cursor-ew-resize"
      >
        {/* Layer 1: Output / Result Preview (Full width at bottom) */}
        <div
          style={{ width: containerWidth }}
          className="absolute inset-y-0 right-0 h-full flex flex-col bg-white dark:bg-[#121724]"
        >
          {/* Browser / Output Controls Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-[#101420]">
            <div className="flex items-center gap-1.5 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
              {activeSlide.outputTitle}
            </span>
          </div>

          {/* Body Render */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {activeSlide.outputType === 'browser' && (
              <div className="max-w-xs p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Hello, World! 👋
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Learning HTML &amp; CSS live
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-[#4F46E5] text-white shadow-xs">
                    Live Demo 🚀
                  </span>
                </div>
              </div>
            )}

            {activeSlide.outputType === 'terminal' && (
              <div className="w-full max-w-sm rounded-xl bg-[#090D16] p-4 text-left font-mono text-xs text-slate-300 border border-slate-800 shadow-inner space-y-1.5">
                <div className="text-emerald-400">$ gcc -O2 main.c -o out &amp;&amp; ./out</div>
                <div className="text-slate-400">Pointer Address: 0x7ffd9c34</div>
                <div className="text-white font-bold">Value via Pointer: 98</div>
                <div className="text-slate-500 pt-1 text-[10px]">
                  [Process exited with code 0 in 8ms]
                </div>
              </div>
            )}

            {activeSlide.outputType === 'console' && (
              <div className="w-full max-w-sm rounded-xl bg-[#090D16] p-4 text-left font-mono text-xs text-slate-300 border border-slate-800 shadow-inner space-y-1.5">
                <div className="text-slate-500">&gt; Array(2) [ &#123; name: "Amit" &#125;, &#123; name: "Rahul" &#125; ]</div>
                <div className="text-emerald-400 font-bold">&gt; Top Performer: &#123; name: "Rahul", score: 99 &#125;</div>
                <div className="text-indigo-400 pt-1 text-[10px]">✓ Execution finished (0.4ms)</div>
              </div>
            )}
          </div>
        </div>

        {/* Layer 2: Code Editor (Clipped to sliderPosition% with smooth transition when not dragging) */}
        <div
          className={`absolute top-0 left-0 bottom-0 overflow-hidden bg-[#0F141F] text-slate-300 ${
            isDragging ? '' : 'transition-[width] duration-150 ease-out'
          }`}
          style={{ width: `${sliderPosition}%` }}
        >
          {/* Inner fixed-width matching container width so text never squishes */}
          <div style={{ width: containerWidth }} className="h-full flex flex-col">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-[#141A28]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-200 font-medium">{activeSlide.fileName}</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400">
                  {activeSlide.langTag}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold pr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            {/* Code Lines with line numbers */}
            <div className="p-3 text-[11px] font-mono leading-snug space-y-0.5 select-none overflow-hidden">
              {activeSlide.codeLines.map((line) => (
                <div key={line.num} className="flex items-center gap-2.5">
                  <span className="w-5 text-right text-slate-600 shrink-0 select-none text-[10px]">
                    {line.num}
                  </span>
                  <span className="truncate">{line.text}</span>
                </div>
              ))}
            </div>

            {/* Status Line */}
            <div className="mt-auto flex items-center justify-between px-3 py-1.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 bg-[#0C101A]">
              <span>Ln {activeSlide.codeLines.length}, Col 1</span>
              <span>UTF-8 • {activeSlide.langTag}</span>
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle Line */}
        <div
          className={`absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize select-none pointer-events-auto ${
            isDragging ? '' : 'transition-[left] duration-150 ease-out'
          }`}
          style={{
            left: `clamp(18px, ${sliderPosition}%, calc(100% - 18px))`,
            transform: 'translateX(-50%)',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Vertical divider line */}
          <div className="w-[2px] h-full bg-[#4F46E5]" />

          {/* Center Drag Handle Pill */}
          <div className="absolute w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-800 hover:scale-110 active:scale-95 transition-transform cursor-ew-resize">
            <span className="text-[10px] font-black tracking-tighter">◄►</span>
          </div>
        </div>
      </div>

      {/* Helper caption & instant snap buttons below slider */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Drag handle all the way (0% to 100%) or click below:</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSliderPosition(0)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              sliderPosition <= 5
                ? 'bg-[#4F46E5] text-white font-bold'
                : 'hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            100% Output
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              sliderPosition > 40 && sliderPosition < 60
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                : 'hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            50/50 Split
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSliderPosition(100)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              sliderPosition >= 95
                ? 'bg-[#4F46E5] text-white font-bold'
                : 'hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            100% Code
          </button>
        </div>
      </div>
    </div>
  );
};
