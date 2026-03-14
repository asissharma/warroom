import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { PHASE_Z } from '@/constants/phaseConfig';

export function TimelineSpine() {
    // A single continuous line extending through Z
    const startObj = new THREE.Vector3(0, 0, PHASE_Z[0] - 200);
    const endObj = new THREE.Vector3(0, 0, PHASE_Z[PHASE_Z.length - 1] + 200);

    return (
        <group>
            <Line
                points={[startObj, endObj]}
                color="#ffffff"
                lineWidth={1.5}
                transparent
                opacity={0.3}
            />
        </group>
    );
}
