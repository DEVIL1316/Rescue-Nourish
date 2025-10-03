import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { Player } from './Player';
import { ZombieManager } from './ZombieManager';
import { Map } from './Map';
import { Lighting } from './Lighting';
import { Buildings } from './Buildings';
import { Trees } from './Trees';
import { BurningCars } from './BurningCars';
import { useGameStore } from '@/store/gameStore';

export function GameScene() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  
  useEffect(() => {
    // Lock pointer on click when game is playing
    const handleClick = () => {
      if (gameStatus === 'playing' && document.pointerLockElement === null) {
        document.body.requestPointerLock();
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [gameStatus]);
  
  return (
    <div className="w-full h-screen relative" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #98D8C8 50%, #8B7355 100%)' }}>
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={[0, 30, 30]}
          fov={75}
          near={0.1}
          far={1000}
        />
        
        <Suspense fallback={null}>
          <Lighting />
          <Environment preset="forest" />
          
          <Map />
          <Buildings />
          <Trees />
          <BurningCars />
          <Player />
          <ZombieManager />
          
          {/* Ground plane - much larger */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[800, 800]} />
            <meshStandardMaterial 
              color="hsl(100, 40%, 20%)"
              roughness={0.95}
            />
          </mesh>
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={false}
          minDistance={15}
          maxDistance={50}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}