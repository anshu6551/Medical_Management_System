'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVertOutlined,
  EmailOutlined,
  PhoneOutlined,
  AccessTimeOutlined,
  EditOutlined,
  SyncAltOutlined,
  DeleteOutlined,
} from '@mui/icons-material';

interface DoctorCardProps {
  id: string | number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  fee: string | number;
  status: 'Active' | 'On Leave' | string;
  experience: string | number;
  timing?: string;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export default function DoctorCard({
  name,
  specialty,
  email,
  phone,
  fee,
  status,
  experience,
  timing = 'Mon - Fri (10:00 AM - 04:00 PM)',
  onEdit,
  onToggleStatus,
  onDelete,
}: DoctorCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isActive = status === 'Active' || status === 'ACTIVE';

  return (
    <Card
      sx={{
        bgcolor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '18px',
        transition: '0.2s',
        '&:hover': { borderColor: '#83C5BE' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#006D77',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {(name || 'D').replace('Dr. ', '').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                {name?.startsWith('Dr.') ? name : `Dr. ${name || 'Doctor'}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#83C5BE', fontWeight: 600 }}>
                {specialty} • {typeof experience === 'number' ? `${experience} yrs` : experience} exp
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" onClick={handleMenuClick} sx={{ color: '#94A3B8' }}>
            <MoreVertOutlined fontSize="small" />
          </IconButton>

          {/* Actions Menu */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '12px',
                minWidth: '160px',
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onEdit();
              }}
            >
              <ListItemIcon>
                <EditOutlined fontSize="small" sx={{ color: '#83C5BE' }} />
              </ListItemIcon>
              <ListItemText primary="Edit Details" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                onToggleStatus();
              }}
            >
              <ListItemIcon>
                <SyncAltOutlined fontSize="small" sx={{ color: '#FBBF24' }} />
              </ListItemIcon>
              <ListItemText
                primary={`Set as ${isActive ? 'On Leave' : 'Active'}`}
                primaryTypographyProps={{ fontSize: '0.85rem' }}
              />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDelete();
              }}
            >
              <ListItemIcon>
                <DeleteOutlined fontSize="small" sx={{ color: '#F87171' }} />
              </ListItemIcon>
              <ListItemText
                primary="Delete"
                primaryTypographyProps={{ fontSize: '0.85rem', color: '#F87171' }}
              />
            </MenuItem>
          </Menu>
        </Box>

        {/* Doctor Details */}
        <Stack spacing={1} sx={{ my: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailOutlined sx={{ fontSize: 16, color: '#83C5BE' }} />
            <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
              {email || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneOutlined sx={{ fontSize: 16, color: '#83C5BE' }} />
            <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
              {phone || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeOutlined sx={{ fontSize: 16, color: '#83C5BE' }} />
            <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
              {timing}
            </Typography>
          </Box>
        </Stack>

        {/* Footer info */}
        <Box
          sx={{
            pt: 2,
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
              Fee
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              {typeof fee === 'number' ? `₹${fee}` : fee}
            </Typography>
          </Box>

          <Chip
            label={isActive ? 'Active' : 'On Leave'}
            size="small"
            sx={{
              bgcolor: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isActive ? '#4ADE80' : '#F87171',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}