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
  const groupRef = useRef<Group>(null);
  const animationTime = useRef(Math.random() * Math.PI * 2);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  
  // Load textures based on zombie type
  const textureMap = {
    normal: zombieNormalTexture,
    runner: zombieRunnerTexture,
    tank: zombieTankTexture
  };
  
  const texture = useLoader(TextureLoader, textureMap[zombie.type]);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    animationTime.current += delta * (zombie.type === 'runner' ? 3 : 2);
    
    // Walking animation
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(animationTime.current) * 0.5;
      rightLegRef.current.rotation.x = -Math.sin(animationTime.current) * 0.5;
    }
    
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -Math.sin(animationTime.current) * 0.3;
      rightArmRef.current.rotation.x = Math.sin(animationTime.current) * 0.3;
      
      // Zombie reaching animation
      leftArmRef.current.rotation.z = -0.5 - Math.sin(animationTime.current * 0.5) * 0.2;
      rightArmRef.current.rotation.z = 0.5 + Math.sin(animationTime.current * 0.5 + Math.PI) * 0.2;
    }
    
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(animationTime.current * 0.5) * 0.1;
      headRef.current.rotation.y = Math.sin(animationTime.current * 0.3) * 0.2;
    }
    
    // Body sway
    groupRef.current.rotation.z = Math.sin(animationTime.current * 0.5) * 0.05;
    groupRef.current.position.y = Math.abs(Math.sin(animationTime.current * 2)) * 0.1;
  });
  
  const getZombieScale = (): [number, number, number] => {
    switch (zombie.type) {
      case 'tank':
        return [2.5, 2.5, 2.5];
      case 'runner':
        return [1.8, 1.8, 1.8];
      default:
        return [2.2, 2.2, 2.2];
    }
  };
  
  const scale = getZombieScale();
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y, zombie.position.z]}
      scale={scale}
    >
      {/* Torso with texture */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.35]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Head with texture */}
      <group ref={headRef} position={[0, 1.8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 12, 10]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        
        {/* Glowing eyes */}
        <mesh position={[-0.08, 0, 0.22]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="hsl(30, 100%, 50%)" emissive="hsl(30, 100%, 40%)" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.08, 0, 0.22]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="hsl(30, 100%, 50%)" emissive="hsl(30, 100%, 40%)" emissiveIntensity={2} />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.08, 0.23]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshBasicMaterial color="hsl(0, 0%, 10%)" />
        </mesh>
      </group>
      
      {/* Left Arm with texture */}
      <group ref={leftArmRef} position={[-0.45, 1.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.7]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        
        {/* Claws */}
        <mesh position={[0, -0.4, 0.05]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshStandardMaterial color="hsl(0, 0%, 20%)" />
        </mesh>
      </group>
      
      {/* Right Arm with texture */}
      <group ref={rightArmRef} position={[0.45, 1.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.7]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        
        {/* Claws */}
        <mesh position={[0, -0.4, 0.05]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshStandardMaterial color="hsl(0, 0%, 20%)" />
        </mesh>
      </group>
      
      {/* Left Leg with texture */}
      <group ref={leftLegRef} position={[-0.18, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.9]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.45, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 25%)" />
        </mesh>
      </group>
      
      {/* Right Leg with texture */}
      <group ref={rightLegRef} position={[0.18, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.9]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.45, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 25%)" />
        </mesh>
      </group>
      
      {/* Special features for tank zombies */}
      {zombie.type === 'tank' && (
        <>
          {/* Bulky shoulders with texture */}
          <mesh castShadow position={[-0.5, 1.5, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial map={texture} />
          </mesh>
          <mesh castShadow position={[0.5, 1.5, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial map={texture} />
          </mesh>
          
          {/* Armor plates with texture overlay */}
          <mesh castShadow position={[0, 1.2, 0.2]}>
            <boxGeometry args={[0.6, 0.7, 0.1]} />
            <meshStandardMaterial 
              map={texture}
              metalness={0.3} 
              roughness={0.7}
            />
          </mesh>
        </>
      )}
      
      {/* Special features for runner zombies */}
      {zombie.type === 'runner' && (
        <>
          {/* Fire effect on hands */}
          <mesh position={[-0.45, 0.9, 0]} scale={[0.3, 0.3, 0.3]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial 
              color="hsl(20, 100%, 50%)" 
              transparent 
              opacity={0.4}
              emissive="hsl(20, 100%, 40%)"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh position={[0.45, 0.9, 0]} scale={[0.3, 0.3, 0.3]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial 
              color="hsl(20, 100%, 50%)" 
              transparent 
              opacity={0.4}
              emissive="hsl(20, 100%, 40%)"
              emissiveIntensity={1}
            />
          </mesh>
        </>
      )}
      
      {/* Health bar */}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.2, 0.15]} />
        <meshBasicMaterial color="hsl(0, 0%, 10%)" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.6 + (zombie.health / 100) * 0.6, 2.8, 0.01]}>
        <planeGeometry args={[(zombie.health / 100) * 1.2, 0.12]} />
        <meshBasicMaterial 
          color={zombie.health > 50 ? 'hsl(120, 60%, 40%)' : zombie.health > 25 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 45%)'} 
        />
      </mesh>
    </group>
  );
}