'use client';
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  DashboardOutlined,
  LocalHospitalOutlined,
  CardMembershipOutlined,
  PeopleAltOutlined,
  BarChartOutlined,
  SettingsOutlined,
  LogoutOutlined,
  MenuOutlined,
  NotificationsOutlined,
  ShieldOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { handleLogout } from '@/lib/utils/auth';

const drawerWidth = 260;

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardOutlined />, href: '/super-admin/dashboard' },
    { text: 'Clinic Management', icon: <LocalHospitalOutlined />, href: '/super-admin/clinics' },
    { text: 'Subscriptions', icon: <CardMembershipOutlined />, href: '/super-admin/subscriptions' },
    { text: 'Platform Users', icon: <PeopleAltOutlined />, href: '/super-admin/users' },
    { text: 'Revenue & Reports', icon: <BarChartOutlined />, href: '/super-admin/reports' },
    { text: 'System Settings', icon: <SettingsOutlined />, href: '/super-admin/settings' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
      {/* Brand Header (68px Height Matched with Top Navbar) */}
      <Box sx={{ height: 68, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box sx={{ p: 0.8, bgcolor: '#006D77', borderRadius: '10px', color: '#83C5BE', display: 'flex' }}>
          <ShieldOutlined fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1 }}>
          Medi<span style={{ color: '#83C5BE' }}>Pulse</span>
        </Typography>
        <Chip
          label="SUPER ADMIN"
          size="small"
          sx={{ bgcolor: 'rgba(131, 197, 190, 0.2)', color: '#83C5BE', fontWeight: 800, fontSize: '0.6rem', height: '20px' }}
        />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Navigation Links */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: '12px',
                  bgcolor: isActive ? '#006D77' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  boxShadow: isActive ? '0 4px 14px rgba(0, 109, 119, 0.35)' : 'none',
                  '&:hover': { bgcolor: isActive ? '#006D77' : 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF' },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#83C5BE' : '#64748B', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: isActive ? 800 : 600, fontSize: '0.88rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Bottom Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: '12px', color: '#F87171', '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' } }}
        >
          <ListItemIcon sx={{ color: '#F87171', minWidth: 38 }}>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout System" primaryTypographyProps={{ fontWeight: 800, fontSize: '0.88rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', overflowX: 'hidden' }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#0F172A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 68, px: { xs: 2, sm: 3 } }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuOutlined />
          </IconButton>

          {/* Title Matched Exactly with Logo Height */}
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', height: '100%' }}>
            Multi-Tenant Platform Governance
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ bgcolor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <NotificationsOutlined sx={{ fontSize: 20, color: '#83C5BE' }} />
            </IconButton>

            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                cursor: 'pointer',
                p: 0.6,
                px: 1.2,
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                transition: '0.2s',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)', borderColor: '#83C5BE' },
              }}
            >
              <Avatar sx={{ bgcolor: '#006D77', width: 34, height: 36, fontWeight: 900, fontSize: '0.85rem' }}>SA</Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1, color: '#FFFFFF' }}>
                  System Admin
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                  Root Control
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  mt: 1,
                  p: 0.5,
                  bgcolor: '#1E293B',
                  color: '#FFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: '#F87171', fontWeight: 800, gap: 1, borderRadius: '10px' }}>
                <LogoutOutlined fontSize="small" /> Logout System
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(!mobileOpen)}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Page Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3.5 },
          pt: { xs: 10, sm: 11 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100%',
          boxSizing: 'border-box',
          bgcolor: '#0F172A',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}