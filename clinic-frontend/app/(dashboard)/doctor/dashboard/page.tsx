'use client';
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Stack, Rating, Avatar, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import QueueTable, { QueueItem } from './components/QueueTable';
import PrescriptionModal from './components/PrescriptionModal';
import api from '@/lib/api/axios';

export default function DoctorDashboard() {
  const [openModal, setOpenModal] = useState(false);
  const [activePatient, setActivePatient] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    waitingInOPD: 0,
    completedVisits: 0,
    avgRating: 4.8,
  });

  const [queue, setQueue] = useState<QueueItem[]>([]);

  // 1. Fetch Doctor Dashboard Live Data (4 Cards + Queue)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/dashboard');
      if (res.data?.success && res.data?.data) {
        setStats(res.data.data.stats || {
          totalBookingsToday: 0,
          waitingInOPD: 0,
          completedVisits: 0,
          avgRating: 4.8,
        });

        // Format backend appointments to QueueItem format
        const formattedQueue = (res.data.data.queue || []).map((item: any) => ({
          id: item._id || item.id,
          tokenId: item.tokenId || 'APT-101',
          patientName: item.patientName || 'Patient',
          timeSlot: item.slotTime || item.timeSlot || '10:30 AM',
          type: item.visitType || item.type || 'General Checkup',
          status: item.status === 'COMPLETED' ? 'Completed' : item.status === 'IN_PROGRESS' ? 'In Progress' : 'Waiting',
        }));

        setQueue(formattedQueue);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. Action: Start Visit -> In Progress
  const handleStartVisit = async (id: string) => {
    try {
      // Optimistic UI update
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'In Progress' } : item))
      );
      // API sync
      await api.put(`/doctor/queue/${id}/status`, { status: 'IN_PROGRESS' });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // 3. Action: Complete Consultation -> Completed
  const handleCompleteConsultation = async (id: string) => {
    try {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'Completed' } : item))
      );
      await api.put(`/doctor/queue/${id}/status`, { status: 'COMPLETED' });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to complete consultation:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', py: 2, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            Doctor OPD Live Queue
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Manage ongoing patient consultations, write digital prescriptions, and track daily visit stats.
          </Typography>
        </Box>

        {/* 4 Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '16px' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                TOTAL BOOKINGS TODAY
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFF', mt: 1 }}>
                {stats.totalBookingsToday}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '16px' }}>
              <Typography variant="caption" sx={{ color: '#FBBF24', fontWeight: 600 }}>
                WAITING IN OPD
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FBBF24', mt: 1 }}>
                {stats.waitingInOPD}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '16px' }}>
              <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 600 }}>
                COMPLETED VISITS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#4ADE80', mt: 1 }}>
                {stats.completedVisits}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '16px' }}>
              <Typography variant="caption" sx={{ color: '#83C5BE', fontWeight: 600 }}>
                AVG PATIENT RATING
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#FBBF24' }}>
                  {stats.avgRating}
                </Typography>
                <Rating value={stats.avgRating || 4.8} precision={0.1} readOnly size="small" />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Live Queue & Patient Feedback Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8} size={{ xs: 12, sm: 8 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress sx={{ color: '#83C5BE' }} />
              </Box>
            ) : (
              <QueueTable
                queue={queue}
                onStartVisit={handleStartVisit}
                onOpenPrescription={(item) => {
                  setActivePatient(item);
                  setOpenModal(true);
                }}
              />
            )}
          </Grid>

          <Grid item xs={12} lg={4} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
                Recent Patient Feedback
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2.5 }}>
                Reviews submitted after OPD visits.
              </Typography>

              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: '#0F172A', border: '1px solid #334155', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#006D77', fontSize: '0.75rem' }}>A</Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFF' }}>
                        Amitav Ghosh
                      </Typography>
                    </Box>
                    <Rating value={5} readOnly size="small" />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block' }}>
                    "Dr. Roy diagnosed my fever accurately and explained the dosage clearly. Very polite!"
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: '#0F172A', border: '1px solid #334155', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#83C5BE', color: '#0F172A', fontSize: '0.75rem', fontWeight: 800 }}>
                        P
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFF' }}>
                        Priya Verma
                      </Typography>
                    </Box>
                    <Rating value={4} readOnly size="small" />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block' }}>
                    "Quick OPD queue management and instant e-prescription."
                  </Typography>
                </Paper>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Prescription Modal */}
        <PrescriptionModal
          open={openModal}
          patient={activePatient}
          onClose={() => {
            setOpenModal(false);
            setActivePatient(null);
          }}
          onCompleteConsultation={handleCompleteConsultation}
        />
      </Container>
    </Box>
  );
}