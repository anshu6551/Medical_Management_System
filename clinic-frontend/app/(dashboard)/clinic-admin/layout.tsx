'use client';
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleAltOutlined,
  CalendarTodayOutlined,
  PersonalInjuryOutlined,
  ReceiptLongOutlined,
  SettingsOutlined,
  MenuOutlined,
  LogoutOutlined,
  NotificationsNoneOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 65;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardOutlined />, href: '/clinic-admin/dashboard' },
  { text: 'Doctors', icon: <PeopleAltOutlined />, href: '/clinic-admin/doctors' },
  { text: 'Appointments', icon: <CalendarTodayOutlined />, href: '/clinic-admin/appointments' },
  { text: 'Patients', icon: <PersonalInjuryOutlined />, href: '/clinic-admin/patients' },
  { text: 'Billing & Invoices', icon: <ReceiptLongOutlined />, href: '/clinic-admin/billing' },
  { text: 'Settings', icon: <SettingsOutlined />, href: '/clinic-admin/settings' },
];

export default function ClinicAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1E293B', color: '#FFFFFF' }}>
      {/* Brand Header */}
      <Box
        sx={{
          height: HEADER_HEIGHT,
          px: 3,
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
          Medi<span style={{ color: '#83C5BE' }}>Pulse</span>
        </Typography>
        <Chip label="Clinic Admin" size="small" sx={{ bgcolor: 'rgba(131, 197, 190, 0.15)', color: '#83C5BE', fontWeight: 700, fontSize: '0.65rem' }} />
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: '12px',
                  bgcolor: isActive ? '#006D77' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  '&:hover': {
                    bgcolor: isActive ? '#004D54' : 'rgba(255,255,255,0.05)',
                    color: '#FFFFFF',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#FFFFFF' : '#83C5BE', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer / Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid #334155' }}>
        <ListItemButton
          component={Link}
          href="/login"
          sx={{ borderRadius: '12px', color: '#F87171', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
        >
          <ListItemIcon sx={{ color: '#F87171', minWidth: 40 }}>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            slotProps={{
              primary: {
                sx: { fontWeight: 600, fontSize: '0.9rem' },
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F172A' }}>
      {/* Desktop Persistent Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #334155',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Page Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {/* Top Header */}
        <Box
          sx={{
            height: HEADER_HEIGHT,
            bgcolor: '#1E293B',
            borderBottom: '1px solid #334155',
            px: { xs: 2, md: 4 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#FFFFFF' }}>
                <MenuOutlined />
              </IconButton>
            )}
          </Box>

          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
            

            <IconButton sx={{ color: '#CBD5E1', border: '1px solid #334155' }}>
              <NotificationsNoneOutlined fontSize="small" />
            </IconButton>

            <Avatar sx={{ bgcolor: '#006D77', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}>
              CA
            </Avatar>
          </Stack>
        </Box>

        {/* Dynamic Page Children */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}