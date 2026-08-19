'use client';
import React, { useEffect, useState } from 'react';
import { Grid, Paper, Box, Typography, Chip, Skeleton } from '@mui/material';
import {
  LocalHospitalOutlined,
  AttachMoneyOutlined,
  PeopleAltOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface StatsCardsProps {
  refreshKey?: number;
}

export default function StatsCards({ refreshKey = 0 }: StatsCardsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalClinics: 0,
    monthlyRevenue: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(API_ENDPOINTS.SUPER_ADMIN.STATS);

        // Extract nested data object cleanly
        const payload = res?.data?.data || res?.data || res;

        

        setData({
          totalClinics: Number(payload?.totalClinics || 0),
          monthlyRevenue: Number(payload?.mrr || payload?.monthlyRevenue || 0),
          totalDoctors: Number(payload?.totalDoctors || 0),
          totalPatients: Number(payload?.totalPatients || 0),
        });

        
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const stats = [
    {
      title: 'Total Onboarded Clinics',
      value: `${data.totalClinics} Clinics`,
      growth: '+12% this month',
      icon: <LocalHospitalOutlined />,
      color: '#83C5BE',
      bg: 'rgba(131, 197, 190, 0.12)',
      border: 'rgba(131, 197, 190, 0.3)',
    },
    {
      title: 'Platform Monthly Revenue',
      value: `₹${data.monthlyRevenue.toLocaleString('en-IN')}`,
      growth: '+18.4% MRR',
      icon: <AttachMoneyOutlined />,
      color: '#34D399',
      bg: 'rgba(52, 211, 153, 0.12)',
      border: 'rgba(52, 211, 153, 0.3)',
    },
    {
      title: 'Active Doctors Across Clinics',
      value: `${data.totalDoctors} Doctors`,
      growth: 'Active Panel',
      icon: <PeopleAltOutlined />,
      color: '#60A5FA',
      bg: 'rgba(96, 165, 250, 0.12)',
      border: 'rgba(96, 165, 250, 0.3)',
    },
    {
      title: 'Total Patient Visits Logged',
      value: data.totalPatients.toLocaleString('en-IN'),
      growth: '+24% OPD traffic',
      icon: <TrendingUpOutlined />,
      color: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.12)',
      border: 'rgba(251, 191, 36, 0.3)',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((item) => (
        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }} key={item.title}>
          <Paper
            elevation={0}
            sx={{
              p: 2.8,
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              transition: '0.3s',
              '&:hover': {
                borderColor: item.color,
                bgcolor: 'rgba(255, 255, 255, 0.07)',
                transform: 'translateY(-3px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1.2,
                  bgcolor: item.bg,
                  color: item.color,
                  borderRadius: '14px',
                  display: 'flex',
                  border: `1px solid ${item.border}`,
                }}
              >
                {item.icon}
              </Box>
              <Chip
                label={item.growth}
                size="small"
                sx={{ bgcolor: item.bg, color: item.color, fontWeight: 800, fontSize: '0.7rem' }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
              {item.title}
            </Typography>

            {loading ? (
              <Skeleton variant="text" width="60%" height={45} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 0.5 }} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>
                {item.value}
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}