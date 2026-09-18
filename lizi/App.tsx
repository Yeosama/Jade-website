import React, { useState } from 'react';
import Experience from './components/Experience';
import ChatInterface from './components/ChatInterface';
import { JADE_COLLECTION } from './constants';
import { ChevronRight, ChevronLeft, Info, MessageSquareText } from 'lucide-react';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const currentItem = JADE_COLLECTION[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % JADE_COLLECTION.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + JADE_COLLECTION.length) % JADE_COLLECTION.length);
  };

  return (
    <div className="relative w-full h-screen text-white overflow-hidden bg-black select-none">
      
      {/* 3D Background */}
      <Experience imageUrl={currentItem.imageUrl} />

      {/* Main UI Layer */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
        
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif text-jade-300 tracking-wider mb-2">
              JADE <span className="text-jade-600">MUSEUM</span>
            </h1>
            <p className="text-jade-700 font-sans text-xs tracking-[0.2em] uppercase">
              Digital Particle Archive
            </p>
          </div>
          <button 
             onClick={() => setShowInfo(!showInfo)}
             className="text-jade-500 hover:text-jade-300 transition p-2 rounded-full border border-jade-900 bg-black/30 backdrop-blur"
          >
            <Info size={24} />
          </button>
        </header>

        {/* Info Panel (Bottom Left) */}
        <div className={`transition-all duration-500 transform ${showInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="pointer-events-auto max-w-md bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-6 px-0 md:px-4">
            <h2 className="text-4xl font-serif text-white mb-1">
              {currentItem.chineseName}
            </h2>
            <h3 className="text-xl text-jade-400 font-light mb-4">
              {currentItem.name}
            </h3>
            
            <div className="flex items-center gap-4 mb-4 text-xs font-bold text-jade-700 uppercase tracking-widest">
              <span>{currentItem.period}</span>
              <span className="w-12 h-[1px] bg-jade-800"></span>
              <span>Artifact #{currentIndex + 1}</span>
            </div>

            <p className="text-jade-100/80 font-sans text-sm leading-relaxed mb-6 border-l-2 border-jade-800 pl-4">
              {currentItem.description}
            </p>

            <button
               onClick={() => setIsChatOpen(true)}
               className="group flex items-center gap-3 px-6 py-3 bg-jade-950/50 hover:bg-jade-900 border border-jade-800/50 rounded-sm transition-all duration-300"
            >
               <MessageSquareText size={18} className="text-jade-400 group-hover:scale-110 transition-transform" />
               <span className="text-sm font-medium text-jade-200 uppercase tracking-widest">Ask Curator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls (Bottom Right/Center) */}
      <div className="absolute bottom-8 right-8 z-20 pointer-events-auto flex gap-4 items-center">
         <div className="flex gap-2">
            <button 
                onClick={handlePrev}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-jade-800 text-jade-500 hover:bg-jade-900 hover:text-jade-300 transition-colors bg-black/40 backdrop-blur"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={handleNext}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-jade-800 text-jade-500 hover:bg-jade-900 hover:text-jade-300 transition-colors bg-black/40 backdrop-blur"
            >
                <ChevronRight size={24} />
            </button>
         </div>
         <div className="hidden md:flex flex-col gap-1 items-end ml-4">
            {JADE_COLLECTION.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-1 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-jade-500' : 'w-2 bg-jade-900'}`}
                />
            ))}
         </div>
      </div>

      {/* Chat Interface Layer */}
      <div className="absolute inset-0 pointer-events-none z-30">
         <ChatInterface 
            currentJadeId={currentItem.id} 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            />
      </div>

    </div>
  );
}

export default App;
