const { v4: uuid } = require('uuid');

const ONLINE_ROOM_ID = 'NGAMES';

class LobbyManager {
  constructor(io) {
    this.io = io;
    this.lobbies = {};
  }

  createLobby(hostSocketId, options = {}) {
    let id;
    do {
      id = uuid().slice(0, 6).toUpperCase();
    } while (id === ONLINE_ROOM_ID);
    this.lobbies[id] = {
      id,
      hostSocketId,
      mode: options.mode || 'party',
      game: options.game || null,
      players: {},
      spectators: new Set(),
      state: 'waiting',
      createdAt: Date.now(),
      maxPlayers: 8,
      joinCode: id,
      online: false,
    };
    return id;
  }

  // Shared "always-on" online room — IB pattern. Everyone clicking
  // "Online Play" from any machine lands in the same room. No codes,
  // no QR, no copy-paste required.
  getOrCreateOnlineLobby(socketId) {
    const id = ONLINE_ROOM_ID;
    if (!this.lobbies[id]) {
      this.lobbies[id] = {
        id,
        hostSocketId: socketId,
        mode: 'online',
        game: null,
        players: {},
        spectators: new Set(),
        state: 'waiting',
        createdAt: Date.now(),
        maxPlayers: 8,
        joinCode: id,
        online: true,
      };
    }
    const lobby = this.lobbies[id];
    // Promote first-in or rehome if previous host disconnected
    if (!lobby.hostSocketId || !lobby.players[lobby.hostSocketId]) {
      lobby.hostSocketId = socketId;
    }
    return id;
  }

  isOnlineRoomId(id) { return id === ONLINE_ROOM_ID; }

  joinLobby(lobbyId, socketId, playerData) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) return { error: 'Lobby not found' };
    if (Object.keys(lobby.players).length >= lobby.maxPlayers) {
      return { error: 'Lobby full' };
    }
    // In the shared online room, only one socket can hold a given crew identity
    if (lobby.online && playerData.id) {
      const taken = Object.values(lobby.players)
        .some(p => p.playerId === playerData.id && p.socketId !== socketId);
      if (taken) return { error: `${playerData.display_name} is already in the room` };
    }

    lobby.players[socketId] = {
      socketId,
      playerId: playerData.id,
      displayName: playerData.display_name,
      color: playerData.color,
      avatar: playerData.avatar,
      isHost: socketId === lobby.hostSocketId,
      isReady: false,
      selectedGame: null,
      faction: null,
      longGameConfirmed: false,
    };

    return { success: true, lobby };
  }

  leaveLobby(lobbyId, socketId) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) return;
    delete lobby.players[socketId];
    lobby.spectators.delete(socketId);

    if (socketId === lobby.hostSocketId) {
      const remaining = Object.keys(lobby.players);
      if (remaining.length > 0) {
        lobby.hostSocketId = remaining[0];
        lobby.players[remaining[0]].isHost = true;
      } else if (lobby.online) {
        // Keep the shared online room alive so the next visitor lands cleanly
        lobby.hostSocketId = null;
        lobby.state = 'waiting';
        lobby.game = null;
      } else {
        delete this.lobbies[lobbyId];
        return;
      }
    }
    return lobby;
  }

  setPlayerReady(lobbyId, socketId, ready = true) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby?.players[socketId]) return;
    lobby.players[socketId].isReady = ready;
    return lobby;
  }

  allPlayersReady(lobbyId) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) return false;
    const players = Object.values(lobby.players);
    return players.length >= 2 && players.every(p => p.isReady);
  }

  getLobby(lobbyId) {
    return this.lobbies[lobbyId] || null;
  }

  getLobbyState(lobbyId) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) return null;
    return {
      id: lobby.id,
      joinCode: lobby.joinCode,
      mode: lobby.mode,
      online: !!lobby.online,
      game: lobby.game,
      state: lobby.state,
      hostId: lobby.hostSocketId,
      players: Object.values(lobby.players),
      spectators: lobby.spectators.size,
      maxPlayers: lobby.maxPlayers,
    };
  }

  startGame(lobbyId, gameConfig) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) return;
    lobby.state = 'playing';
    lobby.game = gameConfig.game;
    lobby.gameConfig = gameConfig;
    return lobby;
  }
}

module.exports = { LobbyManager };
