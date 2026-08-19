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
  IconButton,
  Typography,
} from '@mui/material';
import { VisibilityOutlined, PersonOffOutlined } from '@mui/icons-material';

export interface PatientItem {
  id: string;
  _id?: string;
  name: string;
  age: string;
  gender: string;
  phone: string;
  bloodGroup: string;
  totalVisits: number;
  lastVisit: string;
}

interface PatientTableProps {
  patients: PatientItem[];
  onViewHistory: (patient: PatientItem) => void;
}

export default function PatientTable({ patients, onViewHistory }: PatientTableProps) {
  return (
    <Paper
      sx={{
        bgcolor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '20px',
        p: { xs: 2, sm: 3 },
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  borderColor: '#334155',
                  color: '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                },
              }}
            >
              <TableCell>PATIENT ID</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>AGE / GENDER</TableCell>
              <TableCell>CONTACT</TableCell>
              <TableCell>BLOOD GROUP</TableCell>
              <TableCell>TOTAL VISITS</TableCell>
              <TableCell align="right">RECORD</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, borderColor: '#334155' }}>
                  <PersonOffOutlined sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    No patient records available
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Registered clinic patients will appear here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              patients.map((row) => (
                <TableRow
                  key={row._id || row.id}
                  sx={{
                    '& td': { borderColor: '#334155', color: '#FFFFFF', py: 2 },
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#83C5BE' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                  <TableCell sx={{ color: '#CBD5E1' }}>
                    {row.age} • {row.gender}
                  </TableCell>
                  <TableCell sx={{ color: '#CBD5E1' }}>{row.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.bloodGroup || 'N/A'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.15)',
                        color: '#F87171',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.totalVisits} visits</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => onViewHistory(row)}
                      sx={{
                        color: '#83C5BE',
                        border: '1px solid #334155',
                        '&:hover': { bgcolor: 'rgba(131, 197, 190, 0.1)', borderColor: '#83C5BE' },
                      }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
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