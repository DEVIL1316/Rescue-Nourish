import { GameScene } from '@/components/game/GameScene';
import { HUD } from '@/components/ui/HUD';
import { MainMenu } from '@/components/ui/MainMenu';
import { GameOver } from '@/components/ui/GameOver';
import { PauseMenu } from '@/components/ui/PauseMenu';
import { MiniMap } from '@/components/ui/MiniMap';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { playGunSoundByWeapon, playReloadSound, closeAudioContext } from '@/utils/soundEffects';

const Index = () => {
  const { gameStatus, shoot, reload, currentWeapon, damageZombie, zombies, playerPosition } = useGameStore();
  
  useEffect(() => {
    // Shooting mechanics
    const handleClick = (e: MouseEvent) => {
      if (gameStatus === 'playing' && e.button === 0) {
        if (shoot()) {
          // Play weapon-specific sound
          playGunSoundByWeapon(currentWeapon.name);
          
          // Simple hit detection
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
        playReloadSound();
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
      closeAudioContext();
    };
  }, [gameStatus, shoot, reload, currentWeapon, damageZombie, zombies, playerPosition]);
  
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
      {gameStatus === 'playing' && <MiniMap />}
      <MainMenu />
      <GameOver />
      <PauseMenu />
    </div>
  );
};

export default Index;