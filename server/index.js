const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { LobbyManager } = require('./hub/LobbyManager');
const { GangWarsEngine } = require('./games/gangwars/GameEngine');
const { runBotTurn } = require('./games/gangwars/Bots');
const { getCurrentWeeklyMaps } = require('./hub/WeeklyMaps');
const { PERMANENT_MAPS, SEASONAL_MAPS } = require('./games/gangwars/Maps');
const { FACTIONS } = require('./games/gangwars/Factions');
const { db } = require('./database');
const { getActiveSeason, daysRemaining } = require('./hub/SeasonManager');
const { getAllPlayers, getPlayerStats, recordGameResult } = require('./hub/PlayerProfiles');
const { getLocalIP, buildJoinURL } = require('./hub/PartyHost');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

const lobbyMgr = new LobbyManager(io);
const gameEngines = {};

app.get('/api/hub/status', (req, res) => {
  const weekly = getCurrentWeeklyMaps();
  const season = getActiveSeason();
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    localIP: getLocalIP(),
    port: process.env.PORT || 3847,
    weekly: { weekSeed: weekly.weekSeed, mapAName: weekly.mapA.name, mapBName: weekly.mapB.name },
    season: season ? { ...season, daysRemaining: daysRemaining() } : null,
    permanentMaps: Object.keys(PERMANENT_MAPS),
    seasonalMaps: Object.keys(SEASONAL_MAPS),
    games: [
      { id:'gangwars', name:'Gang Wars', status:'live', players:'2-8', subtitle:'Strategy · Territory Control' },
      { id:'generational_wealth', name:'Generational Wealth', status:'coming_soon', subtitle:'Life Simulator' },
      { id:'cap_detector', name:'Cap Detector', status:'coming_soon', subtitle:'Deception Game' },
    ]
  });
});

app.get('/api/players', (req, res) => res.json(getAllPlayers()));
app.get('/api/players/:id/stats', (req, res) => res.json(getPlayerStats(req.params.id)));

app.get('/api/gangwars/standings', (req, res) => {
  const season = req.query.season || 1;
  const rows = db.prepare(`
    SELECT gs.*, p.display_name, p.color, p.avatar
    FROM gangwars_season_standings gs
    JOIN players p ON p.id = gs.player_id
    WHERE gs.season = ?
    ORDER BY gs.wins DESC, gs.points DESC
  `).all(season);
  res.json(rows);
});

app.get('/api/gangwars/maps', (req, res) => {
  const weekly = getCurrentWeeklyMaps();
  res.json({
    permanent: Object.values(PERMANENT_MAPS).map(m => ({
      id: m.id, name: m.name, subtitle: m.subtitle, description: m.description,
      playerRange: m.playerRange, bestFor: m.bestFor, theme: m.theme, type: 'permanent'
    })),
    weekly: [
      { id:'weekly_a', type:'weekly', name: weekly.mapA.name, theme: weekly.mapA.theme, subtitle:'This Week — Map A' },
      { id:'weekly_b', type:'weekly', name: weekly.mapB.name, theme: weekly.mapB.theme, subtitle:'This Week — Map B' },
    ],
    seasonal: Object.values(SEASONAL_MAPS).map(m => ({
      id: m.id, name: m.name, subtitle: m.subtitle, description: m.description,
      modifiers: m.modifiers, theme: m.theme, type: 'seasonal',
      season: m.season, part: m.part, daysRemaining: daysRemaining()
    })),
  });
});

app.get('/api/gangwars/factions', (req, res) => {
  res.json(Object.values(FACTIONS).map(f => ({
    id: f.id, name: f.name, city: f.city, color: f.color, motto: f.motto,
    playstyle: f.playstyle, difficulty: f.difficulty,
    passive: f.passive.name, passiveDesc: f.passive.desc,
    active: f.active.name, activeDesc: f.active.desc,
    starting: f.starting,
  })));
});

app.get('/api/history', (req, res) => {
  const rows = db.prepare('SELECT * FROM game_history ORDER BY played_at DESC LIMIT 30').all();
  res.json(rows);
});

app.get('/api/party/url/:lobbyCode', (req, res) => {
  res.json({ url: buildJoinURL(req.params.lobbyCode, process.env.PORT || 3847) });
});

io.on('connection', socket => {
  console.log('Connected:', socket.id);

  socket.on('hub:create_lobby', ({ playerId, mode }) => {
    const lobbyId = lobbyMgr.createLobby(socket.id, { mode });
    socket.join(lobbyId);
    socket.lobbyId = lobbyId;

    const player = playerId
      ? db.prepare('SELECT * FROM players WHERE id=?').get(playerId)
      : { id: null, display_name: 'Host', color: '#c8a84b', avatar: 'H' };

    if (player) lobbyMgr.joinLobby(lobbyId, socket.id, player);

    socket.emit('hub:lobby_created', {
      lobbyId, joinCode: lobbyId, state: lobbyMgr.getLobbyState(lobbyId)
    });
  });

  // Shared online room — IB-style. No code, no QR, everyone lands here.
  socket.on('hub:join_online', ({ playerId }) => {
    if (!playerId) return socket.emit('hub:error', { msg: 'Pick a crew member first' });
    const player = db.prepare('SELECT * FROM players WHERE id=?').get(playerId);
    if (!player) return socket.emit('hub:error', { msg: 'Player not found' });

    const lobbyId = lobbyMgr.getOrCreateOnlineLobby(socket.id);
    const result = lobbyMgr.joinLobby(lobbyId, socket.id, player);
    if (result.error) return socket.emit('hub:error', result);

    socket.join(lobbyId);
    socket.lobbyId = lobbyId;

    const isHost = lobbyMgr.getLobby(lobbyId).hostSocketId === socket.id;

    socket.emit('hub:online_joined', {
      lobbyId, state: lobbyMgr.getLobbyState(lobbyId), isHost,
    });
    io.to(lobbyId).emit('hub:lobby_updated', lobbyMgr.getLobbyState(lobbyId));
  });

  socket.on('hub:leave_online', () => {
    if (!socket.lobbyId || !lobbyMgr.isOnlineRoomId(socket.lobbyId)) return;
    const lobby = lobbyMgr.leaveLobby(socket.lobbyId, socket.id);
    socket.leave(socket.lobbyId);
    const id = socket.lobbyId;
    socket.lobbyId = null;
    if (lobby) io.to(id).emit('hub:lobby_updated', lobbyMgr.getLobbyState(id));
  });

  socket.on('hub:join_lobby', ({ lobbyId, playerId }) => {
    const player = db.prepare('SELECT * FROM players WHERE id=?').get(playerId);
    if (!player) return socket.emit('hub:error', { msg: 'Player not found' });

    const result = lobbyMgr.joinLobby(lobbyId, socket.id, player);
    if (result.error) return socket.emit('hub:error', result);

    socket.join(lobbyId);
    socket.lobbyId = lobbyId;
    io.to(lobbyId).emit('hub:lobby_updated', lobbyMgr.getLobbyState(lobbyId));
  });

  socket.on('hub:player_ready', ({ ready }) => {
    if (!socket.lobbyId) return;
    lobbyMgr.setPlayerReady(socket.lobbyId, socket.id, ready);
    io.to(socket.lobbyId).emit('hub:lobby_updated', lobbyMgr.getLobbyState(socket.lobbyId));
  });

  socket.on('gw:start_game', ({ mapId, mode, withBots }) => {
    const lobby = lobbyMgr.getLobby(socket.lobbyId);
    if (!lobby || lobby.hostSocketId !== socket.id) {
      return socket.emit('hub:error', { msg: 'Not host' });
    }

    const playerList = Object.values(lobby.players);

    if (withBots && withBots > 0) {
      const factionIds = Object.keys(FACTIONS);
      let fi = 0;
      let botCount = withBots;
      while (botCount > 0 && fi < factionIds.length) {
        const fid = factionIds[fi++];
        if (playerList.some(p => p.faction === fid)) continue;
        playerList.push({
          socketId: `bot-${fi}-${Date.now()}`,
          playerId: null,
          displayName: `Bot (${FACTIONS[fid].city})`,
          color: FACTIONS[fid].color,
          avatar: 'B',
          faction: fid,
          isBot: true,
        });
        botCount--;
      }
    }

    const engine = new GangWarsEngine(io, socket.lobbyId, { mode, mapId });
    gameEngines[socket.lobbyId] = engine;

    engine.initPlayers(playerList);
    playerList.forEach(p => {
      if (p.faction) engine.selectFaction(p.socketId, p.faction);
    });
    engine.initBoard(mapId);
    engine.startGame();

    lobbyMgr.startGame(socket.lobbyId, { game: 'gangwars', mapId, mode });

    setTimeout(() => triggerBotsIfNeeded(socket.lobbyId), 500);
  });

  socket.on('gw:select_faction', ({ factionId }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.selectFaction(socket.id, factionId);
    socket.emit('gw:faction_result', result);
    io.to(socket.lobbyId).emit('gw:state_update', engine.getPublicState());
  });

  socket.on('gw:roll_dice', () => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.rollDice(socket.id);
    if (result.error) socket.emit('hub:error', result);
  });

  socket.on('gw:claim', ({ tileKey }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.claimTerritory(socket.id, tileKey);
    if (result.error) socket.emit('hub:error', result);
  });

  socket.on('gw:develop', ({ tileKey }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.developTerritory(socket.id, tileKey);
    if (result.error) socket.emit('hub:error', result);
  });

  socket.on('gw:attack', ({ tileKey }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.attack(socket.id, tileKey);
    if (result.error) socket.emit('hub:error', result);
  });

  socket.on('gw:play_card', ({ cardInstanceId, options }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.playCard(socket.id, cardInstanceId, options || {});
    if (result.error) socket.emit('hub:error', result);
  });

  socket.on('gw:use_ability', ({ options }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.useFactionAbility(socket.id, options || {});
    if (result.error) socket.emit('hub:error', result);
  });

  socket.on('gw:propose_trade', ({ toId, offer, request }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    engine.proposeTrade(socket.id, toId, offer, request);
  });

  socket.on('gw:accept_trade', ({ fromId, offer, request }) => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    engine.acceptTrade(fromId, socket.id, offer, request);
  });

  socket.on('gw:end_turn', () => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    const result = engine.endTurn(socket.id);
    if (result.error) socket.emit('hub:error', result);
    setTimeout(() => triggerBotsIfNeeded(socket.lobbyId), 600);
  });

  socket.on('gw:request_state', () => {
    const engine = gameEngines[socket.lobbyId];
    if (!engine) return;
    socket.emit('gw:private_state', engine.getPlayerPrivateState(socket.id));
  });

  socket.on('gw:long_game_confirm', () => {
    const lobby = lobbyMgr.getLobby(socket.lobbyId);
    if (!lobby?.players[socket.id]) return;
    lobby.players[socket.id].longGameConfirmed = true;
    io.to(socket.lobbyId).emit('hub:lobby_updated', lobbyMgr.getLobbyState(socket.lobbyId));
  });

  socket.on('disconnect', () => {
    if (socket.lobbyId) {
      const lobby = lobbyMgr.leaveLobby(socket.lobbyId, socket.id);
      if (lobby) {
        io.to(socket.lobbyId).emit('hub:lobby_updated', lobbyMgr.getLobbyState(socket.lobbyId));
      }
    }
  });
});

function triggerBotsIfNeeded(lobbyId) {
  const engine = gameEngines[lobbyId];
  if (!engine || engine.state.phase !== 'playing') return;
  const currentSocket = engine.currentPlayerSocket();
  const player = engine.state.players[currentSocket];
  if (player?.isBot) {
    runBotTurn(engine, currentSocket);
    setTimeout(() => triggerBotsIfNeeded(lobbyId), 600);
  }
}

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../dist/index.html')));

const PORT = process.env.PORT || 3847;
server.listen(PORT, () => {
  console.log(`BBG Server :${PORT}`);
  console.log(`Local IP: ${getLocalIP()}`);
});
