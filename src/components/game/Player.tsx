import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useGameStore } from '@/store/gameStore';

export function Player() {
  const meshRef = useRef<Group>(null);
  const { 
    playerPosition, 
    movePlayer, 
    gameStatus, 
    currentWeapon, 
    switchWeapon, 
    shoot 
  } = useGameStore();
  
  const velocity = useRef(new Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const jumpHeight = 8;
  const gravity = -20;
  
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
  });
  
  const isShooting = useRef(false);
  const shootTimer = useRef(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Movement keys
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        keys.current[key as keyof typeof keys.current] = true;
      }
      
      // Jump
      if (key === ' ') {
        keys.current.space = true;
      }
      
      // Sprint
      if (key === 'shift') {
        keys.current.shift = true;
      }
      
      // Weapon switching
      if (key === '1') switchWeapon(0);
      if (key === '2') switchWeapon(1);
      if (key === '3') switchWeapon(2);
      
      // Prevent space from scrolling page
      if (key === ' ') {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        keys.current[key as keyof typeof keys.current] = false;
      }
      if (key === ' ') {
        keys.current.space = false;
      }
      if (key === 'shift') {
        keys.current.shift = false;
      }
      if (key === 'shift') {
        keys.current.shift = false;
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && gameStatus === 'playing') {
        isShooting.current = true;
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isShooting.current = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [switchWeapon, gameStatus]);
  
  useFrame((state, delta) => {
    if (!meshRef.current || gameStatus !== 'playing') return;
    
    // Speed: normal = 15, sprint = 25
    const baseSpeed = 15;
    const sprintMultiplier = 1.7;
    const speed = keys.current.shift ? baseSpeed * sprintMultiplier : baseSpeed;
    
    const moveVector = new Vector3(0, 0, 0);
    
    // Horizontal movement
    if (keys.current.w) moveVector.z -= 1;
    if (keys.current.s) moveVector.z += 1;
    if (keys.current.a) moveVector.x -= 1;
    if (keys.current.d) moveVector.x += 1;
    
    // Apply horizontal movement
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);
    }
    
    // Jumping
    if (keys.current.space && isGrounded.current) {
      velocity.current.y = jumpHeight;
      isGrounded.current = false;
    }
    
    // Apply gravity
    velocity.current.y += gravity * delta;
    
    // Update position
    const newPosition = {
      x: playerPosition.x + moveVector.x,
      y: playerPosition.y + velocity.current.y * delta,
      z: playerPosition.z + moveVector.z,
    };
    
    // Ground collision
    if (newPosition.y <= 0) {
      newPosition.y = 0;
      velocity.current.y = 0;
      isGrounded.current = true;
    }
    
    // Clamp to map bounds
    newPosition.x = Math.max(-395, Math.min(395, newPosition.x));
    newPosition.z = Math.max(-395, Math.min(395, newPosition.z));
    
    movePlayer(newPosition);
    meshRef.current.position.set(newPosition.x, newPosition.y + 1, newPosition.z);
    
    // Shooting
    shootTimer.current += delta;
    if (isShooting.current) {
      const fireRate = currentWeapon.fireRate;
      if (shootTimer.current > 1 / fireRate) {
        shootTimer.current = 0;
        shoot();
      }
    }
    
    // Update camera to follow player from a better angle
    state.camera.position.x = playerPosition.x;
    state.camera.position.y = 30;
    state.camera.position.z = playerPosition.z + 30;
    state.camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
  });
  
  // Get weapon model based on current weapon
  const renderWeapon = () => {
    switch(currentWeapon.name) {
      case 'Pistol':
        return (
          <group position={[0.35, 1.0, -0.3]} rotation={[0, 0, -0.2]}>
            {/* Pistol Body */}
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.12, 0.15]} />
              <meshStandardMaterial color="hsl(0, 0%, 10%)" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Pistol Barrel */}
            <mesh castShadow position={[0, 0, -0.1]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1]} />
              <meshStandardMaterial color="hsl(0, 0%, 5%)" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Grip */}
            <mesh castShadow position={[0, -0.06, 0.02]}>
              <boxGeometry args={[0.04, 0.08, 0.06]} />
              <meshStandardMaterial color="hsl(0, 0%, 15%)" />
            </mesh>
            {/* Muzzle Flash */}
            {isShooting.current && shootTimer.current < 0.1 && (
              <mesh position={[0, 0, -0.15]}>
                <coneGeometry args={[0.08, 0.15, 6]} />
                <meshBasicMaterial color="hsl(38, 100%, 70%)" transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        );
        
      case 'Shotgun':
        return (
          <group position={[0.35, 1.0, -0.4]} rotation={[0, 0, -0.2]}>
            {/* Shotgun Body */}
            <mesh castShadow>
              <boxGeometry args={[0.1, 0.15, 0.6]} />
              <meshStandardMaterial color="hsl(30, 20%, 25%)" metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Double Barrels */}
            <mesh castShadow position={[0.02, 0.02, -0.35]}>
              <cylinderGeometry args={[0.025, 0.025, 0.4]} />
              <meshStandardMaterial color="hsl(0, 0%, 8%)" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh castShadow position={[-0.02, 0.02, -0.35]}>
              <cylinderGeometry args={[0.025, 0.025, 0.4]} />
              <meshStandardMaterial color="hsl(0, 0%, 8%)" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Stock */}
            <mesh castShadow position={[0, -0.02, 0.35]}>
              <boxGeometry args={[0.08, 0.12, 0.2]} />
              <meshStandardMaterial color="hsl(30, 25%, 20%)" />
            </mesh>
            {/* Muzzle Flash */}
            {isShooting.current && shootTimer.current < 0.1 && (
              <mesh position={[0, 0.02, -0.55]}>
                <coneGeometry args={[0.2, 0.3, 8]} />
                <meshBasicMaterial color="hsl(38, 100%, 80%)" transparent opacity={0.9} />
              </mesh>
            )}
          </group>
        );
        
      case 'Rifle':
      default:
        return (
          <group position={[0.35, 1.0, -0.4]} rotation={[0, 0, -0.2]}>
            {/* Gun Body */}
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.15, 0.8]} />
              <meshStandardMaterial color="hsl(0, 0%, 10%)" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Gun Barrel */}
            <mesh castShadow position={[0, 0, -0.5]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3]} />
              <meshStandardMaterial color="hsl(0, 0%, 5%)" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Magazine */}
            <mesh castShadow position={[0, -0.1, 0.1]}>
              <boxGeometry args={[0.04, 0.15, 0.08]} />
              <meshStandardMaterial color="hsl(0, 0%, 15%)" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Scope */}
            <mesh castShadow position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.15]} />
              <meshStandardMaterial color="hsl(0, 0%, 8%)" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Muzzle Flash */}
            {isShooting.current && shootTimer.current < 0.1 && (
              <mesh position={[0, 0, -0.65]}>
                <coneGeometry args={[0.15, 0.3, 6]} />
                <meshBasicMaterial color="hsl(38, 100%, 70%)" transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        );
    }
  };
  
  return (
    <group ref={meshRef} position={[playerPosition.x, playerPosition.y + 1, playerPosition.z]} scale={[2, 2, 2]}>
      {/* Player Body */}
      <group>
        {/* Torso */}
        <mesh castShadow position={[0, 1.2, 0]}>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
          <meshStandardMaterial color="hsl(120, 20%, 25%)" />
        </mesh>
        
        {/* Head */}
        <mesh castShadow position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="hsl(30, 40%, 70%)" />
        </mesh>
        
        {/* Helmet */}
        <mesh castShadow position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="hsl(120, 10%, 20%)" metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Left Arm */}
        <mesh castShadow position={[-0.4, 1.1, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color="hsl(120, 20%, 25%)" />
        </mesh>
        
        {/* Right Arm holding weapon */}
        <mesh castShadow position={[0.4, 1.1, -0.2]} rotation={[-0.5, 0, -0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color="hsl(120, 20%, 25%)" />
        </mesh>
        
        {/* Left Leg */}
        <mesh castShadow position={[-0.15, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.8]} />
          <meshStandardMaterial color="hsl(120, 10%, 15%)" />
        </mesh>
        
        {/* Right Leg */}
        <mesh castShadow position={[0.15, 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.8]} />
          <meshStandardMaterial color="hsl(120, 10%, 15%)" />
        </mesh>
        
        {/* Boots */}
        <mesh castShadow position={[-0.15, 0, 0.05]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 10%)" />
        </mesh>
        <mesh castShadow position={[0.15, 0, 0.05]}>
          <boxGeometry args={[0.18, 0.1, 0.25]} />
          <meshStandardMaterial color="hsl(0, 0%, 10%)" />
        </mesh>
        
        {/* Tactical Vest */}
        <mesh castShadow position={[0, 1.2, 0.18]}>
          <boxGeometry args={[0.5, 0.6, 0.1]} />
          <meshStandardMaterial color="hsl(0, 0%, 15%)" metalness={0.1} roughness={0.9} />
        </mesh>
        
        {/* Backpack */}
        <mesh castShadow position={[0, 1.2, -0.25]}>
          <boxGeometry args={[0.4, 0.5, 0.2]} />
          <meshStandardMaterial color="hsl(120, 10%, 18%)" />
        </mesh>
      </group>
      
      {/* Weapon */}
      {renderWeapon()}
    </group>
  );
}