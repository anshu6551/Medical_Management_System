'use client';
import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Avatar, Rating, Chip, Button, CircularProgress } from '@mui/material';
import { CalendarMonthOutlined, VerifiedOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';

interface FeaturedDoctorsProps {
  onSelectDoctor: (doc: any) => void;
}

export default function FeaturedDoctors({ onSelectDoctor }: FeaturedDoctorsProps) {
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Live Top Doctors from Backend
  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/patient/doctors');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const formatted = res.data.data.slice(0, 3).map((doc: any) => ({
            id: doc._id,
            _id: doc._id,
            clinicId: doc.clinicId,
            name: doc.name,
            specialty: doc.specialization,
            clinic: doc.clinicName,
            rating: doc.rating || 4.8,
            experience: `${doc.experienceYears || 5} Yrs`,
            fee: `₹${doc.consultationFee || 500}`,
            consultationFee: doc.consultationFee || 500,
            img: doc.profileImage || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
          }));
          setTopDoctors(formatted);
        }
      } catch (err) {
        console.error('Failed to load featured doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDoctors();
  }, []);

  return (
    <Box sx={{ mb: 8, pt: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'left' }}>
        <Chip
          label="Top Recommendations  |  Verified Specialists →"
          size="small"
          sx={{
            bgcolor: '#EEF2FF',
            color: '#4F46E5',
            fontWeight: 800,
            fontSize: '0.8rem',
            px: 1.5,
            py: 1.8,
            mb: 1.5,
            borderRadius: '50px',
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1E1B4B', letterSpacing: '-1px' }}>
          Our Best & Top Rated Doctors
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5, fontSize: '1rem', fontWeight: 500 }}>
          Most recommended medical specialists based on verified patient ratings.
        </Typography>
      </Box>

      {/* Grid Cards Container */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#4F46E5' }} />
        </Box>
      ) : topDoctors.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#64748B', py: 4 }}>
          No featured doctors available currently.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3.5,
            justifyContent: 'flex-start',
          }}
        >
          {topDoctors.map((doc) => (
            <Paper
              key={doc.id || doc._id}
              elevation={0}
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' },
                maxWidth: { md: '380px' },
                p: 3,
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '28px',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 30px rgba(79, 70, 229, 0.04)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  borderColor: '#C7D2FE',
                  boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)',
                },
              }}
            >
              {/* Avatar with Ring */}
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={doc.img}
                  sx={{
                    width: 90,
                    height: 90,
                    mx: 'auto',
                    border: '3px solid #EEF2FF',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.12)',
                  }}
                />
                <VerifiedOutlined
                  sx={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    color: '#4F46E5',
                    bgcolor: '#FFFFFF',
                    borderRadius: '50%',
                    fontSize: 20,
                  }}
                />
              </Box>

              {/* Name & Specialty */}
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 0.5 }}>
                {doc.name}
              </Typography>

              <Chip
                label={doc.specialty}
                size="small"
                sx={{
                  bgcolor: '#EEF2FF',
                  color: '#4F46E5',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  mb: 1,
                  px: 1,
                }}
              />

              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600, mb: 1.5 }}>
                {doc.clinic} • {doc.experience} Exp
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8, mb: 3 }}>
                <Rating value={doc.rating} precision={0.1} readOnly size="small" />
                <Typography variant="caption" sx={{ color: '#1E1B4B', fontWeight: 800, fontSize: '0.85rem' }}>
                  {doc.rating}
                </Typography>
              </Box>

              {/* Action Bottom Section */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 2,
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem' }}>
                    Consult Fee
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#4F46E5', lineHeight: 1 }}>
                    {doc.fee}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  disableElevation
                  size="small"
                  onClick={() => onSelectDoctor(doc)}
                  startIcon={<CalendarMonthOutlined fontSize="small" />}
                  sx={{
                    bgcolor: '#4F46E5',
                    '&:hover': { bgcolor: '#4338CA' },
                    fontWeight: 800,
                    borderRadius: '50px',
                    px: 2.5,
                    py: 0.9,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    mt: '30px',
                  }}
                >
                  Book Slot
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}