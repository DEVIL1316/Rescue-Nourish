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
    
    // Update camera to follow player from a better angle
    state.camera.position.x = playerPosition.x;
    state.camera.position.y = 30;
    state.camera.position.z = playerPosition.z + 30;
    state.camera.lookAt(playerPosition.x, 0, playerPosition.z);
  });
  
  return (
    <group position={[playerPosition.x, playerPosition.y, playerPosition.z]}>
      {/* Player Body */}
      <group>
        {/* Torso */}
        <mesh castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
          <meshStandardMaterial color="hsl(120, 20%, 25%)" />
        </mesh>
        
        {/* Head */}
        <mesh castShadow position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="hsl(30, 40%, 70%)" />
        </mesh>
        
        {/* Helmet */}
        <mesh castShadow position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="hsl(120, 10%, 20%)" metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Left Arm */}
        <mesh castShadow position={[-0.4, 1.1, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color="hsl(120, 20%, 25%)" />
        </mesh>
        
        {/* Right Arm holding weapon */}
        <mesh castShadow position={[0.4, 1.1, -0.2]} rotation={[-0.5, 0, -0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color="hsl(120, 20%, 25%)" />
        </mesh>
        
        {/* Left Leg */}
        <mesh castShadow position={[-0.15, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.8]} />
          <meshStandardMaterial color="hsl(120, 10%, 15%)" />
        </mesh>
        
        {/* Right Leg */}
        <mesh castShadow position={[0.15, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.8]} />
          <meshStandardMaterial color="hsl(120, 10%, 15%)" />
        </mesh>
        
        {/* Boots */}
        <mesh castShadow position={[-0.15, 0, 0.05]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 10%)" />
        </mesh>
        <mesh castShadow position={[0.15, 0, 0.05]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 10%)" />
        </mesh>
        
        {/* Tactical Vest */}
        <mesh castShadow position={[0, 1.2, 0.18]}>
          <boxGeometry args={[0.5, 0.6, 0.1]} />
          <meshStandardMaterial color="hsl(0, 0%, 15%)" metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Backpack */}
        <mesh castShadow position={[0, 1.2, -0.25]}>
          <boxGeometry args={[0.4, 0.5, 0.2]} />
          <meshStandardMaterial color="hsl(120, 10%, 18%)" />
        </mesh>
      </group>
      
      {/* Weapon - Assault Rifle */}
      <group position={[0.35, 1.0, -0.4]} rotation={[0, 0, -0.2]}>
        {/* Gun Body */}
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.15, 0.8]} />
          <meshStandardMaterial color="hsl(0, 0%, 10%)" metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Gun Barrel */}
        <mesh castShadow position={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="hsl(0, 0%, 5%)" metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* Magazine */}
        <mesh castShadow position={[0, -0.1, 0.1]}>
          <boxGeometry args={[0.04, 0.15, 0.08]} />
          <meshStandardMaterial color="hsl(0, 0%, 15%)" metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* Scope */}
        <mesh castShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.15]} />
          <meshStandardMaterial color="hsl(0, 0%, 8%)" metalness={0.6} roughness={0.3} />
        </mesh>
        
        {/* Muzzle Flash (when shooting) */}
        {Math.random() > 0.95 && (
          <mesh position={[0, 0, -0.65]}>
            <coneGeometry args={[0.15, 0.3, 6]} />
            <meshBasicMaterial color="hsl(38, 100%, 70%)" transparent opacity={0.8} />
          </mesh>
        )}
      </group>
    </group>
  );
}