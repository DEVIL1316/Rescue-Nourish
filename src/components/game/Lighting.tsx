import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

export function Lighting() {
  const time = useRef(0);
  const playerPosition = useGameStore((state) => state.playerPosition);
  
  useFrame((state, delta) => {
    time.current += delta;
  });
  
  return (
    <>
      {/* Ambient daylight for natural outdoor lighting */}
      <ambientLight intensity={0.6} color="hsl(45, 70%, 80%)" />
      
      {/* Main sunlight */}
      <directionalLight
        position={[20, 40, 20]}
        intensity={1.2}
        color="hsl(50, 80%, 95%)"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Secondary light for shadows */}
      <directionalLight
        position={[-15, 25, -10]}
        intensity={0.4}
        color="hsl(200, 30%, 85%)"
      />
      
      {/* Player flashlight */}
      <group position={[playerPosition.x, playerPosition.y + 2, playerPosition.z]}>
        <spotLight
          angle={0.4}
          penumbra={0.3}
          intensity={0.5}
          distance={30}
          color="hsl(55, 70%, 95%)"
          castShadow
        />
      </group>
      
      {/* Fog for depth */}
      <fog attach="fog" args={['hsl(200, 30%, 70%)', 50, 200]} />
    </>
  );
}