import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { RotateCcw, Home, Trophy } from 'lucide-react';

export function GameOver() {
  const { gameStatus, score, kills, wave, startGame } = useGameStore();
  
  if (gameStatus !== 'gameOver') return null;
  
  const handleMainMenu = () => {
    window.location.reload();
  };
  
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8 bg-card rounded-sm border-2 border-destructive shadow-danger max-w-md w-full">
        <h2 className="text-5xl font-black text-destructive">GAME OVER</h2>
        
        <div className="space-y-4 py-6">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-sm">
            <span className="text-muted-foreground">FINAL SCORE</span>
            <span className="text-2xl font-bold text-accent">{score.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-sm">
            <span className="text-muted-foreground">ZOMBIES KILLED</span>
            <span className="text-2xl font-bold text-destructive">{kills}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-sm">
            <span className="text-muted-foreground">WAVES SURVIVED</span>
            <span className="text-2xl font-bold text-primary">{wave - 1}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-gradient-danger hover:shadow-danger transition-all duration-300"
            onClick={startGame}
          >
            <RotateCcw className="mr-2" size={20} />
            TRY AGAIN
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={handleMainMenu}
          >
            <Home className="mr-2" size={20} />
            MAIN MENU
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent/10"
          >
            <Trophy className="mr-2" size={20} />
            VIEW LEADERBOARD
          </Button>
        </div>
      </div>
    </div>
  );
}