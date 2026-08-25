import React, { useMemo, useState } from 'react';

type RatioKey = 'sin' | 'cos' | 'tan' | 'csc' | 'sec' | 'cot';
type RatioTabKey = 'concept' | 'calculator' | 'process' | 'questions';

type PracticeQuestion = {
  key: string;
  title: string;
  skill: string;
  prompt: string;
  given: string[];
  diagram: {
    angle: string;
    opposite: string;
    adjacent: string;
    hypotenuse: string;
    context: string;
  };
  setup: React.ReactNode;
  answer: string;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const rounded = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : '-');

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

const ratioCards: Array<{
  key: RatioKey;
  name: string;
  memory: string;
  formula: React.ReactNode;
  color: string;
}> = [
  { key: 'sin', name: 'Sine', memory: 'SOH', formula: <><Fraction numerator="Opposite" denominator="Hypotenuse" /></>, color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  { key: 'cos', name: 'Cosine', memory: 'CAH', formula: <><Fraction numerator="Adjacent" denominator="Hypotenuse" /></>, color: 'border-blue-200 bg-blue-50 text-blue-900' },
  { key: 'tan', name: 'Tangent', memory: 'TOA', formula: <><Fraction numerator="Opposite" denominator="Adjacent" /></>, color: 'border-orange-200 bg-orange-50 text-orange-900' },
  { key: 'csc', name: 'Cosecant', memory: 'reciprocal of sine', formula: <><Fraction numerator="Hypotenuse" denominator="Opposite" /></>, color: 'border-slate-200 bg-slate-50 text-slate-800' },
  { key: 'sec', name: 'Secant', memory: 'reciprocal of cosine', formula: <><Fraction numerator="Hypotenuse" denominator="Adjacent" /></>, color: 'border-slate-200 bg-slate-50 text-slate-800' },
  { key: 'cot', name: 'Cotangent', memory: 'reciprocal of tangent', formula: <><Fraction numerator="Adjacent" denominator="Opposite" /></>, color: 'border-slate-200 bg-slate-50 text-slate-800' },
];

const ratioTabs: Array<{ key: RatioTabKey; label: string }> = [
  { key: 'concept', label: 'Concept' },
  { key: 'calculator', label: 'Ratio Lab' },
  { key: 'process', label: 'Steps' },
  { key: 'questions', label: 'Questions' },
];

const practiceQuestions: PracticeQuestion[] = [
  {
    key: 'tree-shadow',
    title: 'Tree Height',
    skill: 'Missing side',
    prompt: 'A student stands 18 m from a tree. The angle of elevation to the top is 35°. Find the height of the tree.',
    given: ['Adjacent = 18 m', 'θ = 35°', 'Find opposite height'],
    diagram: { angle: 'θ = 35°', opposite: 'O = h', adjacent: 'A = 18 m', hypotenuse: 'H = ?', context: 'tree' },
    setup: <>tan 35° = <Fraction numerator="h" denominator="18" />, so h = 18 tan 35°.</>,
    answer: `${rounded(18 * Math.tan(toRadians(35)))} m`,
  },
  {
    key: 'kite-height',
    title: 'Kite Height',
    skill: 'Missing side',
    prompt: 'A kite string is 50 m long and makes a 42° angle with the ground. Find the vertical height of the kite.',
    given: ['Hypotenuse = 50 m', 'θ = 42°', 'Find opposite height'],
    diagram: { angle: 'θ = 42°', opposite: 'O = h', adjacent: 'A = ?', hypotenuse: 'H = 50 m', context: 'kite' },
    setup: <>sin 42° = <Fraction numerator="h" denominator="50" />, so h = 50 sin 42°.</>,
    answer: `${rounded(50 * Math.sin(toRadians(42)))} m`,
  },
  {
    key: 'ramp-angle',
    title: 'Wheelchair Ramp',
    skill: 'Missing angle',
    prompt: 'A ramp rises 1.2 m over a horizontal distance of 6 m. Find the ramp angle with the ground.',
    given: ['Opposite = 1.2 m', 'Adjacent = 6 m', 'Find θ'],
    diagram: { angle: 'θ = ?', opposite: 'O = 1.2 m', adjacent: 'A = 6 m', hypotenuse: 'H = ?', context: 'ramp' },
    setup: <>tan θ = <Fraction numerator="1.2" denominator="6" />, so θ = tan⁻¹(1.2/6).</>,
    answer: `${rounded((Math.atan(1.2 / 6) * 180) / Math.PI)}°`,
  },
  {
    key: 'slide-angle',
    title: 'Playground Slide',
    skill: 'Missing angle',
    prompt: 'A slide is 5.5 m long and its platform is 2.5 m high. Find the angle the slide makes with the ground.',
    given: ['Hypotenuse = 5.5 m', 'Opposite = 2.5 m', 'Find θ'],
    diagram: { angle: 'θ = ?', opposite: 'O = 2.5 m', adjacent: 'A = ?', hypotenuse: 'H = 5.5 m', context: 'slide' },
    setup: <>sin θ = <Fraction numerator="2.5" denominator="5.5" />, so θ = sin⁻¹(2.5/5.5).</>,
    answer: `${rounded((Math.asin(2.5 / 5.5) * 180) / Math.PI)}°`,
  },
  {
    key: 'drone-elevation',
    title: 'Drone Elevation',
    skill: 'Missing angle',
    prompt: 'A drone is 45 m high and horizontally 80 m from a student. Find the angle of elevation to the drone.',
    given: ['Opposite = 45 m', 'Adjacent = 80 m', 'Find θ'],
    diagram: { angle: 'θ = ?', opposite: 'O = 45 m', adjacent: 'A = 80 m', hypotenuse: 'H = ?', context: 'drone' },
    setup: <>tan θ = <Fraction numerator="45" denominator="80" />, so θ = tan⁻¹(45/80).</>,
    answer: `${rounded((Math.atan(45 / 80) * 180) / Math.PI)}°`,
  },
  {
    key: 'river-width',
    title: 'River Width',
    skill: 'Missing side',
    prompt: 'From a point 30 m along the riverbank, the angle to a marker directly opposite is 58°. Estimate the river width.',
    given: ['Adjacent = 30 m', 'θ = 58°', 'Find opposite width'],
    diagram: { angle: 'θ = 58°', opposite: 'O = w', adjacent: 'A = 30 m', hypotenuse: 'H = ?', context: 'river' },
    setup: <>tan 58° = <Fraction numerator="w" denominator="30" />, so w = 30 tan 58°.</>,
    answer: `${rounded(30 * Math.tan(toRadians(58)))} m`,
  },
];

const RightTriangleDiagram = ({
  angle,
  opposite,
  adjacent,
  hypotenuse,
}: {
  angle: number;
  opposite: number;
  adjacent: number;
  hypotenuse: number;
}) => (
  <svg className="w-full rounded-2xl border border-slate-200 bg-white" viewBox="0 0 440 300" role="img" aria-label="Right triangle showing opposite adjacent and hypotenuse">
    <rect width="440" height="300" fill="#ffffff" rx="18" />
    <polygon points="64,238 344,238 344,72" fill="#eef2ff" stroke="#4f46e5" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 314 238 L 314 208 L 344 208" fill="none" stroke="#64748b" strokeWidth="3" />
    <path d="M 106 238 A 42 42 0 0 0 99 214" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <text x="106" y="218" fontSize="16" fontWeight="800" fill="#b45309">θ = {angle}°</text>
    <g transform="translate(180 246)">
      <rect width="118" height="30" rx="8" fill="#eff6ff" stroke="#60a5fa" />
      <text x="59" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1d4ed8">A = {rounded(adjacent)}</text>
    </g>
    <g transform="translate(354 142)">
      <rect width="72" height="30" rx="8" fill="#ecfdf5" stroke="#34d399" />
      <text x="36" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#047857">O = {rounded(opposite)}</text>
    </g>
    <g transform="translate(150 128)">
      <rect width="118" height="30" rx="8" fill="#fee2e2" stroke="#f87171" />
      <text x="59" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#b91c1c">H = {rounded(hypotenuse)}</text>
    </g>
  </svg>
);

const MissingSideDiagram = () => (
  <svg className="mt-4 w-full rounded-2xl border border-slate-200 bg-white" viewBox="0 0 440 300" role="img" aria-label="Right triangle missing opposite side example">
    <rect width="440" height="300" fill="#ffffff" rx="18" />
    <polygon points="64,238 344,238 344,72" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 314 238 L 314 208 L 344 208" fill="none" stroke="#64748b" strokeWidth="3" />
    <path d="M 106 238 A 42 42 0 0 0 99 214" fill="none" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
    <text x="106" y="218" fontSize="16" fontWeight="800" fill="#9a3412">θ = 30°</text>
    <g transform="translate(170 246)">
      <rect width="128" height="30" rx="8" fill="#eff6ff" stroke="#60a5fa" />
      <text x="64" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1d4ed8">A = 10 cm</text>
    </g>
    <g transform="translate(354 142)">
      <rect width="74" height="30" rx="8" fill="#ecfdf5" stroke="#34d399" />
      <text x="37" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#047857">O = x</text>
    </g>
    <g transform="translate(150 128)">
      <rect width="118" height="30" rx="8" fill="#fff7ed" stroke="#fb923c" strokeDasharray="5 4" />
      <text x="59" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#9a3412">H = ?</text>
    </g>
  </svg>
);

const MissingAngleDiagram = () => (
  <svg className="mt-4 w-full rounded-2xl border border-slate-200 bg-white" viewBox="0 0 440 300" role="img" aria-label="Ladder leaning on a wall missing angle example">
    <rect width="440" height="300" fill="#ffffff" rx="18" />
    <rect x="342" y="42" width="18" height="198" rx="4" fill="#cbd5e1" />
    <rect x="58" y="238" width="314" height="14" rx="4" fill="#94a3b8" />
    <line x1="88" y1="238" x2="351" y2="86" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
    <path d="M 330 238 L 330 218 L 350 218" fill="none" stroke="#64748b" strokeWidth="3" />
    <path d="M 125 238 A 38 38 0 0 0 121 219" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <text x="125" y="218" fontSize="16" fontWeight="800" fill="#b45309">θ = ?</text>
    <g transform="translate(168 130) rotate(-30)">
      <rect width="132" height="30" rx="8" fill="#fee2e2" stroke="#f87171" />
      <text x="66" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#b91c1c">H = 10 m</text>
    </g>
    <g transform="translate(270 146)">
      <rect width="92" height="30" rx="8" fill="#ecfdf5" stroke="#34d399" />
      <text x="46" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#047857">O = 6 m</text>
    </g>
    <g transform="translate(154 250)">
      <rect width="106" height="30" rx="8" fill="#eff6ff" stroke="#60a5fa" strokeDasharray="5 4" />
      <text x="53" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1d4ed8">A = ?</text>
    </g>
    <text x="366" y="72" fontSize="13" fontWeight="800" fill="#475569">wall</text>
    <text x="64" y="272" fontSize="13" fontWeight="800" fill="#475569">ground</text>
  </svg>
);

const PracticeQuestionDiagram = ({ question }: { question: PracticeQuestion }) => (
  <svg className="mt-4 w-full rounded-2xl border border-slate-200 bg-white" viewBox="0 0 440 300" role="img" aria-label={`${question.title} right-triangle diagram`}>
    <rect width="440" height="300" fill="#ffffff" rx="18" />
    <rect x="58" y="238" width="314" height="14" rx="4" fill="#cbd5e1" />
    {question.diagram.context === 'tree' && <rect x="337" y="58" width="16" height="184" rx="5" fill="#15803d" />}
    {question.diagram.context === 'kite' && (
      <g transform="translate(338 58)">
        <path d="M 0 -18 L 18 0 L 0 18 L -18 0 Z" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
        <path d="M 0 18 L -8 34 M 0 18 L 8 34" stroke="#c2410c" strokeWidth="2" />
      </g>
    )}
    {question.diagram.context === 'ramp' && <rect x="78" y="226" width="274" height="14" rx="4" fill="#94a3b8" transform="rotate(-10 78 226)" />}
    {question.diagram.context === 'slide' && <rect x="332" y="90" width="18" height="150" rx="4" fill="#94a3b8" />}
    {question.diagram.context === 'drone' && (
      <g transform="translate(344 72)">
        <rect x="-22" y="-8" width="44" height="16" rx="4" fill="#475569" />
        <circle cx="-32" cy="-12" r="8" fill="#64748b" />
        <circle cx="32" cy="-12" r="8" fill="#64748b" />
      </g>
    )}
    {question.diagram.context === 'river' && (
      <g>
        <rect x="330" y="74" width="24" height="166" rx="10" fill="#bfdbfe" />
        <line x1="330" y1="104" x2="354" y2="92" stroke="#60a5fa" strokeWidth="3" />
        <line x1="330" y1="156" x2="354" y2="144" stroke="#60a5fa" strokeWidth="3" />
      </g>
    )}
    <polygon points="64,238 344,238 344,72" fill="#f8fafc" stroke="#4f46e5" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 314 238 L 314 208 L 344 208" fill="none" stroke="#64748b" strokeWidth="3" />
    <path d="M 106 238 A 42 42 0 0 0 99 214" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <text x="106" y="218" fontSize="16" fontWeight="800" fill="#b45309">{question.diagram.angle}</text>
    <g transform="translate(160 246)">
      <rect width="142" height="30" rx="8" fill="#eff6ff" stroke="#60a5fa" strokeDasharray={question.diagram.adjacent.includes('?') ? '5 4' : ''} />
      <text x="71" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1d4ed8">{question.diagram.adjacent}</text>
    </g>
    <g transform="translate(344 142)">
      <rect width="88" height="30" rx="8" fill="#ecfdf5" stroke="#34d399" strokeDasharray={question.diagram.opposite.includes('?') ? '5 4' : ''} />
      <text x="44" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#047857">{question.diagram.opposite}</text>
    </g>
    <g transform="translate(142 124) rotate(-29)">
      <rect width="142" height="30" rx="8" fill="#fee2e2" stroke="#f87171" strokeDasharray={question.diagram.hypotenuse.includes('?') ? '5 4' : ''} />
      <text x="71" y="20" textAnchor="middle" fontSize="15" fontWeight="800" fill="#b91c1c">{question.diagram.hypotenuse}</text>
    </g>
  </svg>
);

const TrigRatiosArchiveLesson = () => {
  const [activeTab, setActiveTab] = useState<RatioTabKey>('concept');
  const [angle, setAngle] = useState(30);
  const [hypotenuse, setHypotenuse] = useState(12);

  const values = useMemo(() => {
    const opposite = hypotenuse * Math.sin(toRadians(angle));
    const adjacent = hypotenuse * Math.cos(toRadians(angle));
    return {
      opposite,
      adjacent,
      hypotenuse,
      sin: opposite / hypotenuse,
      cos: adjacent / hypotenuse,
      tan: opposite / adjacent,
      csc: hypotenuse / opposite,
      sec: hypotenuse / adjacent,
      cot: adjacent / opposite,
    };
  }, [angle, hypotenuse]);

  return (
    <section className="rounded-2xl border border-white bg-white/90 p-5 shadow-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Trigonometric Ratios</h2>
          <p className="mt-1 text-slate-700">
            Archive right-triangle lesson: identify sides, choose SOH CAH TOA, then use reciprocal ratios when needed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold sm:grid-cols-4 sm:rounded-full">
          {ratioTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                activeTab === tab.key ? 'bg-white text-purple-700 shadow' : 'text-slate-600 hover:bg-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'concept' && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <h3 className="font-extrabold">Right triangle only</h3>
              <p className="mt-2">Basic trigonometric ratios apply to a right-angled triangle. The hypotenuse is always opposite the 90° angle. Opposite and adjacent are named relative to θ.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {ratioCards.slice(0, 3).map((ratio) => (
                <div key={ratio.key} className={`rounded-2xl border p-4 ${ratio.color}`}>
                  <p className="text-sm font-extrabold uppercase tracking-wide">{ratio.memory}</p>
                  <h3 className="mt-1 text-xl font-extrabold">{ratio.name}</h3>
                  <p className="mt-2 text-lg">{ratio.key}(θ) = {ratio.formula}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {ratioCards.slice(3).map((ratio) => (
                <div key={ratio.key} className={`rounded-2xl border p-4 ${ratio.color}`}>
                  <h3 className="text-lg font-extrabold">{ratio.name}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{ratio.memory}</p>
                  <p className="mt-2">{ratio.key}(θ) = {ratio.formula}</p>
                </div>
              ))}
            </div>
          </div>
          <RightTriangleDiagram angle={angle} opposite={values.opposite} adjacent={values.adjacent} hypotenuse={hypotenuse} />
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <label htmlFor="ratio-angle" className="block text-sm font-bold text-slate-700">
              Angle θ: {angle}°
            </label>
            <input id="ratio-angle" type="range" min="5" max="85" step="1" value={angle} onChange={(event) => setAngle(Number(event.target.value))} className="w-full accent-purple-600" />
            <label htmlFor="ratio-hypotenuse" className="block text-sm font-bold text-slate-700">
              Hypotenuse: {hypotenuse} cm
            </label>
            <input id="ratio-hypotenuse" type="range" min="5" max="25" step="1" value={hypotenuse} onChange={(event) => setHypotenuse(Number(event.target.value))} className="w-full accent-purple-600" />
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-sm font-bold text-purple-200">Key idea</p>
              <p className="mt-1 text-sm">Changing triangle size changes side lengths, but the ratio value stays tied to the angle.</p>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <RightTriangleDiagram angle={angle} opposite={values.opposite} adjacent={values.adjacent} hypotenuse={hypotenuse} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {(['sin', 'cos', 'tan', 'csc', 'sec', 'cot'] as RatioKey[]).map((ratio) => (
                <div key={ratio} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{ratio}(θ)</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{rounded(values[ratio], 3)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'process' && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900">Find a Missing Side</h3>
            <MissingSideDiagram />
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
              <li>Label the sides from θ: opposite, adjacent, hypotenuse.</li>
              <li>Choose the ratio that uses the known side and the unknown side.</li>
              <li>Example: given θ = 30° and adjacent = 10, find opposite.</li>
              <li className="font-serif text-lg">tan 30° = <Fraction numerator="x" denominator="10" /></li>
              <li className="font-bold text-slate-900">x = 10 tan 30° = {rounded(10 * Math.tan(toRadians(30)))} cm</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900">Find a Missing Angle</h3>
            <MissingAngleDiagram />
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
              <li>A 10 m ladder leans against a wall and reaches 6 m high.</li>
              <li>Find the angle θ between the ladder and the ground.</li>
              <li>From θ, the height is opposite and the ladder is the hypotenuse.</li>
              <li className="font-serif text-lg">sin θ = <Fraction numerator="6" denominator="10" /></li>
              <li className="font-bold text-slate-900">θ = sin⁻¹(6/10) = {rounded((Math.asin(6 / 10) * 180) / Math.PI)}°</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 lg:col-span-2">
            <h3 className="font-extrabold">Common mistakes from the archive</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <p>Do not use these ratios on a triangle unless it has a 90° angle.</p>
              <p>The hypotenuse is always opposite the 90° angle. It does not change when θ changes.</p>
              <p>sin⁻¹(x) finds an angle. It is not the same as 1/sin(x), which is csc(x).</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-950">
            <h3 className="text-xl font-extrabold">Practice Questions</h3>
            <p className="mt-2">Choose the right ratio, label the sides, and reveal the worked answer when you are ready.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {practiceQuestions.map((question, index) => (
              <details key={question.key} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wide text-purple-700">Question {index + 1} · {question.skill}</p>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">{question.title}</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-extrabold text-slate-600 group-open:bg-purple-100 group-open:text-purple-700">Show</span>
                  </div>
                  <p className="mt-3 text-slate-700">{question.prompt}</p>
                  <ul className="mt-3 grid gap-2 text-sm font-bold text-slate-700 sm:grid-cols-3">
                    {question.given.map((item) => (
                      <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">{item}</li>
                    ))}
                  </ul>
                  <PracticeQuestionDiagram question={question} />
                </summary>

                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                  <p className="text-sm font-extrabold uppercase tracking-wide">Worked answer</p>
                  <p className="mt-2 font-serif text-lg">{question.setup}</p>
                  <p className="mt-3 text-xl font-extrabold">Answer: {question.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default TrigRatiosArchiveLesson;
