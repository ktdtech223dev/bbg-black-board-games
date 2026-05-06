const { v4: uuid } = require('uuid');

class LobbyManager {
  constructor(io) {
    this.io = io;
    this.lobbies = {};
  }

  createLobby(hostSocketId, options = {}) {
    const id = uuid().slice(0, 6).toUpperCase();
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
    };
    return id;
  }

  joinLobby(lobbyId, socketId, playerData) {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) return { error: 'Lobby not found' };
    if (Object.keys(lobby.players).length >= lobby.maxPlayers) {
      return { error: 'Lobby full' };
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
