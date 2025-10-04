import { useGameStore } from '@/store/gameStore';
import { Heart, Shield, Target, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function HUD() {
  const { 
    playerHealth, 
    playerArmor, 
    currentWeapon, 
    score, 
    kills, 
    wave,
    safeZoneRadius,
    gameStatus,
    weapons,
    switchWeapon
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
        
        {/* Weapon Switcher - Centered */}
        <div className="flex justify-center mt-6">
          <div className="bg-card/90 backdrop-blur-sm p-3 rounded-sm border border-border pointer-events-auto">
            <div className="flex gap-3">
              {weapons.map((weapon, index) => (
                <button
                  key={weapon.name}
                  onClick={() => switchWeapon(index)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-3 rounded transition-all",
                    "hover:bg-accent/20",
                    currentWeapon.name === weapon.name 
                      ? "bg-accent/30 border-2 border-accent" 
                      : "border-2 border-transparent"
                  )}
                >
                  {/* Weapon Icon */}
                  <div className="w-16 h-12 flex items-center justify-center">
                    {weapon.name === 'Pistol' && (
                      <svg viewBox="0 0 64 48" className="w-full h-full">
                        <rect x="8" y="20" width="20" height="8" fill="currentColor" />
                        <rect x="28" y="16" width="12" height="16" fill="currentColor" />
                        <rect x="40" y="20" width="8" height="8" fill="currentColor" />
                        <rect x="20" y="28" width="8" height="8" fill="currentColor" />
                      </svg>
                    )}
                    {weapon.name === 'Shotgun' && (
                      <svg viewBox="0 0 64 48" className="w-full h-full">
                        <rect x="4" y="20" width="36" height="8" fill="currentColor" />
                        <rect x="40" y="18" width="12" height="12" fill="currentColor" />
                        <rect x="52" y="22" width="8" height="4" fill="currentColor" />
                        <rect x="16" y="28" width="8" height="8" fill="currentColor" />
                      </svg>
                    )}
                    {weapon.name === 'Assault Rifle' && (
                      <svg viewBox="0 0 64 48" className="w-full h-full">
                        <rect x="4" y="20" width="40" height="6" fill="currentColor" />
                        <rect x="44" y="18" width="12" height="10" fill="currentColor" />
                        <rect x="56" y="21" width="6" height="4" fill="currentColor" />
                        <rect x="20" y="26" width="8" height="6" fill="currentColor" />
                        <rect x="12" y="16" width="4" height="4" fill="currentColor" />
                      </svg>
                    )}
                    {weapon.name === 'Sniper Rifle' && (
                      <svg viewBox="0 0 64 48" className="w-full h-full">
                        <rect x="2" y="22" width="48" height="4" fill="currentColor" />
                        <rect x="50" y="20" width="10" height="8" fill="currentColor" />
                        <rect x="24" y="26" width="8" height="6" fill="currentColor" />
                        <rect x="12" y="18" width="8" height="4" fill="currentColor" />
                        <circle cx="8" cy="24" r="4" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Weapon Name & Ammo */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground">{weapon.name}</div>
                    <div className="text-xs text-yellow-500 font-bold">{weapon.ammo}/{weapon.maxAmmo}</div>
                  </div>
                  
                  {/* Key hint */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Controls hint */}
        <div className="text-center mt-3 text-muted-foreground text-xs">
          WASD: Move | Shift: Sprint | Space: Jump | R: Reload | ESC: Pause
        </div>
      </div>
    </>
  );
}