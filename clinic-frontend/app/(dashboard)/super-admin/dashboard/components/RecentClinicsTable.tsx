'use client';
import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Avatar,
  Chip,
  Button,
  Skeleton,
} from '@mui/material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface RecentClinicsTableProps {
  refreshKey?: number;
}

export default function RecentClinicsTable({ refreshKey = 0 }: RecentClinicsTableProps) {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentClinics = async () => {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.SUPER_ADMIN.CLINICS);
        const list = res.data?.data || res.data || [];
        setClinics(list);
      } catch (err) {
        console.error('Failed to fetch recent clinics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentClinics();
  }, [refreshKey]);

  // Helper function for status chip color styling
  const getStatusChipProps = (status: string) => {
    const s = status?.toUpperCase() || '';
    if (s === 'ACTIVE' || s === 'APPROVED') {
      return { bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34D399' };
    }
    if (s === 'SUSPENDED' || s === 'BLOCKED' || s === 'REJECTED') {
      return { bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
    }
    return { bgcolor: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24' };
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
          Recently Onboarded Clinics & Tenants
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
          Active clinic subscriptions and assigned doctor capacities
        </Typography>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255, 255, 255, 0.15)', fontWeight: 800, color: '#94A3B8' } }}>
              <TableCell sx={{ color: '#94A3B8' }}>Clinic Name</TableCell>
              <TableCell sx={{ color: '#94A3B8' }}>Location</TableCell>
              <TableCell sx={{ color: '#94A3B8' }}>SaaS Plan</TableCell>
              <TableCell sx={{ color: '#94A3B8' }}>Doctors Panel</TableCell>
              <TableCell sx={{ color: '#94A3B8' }}>Onboarded Date</TableCell>
              <TableCell sx={{ color: '#94A3B8' }}>Status</TableCell>
              <TableCell align="right" sx={{ color: '#94A3B8' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Skeleton Rows for Loading State
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton variant="rectangular" width={180} height={25} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '6px' }} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={80} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} /></TableCell>
                  <TableCell><Skeleton variant="text" width={70} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                  <TableCell><Skeleton variant="text" width={90} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={60} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width={50} sx={{ bgcolor: 'rgba(255,255,255,0.08)', ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : clinics.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#94A3B8', fontWeight: 600 }}>
                  No onboarded clinics found. Click "Onboard New Clinic" to add one.
                </TableCell>
              </TableRow>
            ) : (
              // Live Rendered Rows
              clinics.map((row: any, idx: number) => {
                const clinicName = row.name || row.clinicName || 'Unnamed Clinic';
                const location = row.address || row.city || row.location || 'N/A';
                const planName = row.subscriptionPlan?.name || row.plan || 'Standard SaaS';
                const doctorCount = row.doctorsCount || row.doctors?.length || 0;
                const onboardedDate = row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
                const currentStatus = row.status || 'Active';
                const chipProps = getStatusChipProps(currentStatus);

                return (
                  <TableRow key={row._id || row.id || idx} hover sx={{ '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.08)' } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: '#006D77', color: '#83C5BE', fontWeight: 900, width: 38, height: 38, fontSize: '0.9rem' }}>
                          {clinicName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                          {clinicName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#CBD5E1' }}>{location}</TableCell>
                    <TableCell>
                      <Chip label={planName} size="small" sx={{ bgcolor: 'rgba(131, 197, 190, 0.15)', color: '#83C5BE', fontWeight: 800, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#FFFFFF' }}>{doctorCount} Doctors</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#CBD5E1' }}>{onboardedDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={currentStatus}
                        size="small"
                        sx={{
                          bgcolor: chipProps.bgcolor,
                          color: chipProps.color,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          textTransform: 'capitalize',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" sx={{ color: '#83C5BE', fontWeight: 800, textTransform: 'none' }}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}