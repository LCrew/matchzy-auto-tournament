import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Avatar,
  AvatarGroup,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import type { Lobby } from '../types/lobby.types';
import io from 'socket.io-client';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  waiting: 'success',
  picking: 'warning',
  veto: 'info',
  ready: 'default',
  cancelled: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  waiting: 'Waiting for players',
  picking: 'Captain draft',
  veto: 'Map veto',
  ready: 'Ready',
  cancelled: 'Cancelled',
};

export default function Lobbies() {
  const navigate = useNavigate();
  const { playerSteamId } = useAuth();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { document.title = 'FULM: Lobby'; }, []);

  const loadLobbies = useCallback(async () => {
    try {
      const res = await api.fetch('/api/lobbies');
      setLobbies(res.lobbies || []);
    } catch {
      setError('Failed to load lobbies');
    }
  }, []);

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });
    const refresh = () => { loadLobbies(); };
    refresh();
    socket.on('lobby:created', refresh);
    socket.on('lobby:update', refresh);
    socket.on('lobby:deleted', refresh);
    return () => { socket.disconnect(); };
  }, [loadLobbies]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await api.fetch('/api/lobbies', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (res.lobby?.id) {
        navigate(`/lobby/${res.lobby.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lobby');
      setCreating(false);
    }
  };

  const handleJoin = async (lobbyId: string) => {
    try {
      const lobby = lobbies.find((l) => l.id === lobbyId);
      const isInLobby = lobby?.state.players.some((p) => p.steamId === playerSteamId);
      if (!isInLobby) {
        await api.fetch(`/api/lobbies/${lobbyId}/join`, { method: 'POST' });
      }
      navigate(`/lobby/${lobbyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Lobby
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create Match'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {lobbies.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <SportsEsportsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active lobbies
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create a match to get started. Friends can join from this page.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={creating}>
              Create Match
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {lobbies.map((lobby) => {
            const playerCount = lobby.state.players.length;
            const maxPlayers = lobby.teamSize * 2;
            const isInLobby = lobby.state.players.some((p) => p.steamId === playerSteamId);

            return (
              <Card
                key={lobby.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: isInLobby ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-1px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleJoin(lobby.id)}
              >
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                      <GroupsIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {lobby.teamSize}v{lobby.teamSize} {lobby.format.toUpperCase()}
                          </Typography>
                          <Chip label={lobby.gameMode} size="small" variant="outlined" />
                          <Chip
                            label={STATUS_LABELS[lobby.status] || lobby.status}
                            color={STATUS_COLORS[lobby.status] || 'default'}
                            size="small"
                          />
                          {isInLobby && (
                            <Chip label="You're in" color="primary" size="small" variant="outlined" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Created by {lobby.state.players.find((p) => p.steamId === lobby.createdBy)?.name || 'Unknown'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 14 } }}>
                        {lobby.state.players.map((p) => (
                          <Avatar key={p.steamId} src={p.avatar} alt={p.name} sx={{ width: 32, height: 32 }}>
                            {p.name[0]}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <Chip
                        label={`${playerCount}/${maxPlayers}`}
                        variant="outlined"
                        color={playerCount >= maxPlayers ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
