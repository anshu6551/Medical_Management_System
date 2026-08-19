'use client';
import React from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { PlayArrowOutlined, EditNoteOutlined } from '@mui/icons-material';

export interface QueueItem {
  id: string;
  tokenId?: string;
  patientName: string;
  timeSlot: string;
  type: string;
  status: 'Waiting' | 'In Progress' | 'Completed';
}

interface QueueTableProps {
  queue: QueueItem[];
  onStartVisit: (id: string) => void;
  onOpenPrescription: (item: QueueItem) => void;
}

export default function QueueTable({ queue, onStartVisit, onOpenPrescription }: QueueTableProps) {
  return (
    <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderColor: '#334155', color: '#94A3B8', fontWeight: 700, fontSize: '0.8rem' } }}>
              <TableCell>TOKEN / ID</TableCell>
              <TableCell>PATIENT</TableCell>
              <TableCell>SLOT TIME</TableCell>
              <TableCell>VISIT TYPE</TableCell>
              <TableCell>STATUS</TableCell>
              <TableCell align="right">ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, borderColor: '#334155', color: '#94A3B8' }}>
                  <Typography variant="body2">No patients currently in the OPD queue today.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              queue.map((row) => (
                <TableRow key={row.id} sx={{ '& td': { borderColor: '#334155', color: '#FFFFFF', py: 2 } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#83C5BE' }}>
                    {row.tokenId || row.id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{row.patientName}</TableCell>
                  <TableCell sx={{ color: '#CBD5E1' }}>{row.timeSlot}</TableCell>
                  <TableCell sx={{ color: '#CBD5E1' }}>{row.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        bgcolor:
                          row.status === 'In Progress'
                            ? 'rgba(251, 191, 36, 0.15)'
                            : row.status === 'Completed'
                            ? 'rgba(74, 222, 128, 0.15)'
                            : 'rgba(148, 163, 184, 0.15)',
                        color:
                          row.status === 'In Progress'
                            ? '#FBBF24'
                            : row.status === 'Completed'
                            ? '#4ADE80'
                            : '#94A3B8',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === 'Waiting' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onStartVisit(row.id)}
                        startIcon={<PlayArrowOutlined fontSize="small" />}
                        sx={{ bgcolor: '#006D77', '&:hover': { bgcolor: '#004D54' }, textTransform: 'none', fontWeight: 700 }}
                      >
                        Call Patient
                      </Button>
                    )}
                    {row.status === 'In Progress' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onOpenPrescription(row)}
                        startIcon={<EditNoteOutlined fontSize="small" />}
                        sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' }, textTransform: 'none', fontWeight: 700, color: '#000' }}
                      >
                        Write Prescription
                      </Button>
                    )}
                    {row.status === 'Completed' && (
                      <Chip label="Done" size="small" variant="outlined" color="success" sx={{ fontWeight: 700 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}