// Web Radio player.
// All stations are hand-picked from SomaFM (rock-solid HTTPS Icecast streams,
// publicly licensed for direct linking, no API key, no ads).
// The 128-mp3 endpoints are universally supported by HTML5 <audio>.

export const RADIO_STATIONS = [
  // CHILL / AMBIENT
  { id: 'groove_salad',   name: 'Groove Salad',       genre: 'Chill',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    description: 'Ambient + downtempo beats' },
  { id: 'drone_zone',     name: 'Drone Zone',         genre: 'Chill',
    url: 'https://ice1.somafm.com/dronezone-128-mp3',
    description: 'Atmospheric textures + drone' },
  { id: 'lush',           name: 'Lush',               genre: 'Chill',
    url: 'https://ice1.somafm.com/lush-128-mp3',
    description: 'Mellow vocals + sensuous female voices' },
  { id: 'deep_space_one', name: 'Deep Space One',     genre: 'Chill',
    url: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    description: 'Deep ambient electronic for space travel' },

  // ELECTRONIC
  { id: 'beat_blender',   name: 'Beat Blender',       genre: 'Electronic',
    url: 'https://ice1.somafm.com/beatblender-128-mp3',
    description: 'Deep house + breakbeats' },
  { id: 'def_con',        name: 'DEF CON Radio',      genre: 'Electronic',
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    description: 'Music for hackers' },
  { id: 'the_trip',       name: 'The Trip',           genre: 'Electronic',
    url: 'https://ice1.somafm.com/thetrip-128-mp3',
    description: 'Progressive psy-trance + tech' },
  { id: 'space_station',  name: 'Space Station Soma', genre: 'Electronic',
    url: 'https://ice1.somafm.com/spacestation-128-mp3',
    description: 'Mellow electronica + spacemusic' },
  { id: 'cliqhop',        name: 'cliqhop idm',        genre: 'Electronic',
    url: 'https://ice1.somafm.com/cliqhop-128-mp3',
    description: 'Blips + bleeps · IDM' },

  // ROCK / METAL
  { id: 'metal_detector', name: 'Metal Detector',     genre: 'Metal',
    url: 'https://ice1.somafm.com/metal-128-mp3',
    description: 'From doom to extreme' },
  { id: 'indie_pop',      name: 'Indie Pop Rocks!',   genre: 'Indie',
    url: 'https://ice1.somafm.com/indiepop-128-mp3',
    description: 'New + classic indie pop + rock' },
  { id: 'left_coast_70s', name: 'Left Coast 70s',     genre: 'Rock',
    url: 'https://ice1.somafm.com/seventies-128-mp3',
    description: 'Mellow album rock from the Seventies' },
  { id: 'underground_80s', name: 'Underground 80s',   genre: 'Synthwave',
    url: 'https://ice1.somafm.com/u80s-128-mp3',
    description: 'Early alternative + synth from the 80s' },

  // STREET / ATMOSPHERIC
  { id: 'secret_agent',   name: 'Secret Agent',       genre: 'Lounge',
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    description: 'Spy themes + lounge jazz' },
  { id: 'mission_control', name: 'Mission Control',   genre: 'Atmospheric',
    url: 'https://ice1.somafm.com/missioncontrol-128-mp3',
    description: 'NASA chatter + ambient music' },

  // WORLD / VARIETY
  { id: 'reggae',         name: 'Heavyweight Reggae', genre: 'Reggae',
    url: 'https://ice1.somafm.com/reggae-128-mp3',
    description: 'Roots, dub, modern reggae' },
  { id: 'suburbs_of_goa', name: 'Suburbs of Goa',     genre: 'World',
    url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    description: 'Desi-influenced electronica' },
  { id: 'thistle',        name: 'ThistleRadio',       genre: 'World',
    url: 'https://ice1.somafm.com/thistle-128-mp3',
    description: 'Celtic + modern roots' },

  // JAZZ / SOUL
  { id: 'sonic_universe', name: 'Sonic Universe',     genre: 'Jazz',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    description: 'New + experimental jazz' },
  { id: 'fluid',          name: 'Fluid',              genre: 'Soul',
    url: 'https://ice1.somafm.com/fluid-128-mp3',
    description: 'Liquid trip-hop + chilled hip-hop' },

  // COUNTRY / FOLK
  { id: 'boot_liquor',    name: 'Boot Liquor',        genre: 'Country',
    url: 'https://ice1.somafm.com/bootliquor-128-mp3',
    description: 'Americana + alt-country' },
  { id: 'folk_forward',   name: 'Folk Forward',       genre: 'Folk',
    url: 'https://ice1.somafm.com/folkfwd-128-mp3',
    description: 'Indie folk · acoustic + alt' },
];

class RadioPlayer {
  constructor() {
    this.audio = null;
    this.currentStation = null;
    this.volume = 0.35;
    this.muted = false;
    this.status = 'idle'; // idle | loading | playing | error
    this.listeners = new Set();
  }

  play(stationId) {
    const station = RADIO_STATIONS.find(s => s.id === stationId);
    if (!station) return;
    this.stop();

    // No crossOrigin — playback only, no analysis. Avoids CORS issues with
    // streaming servers that don't send Access-Control-Allow-Origin.
    const audio = new Audio();
    audio.src = station.url;
    audio.volume = this.muted ? 0 : this.volume;
    audio.preload = 'none';

    audio.addEventListener('playing', () => {
      this.status = 'playing';
      this.notify();
    });
    audio.addEventListener('error', () => {
      this.status = 'error';
      this.notify();
    });
    audio.addEventListener('waiting', () => {
      this.status = 'loading';
      this.notify();
    });

    this.audio = audio;
    this.currentStation = stationId;
    this.status = 'loading';
    this.notify();

    audio.play().catch(err => {
      // Autoplay blocked — caller will retry on next user interaction
      console.warn('Radio play blocked:', err.message);
      this.status = 'error';
      this.notify();
    });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    this.currentStation = null;
    this.status = 'idle';
    this.notify();
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio && !this.muted) this.audio.volume = this.volume;
    this.notify();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.audio) this.audio.volume = this.muted ? 0 : this.volume;
    this.notify();
  }

  isPlaying() { return this.status === 'playing' || this.status === 'loading'; }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  notify() { this.listeners.forEach(fn => fn(this)); }
}

export const radio = new RadioPlayer();

export const RADIO_GENRES = (() => {
  const order = ['Chill','Electronic','Lounge','Atmospheric','Soul','Jazz','Reggae','World','Indie','Synthwave','Rock','Metal','Country','Folk'];
  const map = {};
  RADIO_STATIONS.forEach(s => { (map[s.genre] ??= []).push(s); });
  return order.filter(g => map[g]).map(g => ({ genre: g, stations: map[g] }));
})();
