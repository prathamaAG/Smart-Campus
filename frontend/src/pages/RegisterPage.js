import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, TextField, Button, Typography, Box, Alert, Grid, Link as MuiLink, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Student');
    const [semester, setSemester] = useState('');
    const [division, setDivision] = useState('');
    const [error, setError] = useState('');
    const { register, user } = useAuth();
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
        const userData = { name, email, password, role };
        if (role === 'Student') {
            if (!semester || !division) {
                setError('Semester and Division are required for students.');
                return;
            }
            userData.semester = semester;
            userData.division = division;
        }
        try {
            await register(userData);
        } catch (err) {
            setError('Failed to register. The email might already be in use.');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', py: 4 }}>
             <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Paper elevation={6} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                        Create an Account
                    </Typography>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField margin="normal" required fullWidth id="name" label="Full Name" name="name" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
                        <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel id="role-select-label">Role</InputLabel>
                            <Select labelId="role-select-label" id="role-select" value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                                <MenuItem value={'Student'}>Student</MenuItem>
                                <MenuItem value={'Faculty'}>Faculty</MenuItem>
                                <MenuItem value={'Admin'}>Admin</MenuItem>
                            </Select>
                        </FormControl>
                        {role === 'Student' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                <TextField margin="normal" required fullWidth name="semester" label="Semester" type="number" id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
                                <TextField margin="normal" required fullWidth name="division" label="Division" type="text" id="division" value={division} onChange={(e) => setDivision(e.target.value)} />
                            </motion.div>
                        )}
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid>
                                <MuiLink component={RouterLink} to="/login" variant="body2">
                                    Already have an account? Sign in
                                </MuiLink>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default RegisterPage;
