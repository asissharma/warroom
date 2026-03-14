'use client';

import { useThree, Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GhostNodeField } from './GhostNodeField';
import { RealNodeField } from './RealNodeField';
import { PhasePlanes } from './PhasePlanes';
import { TimelineSpine } from './TimelineSpine';
import { PHASE_Z } from '@/constants/phaseConfig';

// Keyboard state for continuous WASD movement
const keys = { w: false, a: false, s: false, d: false };
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase() as keyof typeof keys] = true;
    });
    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase() as keyof typeof keys] = false;
    });
}

// Camera Rig to handle flying to phases smoothly + WASD
function CameraRig({ targetZ }: { targetZ: number | null }) {
    const { camera } = useThree();
    
    useFrame((state, delta) => {
        // Phase jump (1-8 Keys)
        if (targetZ !== null) {
            // Lerp camera position Z to (targetZ + 300) so we look AT the phase from a distance
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + 300, 4 * delta);
            // Lerp camera Y as well to look slightly down
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 100, 4 * delta);
        }

        // WASD Free Move (moves relative to camera looking direction)
        const moveSpeed = 400 * delta;
        const dir = new THREE.Vector3();
        const sideDir = new THREE.Vector3();

        camera.getWorldDirection(dir);
        dir.y = 0; // Lock to horizontal plane for easier navigating
        dir.normalize();
        sideDir.crossVectors(camera.up, dir).normalize();

        if (keys.w) camera.position.addScaledVector(dir, moveSpeed);
        if (keys.s) camera.position.addScaledVector(dir, -moveSpeed);
        if (keys.a) camera.position.addScaledVector(sideDir, moveSpeed); // Notice sideDir is inverted depending on cross product order, usually standard is okay.
        if (keys.d) camera.position.addScaledVector(sideDir, -moveSpeed);
    });

    return <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        minDistance={50} 
        maxDistance={3000} 
        target={[0, 0, targetZ !== null ? targetZ : 0]} 
    />;
}

export function DepthCanvas({ active }: { active: boolean }) {
    const [targetZ, setTargetZ] = useState<number | null>(0);

    useEffect(() => {
        if (!active) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '1' && e.key <= '8') {
                const phaseIndex = parseInt(e.key) - 1;
                if (phaseIndex >= 0 && phaseIndex < 8) {
                    setTargetZ(PHASE_Z[phaseIndex]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active]);

    if (!active) return null;

    return (
        <div className="absolute inset-0 z-40 bg-[#000814]">
            <Canvas
                camera={{ position: [0, 200, 600], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: '#000814' }}
            >
                {/* Distance Fog helps give depth perception */}
                <fog attach="fog" args={['#000814', 400, 2200]} />
                <ambientLight intensity={0.15} />
                <pointLight position={[0, 0, 0]} intensity={1.5} color="#4FC3F7" />

                <Stars radius={100} depth={500} count={2000} factor={4} saturation={0} fade speed={1} />
                
                <CameraRig targetZ={targetZ} />

                {/* Environment and Architecture */}
                <PhasePlanes />
                <TimelineSpine />
                
                {/* Nodes Fields */}
                <GhostNodeField />
                <RealNodeField />
            </Canvas>

            {/* UI Overlay for HUD / 3D instructions */}
            <div className="absolute top-8 left-8 text-muted pointer-events-none flex flex-col gap-1">
                <div className="text-xl font-bold tracking-widest text-white/50">DEPTH MODE</div>
                <div className="text-xs font-mono opacity-50">Z-AXIS = TIME | X = DOMAIN | Y = DAY</div>
                
                {/* Desktop Instructions */}
                <div className="hidden md:block">
                    <div className="mt-4 text-xs font-mono text-accent">KEY [1-8] - Fly to Phase</div>
                    <div className="text-xs font-mono text-accent">W A S D - Move | SCROLL - Zoom | DRAG - Orbit</div>
                </div>

                {/* Mobile Fallback Instruction */}
                <div className="md:hidden mt-4 text-xs font-mono text-orange-400 opacity-80 max-w-[200px] leading-tight">
                    * Interactive depth exploration is optimized for desktop. Return to Work Mode for full mobile functionality.
                </div>
            </div>
        </div>
    );
}

// Fallback export since brain host lazy loads the default export
export default DepthCanvas;
