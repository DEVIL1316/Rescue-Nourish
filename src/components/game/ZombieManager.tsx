import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore, Zombie as ZombieType } from '@/store/gameStore';
import { Zombie } from './Zombie';

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
  
  useEffect(() => {
    if (gameStatus === 'playing' && zombies.length === 0) {
      console.log('Spawning initial wave, current wave:', wave);
      // Spawn initial wave
      const zombieCount = 3 + wave * 2;
      
      for (let i = 0; i < zombieCount; i++) {
        const angle = (Math.PI * 2 * i) / zombieCount;
        const distance = 10 + Math.random() * 15;
        
        // Random zombie type with animal zombies included
        const rand = Math.random();
        let zombieType: 'walker' | 'runner' | 'tank' | 'dog' | 'bear' | 'wolf';
        let zombieSpeed: number;
        let zombieDamage: number;
        let zombieHealth: number;
        
        if (rand < 0.4) {
          zombieType = 'walker';
          zombieSpeed = 2;
          zombieDamage = 10;
          zombieHealth = wave < 3 ? 50 : wave < 6 ? 75 : 100;
        } else if (rand < 0.55) {
          zombieType = 'runner';
          zombieSpeed = 4;
          zombieDamage = 15;
          zombieHealth = wave < 3 ? 40 : wave < 6 ? 60 : 80;
        } else if (rand < 0.65) {
          zombieType = 'tank';
          zombieSpeed = 1.5;
          zombieDamage = 25;
          zombieHealth = wave < 3 ? 80 : wave < 6 ? 120 : 150;
        } else if (rand < 0.78) {
          zombieType = 'dog';
          zombieSpeed = 5;
          zombieDamage = 12;
          zombieHealth = wave < 3 ? 35 : wave < 6 ? 50 : 65;
        } else if (rand < 0.90) {
          zombieType = 'wolf';
          zombieSpeed = 3.5;
          zombieDamage = 18;
          zombieHealth = wave < 3 ? 45 : wave < 6 ? 65 : 85;
        } else {
          zombieType = 'bear';
          zombieSpeed = 2.5;
          zombieDamage = 30;
          zombieHealth = wave < 3 ? 90 : wave < 6 ? 130 : 170;
        }
        
        const zombie: ZombieType = {
          id: `zombie-${Date.now()}-${Math.random()}`,
          position: {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance,
          },
          health: zombieHealth,
          type: zombieType,
          speed: zombieSpeed,
          damage: zombieDamage,
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
        
        // Random zombie type with animal zombies included
        const rand = Math.random();
        let zombieType: 'walker' | 'runner' | 'tank' | 'dog' | 'bear' | 'wolf';
        let zombieSpeed: number;
        let zombieDamage: number;
        let zombieHealth: number;
        
        if (rand < 0.4) {
          zombieType = 'walker';
          zombieSpeed = 2;
          zombieDamage = 10;
          zombieHealth = wave < 3 ? 50 : wave < 6 ? 75 : 100;
        } else if (rand < 0.55) {
          zombieType = 'runner';
          zombieSpeed = 4;
          zombieDamage = 15;
          zombieHealth = wave < 3 ? 40 : wave < 6 ? 60 : 80;
        } else if (rand < 0.65) {
          zombieType = 'tank';
          zombieSpeed = 1.5;
          zombieDamage = 25;
          zombieHealth = wave < 3 ? 80 : wave < 6 ? 120 : 150;
        } else if (rand < 0.78) {
          zombieType = 'dog';
          zombieSpeed = 5;
          zombieDamage = 12;
          zombieHealth = wave < 3 ? 35 : wave < 6 ? 50 : 65;
        } else if (rand < 0.90) {
          zombieType = 'wolf';
          zombieSpeed = 3.5;
          zombieDamage = 18;
          zombieHealth = wave < 3 ? 45 : wave < 6 ? 65 : 85;
        } else {
          zombieType = 'bear';
          zombieSpeed = 2.5;
          zombieDamage = 30;
          zombieHealth = wave < 3 ? 90 : wave < 6 ? 130 : 170;
        }
        
        const zombie: ZombieType = {
          id: `zombie-${Date.now()}-${i}`,
          position: {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance,
          },
          health: zombieHealth,
          type: zombieType,
          speed: zombieSpeed,
          damage: zombieDamage,
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