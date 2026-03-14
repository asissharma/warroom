import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Sparkles } from '@react-three/drei';
import { useBrainGraph } from '@/hooks/useBrainGraph';
import { NODE_TYPE_COLORS } from '@/constants/phaseConfig';
import { useState } from 'react';
import { NodeDetailCard } from './NodeDetailCard';

function RealNode({ node }: { node: any }) {
    // In Phase D we display real nodes as glowing slightly larger spheres
    // The position is either their persisted canvasPosition or derived from their reference
    // For now we assume graph API merges ghost position directly if canvasPosition is empty
    const pos = node.canvasPosition || { x: node.x || 0, y: node.y || 0, z: node.z || 0 };
    const color = NODE_TYPE_COLORS[node.type] || '#ffffff';

    const [isActive, setIsActive] = useState(false);

    return (
        <group position={[pos.x, pos.y, pos.z]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
                <mesh 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsActive(!isActive);
                    }}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={(e) => {
                        document.body.style.cursor = 'auto';
                    }}
                >
                    <octahedronGeometry args={[4, 1]} />
                    <meshStandardMaterial 
                        color={color} 
                        emissive={color}
                        emissiveIntensity={isActive ? 1.0 : 0.8}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </mesh>
            </Float>
            
            {/* Phase E2 Polish: Sparkles around completed nodes */}
            <Sparkles count={15} scale={12} size={3} color={color} opacity={0.6} speed={0.8} />

            
            {isActive ? (
                <Html zIndexRange={[100, 0]}>
                    <NodeDetailCard node={node} onClose={() => setIsActive(false)} />
                </Html>
            ) : (
                /* HTML overlay text label above node when not active */
                <Html distanceFactor={400} position={[0, 10, 0]} center zIndexRange={[100, 0]}>
                    <div className={`px-2 py-0.5 rounded-full bg-black/80 border text-[10px] whitespace-nowrap backdrop-blur whitespace-pre ${
                        node.type === 'task' ? 'border-orange-500/50 text-orange-200' :
                        node.type === 'question' ? 'border-purple-500/50 text-purple-200' :
                        'border-blue-500/50 text-blue-200'
                    }`}>
                        {node.title}
                    </div>
                </Html>
            )}
        </group>
    );
}

export function RealNodeField() {
    const { nodes } = useBrainGraph();
    // Filter only real nodes
    const realNodes = nodes.filter(n => !n.isGhost);

    return (
        <group>
            {realNodes.map(n => (
                <RealNode key={n.id || n._id} node={n} />
            ))}
        </group>
    );
}
