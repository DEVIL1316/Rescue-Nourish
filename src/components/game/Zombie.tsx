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
    walker: zombieNormalTexture, // Walker uses normal texture
    runner: zombieRunnerTexture,
    tank: zombieTankTexture
  };
  
  const texture = useLoader(TextureLoader, textureMap[zombie.type as keyof typeof textureMap]);
  
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
        return [3.0, 3.0, 3.0]; // Extra large tank zombies
      case 'runner':
        return [2.5, 2.5, 2.5]; // Large runner zombies
      default:
        return [2.8, 2.8, 2.8]; // Large walker zombies
    }
  };
  
  const scale = getZombieScale();
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y, zombie.position.z]}
      scale={scale}
    >
      {/* Human-like torso */}
      <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
        <meshStandardMaterial 
          color={zombie.type === 'tank' ? "hsl(210, 20%, 30%)" : 
                 zombie.type === 'runner' ? "hsl(280, 25%, 35%)" : 
                 "hsl(120, 15%, 35%)"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Human head with realistic proportions */}
      <group ref={headRef} position={[0, 1.75, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="hsl(25, 45%, 65%)"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="hsl(0, 60%, 40%)" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="hsl(0, 60%, 40%)" />
        </mesh>
        
        {/* Nose */}
        <mesh position={[0, -0.01, 0.14]}>
          <coneGeometry args={[0.02, 0.03, 4]} />
          <meshStandardMaterial color="hsl(25, 40%, 60%)" />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.05, 0.13]}>
          <boxGeometry args={[0.06, 0.015, 0.01]} />
          <meshBasicMaterial color="hsl(0, 40%, 35%)" />
        </mesh>
        
        {/* Hair */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color="hsl(30, 20%, 25%)" roughness={1} />
        </mesh>
      </group>
      
      {/* Left Arm - Human anatomy */}
      <group ref={leftArmRef} position={[-0.32, 1.35, 0]}>
        {/* Shoulder */}
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="hsl(25, 40%, 60%)" />
        </mesh>
        
        {/* Upper arm */}
        <mesh castShadow receiveShadow position={[0, -0.2, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.06, 0.05, 0.4]} />
          <meshStandardMaterial 
            color="hsl(25, 40%, 60%)"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Elbow */}
        <mesh castShadow position={[-0.02, -0.4, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="hsl(25, 40%, 60%)" />
        </mesh>
        
        {/* Forearm */}
        <mesh castShadow receiveShadow position={[-0.05, -0.6, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.045, 0.04, 0.35]} />
          <meshStandardMaterial 
            color="hsl(25, 40%, 60%)"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Hand */}
        <mesh position={[-0.08, -0.8, 0]} castShadow>
          <boxGeometry args={[0.08, 0.1, 0.03]} />
          <meshStandardMaterial color="hsl(25, 40%, 60%)" />
        </mesh>
      </group>
      
      {/* Right Arm - Human anatomy */}
      <group ref={rightArmRef} position={[0.32, 1.35, 0]}>
        {/* Shoulder */}
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="hsl(25, 40%, 60%)" />
        </mesh>
        
        {/* Upper arm */}
        <mesh castShadow receiveShadow position={[0, -0.2, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.06, 0.05, 0.4]} />
          <meshStandardMaterial 
            color="hsl(25, 40%, 60%)"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Elbow */}
        <mesh castShadow position={[0.02, -0.4, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="hsl(25, 40%, 60%)" />
        </mesh>
        
        {/* Forearm */}
        <mesh castShadow receiveShadow position={[0.05, -0.6, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.045, 0.04, 0.35]} />
          <meshStandardMaterial 
            color="hsl(25, 40%, 60%)"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Hand */}
        <mesh position={[0.08, -0.8, 0]} castShadow>
          <boxGeometry args={[0.08, 0.1, 0.03]} />
          <meshStandardMaterial color="hsl(25, 40%, 60%)" />
        </mesh>
      </group>
      
      {/* Left Leg - Human anatomy */}
      <group ref={leftLegRef} position={[-0.15, 0.25, 0]}>
        {/* Hip joint */}
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="hsl(210, 15%, 35%)" />
        </mesh>
        
        {/* Thigh */}
        <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.5]} />
          <meshStandardMaterial 
            color={zombie.type === 'tank' ? "hsl(210, 15%, 35%)" :
                   zombie.type === 'runner' ? "hsl(280, 20%, 40%)" :
                   "hsl(120, 10%, 40%)"}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Knee */}
        <mesh castShadow position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="hsl(25, 30%, 50%)" />
        </mesh>
        
        {/* Shin */}
        <mesh castShadow receiveShadow position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.055, 0.045, 0.5]} />
          <meshStandardMaterial 
            color="hsl(25, 35%, 55%)"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -1.0, 0.08]} castShadow>
          <boxGeometry args={[0.09, 0.05, 0.2]} />
          <meshStandardMaterial color="hsl(0, 0%, 25%)" />
        </mesh>
      </group>
      
      {/* Right Leg - Human anatomy */}
      <group ref={rightLegRef} position={[0.15, 0.25, 0]}>
        {/* Hip joint */}
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="hsl(210, 15%, 35%)" />
        </mesh>
        
        {/* Thigh */}
        <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.5]} />
          <meshStandardMaterial 
            color={zombie.type === 'tank' ? "hsl(210, 15%, 35%)" :
                   zombie.type === 'runner' ? "hsl(280, 20%, 40%)" :
                   "hsl(120, 10%, 40%)"}
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Knee */}
        <mesh castShadow position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="hsl(25, 30%, 50%)" />
        </mesh>
        
        {/* Shin */}
        <mesh castShadow receiveShadow position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.055, 0.045, 0.5]} />
          <meshStandardMaterial 
            color="hsl(25, 35%, 55%)"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -1.0, 0.08]} castShadow>
          <boxGeometry args={[0.09, 0.05, 0.2]} />
          <meshStandardMaterial color="hsl(0, 0%, 25%)" />
        </mesh>
      </group>
      
      {/* Special features for tank zombies */}
      {zombie.type === 'tank' && (
        <>
          {/* Bulky shoulders with texture */}
          <mesh castShadow position={[-0.9, 2.2, 0]}>
            <sphereGeometry args={[0.35, 12, 10]} />
            <meshStandardMaterial 
              map={texture}
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
          <mesh castShadow position={[0.9, 2.2, 0]}>
            <sphereGeometry args={[0.35, 12, 10]} />
            <meshStandardMaterial 
              map={texture}
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
          
          {/* Armor plates with texture overlay */}
          <mesh castShadow position={[0, 1.8, 0.4]}>
            <boxGeometry args={[1.0, 1.2, 0.15]} />
            <meshStandardMaterial 
              map={texture}
              metalness={0.4} 
              roughness={0.6}
              emissive="hsl(0, 0%, 5%)"
              emissiveIntensity={0.2}
            />
          </mesh>
        </>
      )}
      
      {/* Special features for runner zombies */}
      {zombie.type === 'runner' && (
        <>
          {/* Fire effect on hands - enhanced */}
          <mesh position={[-0.7, 1.3, 0]} scale={[0.5, 0.5, 0.5]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial 
              color="hsl(20, 100%, 50%)" 
              transparent 
              opacity={0.5}
              emissive="hsl(20, 100%, 40%)"
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0.7, 1.3, 0]} scale={[0.5, 0.5, 0.5]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial 
              color="hsl(20, 100%, 50%)" 
              transparent 
              opacity={0.5}
              emissive="hsl(20, 100%, 40%)"
              emissiveIntensity={2}
            />
          </mesh>
          
          {/* Speed trails */}
          <mesh position={[0, 1.5, -0.5]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.3, 2]} />
            <meshBasicMaterial 
              color="hsl(0, 100%, 50%)" 
              transparent 
              opacity={0.3}
            />
          </mesh>
        </>
      )}
      
      {/* Health bar - larger and more visible */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.0, 0.25]} />
        <meshBasicMaterial color="hsl(0, 0%, 10%)" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-1.0 + (zombie.health / 100) * 1.0, 3.5, 0.01]}>
        <planeGeometry args={[(zombie.health / 100) * 2.0, 0.2]} />
        <meshBasicMaterial 
          color={zombie.health > 50 ? 'hsl(120, 60%, 40%)' : zombie.health > 25 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 45%)'} 
        />
      </mesh>
    </group>
  );
}