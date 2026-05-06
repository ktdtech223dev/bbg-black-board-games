import { create } from 'zustand';
import { io } from 'socket.io-client';
import { sfx } from '../games/gangwars/audio/SFX';

const SERVER = import.meta.env.VITE_SERVER_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3847');

export const useBBG = create((set, get) => ({
  socket: null,
  connected: false,

  currentPage: 'hub',
  selectedGame: null,
  hubData: null,

  lobbyId: null,
  lobbyState: null,
  isHost: false,
  mySocketId: null,

  myPlayer: null,

  selectedMap: null,
  selectedMode: null,
  selectedFaction: null,
  longGameWarningOpen: false,
  withBots: 0,

  gameState: null,
  privateState: null,
  selectedTile: null,
  currentAction: null,
  diceResult: null,
  recentEvents: [],
  gameOverData: null,
  lastError: null,

  factionsList: [],
  mapsList: { permanent: [], weekly: [], seasonal: [] },
  playersList: [],

  connect: () => {
    if (get().socket) return;
    const socket = io(SERVER, { transports: ['websocket', 'polling'] });
    set({ socket });

    socket.on('connect', () => set({ connected: true, mySocketId: socket.id }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('hub:lobby_created', data => {
      set({ lobbyId: data.lobbyId, lobbyState: data.state, isHost: true, currentPage: 'lobby' });
    });
    socket.on('hub:lobby_updated', state => set({ lobbyState: state }));

    socket.on('game_started', state => {
      set({ gameState: state, currentPage: 'gw_faction' });
    });

    socket.on('gw:private_state', state => {
      set({ privateState: state, gameState: state });
    });

    socket.on('gw:state_update', state => set({ gameState: { ...get().gameState, ...state } }));

    socket.on('dice_rolled', data => {
      set({ diceResult: data });
      get().addEvent({ type: 'dice', data });
      sfx.diceRoll();
    });
    socket.on('territory_claimed', data => {
      get().addEvent({ type: 'claim', data });
      sfx.territoryClaimed();
    });
    socket.on('territory_developed', data => {
      get().addEvent({ type: 'develop', data });
      sfx.develop();
    });
    socket.on('combat_resolved', data => {
      get().addEvent({ type: 'combat', data });
      data.attackerWon ? sfx.attackHit() : sfx.attackMiss();
    });
    socket.on('card_played', data => {
      get().addEvent({ type: 'card', data });
      sfx.cardPlay();
    });
    socket.on('event_triggered', data => {
      get().addEvent({ type: 'event', data });
      sfx.eventTrigger();
    });
    socket.on('player_eliminated', data => {
      get().addEvent({ type: 'eliminated', data });
      sfx.eliminated();
    });
    socket.on('ability_used', data => {
      get().addEvent({ type: 'ability', data });
      sfx.ability();
    });
    socket.on('trade_proposed', data => get().addEvent({ type: 'trade_proposed', data }));
    socket.on('trade_completed', data => {
      get().addEvent({ type: 'trade', data });
      sfx.trade();
    });

    socket.on('game_over', data => {
      set({ currentPage: 'gw_over', gameOverData: data });
      sfx.victory();
    });

    socket.on('turn_ended', data => {
      const prev = get().gameState?.currentTurn;
      set(s => ({
        gameState: s.gameState ? {
          ...s.gameState,
          currentTurn: data.nextPlayer,
          round: data.round,
          scores: data.scores,
          currentPhase: 'roll',
        } : s.gameState
      }));
      // SFX cue when it becomes my turn
      if (data.nextPlayer === get().mySocketId && prev !== get().mySocketId) {
        sfx.turnStart();
      }
    });

    socket.on('hub:error', err => {
      console.warn('Hub error:', err);
      set({ lastError: err.msg || 'Error' });
      sfx.error();
      setTimeout(() => set({ lastError: null }), 3500);
    });
  },

  addEvent: (event) => {
    set(s => ({
      recentEvents: [{ ...event, id: Date.now() + Math.random() }, ...s.recentEvents].slice(0, 50)
    }));
  },

  fetchHubStatus: async () => {
    try {
      const r = await fetch(`${SERVER}/api/hub/status`);
      const data = await r.json();
      set({ hubData: data });
    } catch (e) { console.error(e); }
  },

  fetchPlayers: async () => {
    try {
      const r = await fetch(`${SERVER}/api/players`);
      const data = await r.json();
      set({ playersList: data });
    } catch (e) { console.error(e); }
  },

  fetchFactions: async () => {
    try {
      const r = await fetch(`${SERVER}/api/gangwars/factions`);
      const data = await r.json();
      set({ factionsList: data });
    } catch (e) { console.error(e); }
  },

  fetchMaps: async () => {
    try {
      const r = await fetch(`${SERVER}/api/gangwars/maps`);
      const data = await r.json();
      set({ mapsList: data });
    } catch (e) { console.error(e); }
  },

  setMyPlayer: (player) => set({ myPlayer: player }),
  setPage: (page) => set({ currentPage: page }),
  setSelectedMap: (map) => set({ selectedMap: map }),
  setSelectedMode: (mode) => set({ selectedMode: mode }),
  setLongGameWarning: (open) => set({ longGameWarningOpen: open }),
  setWithBots: (n) => set({ withBots: n }),

  createLobby: (mode = 'party') => {
    const { socket, myPlayer } = get();
    socket?.emit('hub:create_lobby', { playerId: myPlayer?.id, mode });
  },

  joinLobby: (lobbyId) => {
    const { socket, myPlayer } = get();
    socket?.emit('hub:join_lobby', { lobbyId, playerId: myPlayer?.id });
  },

  toggleReady: (ready) => {
    get().socket?.emit('hub:player_ready', { ready });
  },

  startGangWars: () => {
    const { socket, selectedMap, selectedMode, withBots } = get();
    socket?.emit('gw:start_game', {
      mapId: selectedMap?.id,
      mode: selectedMode || 'medium',
      withBots: withBots || 0,
    });
  },

  selectFaction: (factionId) => {
    get().socket?.emit('gw:select_faction', { factionId });
    set({ selectedFaction: factionId });
  },

  rollDice: () => get().socket?.emit('gw:roll_dice'),

  claimTerritory: (tileKey) => {
    get().socket?.emit('gw:claim', { tileKey });
    set({ selectedTile: null, currentAction: null });
  },

  developTerritory: (tileKey) => {
    get().socket?.emit('gw:develop', { tileKey });
    set({ selectedTile: null, currentAction: null });
  },

  attackTile: (tileKey) => {
    get().socket?.emit('gw:attack', { tileKey });
    set({ selectedTile: null, currentAction: null });
  },

  playCard: (cardInstanceId, options) => {
    get().socket?.emit('gw:play_card', { cardInstanceId, options });
  },

  useFactionAbility: (options) => {
    get().socket?.emit('gw:use_ability', { options });
  },

  proposeTrade: (toId, offer, request) => {
    get().socket?.emit('gw:propose_trade', { toId, offer, request });
  },

  acceptTrade: (fromId, offer, request) => {
    get().socket?.emit('gw:accept_trade', { fromId, offer, request });
  },

  endTurn: () => {
    get().socket?.emit('gw:end_turn');
    set({ diceResult: null, selectedTile: null, currentAction: null });
  },

  confirmLongGame: () => get().socket?.emit('gw:long_game_confirm'),

  setSelectedTile: (tile) => set({ selectedTile: tile?.key || null }),
  setCurrentAction: (action) => set({ currentAction: action }),
  resetGame: () => set({
    gameState: null, privateState: null, selectedTile: null,
    currentAction: null, diceResult: null, gameOverData: null,
    selectedMap: null, selectedMode: null, selectedFaction: null,
    currentPage: 'hub', recentEvents: [],
  }),
}));
