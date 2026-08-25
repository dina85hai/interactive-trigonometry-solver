import React, { PropsWithChildren, useMemo, useState } from 'react';

type TrigFunction = 'sin' | 'cos' | 'tan';

type GraphProps = {
  func: TrigFunction;
  amplitude: number;
  periodK: number;
};

type Lesson = {
  title: string;
  content: React.ReactNode;
};

const width = 640;
const height = 260;
const padding = 42;
const centerY = height / 2;
const plotWidth = width - padding * 2;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const xFromAngle = (angle: number) => padding + (angle / 360) * plotWidth;

const yFromValue = (value: number, func: TrigFunction, amplitude: number) => {
  const scale = func === 'tan' ? 22 : 34;
  const limitedValue = func === 'tan' ? Math.max(-5, Math.min(5, value)) : value;
  const y = centerY - limitedValue * scale;
  const maxY = height - padding + 8;
  const minY = padding - 8;
  return Math.max(minY, Math.min(maxY, y));
};

const getTrigValue = (func: TrigFunction, angle: number) => {
  if (func === 'sin') return Math.sin(toRadians(angle));
  if (func === 'cos') return Math.cos(toRadians(angle));
  return Math.tan(toRadians(angle));
};

const buildPath = (func: TrigFunction, amplitude: number, periodK: number) => {
  if (func !== 'tan') {
    return Array.from({ length: 361 }, (_, angle) => {
      const value = amplitude * getTrigValue(func, periodK * angle);
      return `${angle === 0 ? 'M' : 'L'} ${xFromAngle(angle)} ${yFromValue(value, func, amplitude)}`;
    }).join(' ');
  }

  const segments: string[] = [];
  let currentSegment = '';

  for (let angle = 0; angle <= 360; angle += 1) {
    const cosine = Math.cos(toRadians(periodK * angle));
    const value = amplitude * Math.tan(toRadians(periodK * angle));

    if (Math.abs(cosine) < 0.035 || Math.abs(value) > 8) {
      if (currentSegment) segments.push(currentSegment);
      currentSegment = '';
      continue;
    }

    const command = currentSegment ? 'L' : 'M';
    currentSegment += `${command} ${xFromAngle(angle)} ${yFromValue(value, func, amplitude)} `;
  }

  if (currentSegment) segments.push(currentSegment);
  return segments.join(' ');
};

const MiniGraph = ({ func, amplitude, periodK }: GraphProps) => {
  const path = useMemo(() => buildPath(func, amplitude, periodK), [amplitude, func, periodK]);
  const maxLabel = func === 'tan' ? '5' : String(Math.abs(amplitude));
  const minLabel = func === 'tan' ? '-5' : String(-Math.abs(amplitude));

  return (
    <svg className="mt-4 w-full rounded-lg border border-slate-200 bg-white" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Graph of y = ${amplitude}${func}(${periodK} theta)`}>
      <rect width={width} height={height} fill="#ffffff" />
      {[0, 90, 180, 270, 360].map((tick) => (
        <g key={tick}>
          <line x1={xFromAngle(tick)} y1={padding - 8} x2={xFromAngle(tick)} y2={height - padding + 8} stroke="#e2e8f0" />
          <text x={xFromAngle(tick)} y={height - 16} textAnchor="middle" fontSize="12" fill="#475569">
            {tick}°
          </text>
        </g>
      ))}
      <line x1={padding} y1={centerY} x2={width - padding} y2={centerY} stroke="#64748b" strokeWidth="1.5" />
      <line x1={padding} y1={padding - 8} x2={padding} y2={height - padding + 8} stroke="#64748b" strokeWidth="1.5" />
      <text x="18" y={padding + 4} fontSize="12" fill="#64748b">{maxLabel}</text>
      <text x="16" y={height - padding + 4} fontSize="12" fill="#64748b">{minLabel}</text>
      {func === 'tan' &&
        Array.from({ length: Math.ceil(periodK * 2) + 3 }, (_, index) => (90 + index * 180) / periodK)
          .filter((asymptote) => asymptote >= 0 && asymptote <= 360)
          .map((asymptote) => (
            <line key={asymptote} x1={xFromAngle(asymptote)} y1={padding - 8} x2={xFromAngle(asymptote)} y2={height - padding + 8} stroke="#ef4444" strokeDasharray="6,5" opacity="0.7" />
          ))}
      <path d={path} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

const Reveal = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between p-4 text-left font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <span>{title}</span>
        <span className="text-xl">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="border-t border-slate-200 p-4 text-slate-700">{children}</div>}
    </div>
  );
};

const lessons: Lesson[] = [
  {
    title: 'Selamat Datang!',
    content: (
      <div className="space-y-4">
        <p className="text-2xl font-bold text-teal-700">Jom Jadi Pakar Graf Trigonometri!</p>
        <p>Modul asal ini menerangkan graf sine, cosine, dan tangent secara langkah demi langkah.</p>
        <p>Fokus utama: bentuk graf asas, amplitude, period, gabungan amplitude dan period, serta latihan lakaran.</p>
      </div>
    ),
  },
  {
    title: 'Bahagian 1: Kenali Graf Asas',
    content: (
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-xl font-bold text-sky-700">y = sin θ</h3>
          <p>Graf sine bermula dari 0, naik ke 1 pada 90°, turun ke 0 pada 180°, ke -1 pada 270°, dan kembali ke 0 pada 360°.</p>
          <MiniGraph func="sin" amplitude={1} periodK={1} />
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-xl font-bold text-sky-700">y = cos θ</h3>
          <p>Graf cosine bermula dari 1 pada 0°, turun ke 0 pada 90°, ke -1 pada 180°, naik ke 0 pada 270°, dan kembali ke 1 pada 360°.</p>
          <MiniGraph func="cos" amplitude={1} periodK={1} />
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-xl font-bold text-sky-700">y = tan θ</h3>
          <p>Graf tangent berulang setiap 180° dan mempunyai asymptote pada 90° dan 270°.</p>
          <MiniGraph func="tan" amplitude={1} periodK={1} />
        </section>
        <Reveal title="Soalan Pantas">
          <p>Nilai maksimum dan minimum bagi y = sin θ dan y = cos θ ialah 1 dan -1. Satu kitaran lengkap berlaku dalam 360°.</p>
        </Reveal>
      </div>
    ),
  },
  {
    title: 'Bahagian 2: Konsep Amplitude',
    content: (
      <div className="space-y-5">
        <p className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-4">Amplitude menentukan ketinggian maksimum dan kedalaman minimum graf dari paksi-x. Amplitude = |k|.</p>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-xl font-bold text-amber-700">Contoh: y = 2 sin θ</h3>
          <p>Nilai maksimum menjadi 2 dan nilai minimum menjadi -2. Bentuk asas sine masih sama.</p>
          <MiniGraph func="sin" amplitude={2} periodK={1} />
        </section>
        <Reveal title="Cabaran Mini: y = -3 cos θ">
          <p>Amplitude ialah 3, tetapi tanda negatif menyebabkan graf terbalik.</p>
          <MiniGraph func="cos" amplitude={-3} periodK={1} />
        </Reveal>
      </div>
    ),
  },
  {
    title: 'Bahagian 3: Konsep Period',
    content: (
      <div className="space-y-5">
        <p>Untuk graf berbentuk y = sin kθ atau y = cos kθ, nilai k mengubah kelebaran graf.</p>
        <p className="rounded-lg border-l-4 border-sky-500 bg-sky-50 p-4 text-center font-mono text-lg font-bold">Period baru = 360° / k</p>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-xl font-bold text-purple-700">Contoh: y = sin 2θ</h3>
          <p>Period satu kitaran ialah 180°, jadi ada dua kitaran lengkap antara 0° hingga 360°.</p>
          <MiniGraph func="sin" amplitude={1} periodK={2} />
        </section>
        <Reveal title="Cabaran Mini: period untuk y = cos (1/2)θ">
          <p>Period = 360° / 1/2 = 720°. Dalam 360°, hanya separuh kitaran kelihatan.</p>
          <MiniGraph func="cos" amplitude={1} periodK={0.5} />
        </Reveal>
      </div>
    ),
  },
  {
    title: 'Bahagian 4: Amplitude + Period',
    content: (
      <div className="space-y-5">
        <p className="text-center text-2xl font-bold text-red-600">Lakar y = 3 sin 2θ</p>
        <ol className="list-decimal space-y-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-5 pl-8">
          <li>Graf asas ialah sine.</li>
          <li>Amplitude ialah 3, jadi maksimum 3 dan minimum -3.</li>
          <li>Period ialah 360° / 2 = 180°.</li>
          <li>Lakar dua kitaran lengkap dari 0° hingga 360°.</li>
        </ol>
        <MiniGraph func="sin" amplitude={3} periodK={2} />
      </div>
    ),
  },
  {
    title: 'Bahagian 5: Cabaran Terakhir',
    content: (
      <div className="space-y-5">
        <p className="text-center text-2xl font-bold text-indigo-700">Lakar y = -2 sin 3θ untuk 0° ≤ θ ≤ 360°.</p>
        <Reveal title="Semak jawapan dan lakaran">
          <ul className="list-disc space-y-1 pl-5">
            <li>Graf asas: sine</li>
            <li>Amplitude: |-2| = 2</li>
            <li>Period: 360° / 3 = 120°</li>
            <li>Bilangan kitaran: 3</li>
            <li>Graf terbalik kerana tanda negatif.</li>
          </ul>
          <MiniGraph func="sin" amplitude={-2} periodK={3} />
        </Reveal>
      </div>
    ),
  },
];

const OriginalGraphLessons = () => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const lesson = lessons[currentLesson];
  const progress = ((currentLesson + 1) / lessons.length) * 100;

  return (
    <section className="rounded-2xl bg-slate-50 p-4 shadow-xl sm:p-8">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-700">
          Jom Jadi Pakar Graf Trigonometri
        </h2>
        <p className="mt-2 text-slate-600">Original graph lesson app, now included inside the main app.</p>
      </header>

      <div className="mb-6">
        <div className="h-2.5 rounded-full bg-slate-200">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-slate-600">Langkah {currentLesson + 1} daripada {lessons.length}</p>
      </div>

      <main className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <h3 className="mb-5 border-b-2 border-teal-200 pb-3 text-2xl font-bold text-slate-800">{lesson.title}</h3>
        <div className="text-slate-700">{lesson.content}</div>
      </main>

      <footer className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentLesson((step) => Math.max(0, step - 1))}
          disabled={currentLesson === 0}
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sebelum
        </button>
        <button
          type="button"
          onClick={() => setCurrentLesson((step) => Math.min(lessons.length - 1, step + 1))}
          disabled={currentLesson === lessons.length - 1}
          className="rounded-lg bg-teal-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Seterusnya
        </button>
      </footer>
    </section>
  );
};

export default OriginalGraphLessons;
