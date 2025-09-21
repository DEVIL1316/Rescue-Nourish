import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { Crosshair, Trophy, Settings, Info } from 'lucide-react';

export function MainMenu() {
  const { startGame, gameStatus } = useGameStore();
  
  if (gameStatus !== 'menu') return null;
  
  return (
    <div className="fixed inset-0 bg-gradient-dark flex items-center justify-center">
      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto p-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-danger tracking-wider">
            ZOMBIE SHOOTER
          </h1>
          <p className="text-xl text-accent font-semibold">
            BATTLE ROYALE SURVIVAL
          </p>
          <p className="text-muted-foreground">
            Face endless waves of zombies. Survive the shrinking safe zone. Be the last one standing.
          </p>
        </div>
        
        {/* Menu buttons */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-64 h-14 text-lg font-bold bg-gradient-danger hover:shadow-danger transition-all duration-300 transform hover:scale-105"
            onClick={startGame}
          >
            <Crosshair className="mr-2" size={24} />
            START GAME
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="w-64 h-14 text-lg font-bold bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
          >
            <Trophy className="mr-2" size={24} />
            LEADERBOARD
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="w-64 h-14 text-lg font-bold bg-secondary/50 hover:bg-secondary/70 transition-all duration-300"
          >
            <Settings className="mr-2" size={24} />
            SETTINGS
          </Button>
          
          <Button
            size="lg"
            variant="ghost"
            className="w-64 h-14 text-lg hover:text-accent transition-all duration-300"
          >
            <Info className="mr-2" size={24} />
            HOW TO PLAY
          </Button>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-12 text-sm">
          <div className="bg-card/30 backdrop-blur-sm p-4 rounded-sm border border-border/50">
            <div className="text-destructive font-bold mb-2">REALISTIC AI</div>
            <p className="text-muted-foreground">Smart zombie pathfinding and swarm behavior</p>
          </div>
          <div className="bg-card/30 backdrop-blur-sm p-4 rounded-sm border border-border/50">
            <div className="text-accent font-bold mb-2">BATTLE ROYALE</div>
            <p className="text-muted-foreground">Shrinking safe zone forces intense combat</p>
          </div>
          <div className="bg-card/30 backdrop-blur-sm p-4 rounded-sm border border-border/50">
            <div className="text-primary font-bold mb-2">SURVIVAL</div>
            <p className="text-muted-foreground">Manage health, armor, and ammunition</p>
          </div>
        </div>
      </div>
      
      {/* Background effect */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-toxic animate-pulse-danger" />
      </div>
    </div>
  );
}