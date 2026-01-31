import React, { useState, useEffect } from 'react';
import { AppStep, PanelCount, StoryState, ArtStyle } from './types';
import { ART_STYLES } from './constants';
import { generateStoryIdeas, generateFinalPrompt } from './services/geminiService';
import ProgressBar from './components/ProgressBar';

// --- Icons ---
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0v-1H3a1 1 0 010-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [state, setState] = useState<StoryState>({
    panelCount: null,
    topic: '',
    selectedStyle: null,
    customStyle: '',
    generatedPrompt: '',
  });
  
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleStart = () => setStep(AppStep.PANEL_COUNT);

  const handleSelectPanelCount = (count: PanelCount) => {
    setState(prev => ({ ...prev, panelCount: count }));
    setStep(AppStep.STORY_INPUT);
  };

  const handleGenerateIdeas = async () => {
    setIsLoadingIdeas(true);
    const newIdeas = await generateStoryIdeas();
    setIdeas(newIdeas);
    setIsLoadingIdeas(false);
  };

  const handleSelectIdea = (idea: string) => {
    setState(prev => ({ ...prev, topic: idea }));
  };

  const handleNextToStyle = () => {
    if (state.topic.trim()) {
      setStep(AppStep.STYLE_SELECTION);
    }
  };

  const handleSelectStyle = (style: ArtStyle | null, customVal: string = '') => {
    setState(prev => ({ ...prev, selectedStyle: style, customStyle: customVal }));
  };

  const handleGeneratePrompt = async () => {
    if ((!state.selectedStyle && !state.customStyle) || !state.panelCount) return;
    
    setStep(AppStep.GENERATING);
    setIsGenerating(true);
    
    const prompt = await generateFinalPrompt(
      state.topic,
      state.panelCount,
      state.selectedStyle,
      state.customStyle
    );
    
    setState(prev => ({ ...prev, generatedPrompt: prompt }));
    setIsGenerating(false);
    setStep(AppStep.RESULT);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(state.generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(AppStep.WELCOME);
    setState({
      panelCount: null,
      topic: '',
      selectedStyle: null,
      customStyle: '',
      generatedPrompt: '',
    });
    setIdeas([]);
  };

  // --- Sub-Components (Inline for single-file integration feel while maintaining structure) ---

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center text-center justify-center min-h-[60vh] animate-fade-in-up">
      <div className="mb-6 p-4 bg-white/10 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
        <span className="text-6xl">🎞️</span>
      </div>
      <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-md">StoryFrame Pro</h1>
      <p className="text-xl text-white/90 max-w-lg mb-12 leading-relaxed">
        أداتك الاحترافية لإنشاء قصص مصورة مذهلة. حول أفكارك إلى بروبمت دقيق لمولدات الصور بالذكاء الاصطناعي في ثوانٍ.
      </p>
      <button
        onClick={handleStart}
        className="group relative px-10 py-4 bg-white text-purple-700 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <span className="flex items-center gap-3">
           ابدأ الآن <SparklesIcon />
        </span>
        <div className="absolute inset-0 rounded-full ring-2 ring-white/50 group-hover:ring-4 transition-all opacity-0 group-hover:opacity-100" />
      </button>
    </div>
  );

  const PanelSelection = () => (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold text-white text-center mb-10">كم عدد اللقطات التي تريدها؟</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[9, 12].map((count) => (
          <button
            key={count}
            onClick={() => handleSelectPanelCount(count as PanelCount)}
            className="group flex flex-col items-center p-8 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white rounded-3xl transition-all duration-300 backdrop-blur-md"
          >
            <div className={`grid gap-1 mb-6 p-2 bg-black/20 rounded-lg ${count === 9 ? 'grid-cols-3' : 'grid-cols-3'}`}>
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-8 h-8 md:w-10 md:h-10 bg-white/80 rounded-sm"></div>
              ))}
            </div>
            <span className="text-3xl font-bold text-white mb-2">{count} لقطات</span>
            <span className="text-white/60 text-lg">{count === 9 ? '(3×3)' : '(3×4)'}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const StoryInput = () => (
    <div className="animate-fade-in-up max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-8">ما هي القصة أو الموضوع؟</h2>
      
      <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
        <textarea
          value={state.topic}
          onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value }))}
          placeholder="اكتب فكرتك هنا... مثلاً: رائد فضاء يكتشف كوكباً جديداً مغطى بالكريستال"
          className="w-full h-40 p-4 text-lg text-gray-800 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-500 focus:outline-none resize-none transition-all placeholder-gray-400"
          dir="rtl"
        ></textarea>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <button
          onClick={handleGenerateIdeas}
          disabled={isLoadingIdeas}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500/30 hover:bg-indigo-500/50 text-white rounded-xl border border-white/30 transition-all w-full md:w-auto justify-center"
        >
          {isLoadingIdeas ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>💡</span> ليس لدي فكرة - اعطني 10 أفكار
            </>
          )}
        </button>

        <button
          onClick={handleNextToStyle}
          disabled={!state.topic.trim()}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all w-full md:w-auto justify-center
            ${state.topic.trim() 
              ? 'bg-white text-purple-700 hover:scale-105 shadow-lg' 
              : 'bg-gray-400/50 text-gray-200 cursor-not-allowed'}`}
        >
          التالي <BackIcon />
        </button>
      </div>

      {ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
          {ideas.map((idea, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectIdea(idea)}
              className="text-right p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all text-sm md:text-base"
            >
              {idea}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const StyleSelection = () => (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-white">اختر الاستايل الفني 🎨</h2>
        <button 
           onClick={handleGeneratePrompt}
           disabled={(!state.selectedStyle && !state.customStyle.trim())}
           className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all
             ${(!state.selectedStyle && !state.customStyle.trim()) 
               ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
               : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:scale-105'}`}
        >
           ✨ إنشاء البروبمت
        </button>
      </div>

      {/* Custom Style Input */}
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="أو اكتب ستايل خاص بك هنا (مثلاً: Cyberpunk mixed with Egyptian Art)"
          value={state.customStyle}
          onChange={(e) => handleSelectStyle(null, e.target.value)}
          className={`w-full p-4 rounded-xl border-2 transition-all text-gray-800 placeholder-gray-500 outline-none
            ${state.customStyle ? 'border-orange-400 bg-white ring-2 ring-orange-400/30' : 'border-white/20 bg-white/10 text-white placeholder-white/50 focus:bg-white focus:text-gray-800'}
          `}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
        {ART_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => handleSelectStyle(style)}
            className={`
              relative p-4 rounded-xl transition-all duration-300 flex flex-col items-center text-center gap-2 group
              ${state.selectedStyle?.id === style.id 
                ? 'bg-white text-purple-900 shadow-xl scale-105 ring-4 ring-pink-500/50 z-10' 
                : 'bg-white/10 text-white hover:bg-white/20 hover:-translate-y-1'}
            `}
          >
            <span className="text-4xl mb-2 filter drop-shadow-lg block group-hover:scale-110 transition-transform">{style.emoji}</span>
            <span className="font-bold text-sm">{style.nameAr}</span>
            <span className="text-xs opacity-70">{style.nameEn}</span>
            
            {state.selectedStyle?.id === style.id && (
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1 shadow-md">
                <CheckIcon />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const GeneratingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse text-white">
      <div className="w-24 h-24 border-4 border-white/30 border-t-white rounded-full animate-spin mb-8"></div>
      <h2 className="text-3xl font-bold mb-4">جاري كتابة البروبمت السحري...</h2>
      <p className="text-xl opacity-80">يتم هندسة المشاهد وترتيب اللقطات 🤖✨</p>
    </div>
  );

  const ResultScreen = () => (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
       <div className="text-center mb-8">
         <div className="inline-block p-3 bg-green-500 rounded-full text-white mb-4 shadow-lg shadow-green-500/30">
           <CheckIcon />
         </div>
         <h2 className="text-4xl font-bold text-white mb-2">البروبمت جاهز! ✅</h2>
         <p className="text-white/80">جاهز للاستخدام في محرك التخيل المفضل لديك</p>
       </div>

       <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-8 relative group">
         <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-auto text-xs text-gray-400">Prompt.txt</span>
         </div>
         
         <div className="p-6 pt-12 max-h-[60vh] overflow-y-auto custom-scrollbar">
           <pre className="whitespace-pre-wrap font-mono text-sm md:text-base text-green-400 leading-relaxed text-left" dir="ltr">
             {state.generatedPrompt}
           </pre>
         </div>

         <div className="absolute top-14 right-4 md:right-8">
            <button
              onClick={copyToClipboard}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-lg transition-all
                ${isCopied ? 'bg-green-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}
              `}
            >
              {isCopied ? (
                <>تم النسخ! <CheckIcon /></>
              ) : (
                <>نسخ النص <CopyIcon /></>
              )}
            </button>
         </div>
       </div>

       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 text-white mb-10 border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            📋 كيفية الاستخدام:
          </h3>
          <ul className="space-y-3 text-lg opacity-90 list-disc list-inside">
             <li>انسخ البروبمت من الصندوق أعلاه</li>
             <li>اذهب لأحد أدوات توليد الصور (Midjourney, FLUX, DALL-E)</li>
             <li>الصق النص بالكامل</li>
             <li>استمتع بالنتيجة! 🎨</li>
          </ul>
          <div className="mt-6 pt-6 border-t border-white/20 text-sm opacity-70">
            💡 نصيحة: للحصول على أفضل النتائج، تأكد من استخدام موديل يدعم النصوص المعقدة (مثل Midjourney v6 أو FLUX.1).
          </div>
       </div>

       <div className="flex justify-center pb-20">
         <button
           onClick={handleReset}
           className="flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold transition-all hover:scale-105 border border-white/20 backdrop-blur-sm"
         >
           <RefreshIcon /> إنشاء بروبمت جديد
         </button>
       </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] text-right selection:bg-pink-500 selection:text-white">
      {/* Background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-full h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
           <div 
             className="text-2xl font-bold text-white cursor-pointer flex items-center gap-2" 
             onClick={() => setStep(AppStep.WELCOME)}
           >
             <span className="bg-white text-purple-700 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">SF</span>
             <span className="hidden sm:inline">StoryFrame Pro</span>
           </div>
        </header>

        <ProgressBar currentStep={step} />

        <main className="w-full mx-auto">
          {step === AppStep.WELCOME && <WelcomeScreen />}
          {step === AppStep.PANEL_COUNT && <PanelSelection />}
          {step === AppStep.STORY_INPUT && <StoryInput />}
          {step === AppStep.STYLE_SELECTION && <StyleSelection />}
          {step === AppStep.GENERATING && <GeneratingScreen />}
          {step === AppStep.RESULT && <ResultScreen />}
        </main>

        <footer className="fixed bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/30 text-xs">StoryFrame Pro © 2024</p>
        </footer>
      </div>
      
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a202c; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568; 
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
