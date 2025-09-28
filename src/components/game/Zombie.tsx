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
        return [4.5, 4.5, 4.5]; // Much larger tank zombies
      case 'runner':
        return [3.2, 3.2, 3.2]; // Larger runner zombies
      default:
        return [3.8, 3.8, 3.8]; // Larger normal/walker zombies
    }
  };
  
  const scale = getZombieScale();
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y, zombie.position.z]}
      scale={scale}
    >
      {/* Main Body with enhanced texture visibility */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.6]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.7}
          metalness={0.1}
          emissive="hsl(0, 50%, 10%)"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Texture plane for better visibility */}
      <mesh position={[0, 1.5, 0.31]} receiveShadow>
        <planeGeometry args={[1.1, 1.7]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          opacity={0.95}
        />
      </mesh>
      
      {/* Head with enhanced texture and size */}
      <group ref={headRef} position={[0, 2.4, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.6}
            metalness={0.05}
            emissive="hsl(0, 30%, 5%)"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Face texture overlay for detail */}
        <mesh position={[0, 0, 0.35]}>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        {/* Glowing eyes for visibility */}
        <mesh position={[-0.12, 0.05, 0.38]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="hsl(30, 100%, 60%)" 
            emissive="hsl(30, 100%, 50%)" 
            emissiveIntensity={3}
          />
        </mesh>
        <mesh position={[0.12, 0.05, 0.38]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="hsl(30, 100%, 60%)" 
            emissive="hsl(30, 100%, 50%)" 
            emissiveIntensity={3}
          />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.08, 0.23]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshBasicMaterial color="hsl(0, 0%, 10%)" />
        </mesh>
      </group>
      
      {/* Arms with better texture visibility */}
      <group ref={leftArmRef} position={[-0.7, 1.8, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 1.2]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
        
        {/* Enhanced claws */}
        <mesh position={[0, -0.7, 0.1]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.08, 0.25, 6]} />
          <meshStandardMaterial 
            color="hsl(0, 0%, 15%)" 
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      </group>
      
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.7, 1.8, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 1.2]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
        
        {/* Enhanced claws */}
        <mesh position={[0, -0.7, 0.1]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.08, 0.25, 6]} />
          <meshStandardMaterial 
            color="hsl(0, 0%, 15%)" 
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      </group>
      
      {/* Legs with enhanced visibility */}
      <group ref={leftLegRef} position={[-0.3, 0.6, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.14, 1.4]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.7, 0.15]} castShadow>
          <boxGeometry args={[0.25, 0.12, 0.4]} />
          <meshStandardMaterial color="hsl(0, 0%, 20%)" />
        </mesh>
      </group>
      
      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.3, 0.6, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.14, 1.4]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.7, 0.15]} castShadow>
          <boxGeometry args={[0.25, 0.12, 0.4]} />
          <meshStandardMaterial color="hsl(0, 0%, 20%)" />
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