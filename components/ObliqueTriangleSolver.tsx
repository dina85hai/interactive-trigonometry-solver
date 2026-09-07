import React, { useMemo, useState } from 'react';

type ObliqueMode = 'sine' | 'cosine' | 'area';

type SineValues = {
  sideA: number;
  angleA: number;
  angleB: number;
};

type CosineValues = {
  sideB: number;
  sideC: number;
  angleA: number;
};

type AreaValues = CosineValues;

type StepState = {
  title: string;
  content: React.ReactNode;
};

type DiagramValue = {
  text: string;
  kind: 'given' | 'answer' | 'unknown';
};

type Point = {
  x: number;
  y: number;
};

type DiagramLabelling = {
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
  complete: boolean;
  fields: Array<{ key: string; expected: string; className: string }>;
};

type ObliqueQuestion =
  | {
      key: string;
      title: string;
      source: string;
      mode: 'sine';
      values: SineValues;
    }
  | {
      key: string;
      title: string;
      source: string;
      mode: 'cosine';
      values: CosineValues;
    }
  | {
      key: string;
      title: string;
      source: string;
      mode: 'area';
      values: AreaValues;
    };

const modeOptions: Array<{ key: ObliqueMode; label: string; description: string }> = [
  { key: 'sine', label: 'Sine Rule', description: 'Use when two angles and one opposite side are known.' },
  { key: 'cosine', label: 'Cosine Rule', description: 'Use when two sides and the included angle are known.' },
  { key: 'area', label: 'Area Formula', description: 'Use two sides and the included angle.' },
];

const questionBank: ObliqueQuestion[] = [
  {
    key: 'old-sine-aas',
    title: 'AAS Sine Rule',
    source: 'Previous app example',
    mode: 'sine',
    values: { angleA: 40, angleB: 70, sideA: 8 },
  },
  {
    key: 'practice-sine-basic',
    title: 'Basic Sine Rule',
    source: 'Previous practice pattern',
    mode: 'sine',
    values: { angleA: 35, angleB: 80, sideA: 10 },
  },
  {
    key: 'practice-sine-decimal',
    title: 'Decimal Sine Rule',
    source: 'Previous mixed practice',
    mode: 'sine',
    values: { angleA: 52.5, angleB: 63.5, sideA: 12.5 },
  },
  {
    key: 'old-cosine-sas',
    title: 'SAS Cosine Rule',
    source: 'Previous app example',
    mode: 'cosine',
    values: { sideB: 7, sideC: 9, angleA: 50 },
  },
  {
    key: 'solver-cosine-sas',
    title: 'Step Solver Cosine Rule',
    source: 'Previous solver example',
    mode: 'cosine',
    values: { sideB: 8, sideC: 10, angleA: 60 },
  },
  {
    key: 'practice-cosine-wide',
    title: 'Wider Angle Cosine Rule',
    source: 'Previous practice pattern',
    mode: 'cosine',
    values: { sideB: 11, sideC: 6, angleA: 115 },
  },
  {
    key: 'area-standard',
    title: 'Area With Included Angle',
    source: 'Formula extension',
    mode: 'area',
    values: { sideB: 9, sideC: 12, angleA: 55 },
  },
  {
    key: 'area-wide-angle',
    title: 'Area With Obtuse Angle',
    source: 'Formula extension',
    mode: 'area',
    values: { sideB: 13, sideC: 8, angleA: 105 },
  },
];

const trianglePoints = {
  A: { x: 58, y: 244 },
  B: { x: 168, y: 58 },
  C: { x: 354, y: 220 },
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const rounded = (value: number, digits = 2) => Number.isFinite(value) ? value.toFixed(digits) : '-';
const isPositive = (value: number) => Number.isFinite(value) && value > 0;

const getShortestAngleDelta = (startAngle: number, endAngle: number) => {
  let delta = endAngle - startAngle;

  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;

  return delta;
};

const buildAngleArcPath = (vertex: Point, firstPoint: Point, secondPoint: Point, radius: number) => {
  const startAngle = Math.atan2(firstPoint.y - vertex.y, firstPoint.x - vertex.x);
  const delta = getShortestAngleDelta(startAngle, Math.atan2(secondPoint.y - vertex.y, secondPoint.x - vertex.x));
  const points = Array.from({ length: 18 }, (_, index) => {
    const angle = startAngle + delta * (index / 17);
    return {
      x: vertex.x + Math.cos(angle) * radius,
      y: vertex.y + Math.sin(angle) * radius,
    };
  });

  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
};

const Fraction = ({
  numerator,
  denominator,
}: {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
}) => (
  <span className="mx-1 inline-flex translate-y-1 flex-col items-center align-middle font-serif leading-none">
    <span className="border-b border-current px-1 pb-0.5">{numerator}</span>
    <span className="px-1 pt-0.5">{denominator}</span>
  </span>
);

const SineRuleFormula = () => (
  <span className="font-serif text-xl">
    <Fraction numerator="a" denominator="sin A" /> =
    <Fraction numerator="b" denominator="sin B" /> =
    <Fraction numerator="c" denominator="sin C" />
  </span>
);

const HalfFormula = () => <Fraction numerator="1" denominator="2" />;

const NumberInput = ({
  id,
  label,
  symbol,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  symbol: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
}) => (
  <label htmlFor={id} className="block">
    <span className="sr-only">{label}</span>
    <div className="grid grid-cols-[86px_minmax(0,1fr)_46px] items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-purple-500">
      <span className="flex h-full flex-col justify-center border-r border-slate-200 bg-slate-50 px-3">
        <span className="text-base font-extrabold text-slate-900">{symbol}</span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      </span>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-0 bg-transparent px-3 py-3 text-lg font-bold text-slate-900 outline-none"
      />
      <span className="px-3 text-right text-sm font-bold text-slate-500">{suffix}</span>
    </div>
  </label>
);

const DiagramLabel = ({
  x,
  y,
  width,
  value,
}: {
  x: number;
  y: number;
  width: number;
  value: DiagramValue;
}) => {
  const styles = {
    given: { fill: '#eff6ff', stroke: '#60a5fa', color: '#1d4ed8', dash: '' },
    answer: { fill: '#ecfdf5', stroke: '#34d399', color: '#047857', dash: '' },
    unknown: { fill: '#ffffff', stroke: '#cbd5e1', color: '#64748b', dash: '5 4' },
  }[value.kind];

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height="28" rx="7" fill={styles.fill} stroke={styles.stroke} strokeWidth="1.8" strokeDasharray={styles.dash} />
      <text x={width / 2} y="19" textAnchor="middle" fontSize="15" fontWeight="800" fill={styles.color}>
        {value.text}
      </text>
    </g>
  );
};

const TriangleDiagram = ({
  labelA,
  labelB,
  labelC,
  sideA,
  sideB,
  sideC,
  labelling,
}: {
  labelA: DiagramValue;
  labelB: DiagramValue;
  labelC: DiagramValue;
  sideA: DiagramValue;
  sideB: DiagramValue;
  sideC: DiagramValue;
  labelling?: DiagramLabelling;
}) => (
  <div className="relative">
  <svg className="w-full rounded-2xl border border-slate-200 bg-white" viewBox="0 0 420 300" role="img" aria-label="Oblique triangle diagram">
    <rect width="420" height="300" fill="#ffffff" rx="18" />
    <polygon
      points={`${trianglePoints.A.x},${trianglePoints.A.y} ${trianglePoints.B.x},${trianglePoints.B.y} ${trianglePoints.C.x},${trianglePoints.C.y}`}
      fill="#dbeafe"
      stroke="#2563eb"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path d={buildAngleArcPath(trianglePoints.A, trianglePoints.B, trianglePoints.C, 46)} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <path d={buildAngleArcPath(trianglePoints.B, trianglePoints.C, trianglePoints.A, 42)} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <path d={buildAngleArcPath(trianglePoints.C, trianglePoints.A, trianglePoints.B, 46)} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <circle cx={trianglePoints.A.x} cy={trianglePoints.A.y} r="5.5" fill="#1d4ed8" />
    <circle cx={trianglePoints.B.x} cy={trianglePoints.B.y} r="5.5" fill="#1d4ed8" />
    <circle cx={trianglePoints.C.x} cy={trianglePoints.C.y} r="5.5" fill="#1d4ed8" />
    {!labelling && <><DiagramLabel x={28} y={252} width={104} value={labelA} />
    <DiagramLabel x={114} y={22} width={116} value={labelB} />
    <DiagramLabel x={306} y={232} width={84} value={labelC} />
    <DiagramLabel x={236} y={126} width={110} value={sideA} />
    <DiagramLabel x={174} y={246} width={110} value={sideB} />
    <DiagramLabel x={38} y={132} width={110} value={sideC} />
    <g transform="translate(248 22)">
      <rect width="130" height="52" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
      <rect x="10" y="12" width="14" height="8" rx="2" fill="#eff6ff" stroke="#60a5fa" />
      <text x="30" y="20" fontSize="10" fontWeight="800" fill="#1d4ed8">Question</text>
      <rect x="10" y="31" width="14" height="8" rx="2" fill="#ecfdf5" stroke="#34d399" />
      <text x="30" y="39" fontSize="10" fontWeight="800" fill="#047857">Answer</text>
    </g></>}
  </svg>
  {labelling && (
    <div className="absolute inset-0" aria-label="Label the triangle">
      {labelling.fields.map((field) => (
        <input
          key={field.key}
          aria-label={`Label ${field.key}`}
          value={labelling.answers[field.key] ?? ''}
          onChange={(event) => labelling.onChange(field.key, event.target.value)}
          placeholder="?"
          maxLength={1}
          className={`absolute h-11 w-11 rounded-lg border-2 bg-white text-center text-lg font-extrabold outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 sm:h-10 sm:w-10 ${field.className} ${labelling.complete ? 'border-emerald-500 text-emerald-700' : 'border-purple-500 text-slate-900'}`}
        />
      ))}
    </div>
  )}
  </div>
);

const StepNavigator = ({
  steps,
  activeStep,
  onStepSelect,
}: {
  steps: StepState[];
  activeStep: number;
  onStepSelect: (step: number) => void;
}) => (
  <div className="space-y-4">
    <div className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => (
        <button
          key={step.title}
          type="button"
          onClick={() => onStepSelect(index)}
          className={`rounded-xl border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
            activeStep === index
              ? 'border-purple-300 bg-purple-100 text-purple-900 shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="block text-xs font-bold uppercase tracking-wide">Step {index + 1}</span>
          <span className="mt-1 block text-sm font-bold">{step.title}</span>
        </button>
      ))}
    </div>
    <div className="min-h-[150px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">{steps[activeStep].title}</h3>
      <div className="mt-3 text-slate-700">{steps[activeStep].content}</div>
      {activeStep < steps.length - 1 && (
        <button
          type="button"
          onClick={() => onStepSelect(activeStep + 1)}
          className="mt-5 rounded-full bg-purple-600 px-5 py-2 font-bold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          Continue
        </button>
      )}
    </div>
  </div>
);

const GuidedSineExercise = ({
  values,
  result,
}: {
  values: SineValues;
  result: { valid: boolean; angleC: number; sideB: number; sideC: number };
}) => {
  const [step, setStep] = useState(1);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [formula, setFormula] = useState('');
  const [substitution, setSubstitution] = useState<Record<string, string>>({});
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const labelFields = [
    { key: 'angleA', expected: 'a', className: 'left-[6%] top-[75%]' },
    { key: 'angleB', expected: 'b', className: 'left-[34%] top-[6%]' },
    { key: 'sideA', expected: 'a', className: 'right-[20%] top-[40%]' },
  ];
  const labelsCorrect = labelFields.every(({ key, expected }) => labels[key]?.trim().toLowerCase() === expected);
  const substitutionCorrect = [
    ['side', values.sideA], ['angleA', values.angleA], ['angleB', values.angleB],
  ].every(([key, expected]) => Math.abs(Number(substitution[key]) - Number(expected)) < 0.01);
  const answerCorrect = Math.abs(Number(answer) - result.sideB) < 0.06;
  const next = (message: string) => { setFeedback(message); setStep((current) => Math.min(4, current + 1)); };
  const inputClass = 'h-12 w-20 rounded-lg border-2 border-blue-500 bg-white px-2 text-center text-lg font-extrabold text-slate-900 outline-none focus:border-purple-600 sm:w-24';

  return (
    <section className="rounded-2xl border border-purple-200 bg-white p-4 shadow-lg sm:p-6">
      <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 font-extrabold text-white">{step}</span><h3 className="text-xl font-extrabold text-slate-900">Guided Sine Rule Example</h3></div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-extrabold sm:text-sm">
        {['Label', 'Choose rule', 'Substitute', 'Calculate'].map((name, index) => <div key={name} className={`rounded-lg px-2 py-2 ${step >= index + 1 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>{index + 1}. {name}</div>)}
      </div>

      {step === 1 && <div className="mt-5">
        <p className="font-bold text-slate-800">Label the information given: ∠A = {values.angleA}°, ∠B = {values.angleB}°, and a = {values.sideA} cm.</p>
        <div className="mx-auto mt-4 max-w-md"><TriangleDiagram labelA={{ text: '', kind: 'unknown' }} labelB={{ text: '', kind: 'unknown' }} labelC={{ text: '', kind: 'unknown' }} sideA={{ text: '', kind: 'unknown' }} sideB={{ text: '', kind: 'unknown' }} sideC={{ text: '', kind: 'unknown' }} labelling={{ answers: labels, onChange: (key, value) => { setLabels((current) => ({ ...current, [key]: value })); setFeedback(''); }, complete: labelsCorrect, fields: labelFields }} /></div>
        <button type="button" onClick={() => labelsCorrect ? next('Correct. Now choose the formula.') : setFeedback('Label vertex A, vertex B, and side a before continuing.')} className="mt-4 w-full rounded-xl bg-purple-600 px-5 py-3 font-extrabold text-white hover:bg-purple-700">Check labels</button>
      </div>}

      {step === 2 && <div className="mt-5">
        <p className="font-bold text-slate-800">Choose the formula related to this question.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {['Sine Rule', 'Cosine Rule', 'tan θ = opposite / adjacent'].map((option) => <button key={option} type="button" onClick={() => { setFormula(option); setFeedback(''); }} className={`rounded-xl border-2 p-4 text-left font-extrabold ${formula === option ? 'border-purple-500 bg-purple-50 text-purple-800' : 'border-slate-200 bg-white text-slate-700'}`}>{option}</button>)}
        </div>
        <button type="button" onClick={() => formula === 'Sine Rule' ? next('Correct. Substitute the values into the Sine Rule.') : setFeedback('Try again. Two angles and one opposite side are known.')} className="mt-4 w-full rounded-xl bg-purple-600 px-5 py-3 font-extrabold text-white hover:bg-purple-700">Check formula</button>
      </div>}

      {step === 3 && <div className="mt-5">
        <p className="font-bold text-slate-800">Include the given values in the formula.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-slate-800">
          <span>b =</span><span className="inline-flex flex-col items-center"><input aria-label="Given side a" className={inputClass} type="number" value={substitution.side ?? ''} onChange={(event) => setSubstitution((current) => ({ ...current, side: event.target.value }))} /><span className="mt-1 border-t-2 border-slate-700 px-2">sin(<input aria-label="Given angle A" className="w-12 bg-transparent text-center outline-none" type="number" value={substitution.angleA ?? ''} onChange={(event) => setSubstitution((current) => ({ ...current, angleA: event.target.value }))} />°)</span></span><span>× sin(</span><input aria-label="Given angle B" className={inputClass} type="number" value={substitution.angleB ?? ''} onChange={(event) => setSubstitution((current) => ({ ...current, angleB: event.target.value }))} /><span>°)</span>
        </div>
        <button type="button" onClick={() => substitutionCorrect ? next('Correct. Now calculate b and round to 2 decimal places.') : setFeedback('Use a = ' + values.sideA + ', ∠A = ' + values.angleA + '°, and ∠B = ' + values.angleB + '°.')} className="mt-5 w-full rounded-xl bg-purple-600 px-5 py-3 font-extrabold text-white hover:bg-purple-700">Check substitution</button>
      </div>}

      {step === 4 && <div className="mt-5 text-center">
        <p className="font-bold text-slate-800">Calculate the missing side, b.</p>
        <label className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xl font-extrabold text-slate-800">b = <input aria-label="Calculated side b" className={inputClass} type="number" step="any" value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(''); }} /><span>cm</span></label>
        <button type="button" onClick={() => setFeedback(answerCorrect ? `Excellent! b = ${rounded(result.sideB)} cm.` : 'Try again. Round your answer to 2 decimal places.')} className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 font-extrabold text-white hover:bg-emerald-700">Check calculation</button>
      </div>}
      {feedback && <p role="status" className={`mt-4 text-center font-bold ${feedback.startsWith('Correct') || feedback.startsWith('Excellent') ? 'text-emerald-700' : 'text-rose-700'}`}>{feedback}</p>}
    </section>
  );
};

const GuidedCosineOrAreaExercise = ({
  kind,
  values,
  answer,
}: {
  kind: 'cosine' | 'area';
  values: CosineValues;
  answer: number;
}) => {
  const [step, setStep] = useState(1);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [formula, setFormula] = useState('');
  const [substitution, setSubstitution] = useState<Record<string, string>>({});
  const [calculation, setCalculation] = useState('');
  const [feedback, setFeedback] = useState('');
  const isArea = kind === 'area';
  const fields = [
    { key: 'angleA', expected: 'a', className: 'left-[6%] top-[75%]' },
    { key: 'sideB', expected: 'b', className: 'left-[44%] bottom-[5%]' },
    { key: 'sideC', expected: 'c', className: 'left-[7%] top-[43%]' },
  ];
  const labelsCorrect = fields.every(({ key, expected }) => labels[key]?.trim().toLowerCase() === expected);
  const correctFormula = isArea ? 'Area Formula' : 'Cosine Rule';
  const formulaText = isArea ? 'K = ½bc sin A' : 'a² = b² + c² − 2bc cos A';
  const target = isArea ? 'K' : 'a';
  const unit = isArea ? 'cm²' : 'cm';
  const substitutionCorrect = [['sideB', values.sideB], ['sideC', values.sideC], ['angleA', values.angleA]].every(([key, expected]) => Math.abs(Number(substitution[key]) - Number(expected)) < 0.01);
  const answerCorrect = Math.abs(Number(calculation) - answer) < 0.06;
  const next = (message: string) => { setFeedback(message); setStep((current) => Math.min(4, current + 1)); };
  const inputClass = 'h-12 w-20 rounded-lg border-2 border-blue-500 bg-white px-2 text-center text-lg font-extrabold text-slate-900 outline-none focus:border-purple-600 sm:w-24';

  return <section className="rounded-2xl border border-purple-200 bg-white p-4 shadow-lg sm:p-6">
    <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 font-extrabold text-white">{step}</span><h3 className="text-xl font-extrabold text-slate-900">Guided {isArea ? 'Area Formula' : 'Cosine Rule'} Example</h3></div>
    <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-extrabold sm:text-sm">{['Label', 'Choose rule', 'Substitute', 'Calculate'].map((name, index) => <div key={name} className={`rounded-lg px-2 py-2 ${step >= index + 1 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>{index + 1}. {name}</div>)}</div>
    {step === 1 && <div className="mt-5"><p className="font-bold text-slate-800">Label the information given: ∠A = {values.angleA}°, b = {values.sideB} cm, and c = {values.sideC} cm.</p><div className="mx-auto mt-4 max-w-md"><TriangleDiagram labelA={{ text: '', kind: 'unknown' }} labelB={{ text: '', kind: 'unknown' }} labelC={{ text: '', kind: 'unknown' }} sideA={{ text: '', kind: 'unknown' }} sideB={{ text: '', kind: 'unknown' }} sideC={{ text: '', kind: 'unknown' }} labelling={{ answers: labels, onChange: (key, value) => { setLabels((current) => ({ ...current, [key]: value })); setFeedback(''); }, complete: labelsCorrect, fields }} /></div><button type="button" onClick={() => labelsCorrect ? next('Correct. Now choose the formula.') : setFeedback('Label vertex A and sides b and c before continuing.')} className="mt-4 w-full rounded-xl bg-purple-600 px-5 py-3 font-extrabold text-white">Check labels</button></div>}
    {step === 2 && <div className="mt-5"><p className="font-bold text-slate-800">Choose the formula related to this question.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{[correctFormula, isArea ? 'Sine Rule' : 'Area Formula', 'tan θ = opposite / adjacent'].map((option) => <button key={option} type="button" onClick={() => { setFormula(option); setFeedback(''); }} className={`rounded-xl border-2 p-4 text-left font-extrabold ${formula === option ? 'border-purple-500 bg-purple-50 text-purple-800' : 'border-slate-200 bg-white text-slate-700'}`}>{option}</button>)}</div><button type="button" onClick={() => formula === correctFormula ? next('Correct. Substitute the values into the formula.') : setFeedback('Try again. Use the rule for two sides and their included angle.')} className="mt-4 w-full rounded-xl bg-purple-600 px-5 py-3 font-extrabold text-white">Check formula</button></div>}
    {step === 3 && <div className="mt-5"><p className="font-bold text-slate-800">Include the given values in {formulaText}.</p><p className="mt-4 text-center font-serif text-xl font-bold text-purple-800">{formulaText}</p><div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-lg font-bold text-slate-800"><label>b = <input aria-label="Given side b" className={inputClass} type="number" value={substitution.sideB ?? ''} onChange={(event) => setSubstitution((current) => ({ ...current, sideB: event.target.value }))} /></label><label>c = <input aria-label="Given side c" className={inputClass} type="number" value={substitution.sideC ?? ''} onChange={(event) => setSubstitution((current) => ({ ...current, sideC: event.target.value }))} /></label><label>∠A = <input aria-label="Given angle A" className={inputClass} type="number" value={substitution.angleA ?? ''} onChange={(event) => setSubstitution((current) => ({ ...current, angleA: event.target.value }))} />°</label></div><button type="button" onClick={() => substitutionCorrect ? next(`Correct. Now calculate ${target} and round to 2 decimal places.`) : setFeedback(`Use b = ${values.sideB}, c = ${values.sideC}, and ∠A = ${values.angleA}°.`)} className="mt-5 w-full rounded-xl bg-purple-600 px-5 py-3 font-extrabold text-white">Check substitution</button></div>}
    {step === 4 && <div className="mt-5 text-center"><p className="font-bold text-slate-800">Calculate {target}.</p><label className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xl font-extrabold text-slate-800">{target} = <input aria-label={`Calculated ${target}`} className={inputClass} type="number" step="any" value={calculation} onChange={(event) => { setCalculation(event.target.value); setFeedback(''); }} /><span>{unit}</span></label><button type="button" onClick={() => setFeedback(answerCorrect ? `Excellent! ${target} = ${rounded(answer)} ${unit}.` : 'Try again. Round your answer to 2 decimal places.')} className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 font-extrabold text-white">Check calculation</button></div>}
    {feedback && <p role="status" className={`mt-4 text-center font-bold ${feedback.startsWith('Correct') || feedback.startsWith('Excellent') ? 'text-emerald-700' : 'text-rose-700'}`}>{feedback}</p>}
  </section>;
};

const ObliqueTriangleSolver = () => {
  const [mode, setMode] = useState<ObliqueMode>('sine');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedQuestionKey, setSelectedQuestionKey] = useState('old-sine-aas');
  const [sineValues, setSineValues] = useState<SineValues>({ sideA: 8, angleA: 40, angleB: 70 });
  const [cosineValues, setCosineValues] = useState<CosineValues>({ sideB: 8, sideC: 10, angleA: 60 });
  const [areaValues, setAreaValues] = useState<AreaValues>({ sideB: 9, sideC: 12, angleA: 55 });
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceFeedback, setPracticeFeedback] = useState('');
  const [labellingAnswers, setLabellingAnswers] = useState<Record<string, string>>({});

  const sineResult = useMemo(() => {
    const { sideA, angleA, angleB } = sineValues;
    const angleC = 180 - angleA - angleB;
    const valid = isPositive(sideA) && isPositive(angleA) && isPositive(angleB) && angleC > 0;
    const ratio = valid ? sideA / Math.sin(toRadians(angleA)) : NaN;
    return {
      valid,
      angleC,
      sideB: valid ? ratio * Math.sin(toRadians(angleB)) : NaN,
      sideC: valid ? ratio * Math.sin(toRadians(angleC)) : NaN,
    };
  }, [sineValues]);

  const cosineResult = useMemo(() => {
    const { sideB, sideC, angleA } = cosineValues;
    const valid = isPositive(sideB) && isPositive(sideC) && angleA > 0 && angleA < 180;
    const sideASquared = valid
      ? sideB ** 2 + sideC ** 2 - 2 * sideB * sideC * Math.cos(toRadians(angleA))
      : NaN;
    const sideA = sideASquared > 0 ? Math.sqrt(sideASquared) : NaN;
    return {
      valid: valid && Number.isFinite(sideA),
      sideASquared,
      sideA,
    };
  }, [cosineValues]);

  const areaResult = useMemo(() => {
    const { sideB, sideC, angleA } = areaValues;
    const valid = isPositive(sideB) && isPositive(sideC) && angleA > 0 && angleA < 180;
    return {
      valid,
      area: valid ? 0.5 * sideB * sideC * Math.sin(toRadians(angleA)) : NaN,
    };
  }, [areaValues]);

  const steps = useMemo<StepState[]>(() => {
    if (mode === 'sine') {
      const { sideA, angleA, angleB } = sineValues;
      return [
        {
          title: 'Label the Diagram',
          content: (
            <p>
              Label only the given parts in the diagram: vertices A and B, and side a. Then notice that ∠A = {angleA}°, ∠B = {angleB}°, and side a = {sideA} cm, so use the Sine Rule.
            </p>
          ),
        },
        {
          title: 'Find Third Angle',
          content: <p>∠C = 180° - {angleA}° - {angleB}° = {rounded(sineResult.angleC, 0)}°.</p>,
        },
        {
          title: 'Apply Sine Rule',
          content: <SineRuleFormula />,
        },
        {
          title: 'Answer',
          content: sineResult.valid ? (
            <p>
              b = {rounded(sineResult.sideB)} cm and c = {rounded(sineResult.sideC)} cm.
            </p>
          ) : (
            <p className="font-semibold text-red-600">Use positive values and make sure A + B is less than 180°.</p>
          ),
        },
      ];
    }

    if (mode === 'cosine') {
      const { sideB, sideC, angleA } = cosineValues;
      return [
        {
          title: 'Label the Diagram',
          content: (
            <p>
              Label only the given parts in the diagram: vertex A and sides b and c. Given b = {sideB} cm, c = {sideC} cm, and included angle ∠A = {angleA}°, this is a SAS case, so use the Cosine Rule.
            </p>
          ),
        },
        {
          title: 'Write Formula',
          content: <p className="font-serif text-xl">a² = b² + c² - 2bc cos A.</p>,
        },
        {
          title: 'Substitute',
          content: <p>a² = {sideB}² + {sideC}² - 2({sideB})({sideC}) cos {angleA}° = {rounded(cosineResult.sideASquared)}.</p>,
        },
        {
          title: 'Answer',
          content: cosineResult.valid ? (
            <p>a = √{rounded(cosineResult.sideASquared)} = {rounded(cosineResult.sideA)} cm.</p>
          ) : (
            <p className="font-semibold text-red-600">Use positive sides and an included angle between 0° and 180°.</p>
          ),
        },
      ];
    }

    const { sideB, sideC, angleA } = areaValues;
    return [
      {
        title: 'Label the Diagram',
          content: (
            <p>
              Label only the given parts in the diagram: vertex A and sides b and c. Given b = {sideB} cm, c = {sideC} cm, and included angle ∠A = {angleA}°, use the area formula.
            </p>
          ),
        },
        {
          title: 'Write Formula',
          content: <p className="font-serif text-xl">K = <HalfFormula />bc sin A.</p>,
        },
        {
          title: 'Substitute',
          content: <p>K = <HalfFormula />({sideB})({sideC}) sin {angleA}°.</p>,
        },
      {
        title: 'Answer',
        content: areaResult.valid ? (
          <p>Area = {rounded(areaResult.area)} cm².</p>
        ) : (
          <p className="font-semibold text-red-600">Use positive sides and an included angle between 0° and 180°.</p>
        ),
      },
    ];
  }, [areaResult, areaValues, cosineResult, cosineValues, mode, sineResult, sineValues]);

  const diagramLabels = {
    sine: {
      labelA: { text: `∠A = ${sineValues.angleA}°`, kind: 'given' },
      labelB: { text: `∠B = ${sineValues.angleB}°`, kind: 'given' },
      labelC: { text: `∠C = ${sineResult.valid ? rounded(sineResult.angleC, 0) : '?' }°`, kind: sineResult.valid ? 'answer' : 'unknown' },
      sideA: { text: `a = ${sineValues.sideA}`, kind: 'given' },
      sideB: { text: `b = ${sineResult.valid ? rounded(sineResult.sideB) : '?'}`, kind: sineResult.valid ? 'answer' : 'unknown' },
      sideC: { text: `c = ${sineResult.valid ? rounded(sineResult.sideC) : '?'}`, kind: sineResult.valid ? 'answer' : 'unknown' },
    },
    cosine: {
      labelA: { text: `∠A = ${cosineValues.angleA}°`, kind: 'given' },
      labelB: { text: '∠B', kind: 'unknown' },
      labelC: { text: '∠C', kind: 'unknown' },
      sideA: { text: `a = ${cosineResult.valid ? rounded(cosineResult.sideA) : '?'}`, kind: cosineResult.valid ? 'answer' : 'unknown' },
      sideB: { text: `b = ${cosineValues.sideB}`, kind: 'given' },
      sideC: { text: `c = ${cosineValues.sideC}`, kind: 'given' },
    },
    area: {
      labelA: { text: `∠A = ${areaValues.angleA}°`, kind: 'given' },
      labelB: { text: '∠B', kind: 'unknown' },
      labelC: { text: '∠C', kind: 'unknown' },
      sideA: { text: 'a', kind: 'unknown' },
      sideB: { text: `b = ${areaValues.sideB}`, kind: 'given' },
      sideC: { text: `c = ${areaValues.sideC}`, kind: 'given' },
    },
  }[mode] as Record<'labelA' | 'labelB' | 'labelC' | 'sideA' | 'sideB' | 'sideC', DiagramValue>;

  const labellingFields = mode === 'sine'
    ? [
        { key: 'angleA', expected: 'a', className: 'left-[6%] top-[75%]' },
        { key: 'angleB', expected: 'b', className: 'left-[34%] top-[6%]' },
        { key: 'sideA', expected: 'a', className: 'right-[20%] top-[40%]' },
      ]
    : [
        { key: 'angleA', expected: 'a', className: 'left-[6%] top-[75%]' },
        { key: 'sideB', expected: 'b', className: 'left-[44%] bottom-[5%]' },
        { key: 'sideC', expected: 'c', className: 'left-[7%] top-[43%]' },
      ];

  const labellingComplete = labellingFields.every(
    ({ key, expected }) => labellingAnswers[key]?.trim().toLowerCase() === expected,
  );

  const updateLabelling = (key: string, value: string) => {
    setLabellingAnswers((current) => ({ ...current, [key]: value }));
  };

  const updateMode = (nextMode: ObliqueMode) => {
    setMode(nextMode);
    setActiveStep(0);
    setSelectedQuestionKey('');
    setPracticeAnswers({});
    setPracticeFeedback('');
    setLabellingAnswers({});
  };

  const applyQuestion = (question: ObliqueQuestion) => {
    setMode(question.mode);
    setActiveStep(0);
    setSelectedQuestionKey(question.key);
    setPracticeAnswers({});
    setPracticeFeedback('');
    setLabellingAnswers({});

    if (question.mode === 'sine') {
      setSineValues(question.values);
      return;
    }

    if (question.mode === 'cosine') {
      setCosineValues(question.values);
      return;
    }

    setAreaValues(question.values);
  };

  const updateSineValues = (values: Partial<SineValues>) => {
    setSelectedQuestionKey('');
    setSineValues((current) => ({ ...current, ...values }));
    setPracticeAnswers({});
    setPracticeFeedback('');
    setLabellingAnswers({});
  };

  const updateCosineValues = (values: Partial<CosineValues>) => {
    setSelectedQuestionKey('');
    setCosineValues((current) => ({ ...current, ...values }));
    setPracticeAnswers({});
    setPracticeFeedback('');
    setLabellingAnswers({});
  };

  const updateAreaValues = (values: Partial<AreaValues>) => {
    setSelectedQuestionKey('');
    setAreaValues((current) => ({ ...current, ...values }));
    setPracticeAnswers({});
    setPracticeFeedback('');
    setLabellingAnswers({});
  };

  const questionValues = {
    sine: [`a = ${sineValues.sideA} cm`, `∠A = ${sineValues.angleA}°`, `∠B = ${sineValues.angleB}°`],
    cosine: [`b = ${cosineValues.sideB} cm`, `c = ${cosineValues.sideC} cm`, `∠A = ${cosineValues.angleA}°`],
    area: [`b = ${areaValues.sideB} cm`, `c = ${areaValues.sideC} cm`, `∠A = ${areaValues.angleA}°`],
  }[mode];

  const answerValues = {
    sine: sineResult.valid
      ? [`∠C = ${rounded(sineResult.angleC, 0)}°`, `b = ${rounded(sineResult.sideB)} cm`, `c = ${rounded(sineResult.sideC)} cm`]
      : ['Check the input values'],
    cosine: cosineResult.valid ? [`a = ${rounded(cosineResult.sideA)} cm`] : ['Check the input values'],
    area: areaResult.valid ? [`K = ${rounded(areaResult.area)} cm²`] : ['Check the input values'],
  }[mode];

  const practiceFields = mode === 'sine'
    ? [
        { key: 'angleC', label: '∠C', unit: '°', answer: sineResult.angleC },
        { key: 'sideB', label: 'b', unit: 'cm', answer: sineResult.sideB },
        { key: 'sideC', label: 'c', unit: 'cm', answer: sineResult.sideC },
      ]
    : mode === 'cosine'
      ? [{ key: 'sideA', label: 'a', unit: 'cm', answer: cosineResult.sideA }]
      : [{ key: 'area', label: 'Area', unit: 'cm²', answer: areaResult.area }];

  const practicePrompt = mode === 'sine'
    ? `Given a = ${sineValues.sideA} cm, ∠A = ${sineValues.angleA}°, and ∠B = ${sineValues.angleB}°, find the missing values.`
    : mode === 'cosine'
      ? `Given b = ${cosineValues.sideB} cm, c = ${cosineValues.sideC} cm, and included ∠A = ${cosineValues.angleA}°, find side a.`
      : `Given b = ${areaValues.sideB} cm, c = ${areaValues.sideC} cm, and included ∠A = ${areaValues.angleA}°, find the area.`;

  const checkPractice = () => {
    const valid = practiceFields.every((field) => {
      const entered = Number(practiceAnswers[field.key]);
      return Number.isFinite(entered) && Math.abs(entered - field.answer) < 0.06;
    });
    setPracticeFeedback(valid ? 'Excellent! Every value is correct.' : 'Not quite yet. Check your formula and round each answer to 2 decimal places.');
  };

  const clearPractice = () => {
    setPracticeAnswers({});
    setPracticeFeedback('');
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white bg-white/90 p-6 shadow-xl">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">Oblique Triangle Solver</h2>
        <p className="mt-2 text-center text-slate-700">
          Solve non-right triangles using Sine Rule, Cosine Rule, and the area formula.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-2xl border border-white bg-white/90 p-5 shadow-lg">
          <div>
            <label className="block text-sm font-bold text-slate-700">Select topic</label>
            <div className="mt-2 space-y-2">
              {modeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => updateMode(option.key)}
                  className={`w-full rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                    mode === option.key
                      ? 'border-purple-300 bg-purple-100 text-purple-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-extrabold">{option.label}</span>
                  <span className="mt-1 block text-sm">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-700">Question bank</p>
            <div className="mt-2 max-h-[330px] space-y-2 overflow-y-auto pr-1">
              {questionBank.map((question) => (
                <button
                  key={question.key}
                  type="button"
                  onClick={() => applyQuestion(question)}
                  className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                    selectedQuestionKey === question.key
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold">{question.title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-600">{question.mode}</span>
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-slate-500">{question.source}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'sine' && (
            <div className="space-y-4">
              <NumberInput id="sine-side-a" label="side" symbol="a" value={sineValues.sideA} suffix="cm" onChange={(sideA) => updateSineValues({ sideA })} />
              <NumberInput id="sine-angle-a" label="angle" symbol="∠A" value={sineValues.angleA} suffix="°" onChange={(angleA) => updateSineValues({ angleA })} />
              <NumberInput id="sine-angle-b" label="angle" symbol="∠B" value={sineValues.angleB} suffix="°" onChange={(angleB) => updateSineValues({ angleB })} />
            </div>
          )}

          {mode === 'cosine' && (
            <div className="space-y-4">
              <NumberInput id="cosine-side-b" label="side" symbol="b" value={cosineValues.sideB} suffix="cm" onChange={(sideB) => updateCosineValues({ sideB })} />
              <NumberInput id="cosine-side-c" label="side" symbol="c" value={cosineValues.sideC} suffix="cm" onChange={(sideC) => updateCosineValues({ sideC })} />
              <NumberInput id="cosine-angle-a" label="included" symbol="∠A" value={cosineValues.angleA} suffix="°" onChange={(angleA) => updateCosineValues({ angleA })} />
            </div>
          )}

          {mode === 'area' && (
            <div className="space-y-4">
              <NumberInput id="area-side-b" label="side" symbol="b" value={areaValues.sideB} suffix="cm" onChange={(sideB) => updateAreaValues({ sideB })} />
              <NumberInput id="area-side-c" label="side" symbol="c" value={areaValues.sideC} suffix="cm" onChange={(sideC) => updateAreaValues({ sideC })} />
              <NumberInput id="area-angle-a" label="included" symbol="∠A" value={areaValues.angleA} suffix="°" onChange={(angleA) => updateAreaValues({ angleA })} />
            </div>
          )}
        </aside>

        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {mode === 'sine' ? <GuidedSineExercise key={`${sineValues.sideA}-${sineValues.angleA}-${sineValues.angleB}`} values={sineValues} result={sineResult} /> : <GuidedCosineOrAreaExercise key={`${mode}-${mode === 'cosine' ? cosineValues.sideB : areaValues.sideB}-${mode === 'cosine' ? cosineValues.sideC : areaValues.sideC}-${mode === 'cosine' ? cosineValues.angleA : areaValues.angleA}`} kind={mode} values={mode === 'cosine' ? cosineValues : areaValues} answer={mode === 'cosine' ? cosineResult.sideA : areaResult.area} />}
            {false && <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-lg">
              <TriangleDiagram
                {...diagramLabels}
                labelling={activeStep === 0 ? { answers: labellingAnswers, onChange: updateLabelling, complete: labellingComplete, fields: labellingFields } : undefined}
              />
              {activeStep === 0 && (
                <p role="status" className={`mt-3 text-center text-sm font-bold ${labellingComplete ? 'text-emerald-700' : 'text-purple-700'}`}>
                  {labellingComplete ? 'Correct — the given parts are labelled. Continue to Step 2.' : mode === 'sine' ? 'Type A and B at the given vertices, then a on the given side.' : 'Type A at the given vertex, then b and c on the given sides.'}
                </p>
              )}
              <div className={`mt-4 grid gap-3 ${activeStep >= 3 ? 'sm:grid-cols-2' : ''}`}>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700">Question</p>
                  <ul className="mt-2 space-y-1 text-sm font-bold text-blue-900">
                    {questionValues.map((value) => <li key={value}>{value}</li>)}
                  </ul>
                </div>
                {activeStep >= 3 && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Answer</p>
                  <ul className="mt-2 space-y-1 text-sm font-bold text-emerald-900">
                    {answerValues.map((value) => <li key={value}>{value}</li>)}
                  </ul>
                </div>}
              </div>
            </div>
            }
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-slate-900">Sine Rule</h3>
              <p className="mt-2 text-slate-700"><SineRuleFormula /></p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-slate-900">Cosine Rule</h3>
              <p className="mt-2 font-serif text-lg text-slate-700">a² = b² + c² - 2bc cos A</p>
              <p className="mt-1 font-serif text-sm text-slate-600">
                cos A =
                <Fraction numerator="b² + c² - a²" denominator="2bc" />
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-slate-900">Area</h3>
              <p className="mt-2 font-serif text-lg text-slate-700">K = <HalfFormula />bc sin A</p>
              <p className="mt-1 font-serif text-sm text-slate-600">K = <HalfFormula />ab sin C = <HalfFormula />ca sin B</p>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:p-7" aria-labelledby="try-it-heading">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🎯</span>
              <h3 id="try-it-heading" className="text-2xl font-extrabold text-slate-900">Try It Yourself!</h3>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 px-5 py-6 text-center text-lg font-bold leading-relaxed text-blue-600 sm:text-xl">
              {practicePrompt}
            </div>
            <p className="mt-5 font-bold text-slate-800">Enter your answers in the boxes:</p>
            <div className="mt-4 flex flex-wrap items-end justify-center gap-3 sm:gap-5">
              {practiceFields.map((field, index) => (
                <React.Fragment key={field.key}>
                  {index > 0 && <span className="mb-4 text-xl font-bold text-blue-600" aria-hidden="true">+</span>}
                  <label className="flex items-end rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="sr-only">{field.label} answer</span>
                    <input
                      type="number"
                      step="any"
                      value={practiceAnswers[field.key] ?? ''}
                      onChange={(event) => { setPracticeAnswers((current) => ({ ...current, [field.key]: event.target.value })); setPracticeFeedback(''); }}
                      placeholder="?"
                      className="h-14 w-24 rounded-lg border-2 border-blue-500 bg-white px-2 text-center text-xl font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-600"
                    />
                    <span className="ml-2 pb-3 text-base font-extrabold text-blue-600">{field.label} {field.unit}</span>
                  </label>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={checkPractice} className="rounded-xl bg-blue-600 px-6 py-3 font-extrabold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Check answers</button>
              <button type="button" onClick={clearPractice} className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-extrabold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Clear</button>
            </div>
            {practiceFeedback && <p role="status" className={`mt-4 text-center font-bold ${practiceFeedback.startsWith('Excellent') ? 'text-emerald-700' : 'text-rose-700'}`}>{practiceFeedback}</p>}
          </section>
        </div>
      </div>
    </section>
  );
};

export default ObliqueTriangleSolver;
