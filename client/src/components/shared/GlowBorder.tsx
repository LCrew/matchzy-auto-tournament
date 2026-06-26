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
  disabled?: boolean;
  sx?: SxProps<Theme>;
  onClick?: (e: React.MouseEvent) => void;
}

// Animated shimmer border using CSS mask-composite to punch out the center —
// only the 2px border ring shows the gradient, never the fill.
export function GlowBorder({
  children,
  glowColor,
  speed = 3,
  borderRadius = '8px',
  display = 'block',
  disabled = false,
  sx,
  onClick,
}: GlowBorderProps) {
  return (
    <Box sx={{ position: 'relative', display, borderRadius, ...sx }} onClick={onClick}>
      {!disabled && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            padding: '2px',
            background: `linear-gradient(90deg, ${glowColor}, transparent 50%, ${glowColor})`,
            backgroundSize: '200% 100%',
            // Punch out the content-box so only the 2px border ring is visible
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </Box>
  );
}
