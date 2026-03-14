import { Text } from '@react-three/drei';
import { PHASE_Z, PHASE_COLORS, PHASE_NAMES } from '@/constants/phaseConfig';

export function PhasePlanes() {
    return (
        <>
            {PHASE_Z.map((z, i) => (
                <group key={i} position={[0, 0, z]}>
                    <gridHelper 
                        args={[800, 20, PHASE_COLORS[i], `${PHASE_COLORS[i]}40`]}
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
