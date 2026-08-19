'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  TextField,
  IconButton,
  Divider,
  MenuItem,
  Grid,
  CircularProgress,
} from '@mui/material';
import { CloseOutlined, LocalHospitalOutlined } from '@mui/icons-material';

interface OnboardClinicModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; ownerName: string; email: string; city: string; plan: string }) => Promise<void> | void;
}

export default function OnboardClinicModal({ open, onClose, onSave }: OnboardClinicModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    city: '',
    plan: 'Pro Monthly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      setFormData({ name: '', ownerName: '', email: '', city: '', plan: 'Pro Monthly' });
    } catch (err) {
      console.error('Failed to onboard clinic:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1E293B',
          color: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
          p: 1,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ p: 1, bgcolor: 'rgba(131, 197, 190, 0.15)', color: '#83C5BE', borderRadius: '12px', display: 'flex' }}>
              <LocalHospitalOutlined />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
              Onboard New Clinic Tenant
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={loading} sx={{ color: '#94A3B8' }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <DialogContent sx={{ py: 3, bgcolor: '#1E293B' }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} size={{ xs: 6 }}>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                Clinic Name
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="e.g. Apollo Care Specialty"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: '#83C5BE' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} size={{ xs: 6 }}>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                Clinic Admin / Owner Name
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="Dr. Rajesh Sharma"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} size={{ xs: 6 }}>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                Contact Email
              </Typography>
              <TextField
                fullWidth
                required
                type="email"
                placeholder="admin@apollocare.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} size={{ xs: 6 }}>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                Location / City
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="Salt Lake, Kolkata"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} size={{ xs: 6 }}>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mb: 0.8 }}>
                Assigned SaaS Tier
              </Typography>
              <TextField
                select
                fullWidth
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  },
                  '& .MuiSvgIcon-root': { color: '#83C5BE' },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: { bgcolor: '#1E293B', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.15)' },
                    },
                  },
                }}
              >
                <MenuItem value="Starter Trial">Starter Trial (14 Days)</MenuItem>
                <MenuItem value="Pro Monthly">Pro Monthly Tier</MenuItem>
                <MenuItem value="Enterprise SaaS">Enterprise SaaS Plan</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <DialogActions sx={{ p: 2, bgcolor: '#1E293B' }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: '#94A3B8', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: '#006D77',
              '&:hover': { bgcolor: '#004D54' },
              color: '#FFF',
              fontWeight: 800,
              borderRadius: '10px',
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : 'Confirm & Onboard'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}