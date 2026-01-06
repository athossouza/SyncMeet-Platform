import { Linkedin, Instagram, Youtube } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Grid, Typography, Link, Stack, IconButton } from '@mui/material';

export function Footer() {
    return (
        <Box component="footer" sx={{
            bgcolor: 'background.default',
            color: 'text.secondary',
            borderTop: '1px solid',
            borderColor: 'divider',
            py: 3,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Watermark - Bottom Right */}
            <Box
                component="img"
                src="/masonic_g.png"
                alt=""
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    width: 110,
                    height: 110,
                    opacity: 0.9,
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay',
                    filter: 'grayscale(1)'
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">

                    <Grid size={{ xs: 12, md: 8 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={3}>
                            <Box sx={{ width: 90 }}>
                                <img
                                    src="/logo.png"
                                    alt="ATVEZA"
                                    style={{ width: '100%', height: 'auto', opacity: 0.9 }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Inteligência Operacional em Suporte B2B.
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                                    &copy; 2025 ATVEZA Method ∴ | CNPJ: 48.761.773/0001-17
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent={{ xs: 'center', md: 'flex-end' }}
                            alignItems="center"
                        >
                            <Link
                                component={RouterLink}
                                to="/privacy"
                                sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    mr: 2,
                                    textDecoration: 'none',
                                    '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                                }}
                            >
                                Privacidade
                            </Link>

                            <IconButton size="small" href="https://www.linkedin.com/in/athossouza/" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary', '&:hover': { color: '#06b6d4' } }}>
                                <Linkedin size={20} />
                            </IconButton>
                            <IconButton size="small" href="https://www.instagram.com/atveza/" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}>
                                <Instagram size={20} />
                            </IconButton>
                            <IconButton size="small" href="https://www.youtube.com/@ATVEZATechnology" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                                <Youtube size={20} />
                            </IconButton>
                        </Stack>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
}
