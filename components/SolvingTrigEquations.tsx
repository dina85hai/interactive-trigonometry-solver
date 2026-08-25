import React, { useState, PropsWithChildren, useEffect, useRef } from 'react';
import UnitCircle from './UnitCircle';

type TrigType = 'sin' | 'cos' | 'tan';

interface InteractiveSolution {
    solutions: number[];
    principalSolutions: number[];
    allQuadrantAngles: {
        q1: number | null;
        q2: number | null;
        q3: number | null;
        q4: number | null;
    };
}

interface QuizQuestion {
  text: React.ReactNode;
  options: string[];
  answer: string;
  feedback: { [key: string]: string };
}

const Tooltip = ({ text, children }: PropsWithChildren<{ text: React.ReactNode }>) => {
  return (
    <div className="relative inline-flex items-center group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm font-normal text-white bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none text-left border border-white/20">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800/80"></div>
      </div>
    </div>
  );
};

const CustomSlider = ({ value, onChange, min, max, step, colorClass = 'purple' }: { value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, min: number, max: number, step: number, colorClass?: 'purple' | 'yellow' }) => {
    const safeValue = isNaN(value) ? min : value;
    const percentage = ((safeValue - min) / (max - min)) * 100;
    const sliderColor = colorClass === 'purple' ? 'accent-purple-500' : 'accent-yellow-500';
    const tooltipBgColor = colorClass === 'purple' ? 'bg-purple-600' : 'bg-yellow-600';

    return (
        <div className="relative pt-4 pb-2">
            <div
                className={`absolute text-white text-xs font-bold py-1 px-2 rounded-md -top-2 transform -translate-x-1/2 ${tooltipBgColor}`}
                style={{ left: `${percentage}%` }}
            >
                {safeValue.toFixed(2)}
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={safeValue}
                onChange={onChange}
                className={`w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer ${sliderColor} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white/20 ${colorClass === 'purple' ? 'focus-visible:ring-purple-500' : 'focus-visible:ring-yellow-500'}`}
            />
        </div>
    );
};

const ProgressIndicator = ({
  currentStep,
  totalSteps,
  stepNames,
  onStepSelect,
}: {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
  onStepSelect: (step: number) => void;
}) => (
    <div className="flex items-start justify-center mb-4" aria-label={`Step ${currentStep} of ${totalSteps}`}>
        {stepNames.map((name, index) => {
            const step = index + 1;
            const isCompleted = step < currentStep;
            const isActive = step === currentStep;
            return (
                <React.Fragment key={step}>
                    <button
                        type="button"
                        onClick={() => onStepSelect(step)}
                        className="flex flex-col items-center text-center w-20 rounded-lg p-1 transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Open step ${step}: ${name}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                ${isCompleted ? 'bg-green-500 text-white' : ''}
                                ${isActive ? 'bg-yellow-500 text-white ring-2 ring-yellow-300' : ''}
                                ${!isCompleted && !isActive ? 'bg-slate-300 text-slate-600' : ''}
                            `}
                        >
                            {isCompleted ? '✓' : step}
                        </div>
                        <p className={`mt-1 text-xs leading-tight ${isActive ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{name}</p>
                    </button>
                    {step < totalSteps && <div className={`flex-1 h-1 mt-3.5 rounded ${isCompleted ? 'bg-green-500' : 'bg-slate-300'} transition-colors duration-300`}></div>}
                </React.Fragment>
            );
        })}
    </div>
);


const SolvingTrigEquations = () => {
  const [equationType, setEquationType] = useState<TrigType>('sin');
  const [constant, setConstant] = useState<number>(0.5);
  const [interactiveTrigType, setInteractiveTrigType] = useState<TrigType>('sin');
  const [interactiveVal, setInteractiveVal] = useState<string>('0.5');
  const [interactiveError, setInteractiveError] = useState<string>('');
  
  // Interactive step-by-step state
  const [solStep, setSolStep] = useState<number>(0);
  const [step2Input, setStep2Input] = useState('');
  const [step2Status, setStep2Status] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [step2Feedback, setStep2Feedback] = useState('');
  const [step3Input, setStep3Input] = useState<number[]>([]);
  const [step3Status, setStep3Status] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [step3Feedback, setStep3Feedback] = useState('');
  const [step4Inputs, setStep4Inputs] = useState<{[quadrant: number]: string}>({});
  const [step4Status, setStep4Status] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [step4Feedback, setStep4Feedback] = useState('');
  const [step5Inputs, setStep5Inputs] = useState<string[]>(['']);
  const [step5Status, setStep5Status] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [step5Feedback, setStep5Feedback] = useState('');
  const [focusedStepInput, setFocusedStepInput] = useState<string | null>(null);
  
  const stepRefs = {
      step2: useRef<HTMLInputElement>(null),
      step3: useRef<HTMLInputElement>(null),
      step4: useRef<(HTMLInputElement | null)[]>([]),
      step5: useRef<(HTMLInputElement | null)[]>([]),
  };

  // Quiz State
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [quizFeedback, setQuizFeedback] = useState<string>('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  // Graph interaction state
  const [hoverData, setHoverData] = useState<{ x: number; angle: number; value: number; curveY: number } | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
  const graphRef = useRef<SVGSVGElement>(null);

  const validateInteractiveInput = (type: TrigType, valueStr: string): string => {
    if (valueStr.trim() === '' || valueStr === '-') {
      return 'Please enter a value.';
    }
    const val = Number(valueStr);
    if (isNaN(val)) {
      return 'Please enter a valid number.';
    }
    if ((type === 'sin' || type === 'cos') && (val < -1 || val > 1)) {
      return 'Value for sin/cos must be between -1 and 1.';
    }
    return ''; // No error
  };

  useEffect(() => {
    if (equationType === 'sin' || equationType === 'cos') {
        setConstant(c => Math.max(-1, Math.min(1, c)));
    }
  }, [equationType]);

  useEffect(() => {
    const errorMessage = validateInteractiveInput(interactiveTrigType, interactiveVal);
    setInteractiveError(errorMessage);
  }, [interactiveVal, interactiveTrigType]);
  
  useEffect(() => {
    if (solStep === 2) stepRefs.step2.current?.focus();
    else if (solStep === 3) stepRefs.step3.current?.focus();
    else if (solStep === 4) stepRefs.step4.current[0]?.focus();
    else if (solStep === 5) stepRefs.step5.current[0]?.focus();
  }, [solStep]);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const solveForQuiz = (func: TrigType, val: number, min: number, max: number): number[] => {
    let solutions: number[] = [];
    const period = func === 'tan' ? 180 : 360;
    const maxIterations = Math.ceil((max - min) / period) + 2;

    let baseSolutions: number[] = [];
    if (func === 'sin' && val >= -1 && val <= 1) {
        const principal = Math.asin(val) * 180 / Math.PI;
        baseSolutions = [principal, 180 - principal];
    } else if (func === 'cos' && val >= -1 && val <= 1) {
        const principal = Math.acos(val) * 180 / Math.PI;
        baseSolutions = [principal, 360 - principal];
    } else if (func === 'tan') {
        const principal = Math.atan(val) * 180 / Math.PI;
        baseSolutions = [principal];
    }

    baseSolutions.forEach(baseSol => {
        for (let n = -maxIterations; n <= maxIterations; n++) {
            const sol = baseSol + n * period;
            if (sol >= min && sol < max) {
                solutions.push(parseFloat(sol.toFixed(0)));
            }
        }
    });

    return [...new Set(solutions)].sort((a, b) => a - b);
  };

  const generateQuizQuestion = () => {
    const questionType = Math.random() > 0.5 ? 'solve' : 'quadrant';
    let question: QuizQuestion;

    if (questionType === 'quadrant') {
        const funcs: TrigType[] = ['sin', 'cos', 'tan'];
        const signs = ['positive', 'negative'];
        const func = funcs[Math.floor(Math.random() * funcs.length)];
        const sign = signs[Math.floor(Math.random() * signs.length)];
        
        let answer = '';
        if (func === 'sin' && sign === 'positive') answer = 'I & II';
        if (func === 'sin' && sign === 'negative') answer = 'III & IV';
        if (func === 'cos' && sign === 'positive') answer = 'I & IV';
        if (func === 'cos' && sign === 'negative') answer = 'II & III';
        if (func === 'tan' && sign === 'positive') answer = 'I & III';
        if (func === 'tan' && sign === 'negative') answer = 'II & IV';

        const allOptionsFeedback = {
          'I & II': 'sin(θ) is positive here because the y-coordinate is positive.',
          'III & IV': 'sin(θ) is negative here because the y-coordinate is negative.',
          'I & IV': 'cos(θ) is positive here because the x-coordinate is positive.',
          'II & III': 'cos(θ) is negative here because the x-coordinate is negative.',
          'I & III': 'tan(θ) is positive here because y/x have the same sign.',
          'II & IV': 'tan(θ) is negative here because y/x have different signs.',
        };
        const distractors = Object.keys(allOptionsFeedback).filter(opt => opt !== answer);
        const options = shuffleArray([answer, ...shuffleArray(distractors).slice(0, 3)]);

        const feedback: { [key: string]: string } = {};
        options.forEach(opt => {
            if (opt !== answer) {
                feedback[opt] = `Not quite. ${allOptionsFeedback[opt as keyof typeof allOptionsFeedback]}`;
            }
        });
        
        question = {
            text: <>In which quadrants is <strong className="font-bold text-purple-700">{func}(θ)</strong> {sign}?</>,
            options,
            answer,
            feedback,
        };
    } else { // 'solve' type
        const problems = [
            { func: 'sin' as TrigType, val: 0.5, ref: 30 },
            { func: 'cos' as TrigType, val: 0.5, ref: 60 },
            { func: 'tan' as TrigType, val: 1, ref: 45 },
            { func: 'sin' as TrigType, val: -0.5, ref: 30 },
            { func: 'cos' as TrigType, val: -0.5, ref: 60 },
        ];
        const problem = problems[Math.floor(Math.random() * problems.length)];
        const { func, val } = problem;
        
        const [min, max] = [0, 360];

        const solutions = solveForQuiz(func, val, min, max);
        const answer = solutions.length > 0 ? solutions.map(s => `${s}°`).join(', ') : 'No solution';
        
        const feedback: { [key: string]: string } = {};
        let options: string[] = [answer];

        // Distractor 1: Opposite sign
        const distractorSolutions1 = solveForQuiz(func, -val, min, max);
        const option1 = distractorSolutions1.length > 0 ? distractorSolutions1.map(s => `${s}°`).join(', ') : 'No solution';
        if (option1 !== answer) {
            options.push(option1);
            feedback[option1] = `This is the solution for ${func}(θ) = ${-val}. Check the sign of the constant.`;
        }

        // Distractor 2: Other function
        const otherFunc = func === 'sin' ? 'cos' : 'sin';
        const distractorSolutions2 = solveForQuiz(otherFunc, val, min, max);
        const option2 = distractorSolutions2.length > 0 ? distractorSolutions2.map(s => `${s}°`).join(', ') : 'No solution';
        if (option2 !== answer) {
            options.push(option2);
            feedback[option2] = `This is the correct solution for ${otherFunc}(θ) = ${val}. Be careful to use the correct function.`;
        }
        
        // Distractor 3: Only one solution (if there are two)
        if (solutions.length > 1) {
            const option3 = `${solutions[0]}°`;
            if (!options.includes(option3)) {
                options.push(option3);
                feedback[option3] = "This is one of the solutions, but remember to find all solutions within the given range.";
            }
        }
        
        options = shuffleArray([...new Set(options)]);
        // Fill up to 4 options if needed
        const allPossibleAnswers = ["30°, 150°", "60°, 300°", "45°, 225°", "120°, 240°", "150°, 210°", "210°, 330°"];
        let i = 0;
        while (options.length < 4 && i < allPossibleAnswers.length) {
            const filler = shuffleArray(allPossibleAnswers)[i];
            if (!options.includes(filler)) {
                options.push(filler);
                feedback[filler] = "Check your reference angle and quadrants again.";
            }
            i++;
        }
        
        question = {
            text: <>Solve <strong className="font-bold text-purple-700">{func}(θ) = {val}</strong> for {min}° ≤ θ &lt; {max}°.</>,
            options: shuffleArray(options.slice(0, 4)),
            answer,
            feedback,
        };
    }
    setQuizQuestion(question);
    setUserAnswer('');
    setQuizFeedback('');
  };

  useEffect(() => {
    generateQuizQuestion();
  }, []);

  const handleCheckAnswer = () => {
    if (!userAnswer || !quizQuestion) return;
    if (userAnswer === quizQuestion.answer) {
        setQuizFeedback('CORRECT');
        setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
        const detailedFeedback = quizQuestion.feedback[userAnswer];
        const finalFeedback = detailedFeedback
            ? `${detailedFeedback} The correct answer is ${quizQuestion.answer}.`
            : `Incorrect. The correct answer is ${quizQuestion.answer}.`;
        setQuizFeedback(finalFeedback);
        setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const solveEquation = (): string[] => {
    const val = Number(constant);
    if (isNaN(val)) return [];
    
    const solutions = solveForQuiz(equationType, val, 0, 360);
    return solutions.map(s => s.toFixed(1));
  };
  
  const solveInteractive = (): InteractiveSolution | null => {
    const val = Number(interactiveVal);
    if (isNaN(val) || interactiveError) return null;
    
    let principalSolutions: number[] = [];
    let allQuadrantAngles: InteractiveSolution['allQuadrantAngles'] = { q1: null, q2: null, q3: null, q4: null };
    let refAngleRad = 0;
    
    if (interactiveTrigType !== 'tan' && (val < -1 || val > 1)) return null;

    if(interactiveTrigType === 'sin') refAngleRad = Math.asin(Math.abs(val));
    else if (interactiveTrigType === 'cos') refAngleRad = Math.acos(Math.abs(val));
    else refAngleRad = Math.atan(Math.abs(val));

    const refAngle = refAngleRad * 180 / Math.PI;
    allQuadrantAngles = { q1: refAngle, q2: 180 - refAngle, q3: 180 + refAngle, q4: 360 - refAngle };

    if (interactiveTrigType === 'sin') {
      principalSolutions = val >= 0 ? [allQuadrantAngles.q1, allQuadrantAngles.q2] : [allQuadrantAngles.q3, allQuadrantAngles.q4];
    } else if (interactiveTrigType === 'cos') {
      principalSolutions = val >= 0 ? [allQuadrantAngles.q1, allQuadrantAngles.q4] : [allQuadrantAngles.q2, allQuadrantAngles.q3];
    } else if (interactiveTrigType === 'tan') {
      principalSolutions = val >= 0 ? [allQuadrantAngles.q1, allQuadrantAngles.q3] : [allQuadrantAngles.q2, allQuadrantAngles.q4];
    }
    principalSolutions = principalSolutions.filter(s => s !== null).sort((a, b) => a! - b!) as number[];
    
    return { solutions: principalSolutions, principalSolutions, allQuadrantAngles };
  };
  
  const interactiveResult = solveInteractive();
  const allQuadAngles = interactiveResult?.allQuadrantAngles;
  const refAngle = allQuadAngles?.q1;

  const val = Number(interactiveVal);
  let relevantQuadrants: number[] = [];
  if (interactiveResult) {
      if (interactiveTrigType === 'sin') {
          relevantQuadrants = val >= 0 ? [1, 2] : [3, 4];
      } else if (interactiveTrigType === 'cos') {
          relevantQuadrants = val >= 0 ? [1, 4] : [2, 3];
      } else if (interactiveTrigType === 'tan') {
          relevantQuadrants = val >= 0 ? [1, 3] : [2, 4];
      }
  }

  const resetInteractiveSteps = () => {
    setSolStep(0);
    setStep2Input('');
    setStep2Status('unanswered');
    setStep2Feedback('');
    setStep3Input([]);
    setStep3Status('unanswered');
    setStep3Feedback('');
    setStep4Inputs({});
    setStep4Status('unanswered');
    setStep4Feedback('');
    const solutions = solveInteractive()?.principalSolutions || [];
    setStep5Inputs(solutions.map(() => ''));
    setStep5Status('unanswered');
    setStep5Feedback('');
    setFocusedStepInput(null);
  };

  const startAnimatedSol = () => {
    if (interactiveError) return;
    resetInteractiveSteps();
    setSolStep(1);
    const solutions = solveInteractive()?.principalSolutions || [];
    setStep5Inputs(Array(solutions.length).fill(''));
  };

  const openSolutionStep = (step: number) => {
    if (!interactiveResult) return;
    setSolStep(step);
  };

  const continueToSolutionStep = (step: number) => {
    if (!interactiveResult) return;
    setSolStep((currentStep) => Math.max(currentStep, step));
  };

  const handleInteractiveTypeChange = (type: TrigType) => {
    setInteractiveTrigType(type);
    resetInteractiveSteps();
  };

  const checkStep2 = () => {
    const userVal = parseFloat(step2Input);
    if (!isNaN(userVal) && refAngle != null && Math.abs(userVal - refAngle) < 0.1) {
        setStep2Status('correct');
        setStep2Feedback(`✓ Correct! The reference angle is ${refAngle.toFixed(2)}°`);
        setTimeout(() => setSolStep(3), 300);
    } else {
        setStep2Status('incorrect');
        setStep2Feedback('Not quite, try again! The reference angle is always positive and between 0° and 90°.');
    }
  };

  const checkStep3 = () => {
    const sortedUserInput = [...step3Input].sort();
    const sortedCorrect = [...relevantQuadrants].sort();
    if (sortedUserInput.length === sortedCorrect.length && sortedUserInput.every((val, index) => val === sortedCorrect[index])) {
      setStep3Status('correct');
      setStep3Feedback(`✓ Correct! Solutions are in Quadrants ${relevantQuadrants.join(' & ')}.`);
      setTimeout(() => setSolStep(4), 300);
    } else {
      setStep3Status('incorrect');
      const val = Number(interactiveVal);
      let hint = 'Remember the ASTC rule. ';
      if (interactiveTrigType === 'sin') {
          hint += `Since sin(θ) is ${val >= 0 ? 'positive' : 'negative'}, look for quadrants where the y-coordinate is ${val >= 0 ? 'positive (I & II)' : 'negative (III & IV)'}.`;
      } else if (interactiveTrigType === 'cos') {
          hint += `Since cos(θ) is ${val >= 0 ? 'positive' : 'negative'}, look for quadrants where the x-coordinate is ${val >= 0 ? 'positive (I & IV)' : 'negative (II & III)'}.`;
      } else { // tan
          hint += `Since tan(θ) is ${val >= 0 ? 'positive' : 'negative'}, look for quadrants where sin(θ) and cos(θ) have ${val >= 0 ? 'the same sign (I & III)' : 'different signs (II & IV)'}.`;
      }
      setStep3Feedback(hint);
    }
  };
  
  const handleStep3Checkbox = (q: number) => {
    setStep3Status('unanswered');
    setStep3Feedback('');
    setStep3Input(prev => {
        if (prev.includes(q)) {
            return prev.filter(item => item !== q);
        } else {
            return [...prev, q].sort();
        }
    });
  };

  const checkStep4 = () => {
    let allCorrect = true;
    let specificFeedback = '';

    if (relevantQuadrants.length === 0) {
        setStep4Status('correct');
        setStep4Feedback('✓ Correct! There are no solutions.');
        setTimeout(() => setSolStep(5), 300);
        return;
    }

    for (const q of relevantQuadrants) {
        const userVal = parseFloat(step4Inputs[q]);
        const correctVal = allQuadAngles ? allQuadAngles[`q${q as 1|2|3|4}`] : null;

        if (correctVal === null || isNaN(userVal) || Math.abs(userVal - correctVal) > 0.1) {
            allCorrect = false;
            if (isNaN(userVal)) {
                specificFeedback = `Please enter a value for Quadrant ${q}.`;
            } else {
                const formula = {
                    1: "θ = θ_ref",
                    2: "θ = 180° - θ_ref",
                    3: "θ = 180° + θ_ref",
                    4: "θ = 360° - θ_ref"
                }[q];
                specificFeedback = `Check your calculation for Quadrant ${q}. Remember the formula is: ${formula}.`;
            }
            break; // Stop on first error
        }
    }

    if (allCorrect) {
        setStep4Status('correct');
        setStep4Feedback('✓ Excellent! All solution angles are correct.');
        setTimeout(() => setSolStep(5), 300);
    } else {
        setStep4Status('incorrect');
        setStep4Feedback(specificFeedback || 'Check your calculations!');
    }
  };

  const checkStep5 = () => {
    const correctSols = (interactiveResult?.principalSolutions || []).map(s => s.toFixed(1)).sort();
    const userSols = step5Inputs.filter(s => s.trim() !== '').map(s => parseFloat(s).toFixed(1)).sort();

    if (correctSols.length === userSols.length && userSols.every((val, index) => val === correctSols[index])) {
        setStep5Status('correct');
        setStep5Feedback("🎉 Perfect! You've solved the equation!");
        setSolStep(6);
    } else {
        setStep5Status('incorrect');
        setStep5Feedback("Almost there! Ensure your final answers match the angles from Step 4. List them from smallest to largest.");
    }
  };


  const solutions = solveEquation();
  
  const valueForRefAngle = Number(constant);
  let refAngleForDisplay: number | null = null;
  if (!isNaN(valueForRefAngle)) {
    let refAngleRad: number = NaN;
    if (equationType === 'sin' && Math.abs(valueForRefAngle) <= 1) {
        refAngleRad = Math.asin(Math.abs(valueForRefAngle));
    } else if (equationType === 'cos' && Math.abs(valueForRefAngle) <= 1) {
        refAngleRad = Math.acos(Math.abs(valueForRefAngle));
    } else if (equationType === 'tan') {
        refAngleRad = Math.atan(Math.abs(valueForRefAngle));
    }
    if (!isNaN(refAngleRad)) {
        refAngleForDisplay = (refAngleRad * 180) / Math.PI;
    }
  }

  const getRelevantQuadrantsForHighlight = () => {
    const val = Number(constant);
    if (isNaN(val)) return [];
    if (equationType === 'sin') return val >= 0 ? [1, 2] : [3, 4];
    if (equationType === 'cos') return val >= 0 ? [1, 4] : [2, 3];
    if (equationType === 'tan') return val >= 0 ? [1, 3] : [2, 4];
    return [];
  };
  const relevantQuadrantsForHighlight = getRelevantQuadrantsForHighlight();
  const numericSolutions = solveForQuiz(equationType, constant, 0, 360);
  
  const handleGraphMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!graphRef.current) return;
    const svg = graphRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x } = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const graphXMin = 20;
    const graphXMax = 380;
    const angleRange = 360; // 0 to 360

    if (x >= graphXMin && x <= graphXMax) {
        const angle = ((x - graphXMin) / (graphXMax - graphXMin)) * angleRange;
        const angleRad = (angle * Math.PI) / 180;
        let value, curveY;

        if (equationType === 'sin') {
            value = Math.sin(angleRad);
            curveY = 150 - value * 100;
        } else if (equationType === 'cos') {
            value = Math.cos(angleRad);
            curveY = 150 - value * 100;
        } else {
            value = Math.tan(angleRad);
            curveY = 150 - Math.min(Math.max(value, -2), 2) * 50;
        }
        setHoverData({ x, angle, value, curveY });
    } else {
        setHoverData(null);
    }
  };
  
  const stepNames = ["Equation", "Ref Angle", "Quadrants", "Calculate", "Answer"];

  return (
    <div className="space-y-6">
      <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Interactive Equation Solver</h3>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
              <h4 className="font-bold text-slate-800 mb-3 text-center">Configure Equation</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Function</label>
                  <div className="grid grid-cols-3 gap-2 text-sm font-semibold p-1 bg-black/10 rounded-full">
                    <button onClick={() => setEquationType('sin')} className={`px-2 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${equationType === 'sin' ? 'bg-white shadow' : 'text-slate-600 hover:bg-white/50 active:bg-white/70'}`}>sin(θ)</button>
                    <button onClick={() => setEquationType('cos')} className={`px-2 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${equationType === 'cos' ? 'bg-white shadow' : 'text-slate-600 hover:bg-white/50 active:bg-white/70'}`}>cos(θ)</button>
                    <button onClick={() => setEquationType('tan')} className={`px-2 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${equationType === 'tan' ? 'bg-white shadow' : 'text-slate-600 hover:bg-white/50 active:bg-white/70'}`}>tan(θ)</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Value</label>
                   <CustomSlider value={constant} onChange={(e) => setConstant(Number(e.target.value))} min={equationType === 'tan' ? -2 : -1} max={equationType === 'tan' ? 2 : 1} step={0.01} colorClass="purple" />
                </div>
              </div>
            </div>

            <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                    Relevant Quadrants (ASTC)
                    <Tooltip text={ <div className="space-y-1 text-left"> <p className="font-bold">ASTC Rule</p> <p><strong className="text-green-400">Q1 (A):</strong> All functions are positive.</p> <p><strong className="text-blue-400">Q2 (S):</strong> Sine is positive.</p> <p><strong className="text-orange-400">Q3 (T):</strong> Tangent is positive.</p> <p><strong className="text-purple-400">Q4 (C):</strong> Cosine is positive.</p> </div> }>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 cursor-help" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /> </svg>
                    </Tooltip>
                </h4>
                <div className="flex justify-center">
                    <svg width="120" height="120" viewBox="-60 -60 120 120">
                        <line x1="-55" y1="0" x2="55" y2="0" stroke="#cbd5e1" strokeWidth="1" />
                        <line x1="0" y1="-55" x2="0" y2="55" stroke="#cbd5e1" strokeWidth="1" />
                        {[{ q: 1, path: 'M 0 0 L 50 0 A 50 50 0 0 0 0 -50 Z' }, { q: 2, path: 'M 0 0 L 0 -50 A 50 50 0 0 0 -50 0 Z' }, { q: 3, path: 'M 0 0 L -50 0 A 50 50 0 0 0 0 50 Z' }, { q: 4, path: 'M 0 0 L 0 50 A 50 50 0 0 0 50 0 Z' }].map(({ q, path }) => ( <path key={q} d={path} fill={relevantQuadrantsForHighlight.includes(q) ? '#8b5cf6' : '#e2e8f0'} fillOpacity={relevantQuadrantsForHighlight.includes(q) ? 0.35 : 0.7} stroke="#f8fafc" strokeWidth="1" /> ))}
                        <text x="25" y="-25" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold" fill="#475569" className="pointer-events-none">A</text>
                        <text x="-25" y="-25" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold" fill="#475569" className="pointer-events-none">S</text>
                        <text x="-25" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold" fill="#475569" className="pointer-events-none">T</text>
                        <text x="25" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold" fill="#475569" className="pointer-events-none">C</text>
                    </svg>
                </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl shadow-lg text-white">
              <h4 className="font-bold mb-2 text-purple-100">Equation & Solutions</h4>
              <p className="text-2xl font-bold text-center mb-2">{equationType}(θ) = {constant.toFixed(2)}</p>
              {refAngleForDisplay !== null && (
                <div className="mb-2 pb-2 border-b border-white/20 text-center">
                    <p className="text-sm font-semibold text-purple-200">Reference Angle (θ_ref): <span className="text-lg font-bold text-white">{refAngleForDisplay.toFixed(2)}°</span></p>
                </div>
              )}
              <div className="bg-white/20 p-3 rounded-lg min-h-[80px]">
                {solutions.length > 0 ? (
                  <div className="space-y-1 text-center">
                    {solutions.map((sol, i) => <p key={i} className="text-lg font-bold">θ = {sol}°</p>)}
                  </div>
                ) : ( <p className="font-bold text-yellow-200 text-center py-4">No solutions in range [0°, 360°).</p> )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
                <h4 className="font-semibold text-slate-700 mb-2 text-center">Graph View (0° to 360°)</h4>
                <svg ref={graphRef} width="100%" height="300" viewBox="0 0 400 300" onMouseMove={handleGraphMouseMove} onMouseLeave={() => setHoverData(null)} className="cursor-crosshair rounded-lg">
                  <rect x="0" y="0" width="400" height="300" fill="transparent" />
                  <line x1="20" y1="50" x2="20" y2="250" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="20" y1="150" x2="380" y2="150" stroke="#64748b" strokeWidth="1.5" />
                  <text x="385" y="155" fontSize="12" fill="#475569">θ</text>
                  <text x="5" y="45" fontSize="12" fill="#475569">y</text>
                  { [0, 90, 180, 270, 360].map(angle => { const x = 20 + (angle / 360) * 360; return (<g key={angle}><line x1={x} y1="145" x2={x} y2="155" stroke="#94a3b8" strokeWidth="1" /><text x={x} y="170" fontSize="10" fill="#64748b" textAnchor="middle">{angle}°</text></g>) })}
                  <path d={Array.from({ length: 361 }, (_, i) => { const angle = i; const x = 20 + (angle / 360) * 360; let y; if (equationType === 'sin') { y = 150 - Math.sin((angle * Math.PI) / 180) * 100; } else if (equationType === 'cos') { y = 150 - Math.cos((angle * Math.PI) / 180) * 100; } else { const tanVal = Math.tan((angle * Math.PI) / 180); y = 150 - Math.min(Math.max(tanVal, -2), 2) * 50; } return `${i === 0 ? 'M' : 'L'} ${x} ${y}`; }).join(' ')} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
                  <line x1="20" y1={150 - constant * (equationType === 'tan' ? 50 : 100)} x2="380" y2={150 - constant * (equationType === 'tan' ? 50 : 100)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" />
                  <text x={375} y={150 - constant * (equationType === 'tan' ? 50 : 100) - 5} fontSize="11" fill="#c2410c" fontWeight="bold" textAnchor="end">y={constant.toFixed(2)}</text>
                  {solutions.map((sol, idx) => { const solAngle = parseFloat(sol); if(isNaN(solAngle) || solAngle < 0 || solAngle > 360) return null; const x = 20 + (solAngle / 360) * 360; const y = 150 - constant * (equationType === 'tan' ? 50 : 100); return ( <g key={idx}> <circle cx={x} cy={y} r={hoveredSolution === sol ? 10 : 6} fill="#10b981" stroke="white" strokeWidth="2" onMouseEnter={() => setHoveredSolution(sol)} onMouseLeave={() => setHoveredSolution(null)} className="transition-all duration-150"><title>Solution at {sol}°</title></circle> {hoveredSolution === sol && ( <g transform={`translate(${x > 300 ? x - 100 : x + 15}, ${y - 35})`} pointerEvents="none"> <rect x="0" y="0" width="90" height="25" fill="rgba(16, 185, 129, 0.9)" rx="5" /> <text x="10" y="17" fill="white" fontSize="11" fontWeight="bold">θ = {sol}°</text> </g> )} </g> ); })}
                  {hoverData && ( <g pointerEvents="none" role="tooltip" aria-live="polite"> <title>Angle: {hoverData.angle.toFixed(1)}°, Value: {hoverData.value.toFixed(2)}</title> <line x1={hoverData.x} y1={50} x2={hoverData.x} y2={250} stroke="#475569" strokeWidth="1" strokeDasharray="3,3" /> <circle cx={hoverData.x} cy={hoverData.curveY} r="5" fill="#ef4444" stroke="white" strokeWidth="2" /> <g transform={`translate(${hoverData.x > 300 ? hoverData.x - 120 : hoverData.x + 15}, 55)`}> <rect x="0" y="0" width="105" height="45" fill="rgba(23, 37, 84, 0.85)" rx="5" /> <text x="10" y="20" fill="white" fontSize="12" fontWeight="bold">θ = {hoverData.angle.toFixed(1)}°</text> <text x="10" y="38" fill="white" fontSize="12" fontWeight="bold">y = {hoverData.value.toFixed(2)}</text> </g> </g> )}
                </svg>
              </div>

              <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/20">
                <h4 className="font-semibold text-slate-700 mb-2 text-center">Unit Circle View</h4>
                 <UnitCircle solutions={numericSolutions} relevantQuadrants={relevantQuadrantsForHighlight} trigType={equationType} value={constant} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Interactive Example: Solve Step-by-Step</h3>
        <p className="text-slate-700 mb-4 text-center">Enter an equation to solve for solutions in [0°, 360°]. See the solution appear step-by-step!</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2"> Select Function </label>
                 <div className="grid grid-cols-3 gap-2 text-sm font-semibold p-1 bg-black/10 rounded-full">
                      <button onClick={() => handleInteractiveTypeChange('sin')} className={`px-2 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${interactiveTrigType === 'sin' ? 'bg-white shadow' : 'text-slate-600 hover:bg-white/50 active:bg-white/70'}`}>sin(θ)</button>
                      <button onClick={() => handleInteractiveTypeChange('cos')} className={`px-2 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${interactiveTrigType === 'cos' ? 'bg-white shadow' : 'text-slate-600 hover:bg-white/50 active:bg-white/70'}`}>cos(θ)</button>
                      <button onClick={() => handleInteractiveTypeChange('tan')} className={`px-2 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${interactiveTrigType === 'tan' ? 'bg-white shadow' : 'text-slate-600 hover:bg-white/50 active:bg-white/70'}`}>tan(θ)</button>
                  </div>
              </div>

              <div>
                <label htmlFor="interactive-val-input" className="block text-sm font-semibold text-slate-700 mb-2"> Value ({interactiveTrigType !== 'tan' ? 'between -1 and 1' : 'any number'}) </label>
                <input id="interactive-val-input" type="number" step="0.01" value={interactiveVal} onChange={(e) => { setInteractiveVal(e.target.value); resetInteractiveSteps();}} placeholder="e.g., 0.5" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg transition-colors bg-white/50 ${interactiveError ? 'border-red-400 focus:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' : 'border-purple-300/50 focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500'}`} />
                {interactiveError && <p className="text-red-700 font-bold text-sm mt-1">{interactiveError}</p>}
              </div>

              <button onClick={startAnimatedSol} disabled={!!interactiveError} className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 font-semibold text-lg disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600"> Let's Solve It! </button>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border border-white/20 space-y-3 min-h-[300px]">
             {solStep > 0 && interactiveResult && refAngle != null ? ( <>
                <ProgressIndicator currentStep={solStep > 5 ? 5 : solStep} totalSteps={stepNames.length} stepNames={stepNames} onStepSelect={openSolutionStep} />
                {solStep >= 1 && <div className="pop-in bg-white/30 p-3 rounded-lg border border-white/20"><strong className="text-slate-900">Step 1: Given Equation</strong><p className="text-slate-700 mt-1 text-lg">{interactiveTrigType}(θ) = {interactiveVal}</p>{solStep === 1 && <button type="button" onClick={() => continueToSolutionStep(2)} className="mt-3 px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600">Continue to Reference Angle</button>}</div>}
                
                {solStep >= 2 && <div className={`pop-in bg-white/30 p-3 rounded-lg border border-white/20 transition-all ${focusedStepInput === 'step2' ? 'ring-2 ring-yellow-500' : ''}`}>
                    <Tooltip text="The reference angle (θ_ref) is the smallest acute angle (0° to 90°) formed by the terminal side of an angle and the x-axis. It simplifies solving equations by using symmetry."><strong className="text-slate-900 flex items-center gap-2 cursor-help">Step 2: Find Reference Angle<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></strong></Tooltip>
                    <div className="flex items-center gap-2 mt-2 flex-wrap"> <p className="text-slate-700">θ_ref =</p> <input ref={stepRefs.step2} type="number" value={step2Input} onChange={e => {setStep2Input(e.target.value); setStep2Status('unanswered'); setStep2Feedback('')}} onFocus={() => setFocusedStepInput('step2')} onBlur={() => setFocusedStepInput(null)} disabled={step2Status === 'correct'} placeholder="???" className="w-24 px-2 py-1 border-2 rounded-md focus:outline-none focus:border-yellow-500 disabled:bg-slate-200/50 bg-white/50 border-white/30" /> <span className="text-slate-700">°</span> {step2Status !== 'correct' && <button onClick={checkStep2} className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600">Check</button>} </div>
                     {step2Feedback && <p role="status" className={`pop-in ${step2Status === 'correct' ? 'text-green-800' : 'text-red-800'} text-sm mt-2 font-semibold`}>{step2Feedback}</p>}
                </div>}
                
                {solStep >= 3 && <div className="pop-in bg-white/30 p-3 rounded-lg border border-white/20">
                    <Tooltip text="Use ASTC to determine where the function is positive or negative."><strong className="text-slate-900 flex items-center gap-2 cursor-help">Step 3: Determine Quadrants<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></strong></Tooltip>
                    <p className="text-slate-700 mt-1">{interactiveTrigType} is {val >= 0 ? 'positive' : 'negative'}, so select the correct quadrants:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">{[1,2,3,4].map((q, i) => <label key={q} className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-yellow-500 ${step3Input.includes(q) ? 'bg-yellow-400/50 border-yellow-500' : 'bg-white/50 border-white/30'}`}><input ref={i === 0 ? stepRefs.step3 : null} type="checkbox" checked={step3Input.includes(q)} onChange={() => handleStep3Checkbox(q)} disabled={step3Status === 'correct'} className="accent-yellow-600"/>Quadrant {q}</label>)}</div>
                    {step3Status !== 'correct' && <button onClick={checkStep3} className="w-full mt-2 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600">Check</button>}
                    {step3Feedback && <p role="status" className={`pop-in ${step3Status === 'correct' ? 'text-green-800' : 'text-red-800'} text-sm mt-2 font-semibold`}>{step3Feedback}</p>}
                </div>}
                
                {solStep >= 4 && <div className="pop-in bg-white/30 p-3 rounded-lg border border-white/20">
                    <Tooltip text="Each quadrant has a formula to find the solution angle based on the reference angle (θ_ref)."><strong className="text-slate-900 flex items-center gap-2 cursor-help">Step 4: Calculate Solution Angles<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></strong></Tooltip>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"> {relevantQuadrants.map((q, i) => { const formula = { 1: `θ = ${refAngle.toFixed(2)}°`, 2: `θ = 180° - ${refAngle.toFixed(2)}°`, 3: `θ = 180° + ${refAngle.toFixed(2)}°`, 4: `θ = 360° - ${refAngle.toFixed(2)}°` }[q]; return <div key={q} className={`p-2 rounded-lg bg-white/40 border border-white/30 space-y-1 transition-all ${focusedStepInput === `step4-${q}` ? 'ring-2 ring-yellow-500' : ''}`}><p className="font-bold text-sm text-yellow-900">Quadrant {q}</p><p className="text-xs text-slate-700">{formula}</p><div className="flex items-center gap-1"><span className="font-bold">θ = </span><input 
// FIX: The ref callback should not return a value. Changed from an expression body to a block body to ensure it returns undefined.
ref={el => { stepRefs.step4.current[i] = el; }} type="number" placeholder="???" value={step4Inputs[q] || ''} onChange={(e) => {setStep4Status('unanswered'); setStep4Feedback(''); setStep4Inputs(p => ({...p, [q]: e.target.value}))}} onFocus={() => setFocusedStepInput(`step4-${q}`)} onBlur={() => setFocusedStepInput(null)} disabled={step4Status==='correct'} className="w-24 px-2 py-1 text-sm border-2 rounded-md focus:outline-none focus:border-yellow-500 disabled:bg-slate-200/50 bg-white/50 border-white/30" /></div></div> })} </div>
                     {step4Status !== 'correct' && relevantQuadrants.length > 0 && <button onClick={checkStep4} className="w-full mt-2 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600">Check</button>}
                     {step4Feedback && <p role="status" className={`pop-in ${step4Status === 'correct' ? 'text-green-800' : 'text-red-800'} text-sm mt-2 font-semibold`}>{step4Feedback}</p>}
                </div>}
                
                {solStep >= 5 && <div className={`pop-in bg-green-500/20 p-4 rounded-lg border border-green-300 transition-all ${focusedStepInput?.startsWith('step5') ? 'ring-2 ring-green-500' : ''}`}>
                    <strong className="text-lg font-bold text-green-900">✓ Step 5: Final Answer</strong>
                    <p className="mt-1 text-sm text-slate-600">(Solutions in [0°, 360°])</p>
                    <div className="flex items-center flex-wrap gap-2 mt-2"> <span className="font-bold text-green-800 text-lg">θ =</span> {(interactiveResult?.principalSolutions || []).map((_, idx) => <input key={idx} 
// FIX: The ref callback should not return a value. Changed from an expression body to a block body to ensure it returns undefined.
ref={el => { stepRefs.step5.current[idx] = el; }} type="number" placeholder="???" value={step5Inputs[idx] || ''} onChange={e => {setStep5Status('unanswered'); setStep5Feedback(''); const newInputs = [...step5Inputs]; newInputs[idx] = e.target.value; setStep5Inputs(newInputs);}} onFocus={() => setFocusedStepInput(`step5-${idx}`)} onBlur={() => setFocusedStepInput(null)} disabled={step5Status === 'correct'} className="w-28 px-2 py-1 text-lg border-2 rounded-md focus:outline-none focus:border-green-500 disabled:bg-slate-200/50 bg-white/50 border-white/30" />)} </div>
                    {step5Status !== 'correct' && (interactiveResult?.principalSolutions.length || 0) > 0 && <button onClick={checkStep5} className="w-full mt-2 px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-700">Check</button>}
                    {step5Feedback && <p role="status" className={`pop-in ${step5Status === 'correct' ? 'text-green-800' : 'text-red-800'} text-sm mt-2 font-semibold`}>{step5Feedback}</p>}
                     {(interactiveResult?.principalSolutions.length || 0) === 0 && <p className="mt-2 text-lg font-bold text-green-800">No solution</p>}
                </div>}
              </> ) : (<div className="flex items-center justify-center text-center text-slate-600 h-full"><p>{interactiveError ? 'Please fix the errors to proceed.' : 'Enter an equation and click "Let\'s Solve It!" to begin!'}</p></div>)}
          </div>
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Test Your Knowledge: Interactive Quiz</h3>
        {quizQuestion && (
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl border border-white/20 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg text-slate-800">{quizQuestion.text}</p>
                    <span className="text-sm font-bold text-slate-600 bg-white/40 px-3 py-1 rounded-full">Score: {score.correct}/{score.total}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {quizQuestion.options.map((option, index) => {
                        const isSelected = userAnswer === option;
                        const isCorrect = quizQuestion.answer === option;
                        let feedbackClass = 'border-white/30 bg-white/40 hover:bg-white/60';
                        if (quizFeedback) {
                            if (isCorrect) {
                                feedbackClass = 'border-green-500 bg-green-400/50 ring-2 ring-green-500';
                            } else if (isSelected) {
                                feedbackClass = 'border-red-500 bg-red-400/50';
                            }
                        } else if(isSelected) {
                            feedbackClass = 'border-blue-500 bg-blue-400/50 ring-2 ring-blue-500';
                        }
                        return (
                            <label key={index} htmlFor={`option-${index}`} className={`block p-3 border-2 rounded-lg cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 ${feedbackClass}`}>
                                <input type="radio" id={`option-${index}`} name="quiz-option" value={option} checked={isSelected} onChange={() => setUserAnswer(option)} disabled={!!quizFeedback} className="sr-only" />
                                <span className="font-semibold text-slate-800">{option}</span>
                            </label>
                        );
                    })}
                </div>

                {!quizFeedback ? (
                     <button onClick={handleCheckAnswer} disabled={!userAnswer} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 font-semibold text-lg disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"> Check Answer </button>
                ) : (
                     <button onClick={generateQuizQuestion} className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 font-semibold text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"> Next Question </button>
                )}
                
                {quizFeedback && (
                  <div role="status" className={`mt-4 p-3 rounded-lg text-center font-bold text-white pop-in ${quizFeedback === 'CORRECT' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {quizFeedback === 'CORRECT' ? 'Correct! Well done.' : quizFeedback}
                  </div>
                )}
            </div>
        )}
      </div>

    </div>
  );
};

export default SolvingTrigEquations;
