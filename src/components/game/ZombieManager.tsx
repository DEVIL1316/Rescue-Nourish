import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore, Zombie as ZombieType } from '@/store/gameStore';
import { Zombie } from './Zombie';
import { playZombieGroan } from '@/utils/soundEffects';

export function ZombieManager() {
  const { 
    zombies, 
    spawnZombie, 
    gameStatus, 
    wave, 
    nextWave,
    playerPosition,
    updateZombiePosition,
    removeZombie,
    takeDamage
  } = useGameStore();
  
  const spawnTimer = useRef(0);
  const waveTimer = useRef(0);
  const damageTimer = useRef(0);
  const groanTimer = useRef(0);
  
  useEffect(() => {
    if (gameStatus === 'playing' && zombies.length === 0) {
      console.log('Spawning initial wave, current wave:', wave);
      // Spawn initial wave
      const zombieCount = 3 + wave * 2;
      
      for (let i = 0; i < zombieCount; i++) {
        const angle = (Math.PI * 2 * i) / zombieCount;
        const distance = 10 + Math.random() * 15;
        
        const zombie: ZombieType = {
          id: `zombie-${Date.now()}-${Math.random()}`,
          position: {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance,
          },
          health: wave < 3 ? 50 : wave < 6 ? 75 : 100,
          type: Math.random() < 0.7 ? 'walker' : Math.random() < 0.9 ? 'runner' : 'tank',
          speed: Math.random() < 0.7 ? 2 : Math.random() < 0.9 ? 4 : 1.5,
          damage: Math.random() < 0.7 ? 10 : Math.random() < 0.9 ? 15 : 25,
          target: null,
        };
        
        console.log('Spawning zombie:', zombie);
        spawnZombie(zombie);
      }
    }
  }, [gameStatus, wave, zombies.length, spawnZombie]);
  
  const spawnWave = () => {
    const zombieCount = 3 + wave * 2;
    console.log('Spawning new wave with', zombieCount, 'zombies');
    
    for (let i = 0; i < zombieCount; i++) {
      setTimeout(() => {
        const angle = (Math.PI * 2 * i) / zombieCount;
        const distance = 10 + Math.random() * 15;
        
        const zombie: ZombieType = {
          id: `zombie-${Date.now()}-${i}`,
          position: {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance,
          },
          health: wave < 3 ? 50 : wave < 6 ? 75 : 100,
          type: Math.random() < 0.7 ? 'walker' : Math.random() < 0.9 ? 'runner' : 'tank',
          speed: Math.random() < 0.7 ? 2 : Math.random() < 0.9 ? 4 : 1.5,
          damage: Math.random() < 0.7 ? 10 : Math.random() < 0.9 ? 15 : 25,
          target: null,
        };
        
        spawnZombie(zombie);
      }, i * 200);
    }
  };
  
  useFrame((_, delta) => {
    if (gameStatus !== 'playing') return;
    
    damageTimer.current += delta;
    waveTimer.current += delta;
    groanTimer.current += delta;
    
    // Random zombie groans
    if (groanTimer.current > 2 && zombies.length > 0 && Math.random() < 0.1) {
      groanTimer.current = 0;
      playZombieGroan();
    }
    
    // Check for zombie proximity damage
    if (damageTimer.current > 1) {
      damageTimer.current = 0;
      
      zombies.forEach((zombie) => {
        const distance = new Vector3(
          zombie.position.x - playerPosition.x,
          0,
          zombie.position.z - playerPosition.z
        ).length();
        
        if (distance < 2) {
          takeDamage(zombie.damage);
        }
      });
    }
    
    // Move zombies toward player
    zombies.forEach((zombie) => {
      const direction = new Vector3(
        playerPosition.x - zombie.position.x,
        0,
        playerPosition.z - zombie.position.z
      );
      
      if (direction.length() > 1.5) {
        direction.normalize().multiplyScalar(zombie.speed * delta);
        
        const newPosition = {
          x: zombie.position.x + direction.x,
          y: 0,
          z: zombie.position.z + direction.z,
        };
        
        updateZombiePosition(zombie.id, newPosition);
      }
      
      // Remove dead zombies
      if (zombie.health <= 0) {
        removeZombie(zombie.id);
      }
    });
    
    // Check for next wave
    if (zombies.length === 0 && waveTimer.current > 3) {
      waveTimer.current = 0;
      nextWave();
      spawnWave();
    }
  });
  
  return (
    <>
      {zombies.map((zombie) => (
        <Zombie key={zombie.id} zombie={zombie} />
      ))}
    </>
  );
}