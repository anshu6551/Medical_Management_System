'use client';
import React, { useState } from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVertOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  EventRepeatOutlined,
  EventBusyOutlined,
} from '@mui/icons-material';

export interface AppointmentItem {
  id: string;
  _id?: string;
  patientName: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  status: 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled' | string;
  type: string;
}


//check data type of appointments and make sure it matches the AppointmentItem interface.

interface AppointmentTableProps {
  appointments: AppointmentItem[];
  onStatusChange: (id: string, newStatus: AppointmentItem['status']) => void;
  onRescheduleClick: (appt: AppointmentItem) => void;
}

//

export default function AppointmentTable({
  appointments,
  onStatusChange,
  onRescheduleClick,
}: AppointmentTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, appt: AppointmentItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppt(appt);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppt(null);
  };

  const getStatusChip = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'in progress':
      case 'in_progress':
        return (
          <Chip
            label="In Progress"
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        );
      case 'waiting':
        return (
          <Chip
            label="Waiting"
            size="small"
            color="info"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        );
      case 'completed':
        return (
          <Chip
            label="Completed"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        );
      case 'cancelled':
        return (
          <Chip
            label="Cancelled"
            size="small"
            color="error"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        );
      default:
        return (
          <Chip
            label={status || 'Waiting'}
            size="small"
            variant="outlined"
            sx={{ color: '#94A3B8', borderColor: '#334155', fontWeight: 700, fontSize: '0.75rem' }}
          />
        );
    }
  };

  return (
    <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderColor: '#334155', color: '#94A3B8', fontWeight: 700, fontSize: '0.8rem' } }}>
              <TableCell>APPOINTMENT ID</TableCell>
              <TableCell>PATIENT</TableCell>
              <TableCell>DOCTOR</TableCell>
              <TableCell>DATE & SLOT</TableCell>
              <TableCell>TYPE</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, borderColor: '#334155' }}>
                  <EventBusyOutlined sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    No appointments in queue
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Click &apos;New Booking&apos; to schedule an appointment.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '& td': { borderColor: '#334155', color: '#FFFFFF', py: 2 },
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#83C5BE' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.patientName}</TableCell>
                  <TableCell sx={{ color: '#CBD5E1' }}>{row.doctorName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.timeSlot}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {row.date}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#CBD5E1' }}>{row.type}</TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, row)}
                      sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}
                    >
                      <MoreVertOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#1E293B',
            color: '#FFFFFF',
            border: '1px solid #334155',
            borderRadius: '12px',
            minWidth: '170px',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedAppt) onStatusChange(selectedAppt.id, 'Completed');
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <CheckCircleOutlined fontSize="small" sx={{ color: '#4ADE80' }} />
          </ListItemIcon>
          <ListItemText primary="Mark Completed" primaryTypographyProps={{ fontSize: '0.85rem' }} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedAppt) onRescheduleClick(selectedAppt);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EventRepeatOutlined fontSize="small" sx={{ color: '#FBBF24' }} />
          </ListItemIcon>
          <ListItemText primary="Reschedule Slot" primaryTypographyProps={{ fontSize: '0.85rem' }} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedAppt) onStatusChange(selectedAppt.id, 'Cancelled');
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <CancelOutlined fontSize="small" sx={{ color: '#F87171' }} />
          </ListItemIcon>
          <ListItemText
            primary="Cancel Visit"
            primaryTypographyProps={{ fontSize: '0.85rem', color: '#F87171' }}
          />
        </MenuItem>
      </Menu>
    </Paper>
  );
}