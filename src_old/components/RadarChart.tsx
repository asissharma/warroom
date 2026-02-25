interface RadarChartProps {
    breakdown: Record<string, number>;
}

export default function RadarChart({ breakdown }: RadarChartProps) {
    const categories = ['Backend', 'Core', 'Cognition', 'Leverage', 'Execution'];

    const vals = [
        breakdown['Backend System'] || 0,
        breakdown['Core Engineering'] || 0,
        breakdown['Basic Skills'] || 0,
        (breakdown['Soft Skills'] || 0) + (breakdown['High-Leverage Skill'] || 0) + (breakdown['payable_skill'] || 0) + (breakdown['General'] || 0),
        breakdown['Project Implementation'] || breakdown['project'] || breakdown['CLI & Automation'] || 0
    ];

    const maxVal = Math.max(...vals, 100);
    const radii = vals.map(v => (v / maxVal) * 80);

    const size = 260;
    const center = size / 2;
    const numPoints = 5;
    const angleStep = (Math.PI * 2) / numPoints;

    const points = radii.map((r, i) => {
        const angle = i * angleStep - (Math.PI / 2);
        const radius = r < 10 ? 10 : r;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        };
    });

    const pathStr = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="flex justify-center my-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Web Background */}
                {[1, 2, 3, 4].map(j => {
                    const r = (80 / 4) * j;
                    const pts = Array.from({ length: numPoints }).map((_, i) => {
                        const angle = i * angleStep - (Math.PI / 2);
                        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                    }).join(' ');
                    return <polygon key={`web-${j}`} points={pts} fill="none" stroke="var(--border-light)" strokeDasharray="2,2" strokeWidth="1" />;
                })}

                {/* Axes and Labels */}
                {Array.from({ length: numPoints }).map((_, i) => {
                    const angle = i * angleStep - (Math.PI / 2);
                    const xLine = center + 90 * Math.cos(angle);
                    const yLine = center + 90 * Math.sin(angle);
                    const xText = center + 110 * Math.cos(angle);
                    const yText = center + 110 * Math.sin(angle);

                    let align: "middle" | "start" | "end" = "middle";
                    if (Math.cos(angle) > 0.1) align = "start";
                    else if (Math.cos(angle) < -0.1) align = "end";

                    return (
                        <g key={`axis-${i}`}>
                            <line x1={center} y1={center} x2={xLine} y2={yLine} stroke="var(--border-light)" strokeWidth="1" />
                            <text x={xText} y={yText + 5} textAnchor={align} fill="var(--text-muted)" fontSize="0.65rem" fontFamily="var(--font-mono)" fontWeight="600">
                                {categories[i]}
                            </text>
                        </g>
                    );
                })}

                {/* Data Polygon */}
                <polygon
                    points={pathStr}
                    fill="rgba(162, 155, 254, 0.25)"
                    stroke="var(--accent-purple)"
                    strokeWidth="2"
                    className="transition-all duration-500 ease-in-out"
                />

                {/* Data Markers */}
                {points.map((p, i) => (
                    <circle key={`marker-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--surface-color)" stroke="var(--accent-purple)" strokeWidth="2" />
                ))}
            </svg>
        </div>
    );
}
