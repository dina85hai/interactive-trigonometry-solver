import React, { useState, useEffect, useRef } from 'react';
import TrigRatiosArchiveLesson from './TrigRatiosArchiveLesson';
import TrigGraph from './TrigGraph';

interface TrigSigns {
  sin: '+' | '-';
  cos: '+' | '-';
  tan: '+' | '-';
}

type RatioSubtopic = 'ratios' | 'signs';

const ratioSubtopics: Array<{ key: RatioSubtopic; label: string }> = [
  { key: 'ratios', label: 'Trigonometric Ratios' },
  { key: 'signs', label: 'Signs of Trigonometric Ratios' },
];

const SignsOfTrigRatios = () => {
  const [activeSubtopic, setActiveSubtopic] = useState<RatioSubtopic>('ratios');
  const [angle, setAngle] = useState<number>(45);
  const [quadrant, setQuadrant] = useState<number>(1);
  const [interactiveAngle, setInteractiveAngle] = useState<string>('');
  const [interactiveAngleError, setInteractiveAngleError] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // New state for the interactive exercise
  const [showExercise, setShowExercise] = useState<boolean>(false);
  const [exerciseStep, setExerciseStep] = useState<number>(0);
  
  const [step1Input, setStep1Input] = useState<number | null>(null);
  const [step1Status, setStep1Status] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [step1Feedback, setStep1Feedback] = useState<string>('');

  const [step2Inputs, setStep2Inputs] = useState<{ sin: string, cos: string, tan: string }>({ sin: '', cos: '', tan: '' });
  const [step2Status, setStep2Status] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [step2Feedback, setStep2Feedback] = useState<string>('');

  const firstSignSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (exerciseStep === 2) {
      firstSignSelectRef.current?.focus();
    }
  }, [exerciseStep]);

  useEffect(() => {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    if (normalizedAngle >= 0 && normalizedAngle < 90) setQuadrant(1);
    else if (normalizedAngle >= 90 && normalizedAngle < 180) setQuadrant(2);
    else if (normalizedAngle >= 180 && normalizedAngle < 270) setQuadrant(3);
    else setQuadrant(4);
  }, [angle]);

  useEffect(() => {
    if (!isAnimating) return;

    let frameId: number;
    let start: number | null = null;
    const duration = 8000; // 8 seconds for a full circle

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const newAngle = Math.min((progress / duration) * 360, 360);
      setAngle(newAngle);

      if (progress < duration) {
        frameId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setAngle(45); // Reset to a default angle
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isAnimating]);

  const getSigns = (q: number): TrigSigns => {
    switch(q) {
      case 1: return { sin: '+', cos: '+', tan: '+' };
      case 2: return { sin: '+', cos: '-', tan: '-' };
      case 3: return { sin: '-', cos: '-', tan: '+' };
      case 4: return { sin: '-', cos: '+', tan: '-' };
      default: return { sin: '+', cos: '+', tan: '+' };
    }
  };

  const getInteractiveSigns = () => {
    const ang = Number(interactiveAngle);
    if (isNaN(ang) || ang < 0 || ang > 360) return null;
    const normalized = ang;
    let q;
    if (normalized >= 0 && normalized < 90) q = 1;
    else if (normalized >= 90 && normalized < 180) q = 2;
    else if (normalized >= 180 && normalized < 270) q = 3;
    else q = 4;
    return { quadrant: q, ...getSigns(q), normalized };
  };
  
  const interactiveSigns = getInteractiveSigns();

  const resetExercise = () => {
    setShowExercise(false);
    setExerciseStep(0);
    setStep1Input(null);
    setStep1Status('unanswered');
    setStep1Feedback('');
    setStep2Inputs({ sin: '', cos: '', tan: '' });
    setStep2Status('unanswered');
    setStep2Feedback('');
  };

  const startExercise = () => {
    if (interactiveAngleError) return;
    resetExercise();
    setShowExercise(true);
    setExerciseStep(1);
  };
  
  const checkStep1 = () => {
    if (interactiveSigns && step1Input === interactiveSigns.quadrant) {
      setStep1Status('correct');
      setStep1Feedback(`✓ Correct! ${interactiveSigns.normalized.toFixed(1)}° is indeed in Quadrant ${interactiveSigns.quadrant}.`);
      setTimeout(() => setExerciseStep(2), 300); // Automatically move to next step with a small delay
    } else {
      setStep1Status('incorrect');
      const correctQuadrant = interactiveSigns?.quadrant;
      let hint = 'Not quite. ';
      if (correctQuadrant === 1) hint += 'Angles from 0° to 90° are in Quadrant I.';
      else if (correctQuadrant === 2) hint += 'Angles from 90° to 180° are in Quadrant II.';
      else if (correctQuadrant === 3) hint += 'Angles from 180° to 270° are in Quadrant III.';
      else if (correctQuadrant === 4) hint += 'Angles from 270° to 360° are in Quadrant IV.';
      setStep1Feedback(hint);
    }
  };

  const checkStep2 = () => {
    if (!interactiveSigns) return;
    const correctSigns = getSigns(interactiveSigns.quadrant);
    if (step2Inputs.sin === correctSigns.sin && step2Inputs.cos === correctSigns.cos && step2Inputs.tan === correctSigns.tan) {
      setStep2Status('correct');
      setStep2Feedback('🎉 Excellent! All signs are correct.');
      setExerciseStep(3); // Move to final summary step
    } else {
      setStep2Status('incorrect');
      let hint = "There's a mistake. ";
      const q = interactiveSigns.quadrant;
      if (q === 1) hint += "Remember, in Quadrant I, All ratios are positive.";
      else if (q === 2) hint += "Remember, in Quadrant II, only Sine is positive.";
      else if (q === 3) hint += "Remember, in Quadrant III, only Tangent is positive.";
      else if (q === 4) hint += "Remember, in Quadrant IV, only Cosine is positive.";
      setStep2Feedback(hint);
    }
  };


  const signs = getSigns(quadrant);
  const angleRad = (angle * Math.PI) / 180;
  const sinValue = Math.sin(angleRad);
  const cosValue = Math.cos(angleRad);
  const tanValue = Math.tan(angleRad);
  
  const xCoord = 80 * Math.cos(angleRad);
  const yCoord = -80 * Math.sin(angleRad); // SVG y is inverted

  const quadrantInfo = {
    1: { name: 'I', rule: 'All Positive', xSign: '+', ySign: '+' },
    2: { name: 'II', rule: 'Sine Positive', xSign: '-', ySign: '+' },
    3: { name: 'III', rule: 'Tangent Positive', xSign: '-', ySign: '-' },
    4: { name: 'IV', rule: 'Cosine Positive', xSign: '+', ySign: '-' }
  };
  const currentQuadrantInfo = quadrantInfo[quadrant];

  const quadrantStyles = {
    1: { container: 'bg-green-500/20 border-green-300', title: 'text-green-900', highlight: 'text-green-800 font-bold' },
    2: { container: 'bg-blue-500/20 border-blue-300', title: 'text-blue-900', highlight: 'text-blue-800 font-bold' },
    3: { container: 'bg-orange-500/20 border-orange-300', title: 'text-orange-900', highlight: 'text-orange-800 font-bold' },
    4: { container: 'bg-purple-500/20 border-purple-300', title: 'text-purple-900', highlight: 'text-purple-800 font-bold' },
  };
  const currentQuadrantStyles = quadrantStyles[quadrant];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white bg-white/90 p-5 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Trigonometric Ratios</h2>
            <p className="mt-1 text-slate-700">Study right-triangle ratios first, then practice the signs of ratios in all four quadrants.</p>
          </div>
          <div className="grid gap-2 rounded-full bg-slate-100 p-1 text-sm font-bold sm:grid-cols-2">
            {ratioSubtopics.map((subtopic) => (
              <button
                key={subtopic.key}
                type="button"
                onClick={() => setActiveSubtopic(subtopic.key)}
                className={`rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                  activeSubtopic === subtopic.key ? 'bg-white text-purple-700 shadow' : 'text-slate-600 hover:bg-white/70'
                }`}
              >
                {subtopic.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeSubtopic === 'ratios' && <TrigRatiosArchiveLesson />}

      {activeSubtopic === 'signs' && (
        <>

       <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">ASTC Rule: An Interactive Explanation</h2>
        <p className="text-slate-700 text-center mb-6 max-w-2xl mx-auto">
          This animation shows how the signs of sine, cosine, and tangent are determined by the (x, y) coordinates in each quadrant. 
          Use the <strong className="text-blue-800">angle slider</strong> or play the animation below.
        </p>
        <div className="text-center mb-6">
            <button
                onClick={() => setIsAnimating(true)}
                disabled={isAnimating}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 font-semibold disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                aria-label="Play animated explanation of the ASTC rule"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                <span>{isAnimating ? 'Playing Animation...' : 'Play Animated Explanation'}</span>
            </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* Animated SVG */}
            <div className="w-full max-w-xs mx-auto bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                <svg viewBox="-120 -120 240 240">
                    <line x1="-110" y1="0" x2="110" y2="0" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="0" y1="-110" x2="0" y2="110" stroke="#94a3b8" strokeWidth="1" />
                    <text x="112" y="5" fill="#475569" fontSize="10">x</text>
                    <text x="-5" y="-112" fill="#475569" fontSize="10">y</text>
                    <circle cx="0" cy="0" r="80" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                    <text x="40" y="-40" fill="#64748b" fontSize="14" fontWeight="bold">I</text>
                    <text x="-50" y="-40" fill="#64748b" fontSize="14" fontWeight="bold">II</text>
                    <text x="-50" y="50" fill="#64748b" fontSize="14" fontWeight="bold">III</text>
                    <text x="40" y="50" fill="#64748b" fontSize="14" fontWeight="bold">IV</text>
                    <path d={`M 0 0 L ${xCoord} 0 L ${xCoord} ${yCoord} Z`} fill={`rgba(139, 92, 246, 0.2)`} stroke={`#8b5cf6`} strokeWidth="1"/>
                    <line x1="0" y1="0" x2={xCoord} y2="0" stroke="#3b82f6" strokeWidth="2" />
                    <line x1={xCoord} y1="0" x2={xCoord} y2={yCoord} stroke="#10b981" strokeWidth="2" />
                    <line x1="0" y1="0" x2={xCoord} y2={yCoord} stroke="#ef4444" strokeWidth="2.5" />
                    <text x={xCoord/2} y={12} fill="#3b82f6" fontSize="10" textAnchor="middle">x</text>
                    <text x={xCoord + 10} y={yCoord/2} fill="#10b981" fontSize="10">{yCoord === 0 ? "" : "y"}</text>
                    <text x={xCoord * 0.6} y={yCoord * 0.6} fill="#ef4444" fontSize="10" textAnchor="middle">r</text>
                    <circle cx={xCoord} cy={yCoord} r="4" fill="#ef4444" />
                </svg>
            </div>

            {/* Explanation panel */}
            <div className={`p-4 rounded-2xl border ${currentQuadrantStyles.container}`}>
                <h4 className={`text-xl font-bold mb-3 ${currentQuadrantStyles.title}`}>
                    Quadrant {currentQuadrantInfo.name}: {currentQuadrantInfo.rule}
                </h4>
                <div className="space-y-2 text-lg font-mono text-slate-800">
                    <p className="flex items-center"><span className="font-bold inline-block w-20 text-blue-700">x (adj)</span>: <span className={`font-bold ml-2 px-2 py-0.5 rounded ${currentQuadrantInfo.xSign === '+' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{currentQuadrantInfo.xSign}</span></p>
                    <p className="flex items-center"><span className="font-bold inline-block w-20 text-green-700">y (opp)</span>: <span className={`font-bold ml-2 px-2 py-0.5 rounded ${currentQuadrantInfo.ySign === '+' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{currentQuadrantInfo.ySign}</span></p>
                    <p className="flex items-center"><span className="font-bold inline-block w-20 text-red-700">r (hyp)</span>: <span className="font-bold ml-2 px-2 py-0.5 rounded bg-green-200 text-green-800">+</span></p>
                    <hr className="my-3 border-slate-400/50"/>
                    <p className={(quadrant === 1 || quadrant === 2) ? currentQuadrantStyles.highlight : 'text-slate-700'}>sin(θ) = y/r = ({currentQuadrantInfo.ySign})/(+) {"=>"} <span className={currentQuadrantInfo.ySign === '+' ? 'text-green-700' : 'text-red-700'}>{currentQuadrantInfo.ySign}</span></p>
                    <p className={(quadrant === 1 || quadrant === 4) ? currentQuadrantStyles.highlight : 'text-slate-700'}>cos(θ) = x/r = ({currentQuadrantInfo.xSign})/(+) {"=>"} <span className={currentQuadrantInfo.xSign === '+' ? 'text-green-700' : 'text-red-700'}>{currentQuadrantInfo.xSign}</span></p>
                    <p className={(quadrant === 1 || quadrant === 3) ? currentQuadrantStyles.highlight : 'text-slate-700'}>tan(θ) = y/x = ({currentQuadrantInfo.ySign})/({currentQuadrantInfo.xSign}) {"=>"} <span className={(currentQuadrantInfo.xSign === currentQuadrantInfo.ySign) ? 'text-green-700' : 'text-red-700'}>{(currentQuadrantInfo.xSign === currentQuadrantInfo.ySign) ? '+' : '-'}</span></p>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Interactive Graph Visualization</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <TrigGraph funcType="sin" angle={angle} value={sinValue} color="#10b981" title="sin(θ)" />
            <TrigGraph funcType="cos" angle={angle} value={cosValue} color="#3b82f6" title="cos(θ)" />
            <TrigGraph funcType="tan" angle={angle} value={tanValue} color="#f97316" title="tan(θ)" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
            <h4 className="font-semibold text-slate-700 mb-2">Unit Circle View</h4>
            <svg width="280" height="280" viewBox="-140 -140 280 280">
              <line x1="-130" y1="0" x2="130" y2="0" stroke="#94a3b8" strokeWidth="1" />
              <line x1="0" y1="-130" x2="0" y2="130" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="0" cy="0" r="100" fill="none" stroke="#a855f7" strokeWidth="2" />
              {angle > 1 && (
                <>
                  <path d={`M 30 0 A 30 30 0 ${angle > 180 ? 1 : 0} 1 ${30 * Math.cos(angleRad)} ${-30 * Math.sin(angleRad)}`} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="2,2" />
                  <text x={45 * Math.cos(angleRad / 2)} y={-45 * Math.sin(angleRad / 2)} fill="#334155" fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{angle.toFixed(0)}°</text>
                </>
              )}
              <text x="50" y="-50" fill="#10b981" fontSize="12" fontWeight="bold">I: All +</text>
              <text x="-85" y="-50" fill="#3b82f6" fontSize="12" fontWeight="bold">II: Sin +</text>
              <text x="-85" y="60" fill="#f97316" fontSize="12" fontWeight="bold">III: Tan +</text>
              <text x="40" y="60" fill="#a855f7" fontSize="12" fontWeight="bold">IV: Cos +</text>
              <line x1="0" y1="0" x2={100 * Math.cos(angleRad)} y2={-100 * Math.sin(angleRad)} stroke="#ef4444" strokeWidth="3" />
              <circle cx={100 * Math.cos(angleRad)} cy={-100 * Math.sin(angleRad)} r="6" fill="#ef4444" />
              <line x1={100 * Math.cos(angleRad)} y1="0" x2={100 * Math.cos(angleRad)} y2={-100 * Math.sin(angleRad)} stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
              <line x1="0" y1="0" x2={100 * Math.cos(angleRad)} y2="0" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
              <text x={100 * Math.cos(angleRad) + 5} y={-50 * Math.sin(angleRad)} fill="#10b981" fontSize="11" fontWeight="bold" dominantBaseline="middle">y=sin(θ)</text>
              <text x={50 * Math.cos(angleRad)} y="15" fill="#3b82f6" fontSize="11" fontWeight="bold" textAnchor="middle">x=cos(θ)</text>
              <text x={108 * Math.cos(angleRad)} y={-108 * Math.sin(angleRad)} fill="#4338ca" fontSize="10" fontWeight="bold" textAnchor={cosValue >= 0 ? "start" : "end"} dominantBaseline="middle">(cosθ, sinθ)</text>
            </svg>
            <div className="mt-4 space-y-2 w-full">
              <div className={`px-3 py-1 rounded-lg text-sm font-bold text-center ${signs.sin === '+' ? 'bg-green-400/30 text-green-900' : 'bg-red-400/30 text-red-900'}`}>sin({angle.toFixed(0)}°) = {sinValue.toFixed(3)} ({signs.sin})</div>
              <div className={`px-3 py-1 rounded-lg text-sm font-bold text-center ${signs.cos === '+' ? 'bg-green-400/30 text-green-900' : 'bg-red-400/30 text-red-900'}`}>cos({angle.toFixed(0)}°) = {cosValue.toFixed(3)} ({signs.cos})</div>
              <div className={`px-3 py-1 rounded-lg text-sm font-bold text-center ${signs.tan === '+' ? 'bg-green-400/30 text-green-900' : 'bg-red-400/30 text-red-900'}`}>tan({angle.toFixed(0)}°) = {Math.abs(tanValue) > 100 ? '∞' : tanValue.toFixed(3)} ({signs.tan})</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
              <label htmlFor="angle-slider" className="block text-sm font-semibold text-slate-700 mb-2">Angle: {angle.toFixed(0)}° (Quadrant {quadrant})</label>
              <input id="angle-slider" type="range" min="0" max="360" value={angle} disabled={isAnimating} onChange={(e) => setAngle(Number(e.target.value))} className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer disabled:bg-slate-400/50 accent-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white/20" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[45, 135, 225, 315, 90, 270].map(deg => (
                <button key={deg} onClick={() => setAngle(deg)} disabled={isAnimating} className="px-4 py-2 bg-white/40 text-slate-800 font-semibold rounded-lg hover:bg-white/70 active:scale-95 transition-all duration-200 disabled:bg-slate-400/50 disabled:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500">{deg}°</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Interactive Exercise: Determine the Signs</h3>
        <p className="text-slate-700 mb-4 text-center">Enter an angle and complete the steps to practice identifying the signs of trigonometric ratios.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
            <label htmlFor="interactive-angle-input" className="block text-sm font-semibold text-slate-700 mb-2">Enter Angle (0° to 360°)</label>
            <input id="interactive-angle-input" type="number" min="0" max="360" value={interactiveAngle} onChange={(e) => { const value = e.target.value; setInteractiveAngle(value); resetExercise(); if (value.trim() === '') { setInteractiveAngleError(''); return; } const numValue = Number(value); if (isNaN(numValue) || numValue < 0 || numValue > 360) { setInteractiveAngleError('Angle must be between 0° and 360°'); } else { setInteractiveAngleError(''); } }} placeholder="e.g., 210" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg mb-4 transition-colors bg-white/50 ${interactiveAngleError ? 'border-red-400 focus:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-purple-300/50 focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500'}`} />
            {interactiveAngleError && <p className="text-red-700 font-bold text-sm -mt-2 mb-4">{interactiveAngleError}</p>}
            <button onClick={startExercise} disabled={!interactiveAngle || isNaN(Number(interactiveAngle)) || !!interactiveAngleError} className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 font-semibold text-lg disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600">Start Exercise</button>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border border-white/20 space-y-3 min-h-[300px]">
            {showExercise && interactiveSigns ? ( <>
                <div className="bg-white/30 p-3 rounded-lg border border-white/20">
                  <strong className="text-slate-900">Step 1: Identify Quadrant</strong>
                  <p className="text-slate-700 mt-1">An angle of {interactiveAngle}° is in which quadrant?</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[1, 2, 3, 4].map(q => ( <label key={q} className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-yellow-500 ${step1Input === q ? 'bg-yellow-400/50 border-yellow-500' : 'bg-white/50 border-white/30'}`}><input type="radio" name="quadrant" value={q} checked={step1Input === q} onChange={() => { setStep1Input(q); setStep1Status('unanswered'); setStep1Feedback(''); }} disabled={step1Status === 'correct'} className="accent-yellow-600 focus:outline-none" /> Quadrant {q} </label> ))}
                  </div>
                  {step1Status !== 'correct' && ( <button onClick={checkStep1} className="w-full mt-2 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600">Check Quadrant</button> )}
                  {step1Feedback && <p role="status" className={`pop-in ${step1Status === 'correct' ? 'text-green-800' : 'text-red-800'} text-sm mt-2 font-semibold`}>{step1Feedback}</p>}
                </div>
                {exerciseStep >= 2 && (
                  <div className="pop-in bg-white/30 p-3 rounded-lg border border-white/20">
                    <strong className="text-slate-900">Step 2: Determine Signs (ASTC Rule)</strong>
                    <p className="text-slate-700 mt-1">For Quadrant {interactiveSigns.quadrant}, what are the signs?</p>
                    <div className="space-y-2 mt-2">
                      {['sin', 'cos', 'tan'].map((func, index) => (
                        <div key={func} className="flex items-center justify-between">
                          <label htmlFor={`sign-${func}`} className="font-semibold text-slate-800">{func}({interactiveAngle}°):</label>
                          <select ref={index === 0 ? firstSignSelectRef : null} id={`sign-${func}`} value={step2Inputs[func as keyof typeof step2Inputs]} onChange={e => { setStep2Inputs(prev => ({ ...prev, [func]: e.target.value })); setStep2Status('unanswered'); setStep2Feedback(''); }} disabled={step2Status === 'correct'} className="px-2 py-1 border-2 rounded-md focus:outline-none focus:border-yellow-500 focus-visible:ring-2 focus-visible:ring-yellow-500 disabled:bg-slate-200/50 bg-white/50 border-white/30">
                            <option value="">Select</option> <option value="+">Positive (+)</option> <option value="-">Negative (-)</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    {step2Status !== 'correct' && ( <button onClick={checkStep2} className="w-full mt-2 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600">Check Signs</button> )}
                    {step2Feedback && <p role="status" className={`pop-in ${step2Status === 'correct' ? 'text-green-800' : 'text-red-800'} text-sm mt-2 font-semibold`}>{step2Feedback}</p>}
                  </div>
                )}
                {exerciseStep >= 3 && (
                  <div className="pop-in bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-lg text-white shadow-lg">
                    <strong className="text-lg">Great Work! Here's the summary:</strong>
                    <div className="mt-2 space-y-1 font-semibold text-lg">
                      <p>• sin({interactiveAngle}°) is {interactiveSigns.sin === '+' ? 'positive' : 'negative'} ({interactiveSigns.sin})</p>
                      <p>• cos({interactiveAngle}°) is {interactiveSigns.cos === '+' ? 'positive' : 'negative'} ({interactiveSigns.cos})</p>
                      <p>• tan({interactiveAngle}°) is {interactiveSigns.tan === '+' ? 'positive' : 'negative'} ({interactiveSigns.tan})</p>
                    </div>
                  </div>
                )}
              </> ) : ( <div className="flex items-center justify-center text-center text-slate-600 h-full"> <p>{interactiveAngleError ? 'Please fix the error above to start.' : 'Enter an angle and click "Start Exercise" to begin!'}</p> </div> )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default SignsOfTrigRatios;
