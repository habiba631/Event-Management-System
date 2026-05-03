import { Box } from '@mui/material'
import { useScrollReveal } from '../../hooks/useScrollReveal'


function ScrollRevealSection({
  children,
  sx = {},
  revealSx = {},
  threshold,
  rootMargin,
  triggerOnce,
  ...props
}) {
  const { ref, revealed } = useScrollReveal({ threshold, rootMargin, triggerOnce })

  return (
    <Box
      ref={ref}
      {...props}
      sx={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(40px)',
        transition:
          'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform',
        ...sx,
        ...(revealed ? revealSx : {}),
      }}
    >
      {children}
    </Box>
  )
}

export default ScrollRevealSection
