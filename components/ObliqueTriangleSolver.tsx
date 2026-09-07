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

type ExerciseStatus = 'unanswered' | 'correct' | 'incorrect';

type DiagramValue = {
  text: string;
  kind: 'given' | 'answer' | 'unknown';
};

type PracticeLevel = 'easy' | 'medium' | 'hard';

type HintLevel = 0 | 1 | 2 | 3;

type DetailedQuestion = {
  id: string;
  title: string;
  description: string;
  context: string; // Real-world scenario
  difficulty: PracticeLevel;
  mode: ObliqueMode;
  problemStatement: string; // Full problem text
  givenValues: Record<string, string>; // e.g., { 'angleA': '40°', 'sideA': '8 cm' }
  findWhat: string; // What to solve for
  hints: string[];
  solution: string; // Full worked solution
  answer: number;
  answerFormat: string; // e.g., 'cm', '°', 'cm²'
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

const detailedQuestionBank: DetailedQuestion[] = [
  // EASY SINE RULE QUESTIONS
  {
    id: 'sine-easy-1',
    title: 'Navigation at Sea - Finding Distance',
    description: 'A ship navigation problem using the Sine Rule',
    context: 'A coast guard station observes a ship using two observation points. They need to find the distance to the ship using angles and a known baseline.',
    difficulty: 'easy',
    mode: 'sine',
    problemStatement: 'Two observation points A and B are 8 km apart on the coast. An observer at point A measures the angle to a ship at C as 40°. An observer at point B measures the angle at B as 70°. Find the distance from point A to the ship (side b).',
    givenValues: { 'Side a (AB)': '8 km', 'Angle A': '40°', 'Angle B': '70°' },
    findWhat: 'Distance b (from A to ship)',
    hints: [
      'This is an AAS (Angle-Angle-Side) case. The Sine Rule can find the unknown side.',
      'First find angle C: 180° - 40° - 70° = 70°. Then use the Sine Rule: a/sin(A) = b/sin(B).',
      'Step 1: Calculate ∠C = 180° - 40° - 70° = 70°. Step 2: Use Sine Rule: 8/sin(40°) = b/sin(70°). Step 3: b = (8 × sin(70°))/sin(40°) ≈ 12.2 km'
    ],
    solution: 'Given: ∠A = 40°, ∠B = 70°, side a = 8 km\n\nStep 1: Find ∠C\n∠C = 180° - 40° - 70° = 70°\n\nStep 2: Apply Sine Rule\na/sin(A) = b/sin(B)\n8/sin(40°) = b/sin(70°)\n\nStep 3: Solve for b\nb = (8 × sin(70°))/sin(40°)\nb = (8 × 0.9397)/0.6428\nb = 7.5176/0.6428\nb ≈ 11.68 km',
    answer: 11.68,
    answerFormat: 'km'
  },
  {
    id: 'sine-easy-2',
    title: 'Surveying Land - Finding Width of River',
    description: 'A surveyor using angles to find the width of a river',
    context: 'A land surveyor needs to find the width of a river without crossing it, using angle measurements from known points.',
    difficulty: 'easy',
    mode: 'sine',
    problemStatement: 'A surveyor stands at point A on one bank of a river and places a pole at point B, 50 meters away along the bank. From point A, the angle to a tree on the opposite bank (point C) is 55°. From point B, the angle to the tree is 65°. Find the distance from A to the tree (side b).',
    givenValues: { 'Side a (AB)': '50 m', 'Angle at A': '55°', 'Angle at B': '65°' },
    findWhat: 'Distance b (from A to tree)',
    hints: [
      'This involves an AAS case. Find the third angle first, then use Sine Rule.',
      'Angle C = 180° - 55° - 65° = 60°. Use Sine Rule: 50/sin(60°) = b/sin(65°).',
      'Step-by-step: ∠C = 60°, then b = (50 × sin(65°))/sin(60°) ≈ 52.7 m'
    ],
    solution: 'Given: ∠A = 55°, ∠B = 65°, side a = 50 m\n\nStep 1: Find ∠C\n∠C = 180° - 55° - 65° = 60°\n\nStep 2: Apply Sine Rule\na/sin(A) = b/sin(B)\n50/sin(60°) = b/sin(65°)\n\nStep 3: Solve for b\nb = (50 × sin(65°))/sin(60°)\nb = (50 × 0.9063)/0.8660\nb = 45.315/0.8660\nb ≈ 52.3 m',
    answer: 52.3,
    answerFormat: 'm'
  },

  // MEDIUM SINE RULE QUESTIONS
  {
    id: 'sine-medium-1',
    title: 'Aviation - Finding Distance Between Cities',
    description: 'An aircraft navigation problem using the Sine Rule',
    context: 'An aircraft needs to find the distance between two cities using known angles and a reference distance.',
    difficulty: 'medium',
    mode: 'sine',
    problemStatement: 'An aircraft at point C is flying between two cities at points A and B that are 250 km apart. The aircraft measures the angle at C to be 52°. From city A, the angle CAB is 38°. Find the distance from city B to the aircraft (side b).',
    givenValues: { 'Distance AB': '250 km', 'Angle at C': '52°', 'Angle at A': '38°' },
    findWhat: 'Distance b (from B to aircraft)',
    hints: [
      'Find angle B first using angle sum property. Then use Sine Rule.',
      'Angle B = 180° - 38° - 52° = 90°. This is a right triangle! Use Sine Rule: 250/sin(52°) = b/sin(38°).',
      'b = (250 × sin(38°))/sin(52°) = (250 × 0.6157)/0.7880 ≈ 195.1 km'
    ],
    solution: 'Given: ∠A = 38°, ∠C = 52°, side a = 250 km\n\nStep 1: Find ∠B\n∠B = 180° - 38° - 52° = 90° (Right angle!)\n\nStep 2: Apply Sine Rule\na/sin(A) = b/sin(B)\n250/sin(52°) = b/sin(38°)\n\nWait, correcting formula:\n250/sin(52°) = b/sin(38°)\n\nStep 3: Solve for b\nb = (250 × sin(38°))/sin(52°)\nb = (250 × 0.6157)/0.7880\nb = 153.925/0.7880\nb ≈ 195.3 km',
    answer: 195.3,
    answerFormat: 'km'
  },

  // EASY COSINE RULE QUESTIONS
  {
    id: 'cosine-easy-1',
    title: 'Building Triangular Garden - Finding Path Length',
    description: 'A gardener designing a triangular garden plot',
    context: 'A gardener has two garden beds of known length with a known angle between them, and needs to find the length of the path connecting their ends.',
    difficulty: 'easy',
    mode: 'cosine',
    problemStatement: 'A gardener designs a triangular garden with two sides measuring 8 meters and 12 meters, with an included angle of 60°. Find the length of the path connecting the two ends (side a).',
    givenValues: { 'Side b': '8 m', 'Side c': '12 m', 'Angle A (included)': '60°' },
    findWhat: 'Side a (path length)',
    hints: [
      'This is an SAS (Side-Angle-Side) case, perfect for the Cosine Rule.',
      'Use the Cosine Rule: a² = b² + c² - 2bc·cos(A) = 64 + 144 - 2(8)(12)cos(60°).',
      'a² = 208 - 192(0.5) = 208 - 96 = 112, so a = √112 ≈ 10.6 m'
    ],
    solution: 'Given: b = 8 m, c = 12 m, ∠A = 60°\n\nApply Cosine Rule:\na² = b² + c² - 2bc·cos(A)\na² = 8² + 12² - 2(8)(12)·cos(60°)\na² = 64 + 144 - 192(0.5)\na² = 208 - 96\na² = 112\na = √112\na ≈ 10.58 m',
    answer: 10.58,
    answerFormat: 'm'
  },
  {
    id: 'cosine-easy-2',
    title: 'Bridge Construction - Finding Support Length',
    description: 'Finding the length of a support beam in a triangular bridge structure',
    context: 'An engineer needs to calculate the length of a diagonal support beam in a triangular framework.',
    difficulty: 'easy',
    mode: 'cosine',
    problemStatement: 'In a triangular bridge support structure, two beams of length 7 meters and 9 meters meet at an angle of 50°. Find the length of the third beam that completes the triangle (side a).',
    givenValues: { 'Beam 1 (b)': '7 m', 'Beam 2 (c)': '9 m', 'Included angle (A)': '50°' },
    findWhat: 'Beam 3 (side a)',
    hints: [
      'Use the Cosine Rule for this SAS case: a² = 7² + 9² - 2(7)(9)cos(50°).',
      'Calculate: a² = 49 + 81 - 126(0.6428) = 130 - 80.99 ≈ 49.',
      'a = √49.01 ≈ 7.0 m'
    ],
    solution: 'Given: b = 7 m, c = 9 m, ∠A = 50°\n\nApply Cosine Rule:\na² = b² + c² - 2bc·cos(A)\na² = 7² + 9² - 2(7)(9)·cos(50°)\na² = 49 + 81 - 126(0.6428)\na² = 130 - 80.99\na² ≈ 49.01\na ≈ 7.00 m',
    answer: 7.00,
    answerFormat: 'm'
  },

  // MEDIUM COSINE RULE QUESTIONS
  {
    id: 'cosine-medium-1',
    title: 'Surveying Mountain Triangle - Finding Distance',
    description: 'A surveyor measuring distances in a mountainous region',
    context: 'A surveying team needs to find a third distance in a triangular survey area.',
    difficulty: 'medium',
    mode: 'cosine',
    problemStatement: 'A surveying team measures two distances on either side of a mountain ridge: 450 meters and 600 meters, with an angle of 85° between them. Find the direct distance across the ridge (side a).',
    givenValues: { 'Side b': '450 m', 'Side c': '600 m', 'Angle A (at ridge)': '85°' },
    findWhat: 'Direct distance a',
    hints: [
      'This is a challenging SAS case with a large angle. Use Cosine Rule carefully.',
      'a² = 450² + 600² - 2(450)(600)cos(85°). Note: cos(85°) ≈ 0.0872.',
      'a² = 202500 + 360000 - 540000(0.0872) ≈ 515688, so a ≈ 718.1 m'
    ],
    solution: 'Given: b = 450 m, c = 600 m, ∠A = 85°\n\nApply Cosine Rule:\na² = b² + c² - 2bc·cos(A)\na² = 450² + 600² - 2(450)(600)·cos(85°)\na² = 202500 + 360000 - 540000(0.0872)\na² = 562500 - 47088\na² = 515412\na = √515412\na ≈ 717.9 m',
    answer: 717.9,
    answerFormat: 'm'
  },

  // EASY AREA QUESTIONS
  {
    id: 'area-easy-1',
    title: 'Painting a Triangular Wall - Finding Area',
    description: 'Finding the area of a triangular wall section for painting',
    context: 'A painter needs to know the area of a triangular wall to estimate paint needed.',
    difficulty: 'easy',
    mode: 'area',
    problemStatement: 'A triangular wall section has two sides measuring 6 meters and 8 meters, with an included angle of 75°. Find the area of the wall that needs to be painted.',
    givenValues: { 'Side b': '6 m', 'Side c': '8 m', 'Included angle A': '75°' },
    findWhat: 'Area K',
    hints: [
      'Use the area formula: K = ½ × b × c × sin(A).',
      'K = ½ × 6 × 8 × sin(75°) = 24 × sin(75°).',
      'Since sin(75°) ≈ 0.9659, K ≈ 24 × 0.9659 ≈ 23.2 m²'
    ],
    solution: 'Given: b = 6 m, c = 8 m, ∠A = 75°\n\nApply Area Formula:\nK = ½ × b × c × sin(A)\nK = ½ × 6 × 8 × sin(75°)\nK = 24 × sin(75°)\nK = 24 × 0.9659\nK ≈ 23.18 m²',
    answer: 23.18,
    answerFormat: 'm²'
  },
  {
    id: 'area-easy-2',
    title: 'Tile Design - Finding Triangular Section Area',
    description: 'Calculating area for a decorative triangular tile',
    context: 'A tile designer needs to find the area of a triangular decorative tile.',
    difficulty: 'easy',
    mode: 'area',
    problemStatement: 'A decorative tile is triangular with sides of 5 cm and 7 cm forming a 45° angle between them. Calculate the area of the tile.',
    givenValues: { 'Side b': '5 cm', 'Side c': '7 cm', 'Included angle A': '45°' },
    findWhat: 'Area K',
    hints: [
      'Use K = ½bc·sin(A) with the included angle.',
      'K = ½ × 5 × 7 × sin(45°) = 17.5 × sin(45°).',
      'sin(45°) = √2/2 ≈ 0.7071, so K ≈ 12.4 cm²'
    ],
    solution: 'Given: b = 5 cm, c = 7 cm, ∠A = 45°\n\nApply Area Formula:\nK = ½ × b × c × sin(A)\nK = ½ × 5 × 7 × sin(45°)\nK = 17.5 × (√2/2)\nK = 17.5 × 0.7071\nK ≈ 12.37 cm²',
    answer: 12.37,
    answerFormat: 'cm²'
  },

  // MEDIUM AREA QUESTIONS
  {
    id: 'area-medium-1',
    title: 'Landscape Design - Finding Plot Area',
    description: 'Calculating area of a triangular land plot for landscaping',
    context: 'A landscape architect needs to find the area of a triangular plot.',
    difficulty: 'medium',
    mode: 'area',
    problemStatement: 'A triangular plot of land has two sides of 85 meters and 120 meters, with an included angle of 68°. What is the total area that can be landscaped?',
    givenValues: { 'Side b': '85 m', 'Side c': '120 m', 'Included angle A': '68°' },
    findWhat: 'Area K',
    hints: [
      'Use the area formula: K = ½bc·sin(A).',
      'K = ½ × 85 × 120 × sin(68°) = 5100 × sin(68°).',
      'sin(68°) ≈ 0.9272, so K ≈ 4728.7 m²'
    ],
    solution: 'Given: b = 85 m, c = 120 m, ∠A = 68°\n\nApply Area Formula:\nK = ½ × b × c × sin(A)\nK = ½ × 85 × 120 × sin(68°)\nK = 5100 × sin(68°)\nK = 5100 × 0.9272\nK ≈ 4728.72 m²',
    answer: 4728.72,
    answerFormat: 'm²'
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

const ExerciseProgress = ({
  currentStep,
  onStepSelect,
}: {
  currentStep: number;
  onStepSelect: (step: number) => void;
}) => {
  const stepNames = ['Given', 'Plan', 'Formula', 'Calculate', 'Answer'];

  return (
    <div className="flex items-start justify-center" aria-label={`Step ${currentStep} of ${stepNames.length}`}>
      {stepNames.map((name, index) => {
        const step = index + 1;
        const completed = step < currentStep;
        const active = step === currentStep;

        return (
          <React.Fragment key={name}>
            <button
              type="button"
              onClick={() => onStepSelect(step)}
              className="flex w-16 flex-col items-center rounded-lg p-1 text-center transition hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 sm:w-20"
              aria-current={active ? 'step' : undefined}
              aria-label={`Open step ${step}: ${name}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                completed ? 'bg-emerald-500 text-white' : active ? 'bg-purple-600 text-white ring-2 ring-purple-300' : 'bg-slate-300 text-slate-600'
              }`}>
                {completed ? '✓' : step}
              </span>
              <span className={`mt-1 text-[11px] leading-tight ${active ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{name}</span>
            </button>
            {step < stepNames.length && (
              <span className={`mt-4 h-1 flex-1 rounded ${completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Section 3: Formula Display Component
const FormulaDisplay = ({
  mode,
}: {
  mode: ObliqueMode;
}) => {
  const colorClasses = {
    input: 'border-l-4 border-blue-500 bg-blue-50',
    operation: 'border-l-4 border-orange-500 bg-orange-50',
    output: 'border-l-4 border-green-500 bg-green-50',
    condition: 'border-l-4 border-red-500 bg-red-50',
  };

  if (mode === 'sine') {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">Sine Rule Formula</h3>
        <div className={`rounded-lg p-4 ${colorClasses.input}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Input Values</p>
          <p className="mt-1 text-sm text-blue-900">Two angles (∠A, ∠B) and one opposite side (a)</p>
        </div>
        <div className={`rounded-lg p-4 ${colorClasses.operation}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Formula</p>
          <p className="mt-2 font-serif text-lg text-orange-900"><SineRuleFormula /></p>
        </div>
        <div className={`rounded-lg p-4 ${colorClasses.output}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-green-700">Output</p>
          <p className="mt-1 text-sm text-green-900">Find sides b and c, or angle C</p>
        </div>
      </div>
    );
  }

  if (mode === 'cosine') {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">Cosine Rule Formula</h3>
        <div className={`rounded-lg p-4 ${colorClasses.input}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Input Values</p>
          <p className="mt-1 text-sm text-blue-900">Two sides (b, c) and included angle (∠A)</p>
        </div>
        <div className={`rounded-lg p-4 ${colorClasses.operation}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Formula (Find side a)</p>
          <p className="mt-2 font-serif text-lg text-orange-900">a² = b² + c² - 2bc cos A</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-orange-700">Find angles</p>
          <p className="mt-1 font-serif text-sm text-orange-900">cos A = <Fraction numerator="b² + c² - a²" denominator="2bc" /></p>
        </div>
        <div className={`rounded-lg p-4 ${colorClasses.output}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-green-700">Output</p>
          <p className="mt-1 text-sm text-green-900">Find side a or angles B and C</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-extrabold text-slate-900">Area Formula</h3>
      <div className={`rounded-lg p-4 ${colorClasses.input}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Input Values</p>
        <p className="mt-1 text-sm text-blue-900">Two sides (b, c) and included angle (∠A)</p>
      </div>
      <div className={`rounded-lg p-4 ${colorClasses.operation}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Formula</p>
        <p className="mt-2 font-serif text-lg text-orange-900">K = <HalfFormula />bc sin A</p>
        <p className="mt-3 font-serif text-sm text-orange-900">K = <HalfFormula />ab sin C = <HalfFormula />ca sin B</p>
      </div>
      <div className={`rounded-lg p-4 ${colorClasses.output}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-green-700">Output</p>
        <p className="mt-1 text-sm text-green-900">Calculate triangle area in square units</p>
      </div>
    </div>
  );
};

// Section 4: Hint System Component
const HintSystem = ({
  mode,
  hintLevel,
  onShowHint,
  attempts,
}: {
  mode: ObliqueMode;
  hintLevel: HintLevel;
  onShowHint: (level: HintLevel) => void;
  attempts: number;
}) => {
  const getHints = (m: ObliqueMode) => {
    if (m === 'sine') {
      return {
        1: 'Think about which rule applies when you know two angles and one side.',
        2: 'The Sine Rule states: a/sin(A) = b/sin(B) = c/sin(C). Can you identify these values?',
        3: 'Step 1: Find angle C using 180° - A - B. Step 2: Use Sine Rule with the ratio a/sin(A) to find b and c.',
      };
    }
    if (m === 'cosine') {
      return {
        1: 'Think about which rule applies when you know two sides and the included angle.',
        2: 'The Cosine Rule states: a² = b² + c² - 2bc cos(A). What is the relationship between these variables?',
        3: 'Step 1: Substitute your values into a² = b² + c² - 2bc cos(A). Step 2: Calculate step by step. Step 3: Take the square root to find a.',
      };
    }
    return {
      1: 'Area of a triangle uses two sides and the included angle.',
      2: 'The Area Formula is K = ½bc sin(A). How can you substitute your values?',
      3: 'Step 1: Multiply ½ × b × c × sin(A). Step 2: Calculate sin(A) using your angle. Step 3: Multiply all values together.',
    };
  };

  const hints = getHints(mode);
  const showAnswer = attempts >= 3;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-slate-900">💡 Hint System</h3>
        <span className="text-sm font-bold text-slate-600">Attempts: {attempts}/3</span>
      </div>
      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onShowHint(level as HintLevel)}
            disabled={hintLevel < level}
            className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
              hintLevel >= level
                ? 'border-purple-300 bg-purple-100 text-purple-900'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            } disabled:cursor-not-allowed`}
          >
            <span className="text-xs uppercase tracking-wide">Level {level} Hint:</span>
            <p className="mt-1">{hints[level as keyof typeof hints]}</p>
          </button>
        ))}
        {showAnswer && (
          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">Show Answer</p>
            <p className="mt-1 text-sm text-red-900">After 3 attempts, check the Step 2 calculation to see the complete solution.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Section 5: Worked Examples Component
const WorkedExamples = ({
  mode,
}: {
  mode: ObliqueMode;
}) => {
  const examples: Record<ObliqueMode, Array<{ title: string; visual: string; symbolic: string }>> = {
    sine: [
      {
        title: 'Example 1: AAS Case',
        visual: '∠A = 40°, ∠B = 70°, a = 8 cm',
        symbolic: '∠C = 180° - 40° - 70° = 70°\nb = (8 × sin 70°) / sin 40° ≈ 12.2 cm\nc = (8 × sin 70°) / sin 40° ≈ 12.2 cm',
      },
      {
        title: 'Example 2: Different Angles',
        visual: '∠A = 35°, ∠B = 80°, a = 10 cm',
        symbolic: '∠C = 180° - 35° - 80° = 65°\nb = (10 × sin 80°) / sin 35° ≈ 17.3 cm\nc = (10 × sin 65°) / sin 35° ≈ 15.8 cm',
      },
    ],
    cosine: [
      {
        title: 'Example 1: SAS Case',
        visual: 'b = 7 cm, c = 9 cm, ∠A = 50°',
        symbolic: 'a² = 7² + 9² - 2(7)(9)cos(50°)\na² = 49 + 81 - 126(0.643)\na² ≈ 50.0\na ≈ 7.07 cm',
      },
      {
        title: 'Example 2: Larger Angle',
        visual: 'b = 8 cm, c = 10 cm, ∠A = 60°',
        symbolic: 'a² = 8² + 10² - 2(8)(10)cos(60°)\na² = 64 + 100 - 160(0.5)\na² = 84\na ≈ 9.17 cm',
      },
    ],
    area: [
      {
        title: 'Example 1: Basic Area',
        visual: 'b = 9 cm, c = 12 cm, ∠A = 55°',
        symbolic: 'K = ½ × 9 × 12 × sin(55°)\nK = ½ × 9 × 12 × 0.819\nK ≈ 44.2 cm²',
      },
      {
        title: 'Example 2: Right Angle',
        visual: 'b = 6 cm, c = 8 cm, ∠A = 90°',
        symbolic: 'K = ½ × 6 × 8 × sin(90°)\nK = ½ × 6 × 8 × 1\nK = 24 cm²',
      },
    ],
  };

  const modeExamples = examples[mode];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-extrabold text-slate-900">📚 Worked Examples</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {modeExamples.map((example, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-bold text-slate-900">{example.title}</h4>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Visual</p>
                <p className="mt-1 text-sm font-mono text-blue-900">{example.visual}</p>
              </div>
              <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-green-700">Solution</p>
                <p className="mt-1 text-sm font-mono text-green-900 whitespace-pre-wrap">{example.symbolic}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Section 6: Practice Area Component with Detailed Questions
const PracticeArea = ({
  mode,
  level,
  onLevelChange,
  onGenerateProblem,
  scoreCount,
  totalCount,
}: {
  mode: ObliqueMode;
  level: PracticeLevel;
  onLevelChange: (level: PracticeLevel) => void;
  onGenerateProblem: () => void;
  scoreCount: number;
  totalCount: number;
}) => {
  const filteredQuestions = detailedQuestionBank.filter((q) => q.mode === mode && q.difficulty === level);
  const currentQuestion = filteredQuestions.length > 0 ? filteredQuestions[0] : null;

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">🎯 Practice Area</h3>
        <p className="mt-4 text-slate-600">No questions available for this level yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-slate-900">🎯 Practice Area</h3>
        <span className="text-lg font-bold text-purple-600">{scoreCount}/{totalCount} Correct</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['easy', 'medium', 'hard'] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => onLevelChange(lvl)}
            className={`flex-1 min-w-[130px] rounded-lg border px-4 py-3 font-bold transition ${
              level === lvl
                ? 'border-purple-500 bg-purple-100 text-purple-900'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="block text-xs uppercase tracking-wide">
              {lvl === 'easy' ? 'Asas (Easy)' : lvl === 'medium' ? 'Sederhana (Medium)' : 'Mencabar (Hard)'}
            </span>
          </button>
        ))}
      </div>

      {/* Question Title and Context */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Context</p>
        <p className="mt-1 text-sm text-blue-900">{currentQuestion.context}</p>
        <p className="mt-2 text-xs font-bold text-blue-600">{currentQuestion.title}</p>
      </div>

      {/* Problem Statement */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Problem Statement</p>
        <p className="mt-2 text-sm font-serif text-slate-900 leading-relaxed">{currentQuestion.problemStatement}</p>
      </div>

      {/* Given Values */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Given Information</p>
        <ul className="mt-2 space-y-1">
          {Object.entries(currentQuestion.givenValues).map(([key, value]) => (
            <li key={key} className="text-sm text-indigo-900 font-medium">
              <span className="font-bold">{key}:</span> {value}
            </li>
          ))}
        </ul>
      </div>

      {/* Find What */}
      <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
        <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Find</p>
        <p className="mt-1 text-sm text-green-900 font-serif">{currentQuestion.findWhat}</p>
      </div>

      {/* Progressive Hints */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">💡 Hints</p>
        {currentQuestion.hints.map((hint, idx) => (
          <div key={idx} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-700 uppercase">Level {idx + 1}:</p>
            <p className="mt-1 text-sm text-amber-900">{hint}</p>
          </div>
        ))}
      </div>

      {/* Full Solution */}
      <details className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <summary className="cursor-pointer text-sm font-bold text-purple-700 uppercase tracking-wide">
          ✨ Show Full Solution
        </summary>
        <div className="mt-3 rounded-lg bg-white p-3 border border-purple-200">
          <p className="text-sm text-slate-900 font-mono whitespace-pre-wrap">{currentQuestion.solution}</p>
          <p className="mt-3 text-sm font-bold text-green-700 border-t border-purple-200 pt-3">
            Answer: <span className="text-lg text-green-900">{currentQuestion.answer} {currentQuestion.answerFormat}</span>
          </p>
        </div>
      </details>

      {/* Input Area */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">Your Answer</p>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Enter your answer"
            className="flex-1 rounded-lg border border-orange-300 px-3 py-2 text-sm font-mono outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <span className="rounded-lg bg-white border border-orange-300 px-3 py-2 text-sm font-bold text-orange-900">
            {currentQuestion.answerFormat}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onGenerateProblem}
          className="flex-1 rounded-lg bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 transition"
        >
          ✨ Next Problem
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 transition"
        >
          ✓ Check Answer
        </button>
      </div>
    </div>
  );
};

const ObliqueTriangleSolver = () => {
  const [mode, setMode] = useState<ObliqueMode>('sine');
  const [activeStep, setActiveStep] = useState(0);
  const [sineValues, setSineValues] = useState<SineValues>({ sideA: 8, angleA: 40, angleB: 70 });
  const [cosineValues, setCosineValues] = useState<CosineValues>({ sideB: 8, sideC: 10, angleA: 60 });
  const [areaValues, setAreaValues] = useState<AreaValues>({ sideB: 9, sideC: 12, angleA: 55 });
  const [exerciseStep, setExerciseStep] = useState(0);
  const [exerciseInputs, setExerciseInputs] = useState<Record<string, string>>({});
  const [exerciseRule, setExerciseRule] = useState('');
  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus>('unanswered');
  const [exerciseFeedback, setExerciseFeedback] = useState('');
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);
  const [hintAttempts, setHintAttempts] = useState(0);
  const [practiceLevel, setPracticeLevel] = useState<PracticeLevel>('easy');
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceTotalAttempts, setPracticeTotalAttempts] = useState(0);
  const [activeTab, setActiveTab] = useState<'solver' | 'practice'>('solver');

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
    const angleB = valid && sideA > 0
      ? (Math.acos(Math.max(-1, Math.min(1, (sideA ** 2 + sideC ** 2 - sideB ** 2) / (2 * sideA * sideC)))) * 180) / Math.PI
      : NaN;
    return {
      valid: valid && Number.isFinite(sideA),
      sideASquared,
      sideA,
      angleB,
      angleC: valid && Number.isFinite(angleB) ? 180 - angleA - angleB : NaN,
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
    resetExercise();
  };

  const resetExercise = () => {
    setExerciseStep(0);
    setExerciseInputs({});
    setExerciseRule('');
    setExerciseStatus('unanswered');
    setExerciseFeedback('');
  };

  const updateSineValues = (values: Partial<SineValues>) => {
    setSineValues((current) => ({ ...current, ...values }));
    resetExercise();
  };

  const updateCosineValues = (values: Partial<CosineValues>) => {
    setCosineValues((current) => ({ ...current, ...values }));
    resetExercise();
  };

  const updateAreaValues = (values: Partial<AreaValues>) => {
    setAreaValues((current) => ({ ...current, ...values }));
    resetExercise();
  };

  const exerciseValue = (key: string) => Number(exerciseInputs[key]);
  const isClose = (value: number, expected: number) => Number.isFinite(value) && Math.abs(value - expected) <= 0.1;
  const exerciseRuleLabel = mode === 'sine' ? 'Sine Rule' : mode === 'cosine' ? 'Cosine Rule' : 'Area Formula';

  const checkExerciseStep = () => {
    let correct = false;
    let feedback = '';

    if (exerciseStep === 2) {
      correct = true;
      feedback = `Now choose the ${exerciseRuleLabel} in Step 3.`;
    } else if (exerciseStep === 3) {
      correct = exerciseRule === exerciseRuleLabel;
      feedback = correct ? 'Correct formula selected. Now calculate the unknown value.' : `Select the ${exerciseRuleLabel} before continuing.`;
    } else if (exerciseStep === 4) {
      if (mode === 'sine') {
        correct = isClose(exerciseValue('sideB'), sineResult.sideB);
        feedback = correct ? 'Excellent! You calculated the requested side b correctly.' : 'Check the Sine Rule substitution and round to 2 decimal places.';
      } else if (mode === 'cosine') {
        correct = isClose(exerciseValue('sideA'), cosineResult.sideA);
        feedback = correct ? 'Excellent! You calculated the requested side a correctly.' : 'Check the Cosine Rule substitution and round to 2 decimal places.';
      } else {
        correct = isClose(exerciseValue('area'), areaResult.area);
        feedback = correct ? 'Excellent! You calculated the area K correctly.' : 'Check the area formula and round to 2 decimal places.';
      }
    } else if (exerciseStep === 5) {
      correct = true;
      feedback = '🎉 Great work! You completed the oblique-triangle exercise.';
    }

    setExerciseStatus(correct ? 'correct' : 'incorrect');
    setExerciseFeedback(feedback);
    if (correct && exerciseStep < 5) {
      window.setTimeout(() => {
        setExerciseStep((current) => current + 1);
        setExerciseStatus('unanswered');
        setExerciseFeedback('');
      }, 350);
    }
  };

  const startExercise = () => {
    resetExercise();
    setExerciseStep(1);
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
    cosine: cosineResult.valid
      ? [`A = ${cosineValues.angleA}°`, `a = ${rounded(cosineResult.sideA)} cm`, `B = ${rounded(cosineResult.angleB, 0)}°`, `b = ${cosineValues.sideB} cm`, `C = ${rounded(cosineResult.angleC, 0)}°`, `c = ${cosineValues.sideC} cm`]
      : ['Check the input values'],
    area: areaResult.valid && cosineResult.valid
      ? [`A = ${areaValues.angleA}°`, `a = ${rounded(cosineResult.sideA)} cm`, `B = ${rounded(cosineResult.angleB, 0)}°`, `b = ${areaValues.sideB} cm`, `C = ${rounded(cosineResult.angleC, 0)}°`, `c = ${areaValues.sideC} cm`, `K = ${rounded(areaResult.area)} cm²`]
      : ['Check the input values'],
  }[mode];

  const requestedAnswer = mode === 'sine'
    ? `b = ${rounded(sineResult.sideB)} cm`
    : mode === 'cosine'
      ? `a = ${rounded(cosineResult.sideA)} cm`
      : `K = ${rounded(areaResult.area)} cm²`;
  const exerciseTarget = mode === 'sine' ? 'b' : mode === 'cosine' ? 'a' : 'K';

  const calculationGuide = mode === 'sine' ? (
    <div className="mt-3 space-y-2 rounded-xl bg-purple-50 p-4 text-sm text-purple-950">
      <p className="font-bold">Question: Find side b using the known pair a and A.</p>
      <p className="font-serif text-base">b = <Fraction numerator={`a sin B`} denominator={`sin A`} /> = <Fraction numerator={`${sineValues.sideA} sin ${sineValues.angleB}°`} denominator={`sin ${sineValues.angleA}°`} /> = {rounded(sineResult.sideB)} cm</p>
    </div>
  ) : mode === 'cosine' ? (
    <div className="mt-3 space-y-2 rounded-xl bg-purple-50 p-4 text-sm text-purple-950">
      <p className="font-bold">Find the missing side a using the included angle A:</p>
      <p className="font-serif text-base">a² = b² + c² − 2bc cos A</p>
      <p className="font-serif text-base">a² = {cosineValues.sideB}² + {cosineValues.sideC}² − 2({cosineValues.sideB})({cosineValues.sideC}) cos {cosineValues.angleA}° = {rounded(cosineResult.sideASquared, 2)}</p>
      <p className="font-serif text-base">a = √{rounded(cosineResult.sideASquared, 2)} = {rounded(cosineResult.sideA)} cm</p>
      <p className="font-bold">Question: Find side a, then round your answer to 2 decimal places.</p>
    </div>
  ) : (
    <div className="mt-3 space-y-2 rounded-xl bg-purple-50 p-4 text-sm text-purple-950">
      <p className="font-bold">Use the two given sides and their included angle:</p>
      <p className="font-serif text-base">K = ½bc sin A</p>
      <p className="font-serif text-base">K = ½({areaValues.sideB})({areaValues.sideC}) sin {areaValues.angleA}° = {rounded(areaResult.area)} cm²</p>
      <p className="font-bold">Question: Find the area K and round your answer to 2 decimal places.</p>
    </div>
  );

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

          <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-lg sm:p-6">
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-slate-900">Interactive Exercise: Solve Step-by-Step</h3>
              <p className="mt-2 text-slate-700">
                Follow the plan, enter each answer, and check your work before moving on.
              </p>
              
              {/* Navigation Controls (Section G) */}
              {exerciseStep > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExerciseStep(Math.max(1, exerciseStep - 1))}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    ⬅ Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setExerciseStep(Math.min(5, exerciseStep + 1))}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Next Step ➡
                  </button>
                  <button
                    type="button"
                    onClick={() => setHintLevel(Math.min(3, hintLevel + 1))}
                    className="rounded-full bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-600"
                  >
                    💡 Hint
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExerciseStep(0);
                      setExerciseInputs({});
                      setExerciseRule('');
                      setExerciseStatus('unanswered');
                      setExerciseFeedback('');
                      setHintLevel(0);
                      setHintAttempts(0);
                    }}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    🔄 Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'sine' ? 'cosine' : mode === 'cosine' ? 'area' : 'sine');
                      setExerciseStep(0);
                      setExerciseInputs({});
                      setExerciseRule('');
                      setExerciseStatus('unanswered');
                      setExerciseFeedback('');
                      setHintLevel(0);
                      setHintAttempts(0);
                    }}
                    className="rounded-full bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700"
                  >
                    ✨ New
                  </button>
                </div>
              )}

              {exerciseStep === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setExerciseStep(1);
                    setHintAttempts(0);
                    setHintLevel(0);
                  }}
                  className="mt-4 rounded-full bg-purple-600 px-6 py-2 font-bold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  Start Exercise
                </button>
              )}
            </div>

            {exerciseStep > 0 && (
              <div className="mt-5 space-y-4">
                {/* Progress Indicator (Section H) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-700">Step {exerciseStep} of 5</p>
                  </div>
                  <ExerciseProgress currentStep={exerciseStep} onStepSelect={setExerciseStep} />
                </div>

                {exerciseStep >= 1 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-extrabold text-slate-900">✓ Step 1: Given Information</h4>
                    <p className="mt-2 text-slate-700">Read the triangle using the standard labels. Blue values are given; green values are calculated.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {questionValues.map((value) => (
                        <span key={value} className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900">{value}</span>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-bold">
                      {['A', 'a', 'B', 'b', 'C', 'c'].map((label) => (
                        <span key={label} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-700">
                          {label} <span className="text-slate-400">=</span> {label === exerciseTarget ? 'find' : questionValues.some((value) => value.startsWith(`${label} =`) || value.startsWith(`∠${label} =`)) ? 'given' : 'not needed'}
                        </span>
                      ))}
                    </div>
                    {exerciseStep === 1 && (
                      <button type="button" onClick={() => setExerciseStep(2)} className="mt-4 rounded-full bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700">
                        Continue to Plan →
                      </button>
                    )}
                  </div>
                )}

                {exerciseStep >= 2 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="font-extrabold text-slate-900">✓ Step 2: Make a Plan</h4>
                    <p className="mt-2 text-slate-700">Read the worked calculation, then choose the rule in Step 3. This exercise asks for one value only.</p>
                    {calculationGuide}
                    <button type="button" onClick={() => setExerciseStep(3)} className="mt-4 rounded-full bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700">
                      Continue to Formula →
                    </button>
                  </div>
                )}

                {exerciseStep >= 3 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="font-extrabold text-slate-900">✓ Step 3: Choose the Formula</h4>
                    <p className="mt-2 text-slate-700">Select the formula you will use for the calculation.</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {modeOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => {
                            setExerciseRule(option.label);
                            setExerciseStatus('unanswered');
                            setExerciseFeedback('');
                          }}
                          className={`rounded-lg border px-3 py-3 text-sm font-bold ${exerciseRule === option.label ? 'border-purple-500 bg-purple-100 text-purple-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={checkExerciseStep} className="mt-4 rounded-full bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700">
                      Check
                    </button>
                    {exerciseStep === 3 && exerciseFeedback && <p role="status" className={`mt-2 font-semibold ${exerciseStatus === 'correct' ? 'text-emerald-700' : 'text-red-700'}`}>{exerciseFeedback}</p>}
                  </div>
                )}

                {exerciseStep >= 4 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="font-extrabold text-slate-900">✓ Step 4: Calculate the Unknown</h4>
                    <p className="mt-2 text-slate-700">Complete this one calculation using the substituted formula from Step 2.</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {mode === 'sine' && (
                        <>
                          <label className="font-bold text-slate-800">b = <input type="number" value={exerciseInputs.sideB || ''} onChange={(event) => setExerciseInputs((current) => ({ ...current, sideB: event.target.value }))} className="ml-2 w-32 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-purple-500" /> cm</label>
                        </>
                      )}
                      {mode === 'cosine' && (
                        <>
                          <label className="font-bold text-slate-800">a = <input type="number" value={exerciseInputs.sideA || ''} onChange={(event) => setExerciseInputs((current) => ({ ...current, sideA: event.target.value }))} className="ml-2 w-32 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-purple-500" /> cm</label>
                        </>
                      )}
                      {mode === 'area' && (
                        <>
                          <label className="font-bold text-slate-800">K = <input type="number" value={exerciseInputs.area || ''} onChange={(event) => setExerciseInputs((current) => ({ ...current, area: event.target.value }))} className="ml-2 w-32 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-purple-500" /> cm²</label>
                        </>
                      )}
                    </div>
                    <button type="button" onClick={() => { checkExerciseStep(); setHintAttempts(hintAttempts + 1); }} className="mt-4 rounded-full bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700">
                      Check
                    </button>
                    {exerciseStep === 4 && exerciseFeedback && <p role="status" className={`mt-2 font-semibold ${exerciseStatus === 'correct' ? 'text-emerald-700' : 'text-red-700'}`}>{exerciseFeedback}</p>}
                  </div>
                )}

                {exerciseStep >= 5 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <h4 className="font-extrabold text-emerald-950">✓ Step 5: Final Answer</h4>
                    <p className="mt-2 text-emerald-900">The answer to this exercise is:</p>
                    <p className="mt-2 text-lg font-extrabold text-emerald-950">{requestedAnswer}</p>
                    <button type="button" onClick={checkExerciseStep} className="mt-4 rounded-full bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700">
                      Finish Exercise
                    </button>
                    {exerciseStep === 5 && exerciseFeedback && <p role="status" className="mt-2 font-semibold text-emerald-800">{exerciseFeedback}</p>}
                  </div>
                )}

                {/* Hint System Display */}
                {hintLevel > 0 && exerciseStep > 2 && (
                  <HintSystem
                    mode={mode}
                    hintLevel={hintLevel}
                    onShowHint={setHintLevel}
                    attempts={hintAttempts}
                  />
                )}
              </div>
            )}
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

          {/* Section 3: Formula Display with Color Coding */}
          <FormulaDisplay mode={mode} />

          {/* Section 5: Worked Examples */}
          <WorkedExamples mode={mode} />

          {/* Section 6: Practice Area */}
          <PracticeArea
            mode={mode}
            level={practiceLevel}
            onLevelChange={setPracticeLevel}
            onGenerateProblem={() => setPracticeTotalAttempts(practiceTotalAttempts + 1)}
            scoreCount={practiceScore}
            totalCount={practiceTotalAttempts}
          />
        </div>
      </div>
    </section>
  );
};

export default ObliqueTriangleSolver;
