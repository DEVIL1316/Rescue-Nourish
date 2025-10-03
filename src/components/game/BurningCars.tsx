import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

export function BurningCars() {
  const fireRefs = useRef<Group[]>([]);
  
  useFrame((_, delta) => {
    fireRefs.current.forEach((fire, index) => {
      if (fire) {
        // Animate fire flickering
        fire.position.y = 1.2 + Math.sin(Date.now() * 0.005 + index) * 0.1;
        fire.rotation.y += delta * 2;
      }
    });
  });
  
  const carPositions = [
    { x: -50, z: -30, rotation: 0.3 },
    { x: 40, z: -60, rotation: -0.8 },
    { x: -70, z: 50, rotation: 1.2 },
    { x: 60, z: 70, rotation: -0.5 },
    { x: 0, z: -80, rotation: 0 },
    { x: -90, z: -10, rotation: 0.9 },
    { x: 80, z: 20, rotation: -1.1 },
  ];
  
  return (
    <group>
      {carPositions.map((pos, index) => (
        <group key={index} position={[pos.x, 0, pos.z]} rotation={[0, pos.rotation, 0]}>
          {/* Car Body */}
          <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
            <boxGeometry args={[2.5, 0.8, 4.5]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              roughness={0.9}
              metalness={0.3}
              emissive="#331100"
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Car Roof */}
          <mesh castShadow receiveShadow position={[0, 1.2, 0.2]}>
            <boxGeometry args={[2.2, 0.7, 2.5]} />
            <meshStandardMaterial 
              color="#0a0a0a" 
              roughness={0.8}
              metalness={0.4}
              emissive="#220000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Wheels */}
          {([
            [-1.2, -0.3, 1.5],
            [1.2, -0.3, 1.5],
            [-1.2, -0.3, -1.5],
            [1.2, -0.3, -1.5],
          ] as [number, number, number][]).map((wheelPos, i) => (
            <mesh key={i} position={wheelPos} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
              <meshStandardMaterial color="#050505" roughness={0.95} />
            </mesh>
          ))}
          
          {/* Broken Windows */}
          <mesh position={[-1.3, 1.2, 0.2]}>
            <planeGeometry args={[0.05, 0.6]} />
            <meshStandardMaterial color="#111111" opacity={0.3} transparent />
          </mesh>
          <mesh position={[1.3, 1.2, 0.2]}>
            <planeGeometry args={[0.05, 0.6]} />
            <meshStandardMaterial color="#111111" opacity={0.3} transparent />
          </mesh>
          
          {/* Damage/Dents */}
          <mesh castShadow position={[0.8, 0.6, 2.0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
          <mesh castShadow position={[-0.6, 0.4, -2.1]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#151515" roughness={1} />
          </mesh>
          
          {/* Fire on hood */}
          <group 
            ref={(el) => { if (el) fireRefs.current[index] = el; }}
            position={[0, 1.2, 1.5]}
          >
            {/* Main fire */}
            <mesh>
              <coneGeometry args={[0.6, 1.5, 8]} />
              <meshStandardMaterial 
                color="#ff6600"
                emissive="#ff3300"
                emissiveIntensity={2}
                transparent
                opacity={0.8}
              />
            </mesh>
            
            {/* Inner fire core */}
            <mesh position={[0, 0.3, 0]}>
              <coneGeometry args={[0.4, 1.0, 8]} />
              <meshStandardMaterial 
                color="#ffaa00"
                emissive="#ffff00"
                emissiveIntensity={3}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Fire particles */}
            {[0, 1, 2, 3].map((i) => (
              <mesh 
                key={i} 
                position={[
                  Math.sin(i * Math.PI / 2) * 0.3,
                  0.8 + i * 0.2,
                  Math.cos(i * Math.PI / 2) * 0.3
                ]}
              >
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial 
                  color="#ff8800"
                  emissive="#ff4400"
                  emissiveIntensity={2.5}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            ))}
          </group>
          
          {/* Smoke */}
          <mesh position={[0, 2.5, 1.5]}>
            <sphereGeometry args={[0.8, 12, 12]} />
            <meshStandardMaterial 
              color="#222222"
              transparent
              opacity={0.4}
            />
          </mesh>
          
          {/* Point light for fire glow */}
          <pointLight 
            position={[0, 1.5, 1.5] as [number, number, number]}
            color="#ff6600" 
            intensity={5} 
            distance={10}
            castShadow
          />
        </group>
      ))}
    </group>
  );
}
