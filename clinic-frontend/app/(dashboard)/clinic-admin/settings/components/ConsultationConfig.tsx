'use client';
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { SettingsSuggestOutlined } from '@mui/icons-material';

export default function ConsultationConfig() {
  const [baseFee, setBaseFee] = useState('500');
  const [slotDuration, setSlotDuration] = useState('15');
  const [allowEmergency, setAllowEmergency] = useState(true);

  const inputStyle = {
    color: '#FFFFFF',
    bgcolor: '#0F172A',
    borderRadius: '12px',
    '& fieldset': { borderColor: '#334155' },
    '&:hover fieldset': { borderColor: '#83C5BE' },
  };

  const handleSave = () => {
    alert('Consultation configuration saved!');
  };

  return (
    <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2.5, sm: 3.5 } }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
        Consultation & Slot Configuration
      </Typography>
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
        Manage default fees and booking rules for doctor appointments.
      </Typography>

      <Divider sx={{ borderColor: '#334155', mb: 3 }} />

      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} size={{sm:6,xs:12}}>
            <TextField
              fullWidth
              label="Standard Consultation Fee (₹)"
              value={baseFee}
              onChange={(e) => setBaseFee(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} size={{sm:6,xs:12}}>
            <TextField
              fullWidth
              label="Default Slot Duration (Mins)"
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              slotProps={{
                inputLabel: { sx: { color: '#94A3B8' } },
                input: { sx: inputStyle },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ p: 2, bgcolor: '#0F172A', borderRadius: '12px', border: '1px solid #334155' }}>
          <FormControlLabel
            control={
              <Switch
                checked={allowEmergency}
                onChange={(e) => setAllowEmergency(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#83C5BE' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#006D77' },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  Allow Emergency Walk-in Bookings
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Enables clinic admins to override slot queues for urgent cases.
                </Typography>
              </Box>
            }
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSave}
            startIcon={<SettingsSuggestOutlined />}
            sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' }, fontWeight: 700, px: 3, borderRadius: '10px' }}
          >
            Update Rules
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}