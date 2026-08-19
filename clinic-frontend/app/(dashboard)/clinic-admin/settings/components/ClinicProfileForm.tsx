'use client';
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function ClinicProfileForm() {
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('08:00 PM');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const inputStyle = {
    color: '#FFFFFF',
    bgcolor: '#0F172A',
    borderRadius: '12px',
    '& fieldset': { borderColor: '#334155' },
    '&:hover fieldset': { borderColor: '#83C5BE' },
    '&.Mui-focused fieldset': { borderColor: '#83C5BE' },
  };

  // 1. Fetch Clinic Settings (GET /clinic/settings)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const url = API_ENDPOINTS?.CLINIC?.SETTINGS || '/clinic/settings';
        const res = await api.get(url);

        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          setClinicName(data.name || data.clinicName || '');
          setPhone(data.phone || data.contactNumber || '');
          setEmail(data.email || '');
          setAddress(data.address || '');
          setOpeningTime(data.openingTime || '09:00 AM');
          setClosingTime(data.closingTime || '08:00 PM');
        }
      } catch (err: any) {
        console.error('Fetch Settings Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 2. Save Settings (PATCH /clinic/settings)
  const handleSave = async () => {
    try {
      setSaving(true);
      const url = API_ENDPOINTS?.CLINIC?.SETTINGS || '/clinic/settings';
      const payload = {
        name: clinicName,
        phone,
        email,
        address,
        openingTime,
        closingTime,
      };

      const res = await api.put(url, payload);

      if (res.data?.success || res.status === 200) {
        setSnackbar({
          open: true,
          message: 'Clinic details updated successfully!',
          severity: 'success',
        });
      }
    } catch (err: any) {
      console.error('Update Settings Error:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to update clinic details',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          bgcolor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '20px',
          p: 6,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#83C5BE' }} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2.5, sm: 3.5 } }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
        Clinic Profile & Operating Details
      </Typography>
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
        Update public clinic information visible to patients during slot booking.
      </Typography>

      <Divider sx={{ borderColor: '#334155', mb: 3 }} />

      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} size={{ sm: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Clinic Name"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} size={{ sm: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} size={{ sm: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Support Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} size={{ sm: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} size={{ sm: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Opening Time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} size={{ sm: 6, xs: 12 }}>
            <TextField
              fullWidth
              label="Closing Time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSave}
            disabled={saving}
            startIcon={<SaveOutlined />}
            sx={{
              bgcolor: '#006D77',
              '&:hover': { bgcolor: '#004D54' },
              fontWeight: 700,
              px: 3,
              borderRadius: '10px',
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : 'Save Changes'}
          </Button>
        </Box>
      </Stack>

      {/* Alert Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}