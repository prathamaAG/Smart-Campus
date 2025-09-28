import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, TextField, Button, Typography, Box, Alert, Grid, Link as MuiLink, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/auth.css';
import charusat2Background from '../assets/images/backgrounds/charusat2.jpg'; // Import charusat2 for login

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const path = user.role.toLowerCase();
            navigate(`/${path}`);
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${charusat2Background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                p: 2
            }}
        >
            <Container component="main" maxWidth="xs">
                <motion.div 
                    initial={{ opacity: 0, y: -30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8 }}
                >
                    <Paper 
                        elevation={24} 
                        sx={{ 
                            padding: 4, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            borderRadius: 3,
                            backdropFilter: 'blur(15px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Typography 
                                component="h1" 
                                variant="h3" 
                                sx={{ 
                                    mb: 1,
                                    background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}
                            >
                                Smart Campus
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 2,
                                    color: 'text.secondary',
                                    textAlign: 'center',
                                    fontWeight: 'medium'
                                }}
                            >
                                CHARUSAT University
                            </Typography>
                        </motion.div>
                        
                        <Typography 
                            component="h2" 
                            variant="h5" 
                            sx={{ 
                                mb: 3,
                                color: 'text.primary',
                                fontWeight: 'medium'
                            }}
                        >
                            Welcome Back!
                        </Typography>
                        
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                        
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    id="email" 
                                    label="Email Address" 
                                    name="email" 
                                    autoComplete="email" 
                                    autoFocus 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                        }
                                    }}
                                />
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    name="password" 
                                    label="Password" 
                                    type="password" 
                                    id="password" 
                                    autoComplete="current-password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                        }
                                    }}
                                />
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <Button 
                                    type="submit" 
                                    fullWidth 
                                    variant="contained" 
                                    sx={{ 
                                        mt: 3, 
                                        mb: 2, 
                                        py: 1.5,
                                        borderRadius: 2,
                                        background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                                        boxShadow: '0 8px 32px 0 rgba(33, 150, 243, 0.37)',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #1976d2, #1cb5e0)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 40px 0 rgba(33, 150, 243, 0.5)',
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Sign In
                                </Button>
                            </motion.div>
                            
                            <Grid container justifyContent="center">
                                <Grid item>
                                    <MuiLink 
                                        component={RouterLink} 
                                        to="/register" 
                                        variant="body2"
                                        sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            fontWeight: 'medium',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        {"Don't have an account? Sign Up"}
                                    </MuiLink>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LoginPage;