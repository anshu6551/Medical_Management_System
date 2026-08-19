'use client';
import React from 'react';
import { Box, Typography, Button, Chip, Container } from '@mui/material';
import { ArrowForwardOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function HeroBanner() {


  const router = useRouter();
  
  const handleClick = ()=>{
    router.push("/patient/search-doctors/all");
  }

  return (
    <Box
      sx={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        backgroundImage: `url('https://html.vikinglab.agency/medicax/assets/img/all-images/bg/bg3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        pt: { xs: 4, md: 20 },
        pb: { xs: 8, md: 10 },
        mb: 6,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1350px', px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
          }}
        >
          {/* Left Typography Content */}
          <Box sx={{ flex: 1, maxWidth: { md: '620px' } }}>
            <Chip
              label="What's new • MediPulse ISO 9001 Certified →"
              size="small"
              sx={{
                bgcolor: '#FFFFFF',
                color: '#4F46E5',
                fontWeight: 800,
                fontSize: '0.85rem',
                py: 2,
                px: 1,
                mb: 3,
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.08)',
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                color: '#1E1B4B',
                letterSpacing: '-2px',
                mb: 2.5,
                fontSize: { xs: '2.5rem', md: '4rem' },
                lineHeight: 1.1,
              }}
            >
              Your Health Comes First, Every Time to us.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#475569',
                mb: 4,
                maxWidth: '520px',
                fontSize: '1.15rem',
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Welcome to MediPulse Medical Clinic, where we are dedicated to revolutionizing the way you experience healthcare.
            </Typography>

            <Button
              variant="contained"
              disableElevation
              endIcon={
                <Box sx={{ p: 0.5, bgcolor: '#FFF', borderRadius: '50%', color: '#4F46E5', display: 'flex' }}>
                  <ArrowForwardOutlined sx={{ fontSize: 14 }} />
                </Box>
              }
              onClick={handleClick}
              sx={{
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
                borderRadius: '50px',
                px: 4,
                py: 1.6,
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)',
              }}
            >
              Find OPD Doctor
            </Button>
          </Box>

          {/* Right Doctor Card Image */}
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: '100%', md: '460px' },
              height: { xs: '380px', md: '500px' },
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="MediPulse Doctor"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.2)',
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}