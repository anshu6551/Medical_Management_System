'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Rating,
  Avatar,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';
import { ThumbUpOutlined, ChatBubbleOutlineOutlined } from '@mui/icons-material';
import api from '@/lib/api/axios';

interface ReviewItem {
  id?: string | number;
  _id?: string | number;
  patientName: string;
  date: string;
  rating: number;
  comment: string;
}

export default function DoctorFeedbackPage() {
  const [loading, setLoading] = useState(true);

  // 1. LIVE STATE FOR TOP 3 CARDS
  const [overview, setOverview] = useState({
    overallRating: 4.8,
    verifiedVisits: 124,
    recommendationScore: '96%',
    totalReviews: 124,
  });

  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  // 2. FETCH LIVE FEEDBACK DATA
  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/feedback');

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;

        // TOP 3 CARDS DATA SET HO RAHA HAI
        setOverview({
          overallRating: data.overallRating ?? 4.8,
          verifiedVisits: data.totalReviews ?? (data.reviews?.length || 124),
          recommendationScore: data.recommendationScore ?? '96%',
          totalReviews: data.totalReviews ?? (data.reviews?.length || 0),
        });

        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to load feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', color: '#FFFFFF', py: 2, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            Ratings & Patient Feedback
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Detailed reviews and satisfaction feedback submitted by OPD patients.
          </Typography>
        </Box>

        {/* 3 TOP CARDS (AB DYNAMIC BINDING HAI) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Card 1: Overall Rating */}
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '16px', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                OVERALL RATING
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#FBBF24', my: 1 }}>
                {overview.overallRating}
              </Typography>
              <Rating value={Number(overview.overallRating) || 4.8} precision={0.1} readOnly size="medium" />
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1 }}>
                Based on {overview.verifiedVisits} verified visits
              </Typography>
            </Paper>
          </Grid>

          {/* Card 2: Recommendation Score */}
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '16px', textAlign: 'center' }}>
              <ThumbUpOutlined sx={{ fontSize: 32, color: '#4ADE80', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFF' }}>
                {overview.recommendationScore}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                Positive Recommendation Score
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3: Total Comments */}
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '16px', textAlign: 'center' }}>
              <ChatBubbleOutlineOutlined sx={{ fontSize: 32, color: '#83C5BE', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFF' }}>
                {overview.totalReviews}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                Total Patient Comments
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* All Patient Reviews List */}
        <Paper sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '20px', p: { xs: 2.5, sm: 3.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
            All Patient Reviews
          </Typography>
          <Divider sx={{ borderColor: '#334155', mb: 3 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: '#83C5BE' }} />
            </Box>
          ) : reviews.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>
              No reviews available yet.
            </Typography>
          ) : (
            <Stack spacing={2.5}>
              {reviews.map((rev) => (
                <Paper key={rev._id || rev.id} sx={{ p: 2.5, bgcolor: '#0F172A', border: '1px solid #334155', borderRadius: '14px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#006D77', fontWeight: 800 }}>
                        {rev.patientName ? rev.patientName.charAt(0).toUpperCase() : 'P'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFF', lineHeight: 1.2 }}>
                          {rev.patientName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {rev.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={rev.rating || 5} readOnly size="small" />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.5 }}>
                    "{rev.comment}"
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}