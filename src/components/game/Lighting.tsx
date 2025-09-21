import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight } from 'three';

export function Lighting() {
  const spotLightRef = useRef<SpotLight>(null);
  const time = useRef(0);
  
  useFrame((state, delta) => {
    time.current += delta;
    
    // Flickering effect for dramatic atmosphere
    if (spotLightRef.current) {
      spotLightRef.current.intensity = 0.8 + Math.sin(time.current * 10) * 0.1;
    }
  });
  
  return (
    <>
      {/* Ambient light for basic visibility */}
      <ambientLight intensity={0.3} color="hsl(200, 20%, 50%)" />
      
      {/* Main directional light (moonlight) */}
      <directionalLight
        position={[10, 30, 10]}
        intensity={0.8}
        color="hsl(200, 50%, 70%)"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Red emergency lights */}
      <pointLight
        position={[-20, 5, -20]}
        intensity={0.5}
        color="hsl(0, 100%, 50%)"
        distance={30}
      />
      <pointLight
        position={[20, 5, 20]}
        intensity={0.5}
        color="hsl(0, 100%, 50%)"
        distance={30}
      />
      
      {/* Flickering spotlight for dramatic effect */}
      <spotLight
        ref={spotLightRef}
        position={[0, 30, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={0.8}
        color="hsl(60, 20%, 80%)"
        castShadow
      />
      
      {/* Fog for atmosphere */}
      <fog attach="fog" args={['hsl(0, 0%, 5%)', 20, 100]} />
    </>
  );
}