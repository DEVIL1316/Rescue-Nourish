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
    takeDamage,
    zombieLevel,
    increaseZombieLevel
  } = useGameStore();
  
  const spawnTimer = useRef(0);
  const waveTimer = useRef(0);
  const damageTimer = useRef(0);
  const groanTimer = useRef(0);
  const levelTimer = useRef(0);
  
  useEffect(() => {
    if (gameStatus === 'playing' && zombies.length === 0) {
      console.log('Spawning initial wave, current wave:', wave, 'level:', zombieLevel);
      // Spawn initial wave
      const zombieCount = 3 + wave * 2;
      
      for (let i = 0; i < zombieCount; i++) {
        const angle = (Math.PI * 2 * i) / zombieCount;
        const distance = 10 + Math.random() * 15;
        
        // Calculate stats based on level
        const baseHealth = 80 + (zombieLevel * 20);
        const baseDamage = 15 + (zombieLevel * 5);
        const baseSpeed = 2 + (zombieLevel * 0.3);
        
        // Random zombie type
        const rand = Math.random();
        let type: ZombieType['type'];
        let health: number;
        let speed: number;
        let damage: number;
        
        if (rand < 0.5) {
          type = 'walker';
          health = baseHealth;
          speed = baseSpeed;
          damage = baseDamage;
        } else if (rand < 0.75) {
          type = 'runner';
          health = baseHealth * 0.7;
          speed = baseSpeed * 1.8;
          damage = baseDamage * 1.2;
        } else if (rand < 0.9) {
          type = 'tank';
          health = baseHealth * 2.5;
          speed = baseSpeed * 0.6;
          damage = baseDamage * 2;
        } else {
          // Animal zombies at higher levels
          const animalTypes: ZombieType['type'][] = ['dog', 'wolf', 'bear'];
          type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
          health = baseHealth * 1.5;
          speed = baseSpeed * 1.4;
          damage = baseDamage * 1.3;
        }
        
        const zombie: ZombieType = {
          id: `zombie-${Date.now()}-${Math.random()}`,
          position: {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance,
          },
          health,
          type,
          speed,
          damage,
          target: null,
        };
        
        console.log('Spawning zombie:', zombie);
        spawnZombie(zombie);
      }
    }
  }, [gameStatus, wave, zombies.length, spawnZombie, zombieLevel]);
  
  const spawnWave = () => {
    const zombieCount = 3 + wave * 2;
    console.log('Spawning new wave with', zombieCount, 'zombies at level', zombieLevel);
    
    for (let i = 0; i < zombieCount; i++) {
      setTimeout(() => {
        const angle = (Math.PI * 2 * i) / zombieCount;
        const distance = 10 + Math.random() * 15;
        
        // Calculate stats based on level
        const baseHealth = 80 + (zombieLevel * 20);
        const baseDamage = 15 + (zombieLevel * 5);
        const baseSpeed = 2 + (zombieLevel * 0.3);
        
        // Random zombie type
        const rand = Math.random();
        let type: ZombieType['type'];
        let health: number;
        let speed: number;
        let damage: number;
        
        if (rand < 0.5) {
          type = 'walker';
          health = baseHealth;
          speed = baseSpeed;
          damage = baseDamage;
        } else if (rand < 0.75) {
          type = 'runner';
          health = baseHealth * 0.7;
          speed = baseSpeed * 1.8;
          damage = baseDamage * 1.2;
        } else if (rand < 0.9) {
          type = 'tank';
          health = baseHealth * 2.5;
          speed = baseSpeed * 0.6;
          damage = baseDamage * 2;
        } else {
          // Animal zombies at higher levels
          const animalTypes: ZombieType['type'][] = ['dog', 'wolf', 'bear'];
          type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
          health = baseHealth * 1.5;
          speed = baseSpeed * 1.4;
          damage = baseDamage * 1.3;
        }
        
        const zombie: ZombieType = {
          id: `zombie-${Date.now()}-${i}`,
          position: {
            x: Math.cos(angle) * distance,
            y: 0,
            z: Math.sin(angle) * distance,
          },
          health,
          type,
          speed,
          damage,
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
    levelTimer.current += delta;
    
    // Increase zombie level every 60 seconds (1 minute)
    if (levelTimer.current > 60) {
      levelTimer.current = 0;
      increaseZombieLevel();
      console.log('Zombie level increased to:', zombieLevel + 1);
    }
    
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