import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { api } from '../utils/api';
import type { MatchMapResult } from '../types';
import { getMapDisplayName } from '../constants/maps';

interface DemoMap {
  mapNumber: number;
  mapName: string | null;
}

// Combined slug + result so we never need to call setState synchronously to
// reset to a loading placeholder — loading is derived from a slug mismatch.
interface FetchState {
  slug: string;
  maps: DemoMap[];
}

export default function DemoReplayPage() {
  const { matchSlug } = useParams<{ matchSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [fetchState, setFetchState] = useState<FetchState | null>(null);

  useEffect(() => {
    if (!matchSlug) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get<{ success: boolean; mapResults?: MatchMapResult[] }>(
          `/api/events/live/${matchSlug}`
        );
        if (cancelled) return;
        const maps: DemoMap[] = (res?.mapResults ?? [])
          .filter((mr) => mr.demoFilePath)
          .map((mr) => ({ mapNumber: mr.mapNumber, mapName: mr.mapName ?? null }));
        setFetchState({ slug: matchSlug, maps });
      } catch {
        if (!cancelled) setFetchState({ slug: matchSlug, maps: [] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchSlug]);

  // isLoading is true until we have a completed fetch for the current slug
  const isLoading = fetchState === null || fetchState.slug !== matchSlug;
  const demoMaps = isLoading ? null : fetchState.maps;

  const mapParam = searchParams.get('map');
  const selectedMapNumber =
    mapParam !== null ? parseInt(mapParam, 10) : (demoMaps?.[0]?.mapNumber ?? 0);

  const hasDemo =
    demoMaps !== null && demoMaps.some((m) => m.mapNumber === selectedMapNumber);

  const playerUrl =
    matchSlug && hasDemo
      ? `/demo-player/?demourl=${encodeURIComponent(
          `${window.location.origin}/api/demos/${matchSlug}/download/${selectedMapNumber}`
        )}`
      : null;

  const getMapLabel = (m: DemoMap) => {
    const display = m.mapName ? (getMapDisplayName(m.mapName) ?? m.mapName) : null;
    if (!display) return `Map ${m.mapNumber + 1}`;
    return demoMaps && demoMaps.length > 1 ? `Map ${m.mapNumber + 1}: ${display}` : display;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      >
        <Button startIcon={<ArrowBackIcon />} size="small" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }} noWrap>
          {matchSlug}
        </Typography>
        {demoMaps && demoMaps.length > 1 && (
          <Stack direction="row" spacing={1} flexShrink={0}>
            {demoMaps.map((m) => (
              <Chip
                key={m.mapNumber}
                label={getMapLabel(m)}
                size="small"
                variant={m.mapNumber === selectedMapNumber ? 'filled' : 'outlined'}
                color={m.mapNumber === selectedMapNumber ? 'primary' : 'default'}
                onClick={() => setSearchParams({ map: String(m.mapNumber) })}
                clickable
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading demo info...
            </Typography>
          </Box>
        ) : !hasDemo ? (
          <Box sx={{ textAlign: 'center' }}>
            <VideocamOffIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Demo not available
            </Typography>
            <Typography variant="body2" color="text.disabled">
              The demo file for this match has not been uploaded yet.
            </Typography>
          </Box>
        ) : (
          <Box
            component="iframe"
            src={playerUrl!}
            title="Demo Replay"
            allow="fullscreen"
            sx={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        )}
      </Box>
    </Box>
  );
}
