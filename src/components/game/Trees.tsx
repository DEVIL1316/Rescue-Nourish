import { useMemo } from 'react';
import { Vector3 } from 'three';

export function Trees() {
  const trees = useMemo(() => {
    const treeList = [];
    const treeCount = 30;
    
    for (let i = 0; i < treeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 60;
      treeList.push({
        id: i,
        position: new Vector3(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        ),
        scale: 0.8 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        type: Math.random() > 0.5 ? 'pine' : 'oak'
      });
    }
    
    return treeList;
  }, []);

  return (
    <>
      {trees.map((tree) => (
        <group 
          key={tree.id} 
          position={tree.position}
          rotation={[0, tree.rotation, 0]}
          scale={[tree.scale, tree.scale, tree.scale]}
        >
          {tree.type === 'pine' ? (
            <>
              {/* Pine tree trunk */}
              <mesh castShadow position={[0, 2, 0]}>
                <cylinderGeometry args={[0.4, 0.6, 4]} />
                <meshStandardMaterial 
                  color="hsl(25, 45%, 25%)"
                  roughness={0.9}
                />
              </mesh>
              
              {/* Pine tree foliage layers */}
              <mesh castShadow position={[0, 4, 0]}>
                <coneGeometry args={[2.5, 3, 8]} />
                <meshStandardMaterial 
                  color="hsl(120, 40%, 25%)"
                  roughness={0.9}
                />
              </mesh>
              <mesh castShadow position={[0, 5.5, 0]}>
                <coneGeometry args={[2, 2.5, 8]} />
                <meshStandardMaterial 
                  color="hsl(120, 45%, 30%)"
                  roughness={0.9}
                />
              </mesh>
              <mesh castShadow position={[0, 6.8, 0]}>
                <coneGeometry args={[1.5, 2, 8]} />
                <meshStandardMaterial 
                  color="hsl(120, 50%, 35%)"
                  roughness={0.9}
                />
              </mesh>
            </>
          ) : (
            <>
              {/* Oak tree trunk */}
              <mesh castShadow position={[0, 2, 0]}>
                <cylinderGeometry args={[0.5, 0.7, 4]} />
                <meshStandardMaterial 
                  color="hsl(25, 35%, 22%)"
                  roughness={0.95}
                />
              </mesh>
              
              {/* Oak tree branches */}
              <mesh castShadow position={[-0.8, 3, 0]} rotation={[0, 0, -0.3]}>
                <cylinderGeometry args={[0.15, 0.25, 2]} />
                <meshStandardMaterial 
                  color="hsl(25, 35%, 22%)"
                  roughness={0.95}
                />
              </mesh>
              <mesh castShadow position={[0.8, 3.2, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.15, 0.25, 2]} />
                <meshStandardMaterial 
                  color="hsl(25, 35%, 22%)"
                  roughness={0.95}
                />
              </mesh>
              
              {/* Oak tree foliage */}
              <mesh castShadow position={[0, 5, 0]}>
                <sphereGeometry args={[3, 12, 8]} />
                <meshStandardMaterial 
                  color="hsl(110, 50%, 30%)"
                  roughness={0.8}
                />
              </mesh>
              <mesh castShadow position={[-1.5, 4.5, 0]}>
                <sphereGeometry args={[2, 10, 6]} />
                <meshStandardMaterial 
                  color="hsl(110, 45%, 28%)"
                  roughness={0.8}
                />
              </mesh>
              <mesh castShadow position={[1.5, 4.5, 0]}>
                <sphereGeometry args={[2, 10, 6]} />
                <meshStandardMaterial 
                  color="hsl(110, 45%, 28%)"
                  roughness={0.8}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </>
  );
}