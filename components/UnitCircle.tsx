
import React, { useState } from 'react';

interface UnitCircleProps {
  solutions: number[];
  relevantQuadrants: number[];
  trigType: 'sin' | 'cos' | 'tan';
  value: number;
}

const UnitCircle: React.FC<UnitCircleProps> = ({ solutions, relevantQuadrants, trigType, value }) => {
  const radius = 120;
  const [hoveredSolutionIndex, setHoveredSolutionIndex] = useState<number | null>(null);

  const firstPositiveSolution = solutions.find(s => s >= 0);
  let refAngle: number | undefined;

  if (firstPositiveSolution !== undefined) {
      const normalized = ((firstPositiveSolution % 360) + 360) % 360;
      if (normalized <= 90) {
          refAngle = normalized;
      } else if (normalized <= 180) {
          refAngle = 180 - normalized;
      } else if (normalized <= 270) {
          refAngle = normalized - 180;
      } else {
          refAngle = 360 - normalized;
      }
  }

  const QuadrantHighlight: React.FC<{ quadrant: number }> = ({ quadrant }) => {
    const pathData = {
      1: `M 0 0 L ${radius} 0 A ${radius} ${radius} 0 0 1 0 -${radius} Z`,
      2: `M 0 0 L 0 -${radius} A ${radius} ${radius} 0 0 1 -${radius} 0 Z`,
      3: `M 0 0 L -${radius} 0 A ${radius} ${radius} 0 0 1 0 ${radius} Z`,
      4: `M 0 0 L 0 ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z`,
    };
    if (!relevantQuadrants.includes(quadrant)) return null;
    return <path d={pathData[quadrant as 1|2|3|4]} fill="#10b981" opacity="0.15" />;
  };

  const ValueLine = () => {
    if (isNaN(value) || (trigType !== 'tan' && (value > 1 || value < -1))) return null;

    if (trigType === 'sin') {
      const y = -value * radius;
      return <line x1={-radius} y1={y} x2={radius} y2={y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />;
    }
    if (trigType === 'cos') {
      const x = value * radius;
      return <line x1={x} y1={-radius} x2={x} y2={radius} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />;
    }
    if (trigType === 'tan') {
        const y = -value * radius;
        return (
            <g>
                <line x1={radius} y1={-150} x2={radius} y2={150} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                <circle cx={radius} cy={y} r="5" fill="#f59e0b" />
                <text x={radius + 8} y={y + 4} fontSize="12" fill="#c2410c" fontWeight="bold">tan(θ)={value.toFixed(2)}</text>
            </g>
        )
    }
    return null;
  };

  const FormulaLabel = ({
    x,
    y,
    title,
    formula,
    width,
  }: {
    x: number;
    y: number;
    title: string;
    formula: string;
    width: number;
  }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-width / 2} y="-21" width={width} height="46" rx="8" fill="#ffffff" stroke="#7c3aed" strokeWidth="1.5" />
      <text x="0" y="-4" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e293b">
        {title}
      </text>
      <text x="0" y="15" textAnchor="middle" fontSize="12" fontWeight="800" fill="#581c87">
        {formula}
      </text>
    </g>
  );

  return (
    <svg width="100%" height="300" viewBox="-160 -160 320 320">
      <defs>
        <filter id="tooltip-shadow" x="-0.5" y="-0.5" width="2" height="2">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
        <filter id="solution-glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="-158" y="-158" width="316" height="316" rx="18" fill="#ffffff" />

      {/* Quadrant Highlights */}
      {[1, 2, 3, 4].map(q => <QuadrantHighlight key={q} quadrant={q} />)}
      
      {/* Axes */}
      <line x1="-150" y1="0" x2="150" y2="0" stroke="#94a3b8" strokeWidth="1" />
      <line x1="0" y1="-150" x2="0" y2="150" stroke="#94a3b8" strokeWidth="1" />
      <text x="152" y="5" fill="#475569" fontSize="10">x</text>
      <text x="-12" y="-152" fill="#475569" fontSize="10">y</text>

      {/* Main Circle */}
      <circle cx="0" cy="0" r={radius} fill="none" stroke="#8b5cf6" strokeWidth="2" />

      {/* Value line */}
      <ValueLine />

      {/* Reference Angle */}
      {refAngle !== undefined && refAngle > 0.01 && (() => {
        const refAngleRad = (refAngle * Math.PI) / 180;
        const x = radius * Math.cos(refAngleRad);
        const y = -radius * Math.sin(refAngleRad);
        const arcRadius = 40;
        const arcX = arcRadius * Math.cos(refAngleRad);
        const arcY = -arcRadius * Math.sin(refAngleRad);
        const labelX = (arcRadius + 15) * Math.cos(refAngleRad / 2);
        const labelY = -(arcRadius + 15) * Math.sin(refAngleRad / 2);

        return (
            <g>
                <line x1="0" y1="0" x2={x} y2={y} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                <path d={`M ${arcRadius} 0 A ${arcRadius} ${arcRadius} 0 0 1 ${arcX} ${arcY}`} fill="none" stroke="#ef4444" strokeWidth="1" />
                <text x={labelX} y={labelY} fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">θ_ref</text>
            </g>
        );
      })()}

      {/* Quadrant Labels and Formulas */}
       <g className="quadrant-labels">
        <FormulaLabel x={92} y={-74} title="I (All)" formula="θ = θ_ref" width={108} />
        <FormulaLabel x={-92} y={-74} title="II (Sin)" formula="θ = 180° - θ_ref" width={144} />
        <FormulaLabel x={-92} y={82} title="III (Tan)" formula="θ = 180° + θ_ref" width={148} />
        <FormulaLabel x={92} y={82} title="IV (Cos)" formula="θ = 360° - θ_ref" width={148} />
      </g>


      {/* Solutions */}
      {solutions.map((sol, idx) => {
        const angleRad = (sol * Math.PI) / 180;
        if (isNaN(angleRad)) return null;
        
        const isHovered = hoveredSolutionIndex === idx;
        const x = radius * Math.cos(angleRad);
        const y = -radius * Math.sin(angleRad);
        const tooltipX = (radius + 10) * Math.cos(angleRad);
        const tooltipY = -(radius + 10) * Math.sin(angleRad);
        const textAnchor = (sol > 90 && sol < 270) ? 'end' : 'start';
        
        const baseColor = idx % 2 === 0 ? "#10b981" : "#06b6d4";
        const hoverColor = idx % 2 === 0 ? "#6ee7b7" : "#67e8f9";
        const color = isHovered ? hoverColor : baseColor;

        return (
          <g 
            key={idx} 
            className="cursor-pointer transition-opacity duration-200"
            onMouseEnter={() => setHoveredSolutionIndex(idx)}
            onMouseLeave={() => setHoveredSolutionIndex(null)}
          >
            <line x1="0" y1="0" x2={x} y2={y} stroke={color} strokeWidth={isHovered ? 7 : 3} style={{ transition: 'all 0.2s ease-out' }} />
            <circle cx={x} cy={y} r={isHovered ? 10 : 6} fill={color} stroke="white" strokeWidth="2" style={{ transition: 'all 0.2s ease-out' }} filter={isHovered ? 'url(#solution-glow)' : 'none'}/>
            <line x1="0" y1="0" x2={x} y2={y} stroke="transparent" strokeWidth="20" />
            
            {isHovered && (
                <g transform={`translate(${tooltipX}, ${tooltipY})`} pointerEvents="none" role="tooltip" className="transition-opacity duration-200 opacity-100">
                    <title>{sol.toFixed(1)}°, {angleRad.toFixed(2)} rad</title> {/* Accessibility */}
                    <rect
                        x={textAnchor === 'end' ? -105 : 5}
                        y="-22"
                        width="100"
                        height="40"
                        rx="5"
                        fill="#1e293b" // slate-800
                        filter="url(#tooltip-shadow)"
                    />
                    <text
                        fill="#f1f5f9" // slate-100
                        fontSize="12"
                        fontWeight="bold"
                        alignmentBaseline="middle"
                    >
                        <tspan x={textAnchor === 'end' ? -10 : 15} dy="-0.5em">{sol.toFixed(1)}°</tspan>
                        <tspan x={textAnchor === 'end' ? -10 : 15} dy="1.2em">{(angleRad.toFixed(2))} rad</tspan>
                    </text>
                </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default UnitCircle;
