import { Box, Typography, Alert, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const INVENTORY_URL = 'https://inventory.cstrike.app';

export default function Inventory() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Inventory
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Customize your weapon skins below. After making changes, type <strong>/ws</strong> in the in-game chat to refresh your skins on the server.
        </Alert>
        <Button
          variant="outlined"
          size="small"
          startIcon={<OpenInNewIcon />}
          href={INVENTORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mb: 2 }}
        >
          Open in new tab
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          src={INVENTORY_URL}
          title="Weapon Skin Inventory"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 8,
          }}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        />
      </Box>
    </Box>
  );
}
