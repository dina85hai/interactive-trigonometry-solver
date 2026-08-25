import React from 'react';

interface TrigGraphProps {
  funcType: 'sin' | 'cos' | 'tan';
  angle: number;
  value: number;
  color: string;
  title: string;
}

const TrigGraph: React.FC<TrigGraphProps> = ({ funcType, angle, value, color, title }) => {
  const getPathData = () => {
    switch (funcType) {
      case 'sin':
        return Array.from({ length: 361 }, (_, i) => `L ${30 + (i / 360) * 310} ${100 - Math.sin((i * Math.PI) / 180) * 80}`).join(' ').replace('L', 'M');
      case 'cos':
        return Array.from({ length: 361 }, (_, i) => `L ${30 + (i / 360) * 310} ${100 - Math.cos((i * Math.PI) / 180) * 80}`).join(' ').replace('L', 'M');
      case 'tan':
        return [0, 180].map((offset) => 
            Array.from({ length: 170 }, (_, i) => { 
                const deg = offset + i + 5; 
                if (deg === 90 || deg === 270) return ''; 
                const x = 30 + (deg / 360) * 310; 
                const tanVal = Math.tan((deg * Math.PI) / 180); 
                const clampedTan = Math.max(-3, Math.min(3, tanVal)); 
                const y = 100 - clampedTan * 26; 
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`; 
            }).join(' ')
        ).join(' ');
      default:
        return '';
    }
  };

  const getCircleY = () => {
      if (funcType === 'tan') {
          return 100 - Math.max(-3, Math.min(3, value)) * 26;
      }
      return 100 - value * 80;
  };

  return (
    <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-white/20 w-full">
      <h4 className="font-semibold text-slate-700 mb-2 text-sm flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
        {title}
      </h4>
      <svg width="100%" height="200" viewBox="0 0 360 200">
        <rect x="0" y="0" width="360" height="200" fill="transparent" />
        <line x1="30" y1="100" x2="340" y2="100" stroke="#64748b" strokeWidth="1" />
        <line x1="30" y1="20" x2="340" y2="20" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="30" y1="180" x2="340" y2="180" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="30" y1="20" x2="30" y2="180" stroke="#475569" strokeWidth="1.5" />

        <text x="345" y="105" fontSize="10" fill="#475569">θ</text>
        <text x="10" y="25" fontSize="10" fill="#475569">1</text>
        <text x="5" y="185" fontSize="10" fill="#475569">-1</text>
        
        {funcType === 'tan' && (
            <>
                <line x1={30 + (90 / 360) * 310} y1="20" x2={30 + (90 / 360) * 310} y2="180" stroke={color} strokeWidth="1" strokeDasharray="4,2" opacity="0.3" />
                <line x1={30 + (270 / 360) * 310} y1="20" x2={30 + (270 / 360) * 310} y2="180" stroke={color} strokeWidth="1" strokeDasharray="4,2" opacity="0.3" />
            </>
        )}

        <path d={getPathData()} fill="none" stroke={color} strokeWidth="2.5" />
        
        <line x1={30 + (angle / 360) * 310} y1="20" x2={30 + (angle / 360) * 310} y2="180" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
        
        {!(funcType === 'tan' && Math.abs(value) > 10) && (
            <circle cx={30 + (angle / 360) * 310} cy={getCircleY()} r="4" fill={color} stroke="white" strokeWidth="1.5" />
        )}
      </svg>
      <div className="mt-4 w-full text-center">
          <div className={`px-3 py-1 rounded-lg text-sm font-bold inline-block ${value >= 0 ? 'bg-green-400/30 text-green-900' : 'bg-red-400/30 text-red-900'}`}>
              {funcType}({angle.toFixed(0)}°) = {funcType === 'tan' && Math.abs(value) > 100 ? '∞' : value.toFixed(3)}
          </div>
      </div>
    </div>
  );
};

export default TrigGraph;