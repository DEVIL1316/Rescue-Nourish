import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { Player } from './Player';
import { ZombieManager } from './ZombieManager';
import { Map } from './Map';
import { Lighting } from './Lighting';
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
    <div className="w-full h-screen relative bg-gradient-dark">
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={[0, 25, 25]}
          fov={60}
          near={0.1}
          far={1000}
        />
        
        <Suspense fallback={null}>
          <Lighting />
          <Environment preset="night" />
          
          <Map />
          <Player />
          <ZombieManager />
          
          <Grid
            args={[200, 200]}
            cellSize={2}
            cellThickness={0.5}
            cellColor="#111111"
            sectionSize={10}
            sectionThickness={1}
            sectionColor="#222222"
            fadeDistance={150}
            fadeStrength={1}
            followCamera
          />
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