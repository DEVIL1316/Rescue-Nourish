import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '@/store/gameStore';

export function Player() {
  const meshRef = useRef<Mesh>(null);
  const { playerPosition, movePlayer, gameStatus } = useGameStore();
  const velocity = useRef(new Vector3(0, 0, 0));
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame((state, delta) => {
    if (!meshRef.current || gameStatus !== 'playing') return;
    
    const speed = 15;
    const moveVector = new Vector3(0, 0, 0);
    
    if (keys.current.w) moveVector.z -= 1;
    if (keys.current.s) moveVector.z += 1;
    if (keys.current.a) moveVector.x -= 1;
    if (keys.current.d) moveVector.x += 1;
    
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);
      const newPosition = {
        x: playerPosition.x + moveVector.x,
        y: 0,
        z: playerPosition.z + moveVector.z,
      };
      
      // Clamp to map bounds
      newPosition.x = Math.max(-95, Math.min(95, newPosition.x));
      newPosition.z = Math.max(-95, Math.min(95, newPosition.z));
      
      movePlayer(newPosition);
      meshRef.current.position.set(newPosition.x, newPosition.y + 0.5, newPosition.z);
    }
    
    // Update camera to follow player
    state.camera.position.x = playerPosition.x;
    state.camera.position.z = playerPosition.z + 25;
    state.camera.lookAt(playerPosition.x, 0, playerPosition.z);
  });
  
  return (
    <group position={[playerPosition.x, playerPosition.y, playerPosition.z]}>
      <mesh ref={meshRef} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="hsl(200, 60%, 40%)" emissive="hsl(200, 60%, 20%)" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Weapon */}
      <mesh position={[0.4, 0.5, -0.5]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="hsl(0, 0%, 20%)" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}