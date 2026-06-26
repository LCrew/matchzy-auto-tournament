import React from 'react';
import { Box, Button, Stack, Typography, Divider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import type { MatchMapResult } from '../../types';
import { getMapDisplayName } from '../../constants/maps';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MapDemoDownloadsProps {
  maps: string[];
  mapResults: MatchMapResult[];
  matchSlug: string;
}

export function MapDemoDownloads({ maps, mapResults, matchSlug }: MapDemoDownloadsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDownloadDemo = (mapNumber: number) => {
    const link = document.createElement('a');
    link.href = `/api/demos/${matchSlug}/download/${mapNumber}`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mapsWithDemos = maps
    .map((map, idx) => {
      const result = mapResults.find((mr) => mr.mapNumber === idx);
      if (!result?.demoFilePath) return null;

      const displayName = getMapDisplayName(map) || map;
      const mapName = result.mapName || displayName;

      return { mapNumber: idx, mapName, displayName };
    })
    .filter(
      (item): item is { mapNumber: number; mapName: string; displayName: string } => item !== null
    );

  if (mapsWithDemos.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Map Demos
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={1}>
        {mapsWithDemos.map(({ mapNumber, mapName }) => (
          <Box key={mapNumber} display="flex" gap={1}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadDemo(mapNumber)}
              sx={{ justifyContent: 'flex-start' }}
            >
              Download {mapName} demo
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => navigate(`/replay/${matchSlug}?map=${mapNumber}`)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {t('demo.watchReplay')}
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
