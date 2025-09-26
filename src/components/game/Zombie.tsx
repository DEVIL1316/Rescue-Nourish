import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Zombie as ZombieType } from '@/store/gameStore';

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
  
  const getZombieColors = () => {
    switch (zombie.type) {
      case 'runner':
        return {
          skin: 'hsl(60, 30%, 50%)',
          clothes: 'hsl(0, 40%, 35%)',
          blood: 'hsl(0, 80%, 40%)'
        };
      case 'tank':
        return {
          skin: 'hsl(120, 25%, 40%)',
          clothes: 'hsl(0, 0%, 30%)',
          blood: 'hsl(0, 90%, 35%)'
        };
      default:
        return {
          skin: 'hsl(90, 35%, 45%)',
          clothes: 'hsl(210, 20%, 40%)',
          blood: 'hsl(0, 85%, 38%)'
        };
    }
  };
  
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
  
  const colors = getZombieColors();
  const scale = getZombieScale();
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y, zombie.position.z]}
      scale={scale}
    >
      {/* Torso */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.35]} />
        <meshStandardMaterial 
          color={colors.clothes}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Torn shirt details */}
      <mesh castShadow position={[0.1, 1.2, 0.2]}>
        <planeGeometry args={[0.3, 0.4]} />
        <meshStandardMaterial 
          color={colors.blood}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Head */}
      <group ref={headRef} position={[0, 1.8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 12, 10]} />
          <meshStandardMaterial 
            color={colors.skin}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        
        {/* Decayed face features */}
        <mesh position={[-0.08, 0, 0.22]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="hsl(0, 0%, 5%)" />
        </mesh>
        <mesh position={[0.08, 0, 0.22]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="hsl(0, 0%, 5%)" />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.08, 0.23]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshBasicMaterial color="hsl(0, 0%, 10%)" />
        </mesh>
        
        {/* Blood splatter on face */}
        <mesh position={[0.05, -0.05, 0.24]}>
          <planeGeometry args={[0.15, 0.2]} />
          <meshBasicMaterial color={colors.blood} transparent opacity={0.6} />
        </mesh>
      </group>
      
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.45, 1.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.7]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>
        
        {/* Claws */}
        <mesh position={[0, -0.4, 0.05]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshStandardMaterial color="hsl(0, 0%, 20%)" />
        </mesh>
      </group>
      
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.45, 1.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.7]} />
          <meshStandardMaterial color={colors.skin} />
        </mesh>
        
        {/* Claws */}
        <mesh position={[0, -0.4, 0.05]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshStandardMaterial color="hsl(0, 0%, 20%)" />
        </mesh>
        
        {/* Blood on arm */}
        <mesh position={[0, -0.2, 0.08]}>
          <planeGeometry args={[0.1, 0.3]} />
          <meshBasicMaterial color={colors.blood} transparent opacity={0.5} />
        </mesh>
      </group>
      
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.18, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.9]} />
          <meshStandardMaterial color={colors.clothes} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.45, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 25%)" />
        </mesh>
      </group>
      
      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.18, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.9]} />
          <meshStandardMaterial color={colors.clothes} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.45, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 25%)" />
        </mesh>
        
        {/* Torn pants detail */}
        <mesh position={[0, -0.2, 0.1]}>
          <planeGeometry args={[0.12, 0.2]} />
          <meshBasicMaterial color={colors.blood} transparent opacity={0.4} />
        </mesh>
      </group>
      
      {/* Special features for tank zombies */}
      {zombie.type === 'tank' && (
        <>
          {/* Bulky shoulders */}
          <mesh castShadow position={[-0.5, 1.5, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial color={colors.skin} />
          </mesh>
          <mesh castShadow position={[0.5, 1.5, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial color={colors.skin} />
          </mesh>
          
          {/* Armor plates */}
          <mesh castShadow position={[0, 1.2, 0.2]}>
            <boxGeometry args={[0.6, 0.7, 0.1]} />
            <meshStandardMaterial 
              color="hsl(0, 0%, 30%)" 
              metalness={0.4} 
              roughness={0.6}
            />
          </mesh>
        </>
      )}
      
      {/* Special features for runner zombies */}
      {zombie.type === 'runner' && (
        <>
          {/* Lean body modifier */}
          <mesh position={[0, 1, 0]} scale={[0.9, 1.1, 0.9]}>
            <boxGeometry args={[0.01, 0.01, 0.01]} />
            <meshBasicMaterial transparent opacity={0} />
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