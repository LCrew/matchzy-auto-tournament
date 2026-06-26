import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import React from 'react';

interface GlowBorderProps {
  children: React.ReactNode;
  glowColor: string;
  speed?: number;
  borderRadius?: string;
  display?: string;
  sx?: SxProps<Theme>;
  onClick?: (e: React.MouseEvent) => void;
}

// Animated shimmer border — linear gradient that sweeps horizontally around the element.
// The 2px padding ring shows the gradient; children's background covers the center.
export function GlowBorder({
  children,
  glowColor,
  speed = 3,
  borderRadius = '8px',
  display = 'block',
  sx,
  onClick,
}: GlowBorderProps) {
  return (
    <Box sx={{ position: 'relative', display, borderRadius, p: '2px', ...sx }} onClick={onClick}>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `linear-gradient(90deg, ${glowColor}, transparent 50%, ${glowColor})`,
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      />
      {children}
    </Box>
  );
}
