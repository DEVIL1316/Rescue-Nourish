import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, Group, TextureLoader } from 'three';
import { Zombie as ZombieType } from '@/store/gameStore';
import zombieNormalTexture from '@/assets/zombie-normal.png';
import zombieRunnerTexture from '@/assets/zombie-runner.png';
import zombieTankTexture from '@/assets/zombie-tank.png';

interface ZombieProps {
  zombie: ZombieType;
}

export function Zombie({ zombie }: ZombieProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const animationTime = useRef(Math.random() * Math.PI * 2);
  
  // Load textures based on zombie type
  const textureMap = {
    normal: zombieNormalTexture,
    walker: zombieNormalTexture, // Walker uses normal texture
    runner: zombieRunnerTexture,
    tank: zombieTankTexture
  };
  
  const texture = useLoader(TextureLoader, textureMap[zombie.type as keyof typeof textureMap]);
  
  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return;
    
    animationTime.current += delta * (zombie.type === 'runner' ? 3 : 2);
    
    // Walking animation
    meshRef.current.rotation.x = Math.sin(animationTime.current) * 0.1;
    meshRef.current.rotation.z = Math.sin(animationTime.current * 0.5) * 0.05;
    
    // Body sway
    groupRef.current.position.y = Math.abs(Math.sin(animationTime.current * 2)) * 0.1;
  });
  
  const getZombieScale = (): [number, number, number] => {
    switch (zombie.type) {
      case 'tank':
        return [1.5, 2.0, 1.5];
      case 'runner':
        return [0.8, 0.8, 0.8];
      default:
        return [1, 1, 1];
    }
  };
  
  const getZombieColor = () => {
    switch (zombie.type) {
      case 'tank':
        return "hsl(120, 40%, 30%)";
      case 'runner':
        return "hsl(0, 60%, 40%)";
      default:
        return "hsl(90, 30%, 40%)";
    }
  };
  
  const scale = getZombieScale();
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y, zombie.position.z]}
      scale={scale}
    >
      {/* Main body with texture */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1.5, 0.5]} />
        <meshStandardMaterial 
          map={texture}
          color={getZombieColor()}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={getZombieColor()}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      
      {/* Eyes - glowing effect */}
      <mesh position={[-0.1, 1.05, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={zombie.type === 'runner' ? "orange" : "red"} />
      </mesh>
      <mesh position={[0.1, 1.05, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={zombie.type === 'runner' ? "orange" : "red"} />
      </mesh>
      
      {/* Arms */}
      <mesh castShadow position={[-0.7, 0.2, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color={getZombieColor()} />
      </mesh>
      <mesh castShadow position={[0.7, 0.2, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color={getZombieColor()} />
      </mesh>
      
      {/* Legs */}
      <mesh castShadow position={[-0.3, -1, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 1]} />
        <meshStandardMaterial color={getZombieColor()} />
      </mesh>
      <mesh castShadow position={[0.3, -1, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 1]} />
        <meshStandardMaterial color={getZombieColor()} />
      </mesh>
      
      {/* Special features for tank zombies */}
      {zombie.type === 'tank' && (
        <>
          {/* Armor plates */}
          <mesh castShadow position={[0, 0, 0.4]}>
            <boxGeometry args={[1.2, 1.5, 0.1]} />
            <meshStandardMaterial 
              color="darkgray" 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
          {/* Shoulder spikes */}
          <mesh castShadow position={[-0.8, 0.7, 0]} rotation={[0, 0, -0.8]}>
            <coneGeometry args={[0.15, 0.5, 4]} />
            <meshStandardMaterial color="silver" metalness={0.9} />
          </mesh>
          <mesh castShadow position={[0.8, 0.7, 0]} rotation={[0, 0, 0.8]}>
            <coneGeometry args={[0.15, 0.5, 4]} />
            <meshStandardMaterial color="silver" metalness={0.9} />
          </mesh>
        </>
      )}
      
      {/* Special features for runner zombies */}
      {zombie.type === 'runner' && (
        <>
          {/* Speed trails */}
          <mesh position={[0, 0, -0.3]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.3, 1.5]} />
            <meshBasicMaterial 
              color="red" 
              transparent 
              opacity={0.3}
            />
          </mesh>
          {/* Fire effect on hands */}
          <mesh position={[-0.7, 0.2, 0]} scale={[0.2, 0.2, 0.2]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color="orange" 
              transparent 
              opacity={0.6}
            />
          </mesh>
          <mesh position={[0.7, 0.2, 0]} scale={[0.2, 0.2, 0.2]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color="orange" 
              transparent 
              opacity={0.6}
            />
          </mesh>
        </>
      )}
      
      {/* Health bar */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.5 + (zombie.health / 100) * 0.5, 2, 0.01]}>
        <planeGeometry args={[(zombie.health / 100) * 1, 0.08]} />
        <meshBasicMaterial 
          color={zombie.health > 50 ? 'green' : zombie.health > 25 ? 'yellow' : 'red'} 
        />
      </mesh>
    </group>
  );
}