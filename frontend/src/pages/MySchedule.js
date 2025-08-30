import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider } from '@mui/material';
import Layout from '../components/common/Layout';
import api from '../api/api';
import moment from 'moment';

const MySchedule = ({ toggleTheme }) => {
    const [schedule, setSchedule] = useState([]);
    const theme = useTheme();

    const fetchSchedule = async () => {
        try {
            const { data } = await api.get('/lectures/student'); 
            setSchedule(data);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const today = moment().startOf('day');
    const oneWeekAgo = moment().subtract(7, 'days').startOf('day');

    const todayLectures = schedule
        .filter(item => moment(item.start).isSame(today, 'day'))
        .sort((a, b) => new Date(a.start) - new Date(b.start));

    const lastWeekLectures = schedule
        .filter(item => {
            const itemDate = moment(item.start);
            return itemDate.isBefore(today) && itemDate.isAfter(oneWeekAgo);
        })
        .sort((a, b) => new Date(b.start) - new Date(a.start));

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4, px: { xs: 1, md: 4 }}}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>My Schedule</Typography>
                
                <Grid container spacing={3} alignItems="stretch">
                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Today's Lectures</Typography>
                            <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {todayLectures.length > 0 ? todayLectures.map(item => (
                                    <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 2, borderLeft: `4px solid #fff`, bgcolor: 'primary.dark', color: 'white' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{item.subject.name}</Typography>
                                        <Typography variant="body2">{moment(item.start).format('dddd, MMMM Do YYYY')}</Typography>
                                        <Typography variant="body2">{moment(item.start).format('h:mm A')} - {moment(item.end).format('h:mm A')} | {item.faculty.name}</Typography>
                                    </Paper>
                                )) : <Typography>No lectures scheduled for today.</Typography>}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3, bgcolor: 'secondary.main', color: 'white', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Last Week's Lectures</Typography>
                            <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {lastWeekLectures.length > 0 ? lastWeekLectures.map(item => (
                                    <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 2, borderLeft: `4px solid #fff`, bgcolor: 'secondary.dark', color: 'white' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{item.subject.name}</Typography>
                                        <Typography variant="body2">{moment(item.start).format('dddd, MMMM Do YYYY')}</Typography>
                                        <Typography variant="body2">{moment(item.start).format('h:mm A')} - {moment(item.end).format('h:mm A')} | {item.faculty.name}</Typography>
                                    </Paper>
                                )) : <Typography>No lectures from the past week.</Typography>}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default MySchedule;
