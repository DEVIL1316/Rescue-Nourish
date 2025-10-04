// Sound effects utility using Web Audio API

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Gun sound effects
export const playPistolSound = () => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(180, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
  
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  
  gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.12);
};

export const playShotgunSound = () => {
  const ctx = getAudioContext();
  
  // Create multiple noise sources for shotgun blast
  for (let i = 0; i < 3; i++) {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let j = 0; j < bufferSize; j++) {
      data[j] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    filter.type = 'lowpass';
    filter.frequency.value = 800 - (i * 200);
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    noise.start(ctx.currentTime + (i * 0.01));
    noise.stop(ctx.currentTime + 0.2);
  }
};

export const playAssaultRifleSound = () => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(200, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.06);
  
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  filter.Q.value = 2;
  
  gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.08);
};

export const playSniperSound = () => {
  const ctx = getAudioContext();
  
  // Bass thump
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  
  bass.connect(bassGain);
  bassGain.connect(ctx.destination);
  
  bass.type = 'sine';
  bass.frequency.setValueAtTime(120, ctx.currentTime);
  bass.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
  
  bassGain.gain.setValueAtTime(0.6, ctx.currentTime);
  bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  
  bass.start(ctx.currentTime);
  bass.stop(ctx.currentTime + 0.2);
  
  // Sharp crack
  const crack = ctx.createOscillator();
  const crackGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  crack.connect(filter);
  filter.connect(crackGain);
  crackGain.connect(ctx.destination);
  
  crack.type = 'square';
  crack.frequency.value = 800;
  
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  
  crackGain.gain.setValueAtTime(0.3, ctx.currentTime);
  crackGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  
  crack.start(ctx.currentTime);
  crack.stop(ctx.currentTime + 0.05);
};

export const playReloadSound = () => {
  const ctx = getAudioContext();
  
  // Click sound
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  
  click.type = 'square';
  click.frequency.value = 400;
  
  clickGain.gain.setValueAtTime(0.2, ctx.currentTime);
  clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  
  click.start(ctx.currentTime);
  click.stop(ctx.currentTime + 0.05);
  
  // Mechanical sound
  const mech = ctx.createOscillator();
  const mechGain = ctx.createGain();
  
  mech.connect(mechGain);
  mechGain.connect(ctx.destination);
  
  mech.type = 'sawtooth';
  mech.frequency.setValueAtTime(250, ctx.currentTime + 0.1);
  mech.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
  
  mechGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
  mechGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  mech.start(ctx.currentTime + 0.1);
  mech.stop(ctx.currentTime + 0.3);
};

// Zombie sound effects
export const playZombieGroan = () => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(60 + Math.random() * 30, ctx.currentTime + 0.5);
  
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 3;
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
  gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
};

export const playZombieHit = () => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150 + Math.random() * 50, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
  
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
};

export const playZombieDeath = () => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(100, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.8);
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.4);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.8);
};

export const playGunSoundByWeapon = (weaponName: string) => {
  switch (weaponName) {
    case 'Pistol':
      playPistolSound();
      break;
    case 'Shotgun':
      playShotgunSound();
      break;
    case 'Assault Rifle':
      playAssaultRifleSound();
      break;
    case 'Sniper Rifle':
      playSniperSound();
      break;
    default:
      playPistolSound();
  }
};

export const closeAudioContext = () => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};
