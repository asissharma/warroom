'use client';
export default function CourseCard({ course }: { course: any }) {
    return (
        <a href={course.url} target="_blank" rel="noreferrer" className="block bg-surface border border-border hover:border-accent/50 p-3 rounded-lg transition-colors group">
            <div className="font-mono text-[9px] text-accent mb-1 uppercase tracking-wider">{course.area}</div>
            <div className="font-semibold text-[13px] text-text group-hover:text-white mb-2 leading-tight">{course.name}</div>
            <div className="font-mono text-[10px] text-muted2">{course.provider}</div>
        </a>
    )
}
