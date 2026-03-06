import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react'

export default function ConnectionEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps) {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const isStrong = data?.strength === 'strong';

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={{
                    strokeWidth: isStrong ? 2 : 1,
                    stroke: isStrong ? 'rgba(74, 222, 128, 0.4)' : 'rgba(100, 116, 139, 0.2)', // Using accent color for strong
                    strokeDasharray: isStrong ? 'none' : '5, 5'
                }}
            />
            {/* Optional label rendering can go here if needed in the future */}
        </>
    );
}
