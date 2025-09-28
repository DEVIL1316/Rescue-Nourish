import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useGameStore } from '@/store/gameStore';

export function Map() {
  const safeZoneRef = useRef<Mesh>(null);
  const { safeZoneRadius, safeZoneCenter, gameStatus } = useGameStore();
  const pulseTime = useRef(0);
  
  useFrame((_, delta) => {
    if (!safeZoneRef.current || gameStatus !== 'playing') return;
    
    pulseTime.current += delta;
    const pulseFactor = Math.sin(pulseTime.current * 2) * 0.1 + 1;
    safeZoneRef.current.scale.set(pulseFactor, 1, pulseFactor);
  });
  
  return (
    <>
      {/* Ground plane at y = 0 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="hsl(120, 25%, 25%)" 
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      
      {/* Grid helper for better ground visibility */}
      <gridHelper args={[100, 50, 'hsl(0, 0%, 25%)', 'hsl(0, 0%, 15%)']} position={[0, 0.01, 0]} />
      
      {/* Safe zone indicator */}
      <mesh 
        ref={safeZoneRef}
        position={[safeZoneCenter.x, 0.01, safeZoneCenter.y]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[safeZoneRadius - 2, safeZoneRadius, 64]} />
        <meshBasicMaterial 
          color="hsl(200, 100%, 50%)" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Danger zone */}
      <mesh 
        position={[safeZoneCenter.x, 0.02, safeZoneCenter.y]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[safeZoneRadius, 200, 64]} />
        <meshBasicMaterial 
          color="hsl(0, 100%, 50%)" 
          transparent 
          opacity={0.2}
        />
      </mesh>
    </>
  );
}