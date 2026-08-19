'use client';
import React from 'react';
import { Box, Typography, Container, Grid, Paper, Chip, Button } from '@mui/material';
import { ArrowForwardOutlined, CalendarTodayOutlined } from '@mui/icons-material';

export default function BlogSection() {
  const blogs = [
    {
      id: 1,
      category: 'Heart Care',
      title: '10 Simple Daily Habits to Keep Your Heart Healthy & Strong',
      desc: 'Discover practical lifestyle changes recommended by top cardiologists to maintain optimal cardiovascular health.',
      author: 'Dr. A. K. Roy',
      date: 'Aug 10, 2026',
      img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
      readTime: '5 min read',
    },
    {
      id: 2,
      category: 'Dermatology',
      title: 'Understanding Seasonal Skin Allergy: Prevention & Remedies',
      desc: 'Expert advice on protecting your skin from sudden weather changes, pollution, and seasonal allergies.',
      author: 'Dr. Sneha Das',
      date: 'Aug 08, 2026',
      img: 'https://images.unsplash.com/photo-1512290900676-26c2a48f4134?auto=format&fit=crop&w=600&q=80',
      readTime: '4 min read',
    },
    {
      id: 3,
      category: 'Pediatrics',
      title: 'Child Nutrition Essentials: What Every Parent Needs to Know',
      desc: 'A comprehensive guide on balanced diets, immunity boosters, and growth nutrients for young children.',
      author: 'Dr. Priya Sharma',
      date: 'Aug 05, 2026',
      img: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
      readTime: '6 min read',
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAFC' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Chip
              label="Health Insights  |  Articles & Tips →"
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
                border: '1px solid #C7D2FE',
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1E1B4B', letterSpacing: '-1px' }}>
              Latest Health Articles & Blogs
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}>
              Stay informed with medical tips and guides written by our expert doctors.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} size={{xs:12,sm:6,md:4}} key={blog.id}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '28px',
                  border: '1.5px solid #CBD5E1',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 10px 25px rgba(30, 27, 75, 0.04)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: '#4F46E5',
                    boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)',
                  },
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden', height: '210px' }}>
                  <Box
                    component="img"
                    src={blog.img}
                    alt={blog.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s', '&:hover': { transform: 'scale(1.05)' } }}
                  />
                  <Chip
                    label={blog.category}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: '#4F46E5',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      borderRadius: '50px',
                      px: 1,
                    }}
                  />
                </Box>

                <Box sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', mb: 1.5, fontSize: '0.8rem' }}>
                      <CalendarTodayOutlined sx={{ fontSize: 14, color: '#4F46E5' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {blog.date} • {blog.readTime}
                      </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1.5, lineHeight: 1.35, fontSize: '1.15rem' }}>
                      {blog.title}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 3 }}>
                      {blog.desc}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: '1.5px solid #F1F5F9' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E1B4B' }}>
                      By {blog.author}
                    </Typography>

                    <Button
                      size="small"
                      endIcon={<ArrowForwardOutlined sx={{ fontSize: 14 }} />}
                      sx={{ color: '#4F46E5', fontWeight: 800, textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent' } }}
                    >
                      Read Article
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}