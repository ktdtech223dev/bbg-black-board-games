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
  pendingCard: null,    // { card, mode: 'pick_player' | 'pick_tile' | 'pick_player_resource' }
  pendingAction: null,  // { kind: 'claim'|'develop'|'attack', tile, cost }
  helpOpen: false,
  toasts: [],
  productions: [],      // [{ id, tileKey, resource, amount, ownerSocketId, expires }]

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
      // Online lobbies use a separate event (hub:online_joined) so this
      // path is only the couch/party flow now.
      const isOnline = data.state?.online || data.state?.mode === 'online';
      set({
        lobbyId: data.lobbyId,
        lobbyState: data.state,
        isHost: true,
        currentPage: isOnline ? 'online' : 'lobby',
      });
    });
    socket.on('hub:online_joined', data => {
      set({
        lobbyId: data.lobbyId,
        lobbyState: data.state,
        isHost: !!data.isHost,
        currentPage: 'online',
      });
    });
    socket.on('hub:lobby_updated', state => {
      set(s => ({
        lobbyState: state,
        isHost: state.hostId === s.mySocketId,
      }));
    });

    socket.on('game_started', state => {
      set({ gameState: state, currentPage: 'gw_faction' });
    });

    socket.on('gw:private_state', state => {
      set({ privateState: state, gameState: state });
    });

    socket.on('gw:state_update', state => set({ gameState: { ...get().gameState, ...state } }));

    // Helper — merge fresh scores into gameState so any UI reading
    // gameState.scores stays in sync even before gw:private_state lands.
    const mergeScores = (data) => {
      if (!data?.scores) return;
      set(s => ({
        gameState: s.gameState ? { ...s.gameState, scores: data.scores } : s.gameState,
        privateState: s.privateState ? { ...s.privateState, scores: data.scores } : s.privateState,
      }));
    };

    socket.on('dice_rolled', data => {
      set({ diceResult: data });
      mergeScores(data);
      get().addEvent({ type: 'dice', data });
      sfx.diceRoll();
      if (data.productions?.length) get().pushProductions(data.productions);
      const my = data.collections?.[get().mySocketId];
      if (my && Object.keys(my).length > 0) {
        const summary = Object.entries(my).map(([r,a]) => `+${a} ${r}`).join(' · ');
        get().toast({ type:'gain', icon:'🎲', msg:`Rolled ${data.roll} · ${summary}` });
      }
      if (data.roll === 7) {
        sfx.eventTrigger();
        get().toast({ type:'event', icon:'🚨', msg:`THE FEDS · Roll of 7!`, duration: 4500 });
      }
      if (data.raid) get().raidNotice(data.raid, get().mySocketId);
    });
    socket.on('territory_claimed', data => {
      mergeScores(data);
      get().addEvent({ type: 'claim', data });
      sfx.territoryClaimed();
      if (data.socketId === get().mySocketId) {
        get().toast({ type:'success', icon:'🚩', msg:`Claimed ${data.tileKey}` });
      }
    });
    socket.on('territory_developed', data => {
      mergeScores(data);
      get().addEvent({ type: 'develop', data });
      sfx.develop();
      if (data.socketId === get().mySocketId) {
        const names = ['','Operation','Trap','Empire'];
        get().toast({ type:'success', icon:'🏗️', msg:`${data.tileKey} → ${names[data.tier]}` });
      }
    });
    socket.on('combat_resolved', data => {
      mergeScores(data);
      get().addEvent({ type: 'combat', data });
      data.attackerWon ? sfx.attackHit() : sfx.attackMiss();
      const me = get().mySocketId;
      if (data.attackerId === me) {
        get().toast({
          type: data.attackerWon ? 'success' : 'error',
          icon: data.attackerWon ? '⚔️' : '✗',
          msg: data.attackerWon
            ? `Took ${data.tileKey} · ${data.atkRoll} vs ${data.defRoll}`
            : `Attack failed · ${data.atkRoll} vs ${data.defRoll}`
        });
      } else if (data.defenderId === me) {
        get().toast({
          type: data.attackerWon ? 'error' : 'success',
          icon: data.attackerWon ? '💥' : '🛡️',
          msg: data.attackerWon
            ? `${data.tileKey} taken from you`
            : `Defended ${data.tileKey} · ${data.defRoll} vs ${data.atkRoll}`
        });
      }
    });
    socket.on('card_played', data => {
      mergeScores(data);
      get().addEvent({ type: 'card', data });
      sfx.cardPlay();
      get().toast({ type:'info', icon:'🃏', msg:`${data.playerName} → ${data.card?.name}` });
    });
    socket.on('event_triggered', data => {
      get().addEvent({ type: 'event', data });
      sfx.eventTrigger();
      get().toast({ type:'event', icon:'⚡', msg:`EVENT · ${data.card?.name}`, duration: 4500 });
    });
    socket.on('player_eliminated', data => {
      mergeScores(data);
      get().addEvent({ type: 'eliminated', data });
      sfx.eliminated();
      get().toast({ type:'error', icon:'💀', msg:`${data.playerName} eliminated`, duration: 4500 });
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
      get().toast({ type:'success', icon:'🏆', msg:`${data.winner?.name || 'Someone'} wins!`, duration: 6000 });
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
        } : s.gameState,
        privateState: s.privateState ? {
          ...s.privateState,
          scores: data.scores,
          currentTurn: data.nextPlayer,
          round: data.round,
          currentPhase: 'roll',
        } : s.privateState,
      }));
      if (data.nextPlayer === get().mySocketId && prev !== get().mySocketId) {
        sfx.turnStart();
        get().toast({ type:'success', icon:'▶', msg:`YOUR TURN · Round ${data.round}`, duration: 4000 });
      }
    });

    socket.on('tax_resolved', data => {
      const me = get().mySocketId;
      const ratePct = data.totalRate ? Math.round(data.totalRate * 100) : 0;
      const myEvent = data.events?.find(e => e.payerId === me);
      if (myEvent) {
        if (myEvent.exempt) {
          get().toast({ type:'success', icon:'🛡️', msg:'TAX EXEMPT · poverty floor (<200 wealth)' });
        } else if (myEvent.paid > 0) {
          const myPct = myEvent.rate ? Math.round(myEvent.rate * 100) : ratePct;
          get().toast({ type:'error', icon:'💸', msg:`Paid ${myEvent.paid} cash (${myPct}% tax)` });
        } else if (myEvent.paid < 0) {
          get().toast({ type:'gain', icon:'🔄', msg:`Tax flipped — collected ${-myEvent.paid} cash` });
        }
      }
      if (data.taxerId === me) {
        const total = (data.events || []).reduce((s, e) => s + (e.paid || 0), 0);
        if (total > 0) {
          const breakdown = data.tilesByTier
            ? Object.entries(data.tilesByTier).filter(([,n]) => n > 0).map(([t,n]) => `${n}×T${t}`).join(' ')
            : '';
          get().toast({ type:'gain', icon:'💰', msg:`Collected ${total} cash · ${ratePct}% rate ${breakdown}` });
        }
      }
    });

    socket.on('hub:error', err => {
      console.warn('Hub error:', err);
      sfx.error();
      get().toast({ type:'error', icon:'⚠', msg: err.msg || 'Error' });
    });

    socket.on('hustled', data => {
      get().toast({ type:'info', icon:'💸', msg:`${data.name} hustled · drew 2 cards` });
    });

    socket.on('scouted', data => {
      get().toast({ type:'info', icon:'🔭', msg:`${data.name} scouted ${data.targetName}` });
    });

    socket.on('scout_result', data => {
      set({ scoutResult: data });
    });
  },

  // Helper for v1.5 RAID toast on roll-of-7
  raidNotice: (raid, mySocketId) => {
    if (!raid) return;
    const me = raid.find(r => r.socketId === mySocketId && r.type === 'fine');
    if (me) {
      get().toast({ type:'error', icon:'🚨', msg:`THE FEDS · You paid 100 cash`, duration: 4000 });
    }
    const skim = raid.find(r => r.type === 'skimmed');
    if (skim) {
      const totalSteal = Object.values(skim.steal || {}).reduce((a,b)=>a+b,0);
      if (totalSteal > 0) {
        get().toast({ type:'event', icon:'🚨', msg:`THE FEDS · Raid skim: ${totalSteal} resources`, duration: 4000 });
      }
    }
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

  joinOnline: () => {
    const { socket, myPlayer } = get();
    if (!myPlayer) {
      set({ lastError: 'Pick a crew member first' });
      setTimeout(() => set({ lastError: null }), 3500);
      return;
    }
    socket?.emit('hub:join_online', { playerId: myPlayer.id });
  },

  leaveOnline: () => {
    get().socket?.emit('hub:leave_online');
    set({ lobbyId: null, lobbyState: null, isHost: false });
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
    set({ pendingCard: null, currentAction: null });
  },

  // Initiate playing a card. If it needs a target, parks it in pendingCard
  // and prompts the user; otherwise plays immediately.
  initiateCard: (card) => {
    const t = card?.target;
    if (!t) {
      get().playCard(card.instanceId, {});
      return;
    }
    if (t === 'player' || t === 'player+resource') {
      set({ pendingCard: { card, mode: t === 'player' ? 'pick_player' : 'pick_player_resource' } });
    } else if (t.startsWith('tile')) {
      set({ pendingCard: { card, mode: 'pick_tile' }, currentAction: 'card_target' });
    } else {
      get().playCard(card.instanceId, {});
    }
  },

  resolveCardTarget: (options) => {
    const { pendingCard } = get();
    if (!pendingCard) return;
    get().playCard(pendingCard.card.instanceId, options);
  },

  cancelCard: () => set({ pendingCard: null, currentAction: null }),

  setHelpOpen: (v) => set({ helpOpen: v }),

  // ── TOAST API ───────────────────────
  toast: (opts) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type: 'info',
      duration: 3000,
      ...(typeof opts === 'string' ? { msg: opts } : opts),
    };
    set(s => ({ toasts: [...s.toasts, toast].slice(-6) }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, toast.duration);
  },
  dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // ── ACTION CONFIRM ──────────────────
  pendActionForTile: (kind, tile) => {
    const state = get();
    const tier = tile?.tier || 0;
    let cost = {};
    if (kind === 'claim') cost = { cash: 100 };
    else if (kind === 'develop') {
      const next = (tile?.tier || 1) + 1;
      cost = { cash: { 2: 300, 3: 600 }[next] || 0 };
    }
    else if (kind === 'attack') {
      const mod = state.gameState?.roundModifiers?.attackCostMultiplier || 1;
      cost = { muscle: Math.floor(200 * Math.max(1, tier) * mod) };
    }
    set({ pendingAction: { kind, tile, cost } });
  },
  cancelPendingAction: () => set({ pendingAction: null }),
  confirmPendingAction: () => {
    const { pendingAction } = get();
    if (!pendingAction) return;
    const { kind, tile } = pendingAction;
    set({ pendingAction: null, currentAction: null, selectedTile: null });
    if (kind === 'claim') get().socket?.emit('gw:claim', { tileKey: tile.key });
    else if (kind === 'develop') get().socket?.emit('gw:develop', { tileKey: tile.key });
    else if (kind === 'attack') get().socket?.emit('gw:attack', { tileKey: tile.key });
  },

  pushProductions: (productions) => {
    if (!productions?.length) return;
    const now = Date.now();
    const expires = now + 2400;
    const items = productions.map(p => ({
      id: now + Math.random(),
      ...p,
      createdAt: now,
      expires,
    }));
    set(s => ({ productions: [...s.productions, ...items].slice(-40) }));
    setTimeout(() => {
      const cutoff = Date.now() - 100;
      set(s => ({ productions: s.productions.filter(p => p.expires > cutoff) }));
    }, 2500);
  },

  useFactionAbility: (options) => {
    get().socket?.emit('gw:use_ability', { options });
  },

  hustle: () => {
    get().socket?.emit('gw:hustle');
  },

  scout: (targetId) => {
    get().socket?.emit('gw:scout', { targetId });
  },

  scoutResult: null,
  closeScoutResult: () => set({ scoutResult: null }),

  pickingScoutTarget: false,
  setPickingScoutTarget: (v) => set({ pickingScoutTarget: !!v }),

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
