import * as React from 'react';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import StorageIcon from '@mui/icons-material/Storage';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { usePageHeader } from '../../contexts/PageHeaderContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { api } from '../../utils/api';
import type { SettingsResponse } from '../../types/api.types';
import { useTranslation } from 'react-i18next';
import { SharedNavBar } from './SharedNavBar';

export default function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { headerActions } = usePageHeader();
  const { showError, showPersistentError, closeSnackbar } = useSnackbar();
  const hasShownWebhookWarningRef = React.useRef(false);
  const [dbHealthSnackbarKey, setDbHealthSnackbarKey] = React.useState<import('notistack').SnackbarKey | null>(null);
  const [steamHealthSnackbarKey, setSteamHealthSnackbarKey] = React.useState<import('notistack').SnackbarKey | null>(null);
  const contentContainerRef = React.useRef<HTMLDivElement>(null);
  const [webhookConfigured, setWebhookConfigured] = React.useState<boolean | null>(null);

  // Page header configuration - maps routes to their titles and icons
  const pageHeaders: Record<string, { title: string; icon: React.ComponentType; color?: string }> = {
    '/': { title: t('layout.pageTitle.dashboard'), icon: DashboardIcon },
    '/tournament': { title: t('layout.pageTitle.tournament'), icon: EmojiEventsIcon },
    '/bracket': { title: t('layout.pageTitle.bracket'), icon: AccountTreeIcon },
    '/matches': { title: t('layout.pageTitle.matches'), icon: SportsEsportsIcon },
    '/teams': { title: t('layout.pageTitle.teams'), icon: GroupsIcon },
    '/players': { title: t('layout.pageTitle.players'), icon: PersonIcon },
    '/servers': { title: t('layout.pageTitle.servers'), icon: StorageIcon },
    '/maps': { title: t('layout.pageTitle.maps'), icon: MapIcon },
    '/templates': { title: t('layout.pageTitle.templates'), icon: DescriptionIcon },
    '/elo-templates': { title: t('layout.pageTitle.eloTemplates'), icon: TrendingUpIcon },
    '/admin': { title: t('layout.pageTitle.adminTools'), icon: CampaignIcon },
    '/settings': { title: t('layout.pageTitle.settings'), icon: SettingsIcon },
    '/dev': { title: t('layout.pageTitle.devTools'), icon: BugReportIcon, color: 'warning.main' },
  };

  const currentPageHeader = pageHeaders[location.pathname];

  React.useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await api.get<SettingsResponse>('/api/settings');
        if (isMounted) {
          setWebhookConfigured(Boolean(response.settings?.webhookConfigured));
        }
      } catch {
        if (isMounted) {
          setWebhookConfigured(false);
        }
      }
    };

    loadSettings();

    const handleSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<SettingsResponse['settings']>;
      setWebhookConfigured(Boolean(customEvent.detail?.webhookConfigured));
    };

    window.addEventListener('matchzy:settingsUpdated', handleSettingsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('matchzy:settingsUpdated', handleSettingsUpdated);
    };
  }, []);

  // Global admin warning: keep a persistent snackbar while any server reports plugin DB down.
  React.useEffect(() => {
    let cancelled = false;

    const checkDbHealth = async () => {
      try {
        const response = await api.get<{ success: boolean; servers?: Array<{ enabled?: boolean; matchzyDbOk?: boolean | null }> }>(
          '/api/servers'
        );
        if (cancelled) return;
        const servers = response.servers ?? [];
        const downCount = servers.filter((s) => s.enabled !== false && s.matchzyDbOk === false).length;

        if (downCount > 0) {
          if (!dbHealthSnackbarKey) {
            const key = showPersistentError(
              <span>
                <strong>MatchZy DB unreachable</strong> — {downCount}{' '}
                {downCount === 1 ? 'server has' : 'servers have'} reported that the plugin cannot reach its database.
                Backups/event queue may be impacted.
              </span>,
              'matchzy-db-down'
            );
            setDbHealthSnackbarKey(key);
          }
        } else if (dbHealthSnackbarKey) {
          closeSnackbar(dbHealthSnackbarKey);
          setDbHealthSnackbarKey(null);
        }
      } catch {
        // Non-fatal; we don't want global UI to hard-fail.
      }
    };

    void checkDbHealth();
    const interval = window.setInterval(checkDbHealth, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [dbHealthSnackbarKey, showPersistentError, closeSnackbar]);

  // Global admin warning: keep a persistent snackbar while Steam integration is unhealthy.
  React.useEffect(() => {
    let cancelled = false;

    const checkSteamHealth = async () => {
      try {
        const response = await api.get<{
          success?: boolean;
          configured?: boolean;
          valid?: boolean;
          errorType?: string;
          error?: string;
        }>('/api/steam/status');

        if (cancelled) return;

        const configured = response.configured;
        const valid = response.valid;
        const isUnhealthy =
          configured === false || valid === false || response.success === false;

        if (isUnhealthy) {
          if (!steamHealthSnackbarKey) {
            const key = showPersistentError(
              <span>
                <strong>Steam integration unavailable</strong> — Sign-ins and vanity URL lookups may not work. Check server configuration and connectivity.
              </span>,
              'steam-api-health'
            );
            setSteamHealthSnackbarKey(key);
          }
        } else if (steamHealthSnackbarKey) {
          closeSnackbar(steamHealthSnackbarKey);
          setSteamHealthSnackbarKey(null);
        }
      } catch {
        // Non-fatal.
      }
    };

    void checkSteamHealth();
    const interval = window.setInterval(checkSteamHealth, 5 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [steamHealthSnackbarKey, showPersistentError, closeSnackbar]);

  const handleOpenSettingsFromSnackbar = React.useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  React.useEffect(() => {
    if (webhookConfigured === false && !hasShownWebhookWarningRef.current) {
      hasShownWebhookWarningRef.current = true;
      showError(
        <Box display="flex" alignItems="center" gap={1}>
          <Box component="span" sx={{ mr: 1 }}>
            {t('layout.webhookNotConfigured')}
          </Box>
          <Button
            color="inherit"
            size="small"
            onClick={handleOpenSettingsFromSnackbar}
            sx={{ textDecoration: 'underline' }}
          >
            {t('layout.openSettings')}
          </Button>
        </Box>
      );
    }

    if (webhookConfigured === true) {
      hasShownWebhookWarningRef.current = false;
    }
  }, [webhookConfigured, showError, handleOpenSettingsFromSnackbar, t]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/matches')) {
      document.title = `FULM: ${t('layout.pageTitle.matches')}`;
    }
  }, [location.pathname, t]);

  React.useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <MuiAppBar position="fixed" color="inherit" sx={{ displayPrint: 'none' }}>
        <Toolbar>
          <SharedNavBar />
        </Toolbar>
      </MuiAppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Box
          ref={contentContainerRef}
          sx={{
            width: '100%',
            flexGrow: 1,
            overflow: 'auto',
            p: 3,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: (theme) => theme.breakpoints.values.lg }}>
            {/* Page Header */}
            {currentPageHeader && (
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    component={currentPageHeader.icon}
                    sx={{
                      fontSize: 28,
                      color: currentPageHeader.color || 'primary.main',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="h5" fontWeight={700}>
                    {currentPageHeader.title}
                  </Typography>
                </Box>
                {headerActions && <Box>{headerActions}</Box>}
              </Box>
            )}
            <Box
              key={location.key}
              sx={{
                animation: 'pageEnter 180ms ease-out',
                '@keyframes pageEnter': {
                  from: { opacity: 0, transform: 'scale(0.98)' },
                  to: { opacity: 1, transform: 'scale(1)' },
                },
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
