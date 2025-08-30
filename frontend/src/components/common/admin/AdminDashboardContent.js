import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Paper, Avatar } from '@mui/material';
import api from '../../api/api';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import moment from 'moment';
import UserSubjectManagement from './UserSubjectManagement';

const StatCard = ({ title, value, icon, color = 'primary.main' }) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', backgroundColor: 'background.paper' }}>
        <Box>
            <Typography color="text.secondary" gutterBottom>{title}</Typography>
            <Typography variant="h4" component="div">{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, color: '#fff', width: 56, height: 56 }}>
            {icon}
        </Avatar>
    </Paper>
);

const AdminDashboardContent = () => {
    const [stats, setStats] = useState({ students: 0, faculty: 0, lectures: 0, subjects: 0 });

    const fetchDashboardData = useCallback(async () => {
        try {
            const [usersRes, subjectsRes, lecturesRes] = await Promise.all([
                api.get('/users'),
                api.get('/subjects'),
                api.get('/lectures')
            ]);

            setStats({
                students: usersRes.data.filter(u => u.role === 'Student').length,
                faculty: usersRes.data.filter(u => u.role === 'Faculty').length,
                lectures: lecturesRes.data.filter(l => moment(l.start).isSame(moment(), 'day')).length,
                subjects: subjectsRes.data.length
            });
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'background.default', color: 'text.primary' }}>
            <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6} md={3}><StatCard title="Total Students" value={stats.students} icon={<PeopleIcon />} color="info.main" /></Grid>
                <Grid xs={12} sm={6} md={3}><StatCard title="Total Faculty" value={stats.faculty} icon={<SchoolIcon />} color="success.main" /></Grid>
                <Grid xs={12} sm={6} md={3}><StatCard title="Lectures Today" value={stats.lectures} icon={<EventAvailableIcon />} color="warning.main" /></Grid>
                <Grid xs={12} sm={6} md={3}><StatCard title="Subjects" value={stats.subjects} icon={<MenuBookIcon />} color="error.main" /></Grid>
            </Grid>
            
            <UserSubjectManagement onUpdate={fetchDashboardData} />
        </Box>
    );
};

export default AdminDashboardContent;