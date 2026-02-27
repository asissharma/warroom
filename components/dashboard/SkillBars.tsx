import { useEffect, useState } from 'react';

export default function SkillBars() {
    const [skills, setSkills] = useState<any>(null);

    useEffect(() => {
        fetch('/api/skill')
            .then(r => r.json())
            .then(data => setSkills(data))
            .catch(e => console.error(e));
    }, []);

    if (!skills) return <div className="animate-pulse h-32 bg-surface2 rounded" />;

    const keys = [
        { key: 'python_algo_oop', label: 'Python & Algo' },
        { key: 'databases_concurrency', label: 'DB & Scalability' },
        { key: 'js_node_security', label: 'JS & Security' },
        { key: 'ml_ai_mlops', label: 'ML & AI' },
        { key: 'build_output', label: 'Build Execution' }
    ];

    return (
        <div className="space-y-5">
            {keys.map((k, i) => {
                const s = skills[k.key] || { value: 0, level: 1 };
                return (
                    <div key={i}>
                        <div className="flex justify-between items-end mb-2">
                            <div className="font-mono text-[11px] text-text uppercase tracking-wider">{k.label}</div>
                            <div className="font-mono text-[10px] text-accent">LVL {s.level}</div>
                        </div>
                        <div className="h-[3px] bg-surface2 rounded-full overflow-hidden">
                            <div className="h-full bg-accent a-transition" style={{ width: `${s.value}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
