import { useMemo } from 'react';
import { Vector3 } from 'three';

export function Buildings() {
  const buildings = useMemo(() => {
    const buildingList = [];
    const buildingCount = 15;
    
    for (let i = 0; i < buildingCount; i++) {
      const angle = (Math.PI * 2 * i) / buildingCount;
      const distance = 30 + Math.random() * 40;
      buildingList.push({
        id: i,
        position: new Vector3(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        ),
        width: 4 + Math.random() * 4,
        height: 8 + Math.random() * 12,
        depth: 4 + Math.random() * 4,
        color: `hsl(${30 + Math.random() * 30}, 20%, ${30 + Math.random() * 20}%)`
      });
    }
    
    return buildingList;
  }, []);

  return (
    <>
      {buildings.map((building) => (
        <group key={building.id} position={building.position}>
          {/* Building base */}
          <mesh 
            castShadow 
            receiveShadow 
            position={[0, building.height / 2, 0]}
          >
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshStandardMaterial 
              color={building.color}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          
          {/* Windows */}
          {Array.from({ length: Math.floor(building.height / 3) }).map((_, floorIndex) => (
            <group key={floorIndex}>
              {/* Front windows */}
              <mesh position={[-building.width / 4, 2 + floorIndex * 3, building.depth / 2 + 0.01]}>
                <planeGeometry args={[0.8, 1.2]} />
                <meshBasicMaterial color="hsl(200, 70%, 70%)" />
              </mesh>
              <mesh position={[building.width / 4, 2 + floorIndex * 3, building.depth / 2 + 0.01]}>
                <planeGeometry args={[0.8, 1.2]} />
                <meshBasicMaterial color="hsl(200, 70%, 70%)" />
              </mesh>
              
              {/* Back windows */}
              <mesh position={[-building.width / 4, 2 + floorIndex * 3, -building.depth / 2 - 0.01]}>
                <planeGeometry args={[0.8, 1.2]} />
                <meshBasicMaterial color="hsl(200, 70%, 70%)" />
              </mesh>
              <mesh position={[building.width / 4, 2 + floorIndex * 3, -building.depth / 2 - 0.01]}>
                <planeGeometry args={[0.8, 1.2]} />
                <meshBasicMaterial color="hsl(200, 70%, 70%)" />
              </mesh>
            </group>
          ))}
          
          {/* Roof */}
          <mesh 
            castShadow 
            position={[0, building.height + 0.5, 0]}
          >
            <boxGeometry args={[building.width + 0.5, 1, building.depth + 0.5]} />
            <meshStandardMaterial 
              color="hsl(0, 0%, 20%)"
              roughness={0.8}
            />
          </mesh>
          
          {/* Door */}
          <mesh position={[0, 1.5, building.depth / 2 + 0.01]}>
            <planeGeometry args={[1.5, 3]} />
            <meshBasicMaterial color="hsl(30, 40%, 25%)" />
          </mesh>
        </group>
      ))}
    </>
  );
}