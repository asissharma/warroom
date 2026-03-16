import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { PHASE_Z, PHASE_COLORS, PHASE_NAMES } from '@/constants/phaseConfig';

// Darken a 6-digit hex color to simulate low-alpha grid lines
function dimColor(hex: string): string {
    const c = new THREE.Color(hex);
    c.multiplyScalar(0.25); // 25% brightness ≈ the old 40 alpha look
    return '#' + c.getHexString();
}

export function PhasePlanes() {
    // Pre-compute dim colors once
    const dimColors = useMemo(() => PHASE_COLORS.map(dimColor), []);

    return (
        <>
            {PHASE_Z.map((z, i) => (
                <group key={i} position={[0, 0, z]}>
                    <gridHelper 
                        args={[800, 20, PHASE_COLORS[i], dimColors[i]]}
                        rotation={[0, 0, 0]}
                        position={[0, -100, 0]}
                    />
                    <Text
                        position={[-380, -90, 0]}
                        color={PHASE_COLORS[i]}
                        fontSize={14}
                        anchorX="left"
                        anchorY="bottom"
                        fillOpacity={0.6}
                    >
                        {`PHASE ${i + 1} · ${PHASE_NAMES[i]}`}
                    </Text>
                </group>
            ))}
        </>
    );
}
