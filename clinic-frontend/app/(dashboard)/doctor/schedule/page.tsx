'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedulePage() {
  const [days, setDays] = useState([
    { day: 'Monday', active: true, slot: '10:00 AM - 02:00 PM' },
    { day: 'Tuesday', active: true, slot: '10:00 AM - 02:00 PM' },
    { day: 'Wednesday', active: true, slot: '10:00 AM - 02:00 PM' },
    { day: 'Thursday', active: true, slot: '10:00 AM - 02:00 PM' },
    { day: 'Friday', active: true, slot: '10:00 AM - 02:00 PM' },
    { day: 'Saturday', active: false, slot: 'Off' },
    { day: 'Sunday', active: false, slot: 'Off' },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 1. Fetch Doctor's Available Days from Database
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        // Endpoint: /doctor/schedule (ya /doctor/slots)
        const res = await api.get('/doctor/schedule');

        if (res.data?.success && res.data?.data) {
          const availableDays: string[] = res.data.data.availableDays || [];
          const timingSlot = res.data.data.timing || '10:00 AM - 02:00 PM';

          const mappedDays = ALL_DAYS.map((dayName) => {
            const isActive = availableDays.some(
              (d) => d.toLowerCase().trim() === dayName.toLowerCase().trim() ||
                     d.toLowerCase().trim() === dayName.slice(0, 3).toLowerCase().trim()
            );

            return {
              day: dayName,
              active: isActive,
              slot: isActive ? timingSlot : 'Off',
            };
          });

          setDays(mappedDays);
        }
      } catch (err) {
        console.error('Failed to load doctor schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // 2. Toggle Day Active / Inactive
  const toggleDay = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === index
          ? { ...d, active: !d.active, slot: !d.active ? '10:00 AM - 02:00 PM' : 'Off' }
          : d
      )
    );
  };

  // 3. Save Updated Schedule to Backend
  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      const activeDaysList = days.filter((d) => d.active).map((d) => d.day);

      const res = await api.put('/doctor/schedule', {
        availableDays: activeDaysList,
      });

      if (res.data?.success || res.status === 200) {
        setSnackbar({
          open: true,
          message: 'Schedule and availability updated successfully!',
          severity: 'success',
        });
      }
    } catch (err: any) {
      console.error('Save Schedule Error:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to save schedule. Please try again.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', py: 2, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            My Consultation Availability
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Configure weekly working days and OPD timing slots.
          </Typography>
        </Box>

        {/* Schedule Card */}
        <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2.5, sm: 3.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
            Weekly OPD Schedule
          </Typography>
          <Divider sx={{ borderColor: '#334155', mb: 3 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#83C5BE' }} />
            </Box>
          ) : (
            <Stack spacing={2}>
              {days.map((item, idx) => (
                <Box
                  key={item.day}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: '#0F172A',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.active}
                        onChange={() => toggleDay(idx)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#83C5BE' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#006D77' },
                        }}
                      />
                    }
                    label={
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                        {item.day}
                      </Typography>
                    }
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: item.active ? '#83C5BE' : '#64748B' }}>
                    {item.slot}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              disableElevation
              onClick={handleSaveSchedule}
              disabled={loading || saving}
              startIcon={saving ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <SaveOutlined />}
              sx={{
                bgcolor: '#006D77',
                '&:hover': { bgcolor: '#004D54' },
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: '10px',
              }}
            >
              {saving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}