import React from 'react';

type CurriculumItem = {
  label: string;
  details?: string[];
};

type CurriculumRow = {
  no?: string;
  unit: {
    heading: string;
    codes?: string[];
    topics: CurriculumItem[];
  };
  outcomes: CurriculumItem[];
  activities: CurriculumItem[];
};

const curriculumRows: CurriculumRow[] = [
  {
    no: '3.0',
    unit: {
      heading: 'Trigonometry',
      codes: ['CLO1: C3', 'CLO2: C5'],
      topics: [
        { label: '3.1 Introduction to Trigonometry' },
        { label: '3.2 Trigonometric Ratios' },
      ],
    },
    outcomes: [
      { label: 'Describe angles using degrees and radians in mathematical contexts.' },
      { label: 'Convert angle measurements accurately between degree and radian form.' },
      { label: 'Define sine, cosine, tangent, cosecant, secant, and cotangent for a right triangle.' },
      {
        label: 'Evaluate trigonometric and inverse trigonometric values using a calculator.',
        details: ['round answers appropriately', 'state angle units clearly'],
      },
      { label: 'Apply trigonometric ratios to determine unknown sides and angles in right-angled triangles.' },
    ],
    activities: [
      { label: 'Use a protractor and unit circle sketch to compare one full turn in degrees and radians.' },
      { label: 'Guide students to build a conversion map using 180 degrees = pi radians.' },
      { label: 'Label opposite, adjacent, and hypotenuse sides from different reference angles.' },
      {
        label: 'Construct a ratio table for all six trigonometric ratios.',
        details: ['sin theta, cos theta, tan theta', 'csc theta, sec theta, cot theta'],
      },
      { label: 'Run calculator drills that include mode checking, inverse functions, and sensible rounding.' },
      { label: 'Use short word problems involving height, distance, slope, and angle of elevation.' },
    ],
  },
  {
    unit: {
      heading: 'Trigonometry',
      topics: [{ label: '3.3 Graphing Trigonometric Functions' }],
    },
    outcomes: [
      {
        label: 'Sketch and interpret basic trigonometric graphs.',
        details: ['identify amplitude, period, intercepts, and turning points', 'compare degree and radian domains'],
      },
    ],
    activities: [
      { label: 'Plot key points for y = sin theta, y = cos theta, and y = tan theta from 0 degrees to 360 degrees.' },
      { label: 'Use sliders or graphing software to explore y = k sin theta and y = k cos theta.' },
      { label: 'Compare y = sin ktheta and y = cos ktheta to show how k affects the period.' },
      { label: 'Ask students to annotate where the graph reaches 1, 0, -1, and undefined values.' },
      { label: 'Include a quick exit task where students match equations to graph sketches.' },
    ],
  },
  {
    unit: {
      heading: 'Trigonometry',
      topics: [
        { label: '3.4 Trigonometric Equations' },
        {
          label: '3.5 Solution of Triangle',
          details: ['3.5.1 Sine Rule', '3.5.2 Cosine Rule', '3.5.3 Area of Triangle'],
        },
      ],
    },
    outcomes: [
      { label: 'Identify the sign of trigonometric ratios in all four quadrants.' },
      { label: 'Solve basic trigonometric equations over a stated interval.' },
      {
        label: 'Choose an appropriate rule to solve oblique triangles.',
        details: ['Sine Rule', 'Cosine Rule', 'area formula using two sides and the included angle'],
      },
      { label: 'Present complete solutions with correct units, diagrams, and final statements.' },
    ],
    activities: [
      { label: 'Use the CAST diagram to connect quadrants with positive and negative ratio values.' },
      { label: 'Highlight special graph values at 1, 0, -1, and undefined positions before solving equations.' },
      { label: 'Demonstrate how reference angles produce multiple answers in a fixed interval.' },
      { label: 'Sort triangle problems into right-angled and oblique cases before selecting a method.' },
      { label: 'Use paired practice: one student draws and labels the triangle, the other chooses the rule.' },
      { label: 'Close with mixed problems requiring students to justify the chosen formula.' },
    ],
  },
];

const renderList = (items: CurriculumItem[]) => (
  <ol className="space-y-4">
    {items.map((item, index) => (
      <li key={`${item.label}-${index}`} className="pl-1">
        <div className="flex gap-3">
          <span className="shrink-0 font-semibold text-slate-500">{index + 1}.</span>
          <div>
            <p>{item.label}</p>
            {item.details && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </li>
    ))}
  </ol>
);

const CurriculumOutline = () => (
  <div className="overflow-x-auto">
    <section className="min-w-[880px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl">
    <div className="grid grid-cols-[64px_minmax(180px,1fr)_minmax(240px,1.2fr)_minmax(260px,1.25fr)] bg-slate-300 text-center text-sm font-bold uppercase tracking-wide text-slate-900">
      <div className="border-r border-slate-500 p-4">No.</div>
      <div className="border-r border-slate-500 p-4">Unit</div>
      <div className="border-r border-slate-500 p-4">Unit Learning Outcomes</div>
      <div className="p-4">Suggested Teaching and Learning Activities</div>
    </div>

    <div className="divide-y divide-slate-300">
      {curriculumRows.map((row, index) => (
        <div
          key={`${row.unit.heading}-${index}`}
          className="grid grid-cols-[64px_minmax(180px,1fr)_minmax(240px,1.2fr)_minmax(260px,1.25fr)] text-sm leading-relaxed text-slate-900"
        >
          <div className="border-r border-slate-300 p-4 text-center font-semibold">{row.no}</div>
          <div className="border-r border-slate-300 p-4">
            <h2 className="font-bold">{row.unit.heading}</h2>
            {row.unit.codes && <p className="mt-1 text-slate-600">{row.unit.codes.join(' | ')}</p>}
            <div className="mt-8 space-y-8">
              {row.unit.topics.map((topic) => (
                <div key={topic.label}>
                  <p>{topic.label}</p>
                  {topic.details && (
                    <div className="mt-1 space-y-1 pl-6 text-slate-700">
                      {topic.details.map((detail) => (
                        <p key={detail}>{detail}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="border-r border-slate-300 p-4">{renderList(row.outcomes)}</div>
          <div className="p-4">{renderList(row.activities)}</div>
        </div>
      ))}
    </div>
    </section>
  </div>
);

export default CurriculumOutline;
