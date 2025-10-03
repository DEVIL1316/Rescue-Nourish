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
  const textureMap: Record<string, string> = {
    normal: zombieNormalTexture,
    walker: zombieNormalTexture,
    runner: zombieRunnerTexture,
    tank: zombieTankTexture,
    dog: zombieNormalTexture,    // Reuse normal texture for animals
    bear: zombieTankTexture,      // Reuse tank texture (darker)
    wolf: zombieRunnerTexture     // Reuse runner texture
  };
  
  const texture = useLoader(TextureLoader, textureMap[zombie.type] || zombieNormalTexture);
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
        return [2.2, 2.2, 2.2]; // Larger for tank
      case 'bear':
        return [2.5, 2.0, 2.5]; // Large and wide
      case 'runner':
        return [1.4, 1.4, 1.4]; // Smaller, agile
      case 'dog':
        return [1.0, 0.8, 1.2]; // Low and long
      case 'wolf':
        return [1.3, 1.0, 1.5]; // Medium predator
      default:
        return [1.6, 1.6, 1.6]; // Normal size
    }
  };
  
  const scale = getZombieScale();
  const isAnimal = zombie.type === 'dog' || zombie.type === 'bear' || zombie.type === 'wolf';
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y + (isAnimal ? 0.5 : 1.5), zombie.position.z]}
      scale={scale}
    >
      <group ref={bodyRef}>
        {/* Render animal zombies */}
        {isAnimal ? (
          <>
            {/* Animal Body */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={zombie.type === 'dog' ? [0.6, 0.5, 1.2] : zombie.type === 'bear' ? [1.2, 0.8, 1.5] : [0.8, 0.6, 1.3]} />
              <meshStandardMaterial 
                map={texture}
                roughness={0.95}
                metalness={0.05}
                color={zombie.type === 'bear' ? '#4a3929' : zombie.type === 'wolf' ? '#5a5a5a' : '#6b5544'}
              />
            </mesh>
            
            {/* Animal Head */}
            <mesh castShadow receiveShadow position={[0, 0.2, zombie.type === 'dog' ? 0.8 : zombie.type === 'bear' ? 0.9 : 0.85]}>
              <boxGeometry args={zombie.type === 'dog' ? [0.4, 0.35, 0.5] : zombie.type === 'bear' ? [0.7, 0.6, 0.6] : [0.5, 0.45, 0.55]} />
              <meshStandardMaterial 
                map={texture}
                roughness={0.9}
                metalness={0.05}
                color={zombie.type === 'bear' ? '#3a2919' : zombie.type === 'wolf' ? '#4a4a4a' : '#5b4534'}
              />
            </mesh>
            
            {/* Snout */}
            <mesh castShadow position={[0, 0.05, zombie.type === 'dog' ? 1.15 : zombie.type === 'bear' ? 1.3 : 1.2]}>
              <boxGeometry args={zombie.type === 'bear' ? [0.4, 0.3, 0.3] : [0.25, 0.2, 0.25]} />
              <meshStandardMaterial color="#3a3030" roughness={1} />
            </mesh>
            
            {/* Glowing Eyes */}
            <mesh position={[-0.15, 0.3, zombie.type === 'dog' ? 1.0 : zombie.type === 'bear' ? 1.15 : 1.05]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial 
                emissive="#ff0000"
                emissiveIntensity={3}
                color="#ffffff"
              />
            </mesh>
            <mesh position={[0.15, 0.3, zombie.type === 'dog' ? 1.0 : zombie.type === 'bear' ? 1.15 : 1.05]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial 
                emissive="#ff0000"
                emissiveIntensity={3}
                color="#ffffff"
              />
            </mesh>
            
            {/* Front Legs */}
            <mesh castShadow position={[-0.25, -0.5, 0.4]} rotation={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.8]} />
              <meshStandardMaterial map={texture} color="#5a4a3a" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[0.25, -0.5, 0.4]} rotation={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.8]} />
              <meshStandardMaterial map={texture} color="#5a4a3a" roughness={0.9} />
            </mesh>
            
            {/* Back Legs */}
            <mesh castShadow position={[-0.25, -0.5, -0.4]} rotation={[-0.1, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.8]} />
              <meshStandardMaterial map={texture} color="#5a4a3a" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[0.25, -0.5, -0.4]} rotation={[-0.1, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.8]} />
              <meshStandardMaterial map={texture} color="#5a4a3a" roughness={0.9} />
            </mesh>
            
            {/* Paws with claws */}
            {[-0.25, 0.25].map((x, i) => (
              <group key={`front-${i}`}>
                <mesh castShadow position={[x, -0.9, 0.4]}>
                  <sphereGeometry args={[0.15, 8, 8]} />
                  <meshStandardMaterial color="#2a2020" roughness={1} />
                </mesh>
              </group>
            ))}
            
            {/* Tail */}
            <mesh castShadow position={[0, 0.1, -0.8]} rotation={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.05, zombie.type === 'bear' ? 0.3 : 0.5]} />
              <meshStandardMaterial map={texture} color="#4a3a2a" roughness={0.95} />
            </mesh>
            
            {/* Bear specific features */}
            {zombie.type === 'bear' && (
              <>
                {/* Hunched back */}
                <mesh castShadow position={[0, 0.3, -0.3]}>
                  <sphereGeometry args={[0.5, 12, 12]} />
                  <meshStandardMaterial map={texture} color="#3a2919" roughness={0.95} />
                </mesh>
                
                {/* Large claws */}
                {[-0.25, 0.25].map((x, i) => (
                  <group key={`claw-${i}`}>
                    <mesh position={[x, -0.9, 0.5]} rotation={[0, 0, 0]}>
                      <coneGeometry args={[0.05, 0.2, 8]} />
                      <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.6} />
                    </mesh>
                  </group>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {/* Human Zombie Body */}
            {/* Main Body - Torso */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.8, 1.4, 0.5]} />
              <meshStandardMaterial 
                map={texture}
                roughness={0.9}
                metalness={0.1}
                color={zombie.type === 'tank' ? '#666666' : zombie.type === 'runner' ? '#884444' : '#666655'}
              />
            </mesh>
            
            {/* Ribcage detail */}
            <mesh castShadow position={[0, 0.3, 0.26]}>
              <boxGeometry args={[0.7, 1.0, 0.05]} />
              <meshStandardMaterial color="#555544" roughness={1} />
            </mesh>
            
            {/* Head with horror texture */}
            <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial 
                map={texture}
                roughness={0.8}
                metalness={0.05}
                color="#997755"
              />
            </mesh>
            
            {/* Jaw */}
            <mesh castShadow position={[0, 0.9, 0.2]}>
              <boxGeometry args={[0.3, 0.15, 0.25]} />
              <meshStandardMaterial color="#887766" roughness={0.95} />
            </mesh>
            
            {/* Glowing Eyes */}
            <mesh position={[-0.15, 1.15, 0.35]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial 
                emissive={zombie.type === 'runner' ? '#ff6600' : '#ff0000'}
                emissiveIntensity={3}
                color="#ffffff"
              />
            </mesh>
            <mesh position={[0.15, 1.15, 0.35]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial 
                emissive={zombie.type === 'runner' ? '#ff6600' : '#ff0000'}
                emissiveIntensity={3}
                color="#ffffff"
              />
            </mesh>
            
            {/* Neck */}
            <mesh castShadow position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.15, 0.18, 0.25]} />
              <meshStandardMaterial map={texture} color="#887766" roughness={0.9} />
            </mesh>
            
            {/* Arms with texture - improved */}
            <group position={[-0.5, 0.3, 0]} rotation={[0.3, 0, 0.4]}>
              {/* Upper arm */}
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.14, 0.6, 8, 16]} />
                <meshStandardMaterial 
                  map={texture}
                  roughness={0.9}
                  metalness={0.05}
                  color="#886655"
                />
              </mesh>
              {/* Forearm */}
              <mesh castShadow position={[0, -0.5, 0]} rotation={[-0.3, 0, 0]}>
                <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
                <meshStandardMaterial map={texture} color="#776644" roughness={0.95} />
              </mesh>
              {/* Claw/Hand */}
              <mesh position={[0, -0.85, 0]} castShadow>
                <boxGeometry args={[0.25, 0.15, 0.3]} />
                <meshStandardMaterial color="#554433" roughness={1} metalness={0} />
              </mesh>
              {/* Fingers/Claws */}
              {[-0.08, 0, 0.08].map((offset, i) => (
                <mesh key={i} position={[offset, -0.95, 0.1]} rotation={[0.2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.015, 0.15]} />
                  <meshStandardMaterial color="#332211" roughness={0.8} />
                </mesh>
              ))}
            </group>
            
            <group position={[0.5, 0.3, 0]} rotation={[0.3, 0, -0.4]}>
              {/* Upper arm */}
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.14, 0.6, 8, 16]} />
                <meshStandardMaterial 
                  map={texture}
                  roughness={0.9}
                  metalness={0.05}
                  color="#886655"
                />
              </mesh>
              {/* Forearm */}
              <mesh castShadow position={[0, -0.5, 0]} rotation={[-0.3, 0, 0]}>
                <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
                <meshStandardMaterial map={texture} color="#776644" roughness={0.95} />
              </mesh>
              {/* Claw/Hand */}
              <mesh position={[0, -0.85, 0]} castShadow>
                <boxGeometry args={[0.25, 0.15, 0.3]} />
                <meshStandardMaterial color="#554433" roughness={1} metalness={0} />
              </mesh>
              {/* Fingers/Claws */}
              {[-0.08, 0, 0.08].map((offset, i) => (
                <mesh key={i} position={[offset, -0.95, 0.1]} rotation={[0.2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.015, 0.15]} />
                  <meshStandardMaterial color="#332211" roughness={0.8} />
                </mesh>
              ))}
            </group>
            
            {/* Legs with texture - improved */}
            <group position={[-0.22, -1.0, 0]}>
              {/* Thigh */}
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
                <meshStandardMaterial 
                  map={texture}
                  roughness={0.9}
                  metalness={0.05}
                  color="#665544"
                />
              </mesh>
              {/* Shin */}
              <mesh castShadow position={[0, -0.6, 0]}>
                <capsuleGeometry args={[0.15, 0.65, 8, 16]} />
                <meshStandardMaterial map={texture} color="#554433" roughness={0.95} />
              </mesh>
              {/* Foot */}
              <mesh position={[0, -1.0, 0.15]} castShadow>
                <boxGeometry args={[0.22, 0.15, 0.4]} />
                <meshStandardMaterial color="#332222" roughness={1} metalness={0} />
              </mesh>
            </group>
            
            <group position={[0.22, -1.0, 0]}>
              {/* Thigh */}
              <mesh castShadow receiveShadow>
                <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
                <meshStandardMaterial 
                  map={texture}
                  roughness={0.9}
                  metalness={0.05}
                  color="#665544"
                />
              </mesh>
              {/* Shin */}
              <mesh castShadow position={[0, -0.6, 0]}>
                <capsuleGeometry args={[0.15, 0.65, 8, 16]} />
                <meshStandardMaterial map={texture} color="#554433" roughness={0.95} />
              </mesh>
              {/* Foot */}
              <mesh position={[0, -1.0, 0.15]} castShadow>
                <boxGeometry args={[0.22, 0.15, 0.4]} />
                <meshStandardMaterial color="#332222" roughness={1} metalness={0} />
              </mesh>
            </group>
          </>
        )}
        
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