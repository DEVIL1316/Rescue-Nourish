import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Group, TextureLoader, DoubleSide, RepeatWrapping } from 'three';
import { Zombie as ZombieType } from '@/store/gameStore';
import zombieNormalTexture from '@/assets/zombie-normal.png';
import zombieRunnerTexture from '@/assets/zombie-runner.png';
import zombieTankTexture from '@/assets/zombie-tank.png';

interface ZombieProps {
  zombie: ZombieType;
}

export function Zombie({ zombie }: ZombieProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const animationTime = useRef(Math.random() * Math.PI * 2);
  
  // Load textures based on zombie type
  const textureMap = {
    normal: zombieNormalTexture,
    walker: zombieNormalTexture,
    runner: zombieRunnerTexture,
    tank: zombieTankTexture
  };
  
  const texture = useLoader(TextureLoader, textureMap[zombie.type as keyof typeof textureMap]);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);
  
  useFrame((_, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    
    animationTime.current += delta * (zombie.type === 'runner' ? 3 : 2);
    
    // Walking animation
    groupRef.current.position.y = Math.abs(Math.sin(animationTime.current * 2)) * 0.1;
    
    // Body sway and rotation
    bodyRef.current.rotation.y = Math.sin(animationTime.current * 0.5) * 0.1;
    bodyRef.current.rotation.z = Math.sin(animationTime.current * 0.3) * 0.05;
  });
  
  const getZombieScale = (): [number, number, number] => {
    switch (zombie.type) {
      case 'tank':
        return [1.8, 1.8, 1.8]; // Larger for tank
      case 'runner':
        return [1.2, 1.2, 1.2]; // Smaller, agile
      default:
        return [1.5, 1.5, 1.5]; // Normal size
    }
  };
  
  const scale = getZombieScale();
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y + 1.5, zombie.position.z]}
      scale={scale}
    >
      <group ref={bodyRef}>
        {/* Main Body - Torso */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 1.2, 0.4]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.9}
            metalness={0.1}
            color={zombie.type === 'tank' ? '#666666' : zombie.type === 'runner' ? '#884444' : '#666655'}
          />
        </mesh>
        
        {/* Head with horror texture */}
        <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.8}
            metalness={0.05}
            color="#997755"
          />
        </mesh>
        
        {/* Glowing Eyes */}
        <mesh position={[-0.12, 0.95, 0.3]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial 
            emissive={zombie.type === 'runner' ? '#ff6600' : '#ff0000'}
            emissiveIntensity={2}
            color="#ffffff"
          />
        </mesh>
        <mesh position={[0.12, 0.95, 0.3]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial 
            emissive={zombie.type === 'runner' ? '#ff6600' : '#ff0000'}
            emissiveIntensity={2}
            color="#ffffff"
          />
        </mesh>
        
        {/* Arms with texture */}
        <group position={[-0.55, 0.2, 0]} rotation={[0, 0, 0.3]}>
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
            <meshStandardMaterial 
              map={texture}
              roughness={0.9}
              metalness={0.05}
              color="#886655"
            />
          </mesh>
          {/* Claw/Hand */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#554433"
              roughness={1}
              metalness={0}
            />
          </mesh>
        </group>
        
        <group position={[0.55, 0.2, 0]} rotation={[0, 0, -0.3]}>
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.12, 0.8, 8, 16]} />
            <meshStandardMaterial 
              map={texture}
              roughness={0.9}
              metalness={0.05}
              color="#886655"
            />
          </mesh>
          {/* Claw/Hand */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#554433"
              roughness={1}
              metalness={0}
            />
          </mesh>
        </group>
        
        {/* Legs with texture */}
        <group position={[-0.25, -1, 0]}>
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.15, 0.9, 8, 16]} />
            <meshStandardMaterial 
              map={texture}
              roughness={0.9}
              metalness={0.05}
              color="#665544"
            />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.6, 0.1]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.3]} />
            <meshStandardMaterial 
              color="#332222"
              roughness={1}
              metalness={0}
            />
          </mesh>
        </group>
        
        <group position={[0.25, -1, 0]}>
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.15, 0.9, 8, 16]} />
            <meshStandardMaterial 
              map={texture}
              roughness={0.9}
              metalness={0.05}
              color="#665544"
            />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.6, 0.1]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.3]} />
            <meshStandardMaterial 
              color="#332222"
              roughness={1}
              metalness={0}
            />
          </mesh>
        </group>
        
        {/* Special features for tank zombies */}
        {zombie.type === 'tank' && (
          <>
            {/* Bulky shoulders */}
            <mesh castShadow position={[-0.7, 0.4, 0]}>
              <sphereGeometry args={[0.25, 12, 10]} />
              <meshStandardMaterial 
                map={texture}
                color="#444444"
                roughness={0.6}
                metalness={0.3}
              />
            </mesh>
            <mesh castShadow position={[0.7, 0.4, 0]}>
              <sphereGeometry args={[0.25, 12, 10]} />
              <meshStandardMaterial 
                map={texture}
                color="#444444"
                roughness={0.6}
                metalness={0.3}
              />
            </mesh>
            
            {/* Chest armor */}
            <mesh castShadow position={[0, 0, 0.25]}>
              <boxGeometry args={[0.9, 1.1, 0.1]} />
              <meshStandardMaterial 
                color="#333333"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          </>
        )}
        
        {/* Special features for runner zombies */}
        {zombie.type === 'runner' && (
          <>
            {/* Fire aura effect */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial 
                color="#ff4400"
                transparent
                opacity={0.2}
                emissive="#ff2200"
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Fire particles on hands */}
            <mesh position={[-0.6, -0.3, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial 
                emissive="#ff6600"
                emissiveIntensity={3}
                color="#ffaa00"
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[0.6, -0.3, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial 
                emissive="#ff6600"
                emissiveIntensity={3}
                color="#ffaa00"
                transparent
                opacity={0.8}
              />
            </mesh>
          </>
        )}
      </group>
      
      {/* Health bar */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.5, 0.15]} />
        <meshBasicMaterial color="hsl(0, 0%, 10%)" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.75 + (zombie.health / 100) * 0.75, 2, 0.01]}>
        <planeGeometry args={[(zombie.health / 100) * 1.5, 0.12]} />
        <meshBasicMaterial 
          color={zombie.health > 50 ? 'hsl(120, 70%, 45%)' : 
                 zombie.health > 25 ? 'hsl(45, 90%, 50%)' : 
                 'hsl(0, 80%, 50%)'} 
        />
      </mesh>
      
      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <circleGeometry args={[0.8]} />
        <meshBasicMaterial color="black" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}