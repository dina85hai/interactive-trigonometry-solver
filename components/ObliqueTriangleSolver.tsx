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
}: {
  labelA: DiagramValue;
  labelB: DiagramValue;
  labelC: DiagramValue;
  sideA: DiagramValue;
  sideB: DiagramValue;
  sideC: DiagramValue;
}) => (
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
    <DiagramLabel x={28} y={252} width={104} value={labelA} />
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
    </g>
  </svg>
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

const ObliqueTriangleSolver = () => {
  const [mode, setMode] = useState<ObliqueMode>('sine');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedQuestionKey, setSelectedQuestionKey] = useState('old-sine-aas');
  const [sineValues, setSineValues] = useState<SineValues>({ sideA: 8, angleA: 40, angleB: 70 });
  const [cosineValues, setCosineValues] = useState<CosineValues>({ sideB: 8, sideC: 10, angleA: 60 });
  const [areaValues, setAreaValues] = useState<AreaValues>({ sideB: 9, sideC: 12, angleA: 55 });

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
          title: 'Identify Given Values',
          content: (
            <p>
              Given ∠A = {angleA}°, ∠B = {angleB}°, and side a = {sideA} cm. Since two angles and one opposite side are known, use the Sine Rule.
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
          title: 'Identify Given Values',
          content: (
            <p>
              Given b = {sideB} cm, c = {sideC} cm, and included angle ∠A = {angleA}°. This is a SAS case, so use the Cosine Rule.
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
          title: 'Identify Given Values',
          content: (
            <p>
              Given b = {sideB} cm, c = {sideC} cm, and included angle ∠A = {angleA}°. Use the area formula for two sides and included angle.
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

  const updateMode = (nextMode: ObliqueMode) => {
    setMode(nextMode);
    setActiveStep(0);
    setSelectedQuestionKey('');
  };

  const applyQuestion = (question: ObliqueQuestion) => {
    setMode(question.mode);
    setActiveStep(0);
    setSelectedQuestionKey(question.key);

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
  };

  const updateCosineValues = (values: Partial<CosineValues>) => {
    setSelectedQuestionKey('');
    setCosineValues((current) => ({ ...current, ...values }));
  };

  const updateAreaValues = (values: Partial<AreaValues>) => {
    setSelectedQuestionKey('');
    setAreaValues((current) => ({ ...current, ...values }));
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
            <StepNavigator steps={steps} activeStep={activeStep} onStepSelect={setActiveStep} />
            <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-lg">
              <TriangleDiagram {...diagramLabels} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700">Question</p>
                  <ul className="mt-2 space-y-1 text-sm font-bold text-blue-900">
                    {questionValues.map((value) => <li key={value}>{value}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Answer</p>
                  <ul className="mt-2 space-y-1 text-sm font-bold text-emerald-900">
                    {answerValues.map((value) => <li key={value}>{value}</li>)}
                  </ul>
                </div>
              </div>
            </div>
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
        </div>
      </div>
    </section>
  );
};

export default ObliqueTriangleSolver;
