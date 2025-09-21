import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';
import { useEffect } from 'react';

export function PauseMenu() {
  const { gameStatus, pauseGame, resumeGame } = useGameStore();
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameStatus === 'playing') {
          pauseGame();
        } else if (gameStatus === 'paused') {
          resumeGame();
        }
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [gameStatus, pauseGame, resumeGame]);
  
  if (gameStatus !== 'paused') return null;
  
  const handleMainMenu = () => {
    window.location.reload();
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8 bg-card rounded-sm border border-border max-w-md w-full">
        <h2 className="text-4xl font-bold text-foreground">PAUSED</h2>
        
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-gradient-toxic hover:shadow-toxic transition-all duration-300"
            onClick={resumeGame}
          >
            <Play className="mr-2" size={20} />
            RESUME
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="mr-2" size={20} />
            RESTART
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
          >
            <Settings className="mr-2" size={20} />
            SETTINGS
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={handleMainMenu}
          >
            <Home className="mr-2" size={20} />
            MAIN MENU
          </Button>
        </div>
        
        <div className="text-muted-foreground text-sm">
          Press ESC to resume
        </div>
      </div>
    </div>
  );
}