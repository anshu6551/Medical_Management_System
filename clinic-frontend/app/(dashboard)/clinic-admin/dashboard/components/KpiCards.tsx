'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Typography, Box, Grid, Skeleton } from '@mui/material';
import {
  PeopleAltOutlined,
  CalendarTodayOutlined,
  MedicalServicesOutlined,
  AccountBalanceWalletOutlined,
  TrendingUp,
} from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  activeDoctors: number;
  monthlyRevenue: number;
}

export default function KpiCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    activeDoctors: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Dashboard Stats API
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const url = API_ENDPOINTS?.CLINIC_ADMIN?.DASHBOARD || '/clinic/dashboard';
      const res = await api.get(url);
      if (res.data?.success && res.data?.data?.stats) {
        setStats(res.data.data.stats);
      }
    } catch {
      // Keep existing values or fallback on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Format Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {/* 1. Total Patients */}
      <Grid item xs={6} md={3} size={{ xs: 6, md: 3 }}>
        <Card sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '18px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleAltOutlined sx={{ color: '#83C5BE' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(34, 197, 94, 0.15)', px: 1, py: 0.3, borderRadius: '6px' }}>
                <TrendingUp sx={{ fontSize: 14, color: '#4ADE80' }} />
                <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 700 }}>+12%</Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>
              Total Patients
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: '#334155' }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                {stats.totalPatients.toLocaleString('en-IN')}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 2. Today's Appointments */}
      <Grid item xs={6} md={3} size={{ xs: 6, md: 3 }}>
        <Card sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '18px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarTodayOutlined sx={{ color: '#2DD4BF' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(34, 197, 94, 0.15)', px: 1, py: 0.3, borderRadius: '6px' }}>
                <TrendingUp sx={{ fontSize: 14, color: '#4ADE80' }} />
                <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 700 }}>+8%</Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>
              Today&apos;s Appointments
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: '#334155' }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                {stats.todayAppointments}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 3. Active Doctors */}
      <Grid item xs={6} md={3} size={{ xs: 6, md: 3 }}>
        <Card sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '18px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MedicalServicesOutlined sx={{ color: '#FBBF24' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(34, 197, 94, 0.15)', px: 1, py: 0.3, borderRadius: '6px' }}>
                <TrendingUp sx={{ fontSize: 14, color: '#4ADE80' }} />
                <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 700 }}>Active</Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>
              Active Doctors
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: '#334155' }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                {stats.activeDoctors}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 4. Monthly Revenue */}
      <Grid item xs={6} md={3} size={{ xs: 6, md: 3 }}>
        <Card sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '18px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBalanceWalletOutlined sx={{ color: '#60A5FA' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(34, 197, 94, 0.15)', px: 1, py: 0.3, borderRadius: '6px' }}>
                <TrendingUp sx={{ fontSize: 14, color: '#4ADE80' }} />
                <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 700 }}>+18%</Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>
              Monthly Revenue
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="70%" height={40} sx={{ bgcolor: '#334155' }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                {formatCurrency(stats.monthlyRevenue)}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}