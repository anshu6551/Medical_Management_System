'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Stack,
  Typography,
  MenuItem,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface RescheduleModalProps {
  open: boolean;
  appointment: any;
  onClose: () => void;
  onConfirm: (id: string, newDate: string, newTime: string) => void;
}

export default function RescheduleModal({
  open,
  appointment,
  onClose,
  onConfirm,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:30 AM');

  // Pre-fill existing appointment slot if available
  useEffect(() => {
    if (appointment) {
      if (appointment.date && appointment.date !== 'Today') {
        const parsedDate = new Date(appointment.date);
        if (!isNaN(parsedDate.getTime())) {
          setNewDate(parsedDate.toISOString().split('T')[0]);
        }
      }
      if (appointment.timeSlot) {
        setNewTime(appointment.timeSlot);
      }
    }
  }, [appointment, open]);

  const dialogSx = {
    bgcolor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #334155',
  };

  const inputStyle = {
    color: '#FFFFFF',
    bgcolor: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
  };

  const handleSave = () => {
    if (appointment) {
      const apptId = appointment._id || appointment.id;
      onConfirm(apptId, newDate, newTime);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: dialogSx }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
          Reschedule Slot
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#334155', px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
            Patient: <strong style={{ color: '#FFF' }}>{appointment?.patientName || 'Patient'}</strong> ({appointment?.id || 'APT'})
          </Typography>

          <TextField
            fullWidth
            type="date"
            label="New Date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true, sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          />

          <TextField
            fullWidth
            select
            label="New Time Slot"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            InputLabelProps={{ sx: { color: '#94A3B8' } }}
            InputProps={{ sx: inputStyle }}
          >
            <MenuItem value="09:30 AM">09:30 AM</MenuItem>
            <MenuItem value="10:00 AM">10:00 AM</MenuItem>
            <MenuItem value="10:30 AM">10:30 AM</MenuItem>
            <MenuItem value="11:00 AM">11:00 AM</MenuItem>
            <MenuItem value="11:30 AM">11:30 AM</MenuItem>
            <MenuItem value="02:00 PM">02:00 PM</MenuItem>
            <MenuItem value="03:30 PM">03:30 PM</MenuItem>
            <MenuItem value="04:30 PM">04:30 PM</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: '#94A3B8' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' }, fontWeight: 700, px: 3 }}
        >
          Update Slot
        </Button>
      </DialogActions>
    </Dialog>
  );
}