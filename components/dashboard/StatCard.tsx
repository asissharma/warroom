export default function StatCard({ label, value, color, subtitle }: any) {
    const colorMap: any = {
        accent: 'text-accent border-accent/20 bg-accent/5',
        success: 'text-success border-success/20 bg-success/5',
        acid: 'text-acid border-acid/20 bg-acid/5',
        warning: 'text-warning border-warning/20 bg-warning/5',
    };
    const c = colorMap[color] || 'text-text border-white/10 bg-white/5';
    return (
        <div className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center ${c}`}>
            <div className="font-bebas text-[32px] md:text-[40px] leading-none mb-1">{value}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider opacity-80">{label}</div>
            {subtitle && <div className="font-mono text-[8px] opacity-50 mt-1">{subtitle}</div>}
        </div>
    );
}
