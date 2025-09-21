import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Zombie as ZombieType } from '@/store/gameStore';

interface ZombieProps {
  zombie: ZombieType;
}

export function Zombie({ zombie }: ZombieProps) {
  const meshRef = useRef<Mesh>(null);
  const animationTime = useRef(Math.random() * Math.PI * 2);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    animationTime.current += delta * 2;
    
    // Zombie walking animation
    meshRef.current.rotation.z = Math.sin(animationTime.current) * 0.1;
    meshRef.current.position.y = Math.abs(Math.sin(animationTime.current * 2)) * 0.2;
  });
  
  const getZombieColor = () => {
    switch (zombie.type) {
      case 'runner':
        return 'hsl(0, 50%, 30%)';
      case 'tank':
        return 'hsl(90, 20%, 25%)';
      default:
        return 'hsl(90, 30%, 25%)';
    }
  };
  
  const getZombieScale = (): [number, number, number] => {
    switch (zombie.type) {
      case 'tank':
        return [1.5, 1.5, 1.5];
      case 'runner':
        return [0.8, 0.8, 0.8];
      default:
        return [1, 1, 1];
    }
  };
  
  return (
    <group position={[zombie.position.x, zombie.position.y, zombie.position.z]}>
      <mesh ref={meshRef} castShadow receiveShadow scale={getZombieScale()}>
        {/* Body */}
        <boxGeometry args={[0.8, 1.6, 0.4]} />
        <meshStandardMaterial 
          color={getZombieColor()} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial 
          color={getZombieColor()}
          emissive="hsl(0, 100%, 20%)"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, 0.3, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={getZombieColor()} />
      </mesh>
      <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={getZombieColor()} />
      </mesh>
      
      {/* Health bar */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshBasicMaterial color="hsl(0, 0%, 10%)" />
      </mesh>
      <mesh position={[-0.75 + (zombie.health / 100) * 0.75, 2.5, 0.01]}>
        <planeGeometry args={[(zombie.health / 100) * 1.5, 0.15]} />
        <meshBasicMaterial color="hsl(0, 72%, 45%)" />
      </mesh>
    </group>
  );
}