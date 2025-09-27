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
      {/* Ground - expanded to match larger play area */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[800, 1, 800]} />
        <meshStandardMaterial 
          color="hsl(0, 0%, 8%)" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
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
      
      {/* Obstacles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 30 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const height = 2 + Math.random() * 4;
        
        return (
          <mesh 
            key={`obstacle-${i}`}
            position={[x, height / 2, z]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[2 + Math.random() * 2, height, 2 + Math.random() * 2]} />
            <meshStandardMaterial 
              color="hsl(0, 0%, 15%)"
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>
        );
      })}
      
      {/* Ammo/Health pickups */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 60;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const isHealth = Math.random() > 0.5;
        
        return (
          <mesh 
            key={`pickup-${i}`}
            position={[x, 0.5, z]}
          >
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial 
              color={isHealth ? 'hsl(0, 72%, 45%)' : 'hsl(38, 92%, 50%)'}
              emissive={isHealth ? 'hsl(0, 72%, 45%)' : 'hsl(38, 92%, 50%)'}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}
    </>
  );
}