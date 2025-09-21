import { GameScene } from '@/components/game/GameScene';
import { HUD } from '@/components/ui/HUD';
import { MainMenu } from '@/components/ui/MainMenu';
import { GameOver } from '@/components/ui/GameOver';
import { PauseMenu } from '@/components/ui/PauseMenu';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { gameStatus, shoot, reload, currentWeapon, damageZombie, zombies, playerPosition } = useGameStore();
  const audioContext = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    // Initialize audio context
    audioContext.current = new AudioContext();
    
    // Shooting mechanics
    const handleClick = (e: MouseEvent) => {
      if (gameStatus === 'playing' && e.button === 0) {
        if (shoot()) {
          // Play shooting sound effect (simulated)
          playShootSound();
          
          // Simple hit detection (ray casting would be better in production)
          const hitZombie = zombies.find(zombie => {
            const distance = Math.sqrt(
              Math.pow(zombie.position.x - playerPosition.x, 2) +
              Math.pow(zombie.position.z - playerPosition.z, 2)
            );
            return distance < currentWeapon.range;
          });
          
          if (hitZombie) {
            damageZombie(hitZombie.id, currentWeapon.damage);
          }
        } else {
          toast({
            title: "Out of ammo!",
            description: "Press R to reload",
            variant: "destructive",
          });
        }
      }
    };
    
    // Reload mechanic
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && gameStatus === 'playing') {
        reload();
        toast({
          title: "Reloading...",
          description: `${currentWeapon.name} reloaded!`,
        });
      }
    };
    
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keypress', handleKeyPress);
    
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keypress', handleKeyPress);
      audioContext.current?.close();
    };
  }, [gameStatus, shoot, reload, currentWeapon, damageZombie, zombies, playerPosition]);
  
  const playShootSound = () => {
    if (audioContext.current) {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      oscillator.frequency.value = 150;
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.1);
      
      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + 0.1);
    }
  };
  
  // Show warning when entering danger zone
  useEffect(() => {
    if (gameStatus === 'playing') {
      const timer = setInterval(() => {
        const { safeZoneRadius, safeZoneCenter, playerPosition } = useGameStore.getState();
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - safeZoneCenter.x, 2) +
          Math.pow(playerPosition.z - safeZoneCenter.y, 2)
        );
        
        if (distance > safeZoneRadius - 5) {
          toast({
            title: "WARNING!",
            description: "You're outside the safe zone!",
            variant: "destructive",
          });
        }
      }, 3000);
      
      return () => clearInterval(timer);
    }
  }, [gameStatus]);
  
  // Shrink safe zone periodically
  useEffect(() => {
    if (gameStatus === 'playing') {
      const timer = setInterval(() => {
        useGameStore.getState().shrinkSafeZone();
      }, 15000);
      
      return () => clearInterval(timer);
    }
  }, [gameStatus]);
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-dark">
      {gameStatus !== 'menu' && <GameScene />}
      <HUD />
      <MainMenu />
      <GameOver />
      <PauseMenu />
    </div>
  );
};

export default Index;