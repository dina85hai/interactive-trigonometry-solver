import React, { useState } from 'react';
import CurriculumOutline from './components/CurriculumOutline';
import GraphLessonsHub from './components/GraphLessonsHub';
import ObliqueTriangleSolver from './components/ObliqueTriangleSolver';
import SignsOfTrigRatios from './components/SignsOfTrigRatios';
import SolvingTrigEquations from './components/SolvingTrigEquations';

type TabKey = 'outline' | 'ratios' | 'graphLessons' | 'equations' | 'oblique';

type Tab = {
  key: TabKey;
  name: string;
};

const tabs: Tab[] = [
  { key: 'outline', name: 'Curriculum Outline' },
  { key: 'ratios', name: 'Trigonometric Ratios' },
  { key: 'graphLessons', name: 'Graph Lessons' },
  { key: 'equations', name: 'Solving Trig Equations' },
  { key: 'oblique', name: 'Oblique Triangle' },
];

const AnimatedBackground = () => {
  const symbols = ['sin(θ)', 'cos(θ)', 'tan(θ)', 'π', 'θ', 'α', 'β', 'sec(θ)', 'csc(θ)', 'cot(θ)'];
  const positions = [
    { top: '10%', left: '15%', animationDelay: '0s', animationDuration: '18s' },
    { top: '20%', left: '80%', animationDelay: '2s', animationDuration: '20s' },
    { top: '70%', left: '10%', animationDelay: '4s', animationDuration: '22s' },
    { top: '80%', left: '90%', animationDelay: '1s', animationDuration: '15s' },
    { top: '50%', left: '50%', animationDelay: '7s', animationDuration: '19s' },
    { top: '5%', left: '40%', animationDelay: '3s', animationDuration: '21s' },
    { top: '90%', left: '30%', animationDelay: '5s', animationDuration: '16s' },
    { top: '40%', left: '5%', animationDelay: '6s', animationDuration: '24s' },
    { top: '60%', left: '70%', animationDelay: '8s', animationDuration: '17s' },
    { top: '30%', left: '60%', animationDelay: '9s', animationDuration: '23s' },
  ];

  return (
    <div 
        className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-gradient-to-br from-[#6D83F2] via-[#A36BF3] to-[#F178D4]"
        style={{ perspective: '800px' }}
    >
      {symbols.map((symbol, index) => (
        <span key={index} className="math-symbol" style={{ ...positions[index % positions.length] }}>
          {symbol}
        </span>
      ))}
    </div>
  );
};


const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('outline');

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 sm:p-8 border border-white/30">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">Trigonometric Equations</h1>
          <p className="text-white/80 text-lg">Interactive Learning and Practice</p>
        </header>

        <nav className="flex justify-center mb-8">
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-black/10 rounded-full">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base rounded-full transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                  activeTab === tab.key
                    ? `bg-white/90 text-purple-700 shadow-md`
                    : `text-white/80 hover:bg-white/20 active:bg-white/30`
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </nav>

        <main>
          <div key={activeTab} className="fade-in-content">
            {activeTab === 'outline' && <CurriculumOutline />}
            {activeTab === 'ratios' && <SignsOfTrigRatios />}
            {activeTab === 'graphLessons' && <GraphLessonsHub />}
            {activeTab === 'equations' && <SolvingTrigEquations />}
            {activeTab === 'oblique' && <ObliqueTriangleSolver />}
          </div>
        </main>
      </div>
       <footer className="text-center mt-8 text-white/70 text-sm">
        <p>Built with React & Tailwind CSS. An interactive trigonometry learning tool.</p>
      </footer>
    </div>
  );
};

export default App;
