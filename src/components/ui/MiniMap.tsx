import { useGameStore } from '@/store/gameStore';

export function MiniMap() {
  const { playerPosition, zombies, safeZoneRadius } = useGameStore();
  
  // Map dimensions and scale
  const mapSize = 200; // pixels
  const worldSize = 400; // game world units (-200 to 200)
  const scale = mapSize / worldSize;
  
  // Convert world coordinates to minimap coordinates
  const worldToMap = (x: number, z: number) => ({
    x: (x + worldSize / 2) * scale,
    y: (z + worldSize / 2) * scale,
  });
  
  const playerMap = worldToMap(playerPosition.x, playerPosition.z);
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className="relative bg-black/70 border-2 border-white/30 rounded-lg backdrop-blur-sm"
        style={{ width: mapSize, height: mapSize }}
      >
        {/* Safe zone circle */}
        <div
          className="absolute border-2 border-green-500/30 rounded-full"
          style={{
            width: safeZoneRadius * 2 * scale,
            height: safeZoneRadius * 2 * scale,
            left: mapSize / 2 - safeZoneRadius * scale,
            top: mapSize / 2 - safeZoneRadius * scale,
          }}
        />
        
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {[0, 1, 2, 3, 4].map((i) => {
            const pos = (i * mapSize) / 4;
            return (
              <g key={i}>
                <line x1={pos} y1={0} x2={pos} y2={mapSize} stroke="white" strokeWidth="1" />
                <line x1={0} y1={pos} x2={mapSize} y2={pos} stroke="white" strokeWidth="1" />
              </g>
            );
          })}
        </svg>
        
        {/* Center cross */}
        <div className="absolute left-1/2 top-1/2 w-4 h-4 -ml-2 -mt-2">
          <div className="absolute w-full h-0.5 bg-white/30 top-1/2 -mt-px" />
          <div className="absolute h-full w-0.5 bg-white/30 left-1/2 -ml-px" />
        </div>
        
        {/* Zombies - red dots */}
        {zombies.map((zombie) => {
          const zombieMap = worldToMap(zombie.position.x, zombie.position.z);
          
          // Only show zombies within the map bounds
          if (zombieMap.x < 0 || zombieMap.x > mapSize || zombieMap.y < 0 || zombieMap.y > mapSize) {
            return null;
          }
          
          return (
            <div
              key={zombie.id}
              className="absolute rounded-full animate-pulse"
              style={{
                left: zombieMap.x - 3,
                top: zombieMap.y - 3,
                width: 6,
                height: 6,
                backgroundColor: zombie.type === 'tank' ? '#ff0000' : 
                                zombie.type === 'runner' ? '#ff6600' : 
                                zombie.type === 'bear' ? '#cc0000' :
                                zombie.type === 'wolf' ? '#dd0000' :
                                zombie.type === 'dog' ? '#ee0000' : '#ff3333',
                boxShadow: '0 0 4px rgba(255, 0, 0, 0.8)',
              }}
            />
          );
        })}
        
        {/* Player - green dot with direction indicator */}
        <div
          className="absolute"
          style={{
            left: playerMap.x - 5,
            top: playerMap.y - 5,
          }}
        >
          {/* Outer glow */}
          <div className="absolute w-10 h-10 -left-2.5 -top-2.5 bg-green-500/20 rounded-full animate-pulse" />
          
          {/* Player dot */}
          <div 
            className="relative w-5 h-5 rounded-full"
            style={{
              backgroundColor: '#00ff00',
              boxShadow: '0 0 8px rgba(0, 255, 0, 0.8)',
            }}
          >
            {/* Direction triangle */}
            <div
              className="absolute w-0 h-0 left-1/2 -ml-1"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '6px solid #00ff00',
                top: -6,
              }}
            />
          </div>
        </div>
        
        {/* Wave info */}
        <div className="absolute -bottom-8 left-0 right-0 text-center text-white text-xs font-bold">
          Mini Map
        </div>
      </div>
    </div>
  );
}
