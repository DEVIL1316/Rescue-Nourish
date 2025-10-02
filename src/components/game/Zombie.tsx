import { useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Group, TextureLoader, DoubleSide } from 'three';
import { Zombie as ZombieType } from '@/store/gameStore';
import zombieNormalTexture from '@/assets/zombie-normal.png';
import zombieRunnerTexture from '@/assets/zombie-runner.png';
import zombieTankTexture from '@/assets/zombie-tank.png';

interface ZombieProps {
  zombie: ZombieType;
}

export function Zombie({ zombie }: ZombieProps) {
  const groupRef = useRef<Group>(null);
  const spriteRef = useRef<Group>(null);
  const animationTime = useRef(Math.random() * Math.PI * 2);
  const { camera } = useThree();
  
  // Load textures based on zombie type
  const textureMap = {
    normal: zombieNormalTexture,
    walker: zombieNormalTexture,
    runner: zombieRunnerTexture,
    tank: zombieTankTexture
  };
  
  const texture = useLoader(TextureLoader, textureMap[zombie.type as keyof typeof textureMap]);
  texture.flipY = false; // Correct orientation
  
  useFrame((_, delta) => {
    if (!groupRef.current || !spriteRef.current) return;
    
    // Make sprite always face the camera (billboard effect)
    spriteRef.current.lookAt(camera.position);
    
    animationTime.current += delta * (zombie.type === 'runner' ? 3 : 2);
    
    // Walking animation - subtle bobbing
    groupRef.current.position.y = Math.abs(Math.sin(animationTime.current * 2)) * 0.1;
    
    // Subtle swaying for more natural movement
    spriteRef.current.rotation.z = Math.sin(animationTime.current * 0.5) * 0.05;
  });
  
  const getZombieScale = (): [number, number, number] => {
    switch (zombie.type) {
      case 'tank':
        return [3.0, 4.0, 1]; // Taller and wider
      case 'runner':
        return [2.5, 3.5, 1]; // Medium size
      default:
        return [2.5, 3.5, 1]; // Default size
    }
  };
  
  const scale = getZombieScale();
  
  return (
    <group 
      ref={groupRef}
      position={[zombie.position.x, zombie.position.y + 1.75, zombie.position.z]}
    >
      {/* Zombie sprite */}
      <group ref={spriteRef} scale={scale}>
        <mesh castShadow receiveShadow>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial 
            map={texture}
            transparent={true}
            side={DoubleSide}
            alphaTest={0.1}
            roughness={0.8}
            metalness={0}
          />
        </mesh>
        
        {/* Special effects for runner zombies - fire particles */}
        {zombie.type === 'runner' && (
          <>
            <mesh position={[-0.3, -0.2, 0.1]} scale={[0.15, 0.15, 0.15]}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial 
                color="hsl(30, 100%, 50%)" 
                transparent 
                opacity={Math.sin(animationTime.current * 4) * 0.3 + 0.5}
              />
            </mesh>
            <mesh position={[0.3, -0.2, 0.1]} scale={[0.15, 0.15, 0.15]}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial 
                color="hsl(30, 100%, 50%)" 
                transparent 
                opacity={Math.sin(animationTime.current * 4 + Math.PI) * 0.3 + 0.5}
              />
            </mesh>
          </>
        )}
        
        {/* Special effects for tank zombies - armor glow */}
        {zombie.type === 'tank' && (
          <mesh position={[0, 0, -0.05]} scale={[1.1, 1.1, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
              color="hsl(200, 60%, 40%)" 
              transparent 
              opacity={Math.sin(animationTime.current * 2) * 0.2 + 0.3}
            />
          </mesh>
        )}
      </group>
      
      {/* Health bar - positioned above the sprite */}
      <group position={[0, 2.5, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[2.0, 0.2]} />
          <meshBasicMaterial color="hsl(0, 0%, 10%)" transparent opacity={0.8} />
        </mesh>
        <mesh position={[-1.0 + (zombie.health / 100) * 1.0, 0, 0.01]}>
          <planeGeometry args={[(zombie.health / 100) * 2.0, 0.15]} />
          <meshBasicMaterial 
            color={zombie.health > 50 ? 'hsl(120, 70%, 45%)' : 
                   zombie.health > 25 ? 'hsl(45, 90%, 50%)' : 
                   'hsl(0, 80%, 50%)'} 
          />
        </mesh>
      </group>
      
      {/* Shadow plane for depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]} receiveShadow>
        <planeGeometry args={[scale[0] * 0.7, scale[0] * 0.7]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}