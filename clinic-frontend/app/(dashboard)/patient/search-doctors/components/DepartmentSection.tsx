'use client';
import React from 'react';
import { Box, Typography, Chip, Container, Paper, Button } from '@mui/material';
import { ArrowForwardOutlined } from '@mui/icons-material';
import Link from 'next/link';

export default function DepartmentSection() {
  const departments = [
    {
      title: 'Dermatology',
      desc: 'Specializing in the diagnosis and treatment of skin conditions.',
      img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Orthopedics',
      desc: 'Expert care for bones, joints, ligaments, and tendons.',
      img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Cardiology',
      desc: 'Specializing in the diagnosis and treatment of heart conditions.',
      img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Pediatrics',
      desc: 'Comprehensive medical care for infants, children, and teens.',
      img: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <Box
      sx={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        py: { xs: 6, md: 10 },
        bgcolor: '#F5F3FF',
        backgroundImage: `url('https://html.vikinglab.agency/medicax/assets/img/all-images/bg/bg3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="MediPulse | Departments →"
            size="small"
            sx={{
              bgcolor: '#FFFFFF',
              color: '#4F46E5',
              fontWeight: 800,
              px: 1.5,
              py: 2,
              mb: 2,
              borderRadius: '50px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#1E1B4B',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Our specialized departments
            <br /> work together seamlessly
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
          }}
        >
          {departments.map((dept) => (
            <Paper
              key={dept.title}
              elevation={0}
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
                maxWidth: { md: '300px' },
                bgcolor: '#FFFFFF',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #E0E7FF',
                transition: '0.3s',
                '&:hover': {
                  boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box
                component="img"
                src={dept.img}
                alt={dept.title}
                sx={{ width: '100%', height: '170px', objectFit: 'cover' }}
              />
              <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1B4B', mb: 1 }}>
                    {dept.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 2, lineHeight: 1.6 }}>
                    {dept.desc}
                  </Typography>
                </Box>

                {/* Direct Link to Specialty in Search Page */}
                <Button
                  component={Link}
                  href={`/patient/search-doctors/all?specialty=${encodeURIComponent(dept.title)}`}
                  variant="text"
                  endIcon={<ArrowForwardOutlined sx={{ fontSize: 16 }} />}
                  sx={{
                    color: '#4F46E5',
                    fontWeight: 800,
                    p: 0,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'transparent' },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}