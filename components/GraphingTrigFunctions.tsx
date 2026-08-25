import React, { useMemo, useState } from 'react';

type GraphFunction = 'sin' | 'cos' | 'tan';

const functionOptions: Array<{ key: GraphFunction; label: string; color: string }> = [
  { key: 'sin', label: 'sin θ', color: '#10b981' },
  { key: 'cos', label: 'cos θ', color: '#2563eb' },
  { key: 'tan', label: 'tan θ', color: '#f97316' },
];

const graphWidth = 720;
const graphHeight = 360;
const graphPadding = 48;
const plotWidth = graphWidth - graphPadding * 2;
const centerY = graphHeight / 2;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getTrigValue = (functionType: GraphFunction, angle: number) => {
  if (functionType === 'sin') return Math.sin(toRadians(angle));
  if (functionType === 'cos') return Math.cos(toRadians(angle));
  return Math.tan(toRadians(angle));
};

const formatWholeNumber = (value: number) => Math.round(value).toString();

const formatMultiplierLabel = (value: number) => (value === 1 ? 'standard' : formatWholeNumber(value));

const formatEquation = (amplitude: number, functionType: GraphFunction, frequency: number) => {
  const coefficient = amplitude === 1 ? '' : `${formatWholeNumber(amplitude)} `;
  const argument = frequency === 1 ? 'θ' : `${formatWholeNumber(frequency)}θ`;
  return `y = ${coefficient}${functionType}(${argument})`;
};

const getX = (angle: number) => graphPadding + (angle / 360) * plotWidth;

const getY = (value: number, functionType: GraphFunction) => {
  const scale = functionType === 'tan' ? 28 : 46;
  const limitedValue = functionType === 'tan' ? Math.max(-4, Math.min(4, value)) : value;
  return centerY - limitedValue * scale;
};

const buildGraphPath = (functionType: GraphFunction, amplitude: number, frequency: number) => {
  if (functionType !== 'tan') {
    return Array.from({ length: 361 }, (_, angle) => {
      const value = amplitude * getTrigValue(functionType, frequency * angle);
      return `${angle === 0 ? 'M' : 'L'} ${getX(angle)} ${getY(value, functionType)}`;
    }).join(' ');
  }

  const segments: string[] = [];
  let currentSegment = '';

  for (let angle = 0; angle <= 360; angle += 1) {
    const rawValue = amplitude * Math.tan(toRadians(frequency * angle));
    const isAsymptote = Math.abs(Math.cos(toRadians(frequency * angle))) < 0.035;

    if (isAsymptote || Math.abs(rawValue) > 8) {
      if (currentSegment) segments.push(currentSegment);
      currentSegment = '';
      continue;
    }

    const command = currentSegment ? 'L' : 'M';
    currentSegment += `${command} ${getX(angle)} ${getY(rawValue, functionType)} `;
  }

  if (currentSegment) segments.push(currentSegment);
  return segments.join(' ');
};

const GraphingTrigFunctions = () => {
  const [functionType, setFunctionType] = useState<GraphFunction>('sin');
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [angle, setAngle] = useState(45);

  const selectedFunction = functionOptions.find((option) => option.key === functionType) ?? functionOptions[0];
  const transformedValue = amplitude * getTrigValue(functionType, frequency * angle);
  const displayValue = functionType === 'tan' && Math.abs(transformedValue) > 20 ? 'undefined' : transformedValue.toFixed(3);
  const graphPath = useMemo(
    () => buildGraphPath(functionType, amplitude, frequency),
    [amplitude, frequency, functionType],
  );
  const currentX = getX(angle);
  const currentY = getY(transformedValue, functionType);
  const equation = formatEquation(amplitude, functionType, frequency);
  const period = functionType === 'tan' ? 180 / frequency : 360 / frequency;

  return (
    <section className="space-y-6">
      <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-white">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Graphing Trigonometric Functions</h2>
        <p className="mt-2 text-center text-slate-700">
          Explore the shape, amplitude, period, and current value of sine, cosine, and tangent graphs.
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <div className="bg-white/90 p-5 rounded-2xl shadow-lg border border-white space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Function</label>
            <div className="grid grid-cols-3 gap-2 rounded-full bg-slate-100 p-1 text-sm font-bold">
              {functionOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFunctionType(option.key)}
                  className={`rounded-full px-3 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                    functionType === option.key ? 'bg-white text-purple-700 shadow' : 'text-slate-600 hover:bg-white/70'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="graph-amplitude" className="block text-sm font-bold text-slate-700">
              Amplitude multiplier: {formatMultiplierLabel(amplitude)}
            </label>
            <input
              id="graph-amplitude"
              type="range"
              min="1"
              max="3"
              step="1"
              value={amplitude}
              onChange={(event) => setAmplitude(Number(event.target.value))}
              className="mt-3 w-full accent-purple-600"
            />
          </div>

          <div>
            <label htmlFor="graph-frequency" className="block text-sm font-bold text-slate-700">
              Period multiplier: {formatMultiplierLabel(frequency)}
            </label>
            <input
              id="graph-frequency"
              type="range"
              min="1"
              max="3"
              step="1"
              value={frequency}
              onChange={(event) => setFrequency(Number(event.target.value))}
              className="mt-3 w-full accent-purple-600"
            />
          </div>

          <div>
            <label htmlFor="graph-angle" className="block text-sm font-bold text-slate-700">
              Angle: {angle}°
            </label>
            <input
              id="graph-angle"
              type="range"
              min="0"
              max="360"
              step="1"
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value))}
              className="mt-3 w-full accent-purple-600"
            />
          </div>

          <div className="rounded-xl bg-slate-900 p-4 text-white shadow-inner">
            <p className="text-sm text-purple-200">Current equation</p>
            <p className="mt-1 text-2xl font-bold">{equation}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-slate-300">Value</p>
                <p className="text-lg font-bold">{displayValue}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-slate-300">Period</p>
                <p className="text-lg font-bold">{period.toFixed(0)}°</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xl border border-white">
          <svg width="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`} role="img" aria-label={`Graph of ${equation}`}>
            <rect width={graphWidth} height={graphHeight} rx="18" fill="#ffffff" />
            {[0, 90, 180, 270, 360].map((tick) => (
              <g key={tick}>
                <line x1={getX(tick)} y1="40" x2={getX(tick)} y2="320" stroke="#e2e8f0" strokeWidth="1" />
                <text x={getX(tick)} y="342" textAnchor="middle" fontSize="13" fill="#475569">
                  {tick}°
                </text>
              </g>
            ))}
            {[-2, -1, 1, 2].map((tick) => (
              <g key={tick}>
                <line x1={graphPadding} y1={centerY - tick * 46} x2={graphWidth - graphPadding} y2={centerY - tick * 46} stroke="#f1f5f9" strokeWidth="1" />
                <text x="28" y={centerY - tick * 46 + 4} textAnchor="middle" fontSize="12" fill="#64748b">
                  {tick}
                </text>
              </g>
            ))}
            <line x1={graphPadding} y1={centerY} x2={graphWidth - graphPadding} y2={centerY} stroke="#64748b" strokeWidth="1.5" />
            <line x1={graphPadding} y1="40" x2={graphPadding} y2="320" stroke="#64748b" strokeWidth="1.5" />
            {functionType === 'tan' &&
              Array.from({ length: Math.ceil(frequency * 2) + 3 }, (_, index) => (90 + index * 180) / frequency)
                .filter((asymptote) => asymptote >= 0 && asymptote <= 360)
                .map((asymptote) => (
                  <line key={asymptote} x1={getX(asymptote)} y1="40" x2={getX(asymptote)} y2="320" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.5" />
                ))}
            <path d={graphPath} fill="none" stroke={selectedFunction.color} strokeWidth="4" strokeLinecap="round" />
            <line x1={currentX} y1="40" x2={currentX} y2="320" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,5" />
            {displayValue !== 'undefined' && (
              <circle cx={currentX} cy={currentY} r="8" fill={selectedFunction.color} stroke="#ffffff" strokeWidth="3" />
            )}
            <g transform="translate(520 32)">
              <rect width="152" height="58" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
              <circle cx="18" cy="20" r="6" fill={selectedFunction.color} />
              <text x="32" y="25" fill="#334155" fontSize="14" fontWeight="700">
                {selectedFunction.label}
              </text>
              <text x="18" y="46" fill="#64748b" fontSize="12">
                θ = {angle}°, y = {displayValue}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default GraphingTrigFunctions;
