'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ArrowForwardOutlined,
  FavoriteOutlined,
  LogoutOutlined,
  ReceiptLongOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Dynamic Patient Profile State
  const [patientUser, setPatientUser] = useState<{
    name: string;
    tokenId: string;
    initial: string;
    isLoggedIn: boolean;
  }>({
    name: 'Patient Account',
    tokenId: 'PAT-OPD',
    initial: 'P',
    isLoggedIn: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          const parsed = JSON.parse(storedUser);
          const name = parsed.name || parsed.patientName || 'Verified Patient';
          const tokenId = parsed.patientId || parsed.customId || `PAT-${(parsed._id || '1082').slice(-4).toUpperCase()}`;
          const initial = name.charAt(0).toUpperCase();

          setPatientUser({
            name,
            tokenId,
            initial,
            isLoggedIn: true,
          });
        } catch (e) {
          console.error('Failed to parse patient user data', e);
        }
      }
    }
  }, []);

  // Profile Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    router.push('/login');
  };

  const navs = [
    { text: 'Home', href: '/patient/search-doctors' },
    { text: 'Our Doctors', href: '/patient/search-doctors/all' },
    { text: 'My Bookings', href: '/patient/dashboard' },
    { text: 'Contact', href: '/patient/search-doctors#contact-desk' },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '24px',
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: '16px',
            px: 3,
            bgcolor: '#FFFFFF',
            borderRadius: '50px',
            border: '1px solid rgba(224, 231, 255, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.08)',
          }}
        >
          {/* Brand Logo */}
          <Box
            component={Link}
            href="/patient/search-doctors"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
          >
            <Box sx={{ p: 0.8, bgcolor: '#4F46E5', borderRadius: '12px', color: '#FFF', display: 'flex' }}>
              <FavoriteOutlined fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.5px' }}>
              Medi<span style={{ color: '#4F46E5' }}>Pulse</span>
            </Typography>
            <Chip
              label="Patient Care"
              size="small"
              sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '0.65rem' }}
            />
          </Box>

          {/* 4 Navigation Links */}
          <Stack direction="row" spacing={3.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navs.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Typography
                  key={item.text}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: isActive ? '#4F46E5' : '#475569',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    transition: '0.2s',
                    '&:hover': { color: '#4F46E5' },
                  }}
                >
                  {item.text}
                </Typography>
              );
            })}
          </Stack>

          {/* User Profile & CTA */}
          <Stack direction="row" spacing={2} alignItems="center">
            {patientUser.isLoggedIn ? (
              <Box
                onClick={handleOpenMenu}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 0.5,
                  px: 1,
                  borderRadius: '50px',
                  transition: '0.2s',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                <Avatar sx={{ bgcolor: '#4F46E5', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 800 }}>
                  {patientUser.initial}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E1B4B', lineHeight: 1 }}>
                    {patientUser.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {patientUser.tokenId}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Button
                component={Link}
                href="/login"
                sx={{ fontWeight: 700, color: '#4F46E5', textTransform: 'none' }}
              >
                Sign In
              </Button>
            )}

            {/* Logout Popover Menu */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              onClick={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  filter: 'drop-shadow(0px 10px 25px rgba(30, 27, 75, 0.12))',
                  mt: 1.5,
                  borderRadius: '20px',
                  minWidth: 190,
                  border: '1.5px solid #CBD5E1',
                  p: 0.5,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E1B4B' }}>
                  {patientUser.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {patientUser.tokenId}
                </Typography>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem onClick={() => router.push('/patient/dashboard')} sx={{ borderRadius: '12px', py: 1 }}>
                <ListItemIcon>
                  <ReceiptLongOutlined fontSize="small" sx={{ color: '#4F46E5' }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E1B4B' }}>
                  My Bookings
                </Typography>
              </MenuItem>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem onClick={handleLogout} sx={{ borderRadius: '12px', py: 1 }}>
                <ListItemIcon>
                  <LogoutOutlined fontSize="small" sx={{ color: '#DC2626' }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#DC2626' }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>

            {/* Book OPD Slot CTA */}
            <Button
              variant="contained"
              disableElevation
              component={Link}
              href="/patient/search-doctors/all"
              endIcon={
                <Box sx={{ p: 0.5, bgcolor: '#FFF', borderRadius: '50%', color: '#4F46E5', display: 'flex' }}>
                  <ArrowForwardOutlined sx={{ fontSize: 14 }} />
                </Box>
              }
              sx={{
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
                borderRadius: '50px',
                px: 2.8,
                py: 0.9,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.85rem',
              }}
            >
              Book OPD Slot
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}