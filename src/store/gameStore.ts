import { create } from 'zustand';

export interface Zombie {
  id: string;
  position: { x: number; y: number; z: number };
  health: number;
  type: 'walker' | 'runner' | 'tank';
  speed: number;
  damage: number;
  target: { x: number; y: number; z: number } | null;
}

export interface Weapon {
  name: string;
  damage: number;
  ammo: number;
  maxAmmo: number;
  fireRate: number;
  range: number;
}

interface GameState {
  // Player state
  playerHealth: number;
  playerArmor: number;
  playerPosition: { x: number; y: number; z: number };
  score: number;
  kills: number;
  
  // Weapons
  currentWeapon: Weapon;
  weapons: Weapon[];
  
  // Zombies
  zombies: Zombie[];
  wave: number;
  
  // Game state
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver';
  safeZoneRadius: number;
  safeZoneCenter: { x: number; y: number };
  
  // Actions
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  addArmor: (amount: number) => void;
  movePlayer: (position: { x: number; y: number; z: number }) => void;
  
  switchWeapon: (index: number) => void;
  reload: () => void;
  shoot: () => boolean;
  
  spawnZombie: (zombie: Zombie) => void;
  damageZombie: (id: string, damage: number) => void;
  removeZombie: (id: string) => void;
  updateZombiePosition: (id: string, position: { x: number; y: number; z: number }) => void;
  
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  
  shrinkSafeZone: () => void;
  nextWave: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial player state
  playerHealth: 100,
  playerArmor: 0,
  playerPosition: { x: 0, y: 0, z: 0 },
  score: 0,
  kills: 0,
  
  // Initial weapons
  currentWeapon: {
    name: 'Pistol',
    damage: 25,
    ammo: 12,
    maxAmmo: 12,
    fireRate: 2,
    range: 20,
  },
  weapons: [
    {
      name: 'Pistol',
      damage: 25,
      ammo: 12,
      maxAmmo: 12,
      fireRate: 2,
      range: 20,
    },
  ],
  
  // Initial zombies
  zombies: [],
  wave: 1,
  
  // Initial game state
  gameStatus: 'menu',
  safeZoneRadius: 100,
  safeZoneCenter: { x: 0, y: 0 },
  
  // Player actions
  takeDamage: (damage) =>
    set((state) => {
      const remainingDamage = Math.max(0, damage - state.playerArmor);
      const newArmor = Math.max(0, state.playerArmor - damage);
      const newHealth = Math.max(0, state.playerHealth - remainingDamage);
      
      if (newHealth === 0) {
        get().gameOver();
      }
      
      return {
        playerArmor: newArmor,
        playerHealth: newHealth,
      };
    }),
  
  heal: (amount) =>
    set((state) => ({
      playerHealth: Math.min(100, state.playerHealth + amount),
    })),
  
  addArmor: (amount) =>
    set((state) => ({
      playerArmor: Math.min(100, state.playerArmor + amount),
    })),
  
  movePlayer: (position) =>
    set(() => ({
      playerPosition: position,
    })),
  
  // Weapon actions
  switchWeapon: (index) =>
    set((state) => ({
      currentWeapon: state.weapons[index] || state.currentWeapon,
    })),
  
  reload: () =>
    set((state) => ({
      currentWeapon: {
        ...state.currentWeapon,
        ammo: state.currentWeapon.maxAmmo,
      },
    })),
  
  shoot: () => {
    const state = get();
    if (state.currentWeapon.ammo > 0) {
      set((state) => ({
        currentWeapon: {
          ...state.currentWeapon,
          ammo: state.currentWeapon.ammo - 1,
        },
      }));
      return true;
    }
    return false;
  },
  
  // Zombie actions
  spawnZombie: (zombie) =>
    set((state) => ({
      zombies: [...state.zombies, zombie],
    })),
  
  damageZombie: (id, damage) =>
    set((state) => ({
      zombies: state.zombies.map((z) =>
        z.id === id ? { ...z, health: Math.max(0, z.health - damage) } : z
      ),
    })),
  
  removeZombie: (id) =>
    set((state) => ({
      zombies: state.zombies.filter((z) => z.id !== id),
      kills: state.kills + 1,
      score: state.score + 100,
    })),
  
  updateZombiePosition: (id, position) =>
    set((state) => ({
      zombies: state.zombies.map((z) =>
        z.id === id ? { ...z, position } : z
      ),
    })),
  
  // Game control actions
  startGame: () =>
    set(() => ({
      gameStatus: 'playing',
      playerHealth: 100,
      playerArmor: 0,
      score: 0,
      kills: 0,
      wave: 1,
      zombies: [],
      safeZoneRadius: 100,
    })),
  
  pauseGame: () =>
    set(() => ({
      gameStatus: 'paused',
    })),
  
  resumeGame: () =>
    set(() => ({
      gameStatus: 'playing',
    })),
  
  gameOver: () =>
    set(() => ({
      gameStatus: 'gameOver',
    })),
  
  shrinkSafeZone: () =>
    set((state) => ({
      safeZoneRadius: Math.max(20, state.safeZoneRadius - 5),
    })),
  
  nextWave: () =>
    set((state) => ({
      wave: state.wave + 1,
    })),
}));