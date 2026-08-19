'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Stack, Chip, CircularProgress } from '@mui/material';
import { DownloadOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function RevenueReportsPage() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState({
    totalMrr: 0,
    growthPercentage: 18.4,
    proEarnings: 0,
    enterpriseEarnings: 0,
  });

  // 1. Live Revenue Stats API Call
  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(
          API_ENDPOINTS.SUPER_ADMIN.REVENUE_REPORTS || '/super-admin/revenue-reports'
        );
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setStats({
            totalMrr: data.totalMrr || 0,
            growthPercentage: data.growthPercentage || 18.4,
            proEarnings: data.proEarnings || 0,
            enterpriseEarnings: data.enterpriseEarnings || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch revenue stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueStats();
  }, []);

  // 2. Platform CSV Download Trigger Function
  const handleExportCSV = async () => {
    try {
      setDownloading(true);
      const endpoint = API_ENDPOINTS.SUPER_ADMIN.EXPORT_CSV || '/super-admin/export-csv';
      const response: any = await api.get(endpoint, {
        responseType: 'blob',
      });

      // Browser file download creation
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `platform-audit-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const reports = [
    {
      title: 'Monthly SaaS Revenue Statement',
      desc: 'Detailed breakdown of subscription fee collection across all clinic tiers.',
      date: 'August 2026',
    },
    {
      title: 'Clinic Onboarding & Conversion Log',
      desc: 'New clinic registrations, trial-to-paid plan conversion statistics.',
      date: 'August 2026',
    },
    {
      title: 'Platform Patient OPD Traffic Report',
      desc: 'Aggregated OPD consultation volume and clinic-wise appointment counts.',
      date: 'August 2026',
    },
  ];

  return (
    <Box sx={{ color: '#FFFFFF' }}>
      {/* Page Title & Main Export CTA */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            Platform Revenue & System Reports
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5, fontWeight: 500 }}>
            Export platform analytics, financial audit logs, and multi-tenant performance reports.
          </Typography>
        </Box>

        <Button
          variant="contained"
          disableElevation
          disabled={downloading}
          startIcon={downloading ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <DownloadOutlined />}
          onClick={handleExportCSV}
          sx={{
            bgcolor: '#006D77',
            '&:hover': { bgcolor: '#004D54' },
            fontWeight: 800,
            borderRadius: '12px',
            px: 3,
            py: 1.1,
            textTransform: 'none',
            fontSize: '0.88rem',
            boxShadow: '0 4px 14px rgba(0, 109, 119, 0.4)',
          }}
        >
          {downloading ? 'Downloading...' : 'Export Full Platform CSV'}
        </Button>
      </Box>

      {/* Dark Revenue Summary Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          bgcolor: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          mb: 4,
          backgroundImage: 'linear-gradient(135deg, rgba(0, 109, 119, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress sx={{ color: '#83C5BE' }} />
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" sx={{ color: '#83C5BE', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Gross Platform MRR
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>
                ₹{stats.totalMrr.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#34D399', mt: 1, fontWeight: 700 }}>
                +{stats.growthPercentage}% growth compared to last month
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="flex-end">
                <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', p: 2.5, borderRadius: '16px', minWidth: '180px' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Pro Tier Earnings</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFF', mt: 0.5 }}>₹{stats.proEarnings.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', p: 2.5, borderRadius: '16px', minWidth: '180px' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>Enterprise Earnings</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFF', mt: 0.5 }}>₹{stats.enterpriseEarnings.toLocaleString('en-IN')}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Dark Report Cards Grid */}
      <Grid container spacing={3}>
        {reports.map((rep) => (
          <Grid size={{ xs: 12, md: 4 }} key={rep.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Chip label={rep.date} size="small" sx={{ bgcolor: 'rgba(131, 197, 190, 0.15)', color: '#83C5BE', fontWeight: 800, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1 }}>
                  {rep.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6 }}>
                  {rep.desc}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                disabled={downloading}
                onClick={handleExportCSV}
                startIcon={<DownloadOutlined />}
                sx={{
                  borderColor: '#83C5BE',
                  color: '#83C5BE',
                  fontWeight: 800,
                  borderRadius: '12px',
                  textTransform: 'none',
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(131, 197, 190, 0.15)',
                    borderColor: '#83C5BE',
                  },
                }}
              >
                Download CSV Audit
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}