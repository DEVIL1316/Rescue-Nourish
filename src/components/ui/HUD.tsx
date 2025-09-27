import { useGameStore } from '@/store/gameStore';
import { Heart, Shield, Target, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HUD() {
  const { 
    playerHealth, 
    playerArmor, 
    currentWeapon, 
    score, 
    kills, 
    wave,
    safeZoneRadius,
    gameStatus
  } = useGameStore();
  
  const [showDamage, setShowDamage] = useState(false);
  const [prevHealth, setPrevHealth] = useState(playerHealth);
  
  useEffect(() => {
    if (playerHealth < prevHealth) {
      setShowDamage(true);
      setTimeout(() => setShowDamage(false), 500);
    }
    setPrevHealth(playerHealth);
  }, [playerHealth, prevHealth]);
  
  if (gameStatus !== 'playing' && gameStatus !== 'paused') return null;
  
  return (
    <>
      {/* Damage overlay */}
      {showDamage && (
        <div className="fixed inset-0 pointer-events-none animate-pulse">
          <div className="w-full h-full bg-gradient-blood opacity-30" />
        </div>
      )}
      
      {/* Top HUD */}
      <div className="fixed top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Wave info */}
          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-sm border border-border">
            <div className="text-destructive font-bold text-xl">WAVE {wave}</div>
            <div className="text-muted-foreground text-sm">Zone: {Math.round(safeZoneRadius)}m</div>
          </div>
          
          {/* Score */}
          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-sm border border-border text-center">
            <div className="text-accent font-bold text-2xl">{score.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">SCORE</div>
          </div>
          
          {/* Kills */}
          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-sm border border-border">
            <div className="flex items-center gap-2">
              <Target className="text-destructive" size={20} />
              <span className="text-foreground font-bold text-xl">{kills}</span>
            </div>
            <div className="text-muted-foreground text-sm">KILLS</div>
          </div>
        </div>
      </div>
      
      {/* Bottom HUD */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          {/* Health and Armor */}
          <div className="space-y-2">
            {/* Health bar */}
            <div className="bg-card/80 backdrop-blur-sm p-3 rounded-sm border border-border">
              <div className="flex items-center gap-3">
                <Heart className="text-destructive" size={24} />
                <div className="w-48">
                  <div className="bg-muted rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-danger h-full transition-all duration-300"
                      style={{ width: `${playerHealth}%` }}
                    />
                  </div>
                </div>
                <span className="text-foreground font-bold min-w-[3rem] text-right">
                  {playerHealth}
                </span>
              </div>
            </div>
            
            {/* Armor bar */}
            {playerArmor > 0 && (
              <div className="bg-card/80 backdrop-blur-sm p-3 rounded-sm border border-border">
                <div className="flex items-center gap-3">
                  <Shield className="text-blue-400" size={24} />
                  <div className="w-48">
                    <div className="bg-muted rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-blue-400 h-full transition-all duration-300"
                        style={{ width: `${playerArmor}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-foreground font-bold min-w-[3rem] text-right">
                    {playerArmor}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Weapon info */}
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-sm border border-border">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-foreground font-bold text-xl">{currentWeapon.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="text-yellow-500" size={16} />
                  <span className="text-yellow-500 font-bold text-2xl">
                    {currentWeapon.ammo} / {currentWeapon.maxAmmo}
                  </span>
                </div>
              </div>
              <div className="text-muted-foreground text-sm">
                <div>DMG: {currentWeapon.damage}</div>
                <div>RNG: {currentWeapon.range}m</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls hint */}
        <div className="text-center mt-4 text-muted-foreground text-sm space-y-1">
          <div>WASD: Move | Shift: Sprint | Space: Jump | Mouse: Aim & Shoot</div>
          <div>1/2/3: Switch Weapons | ESC: Pause</div>
        </div>
      </div>
    </>
  );
}