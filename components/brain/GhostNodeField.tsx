import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGhostPositions } from '@/hooks/useGhostPositions';

// Fixed NODE_TYPE_COLORS to map to our known types
const NODE_TYPE_COLORS: Record<string, string> = {
    project: '#FFB74D', // task=orange equivalent
    build: '#4FC3F7', // blue
    question: '#BA68C8', // purple
    skill: '#81C784', // skill=green
    survival: '#E57373', // survival=red
    log: '#FFF59D',
};

export function GhostNodeField() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const ghostPositions = useGhostPositions();

    const colorArray = useMemo(() => {
        const arr = new Float32Array(ghostPositions.length * 3);
        const color = new THREE.Color();
        ghostPositions.forEach((pos, i) => {
            color.set(NODE_TYPE_COLORS[pos.type] || '#ffffff');
            arr[i * 3] = color.r;
            arr[i * 3 + 1] = color.g;
            arr[i * 3 + 2] = color.b;
        });
        return arr;
    }, [ghostPositions]);

    useEffect(() => {
        if (!meshRef.current) return;
        const matrix = new THREE.Matrix4();

        ghostPositions.forEach((pos, i) => {
            matrix.setPosition(pos.x, pos.y, pos.z);
            meshRef.current!.setMatrixAt(i, matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        
        // Use generic setGeometry color attribute instead of setColorAt which has performance limits
        if (meshRef.current.geometry) {
            meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));
        }

    }, [ghostPositions, colorArray]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, ghostPositions.length]}
        >
            <sphereGeometry args={[2.5, 8, 8]}>
                <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
            </sphereGeometry>
            <meshBasicMaterial
                transparent
                opacity={0.18}
                vertexColors={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}
