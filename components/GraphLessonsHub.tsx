import React, { useState } from 'react';
import GraphingTrigFunctions from './GraphingTrigFunctions';
import OriginalGraphLessons from './OriginalGraphLessons';

type GraphLessonTab = 'tool' | 'lessons';

const graphLessonTabs: Array<{ key: GraphLessonTab; label: string }> = [
  { key: 'tool', label: 'Graphing Tool' },
  { key: 'lessons', label: 'Lesson Module' },
];

const GraphLessonsHub = () => {
  const [activeTab, setActiveTab] = useState<GraphLessonTab>('tool');

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Graph Lessons</h2>
            <p className="mt-1 text-slate-700">
              Use the graphing tool, then move through the lesson steps for sine, cosine, and tangent graphs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 text-sm font-bold">
            {graphLessonTabs.map((tab) => (
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
      </div>

      {activeTab === 'tool' && <GraphingTrigFunctions />}
      {activeTab === 'lessons' && <OriginalGraphLessons />}
    </section>
  );
};

export default GraphLessonsHub;
