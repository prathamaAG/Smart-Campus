import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider, Button, Chip } from '@mui/material';
import { Refresh, Schedule as ScheduleIcon } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import moment from 'moment';

const MySchedule = ({ toggleTheme }) => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            console.log('MySchedule - Fetching schedule for user:', user?.name);
            const { data } = await api.get('/lectures/student'); 
            console.log('MySchedule - Received schedule:', data.length, 'lectures');
            setSchedule(data);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSchedule();
        }
    }, [user, fetchSchedule]);

    // Auto-refresh every minute
    useEffect(() => {
        const interval = setInterval(() => {
            if (user) {
                fetchSchedule();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [user, fetchSchedule]);

    const today = moment().startOf('day');
    const oneWeekAgo = moment().subtract(7, 'days').startOf('day');
    const nextWeek = moment().add(7, 'days').endOf('day');

    const todayLectures = schedule
        .filter(item => moment(item.start).isSame(today, 'day'))
        .sort((a, b) => new Date(a.start) - new Date(b.start));

    const lastWeekLectures = schedule
        .filter(item => {
            const itemDate = moment(item.start);
            return itemDate.isBefore(today) && itemDate.isAfter(oneWeekAgo);
        })
        .sort((a, b) => new Date(b.start) - new Date(a.start))
        .slice(0, 10);

    const upcomingLectures = schedule
        .filter(item => {
            const itemDate = moment(item.start);
            return itemDate.isAfter(today) && itemDate.isBefore(nextWeek);
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 10);

    const LectureCard = ({ lecture, showDate = false }) => (
        <Paper 
            key={lecture._id} 
            variant="outlined" 
            sx={{ 
                p: 2, 
                mb: 2, 
                borderLeft: `4px solid #fff`, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(4px)' }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {lecture.subject?.name}
                </Typography>
                <Chip 
                    label={lecture.subject?.code || 'N/A'}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
            </Box>
            {showDate && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                    {moment(lecture.start).format('dddd, MMMM Do YYYY')}
                </Typography>
            )}
            <Typography variant="body2">
                {moment(lecture.start).format('h:mm A')} - {moment(lecture.end).format('h:mm A')}
            </Typography>
            <Typography variant="body2">
                Faculty: {lecture.faculty?.name} | Venue: {lecture.venue || 'TBA'}
            </Typography>
            {showDate && (
                <Chip 
                    label={moment(lecture.start).fromNow()}
                    size="small"
                    sx={{ 
                        mt: 1,
                        bgcolor: moment(lecture.start).diff(moment(), 'hours') <= 2 ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,0,0.3)',
                        color: 'white'
                    }}
                />
            )}
        </Paper>
    );

    console.log('MySchedule render - Today:', todayLectures.length, 'Upcoming:', upcomingLectures.length, 'Past week:', lastWeekLectures.length);

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4, px: { xs: 1, md: 4 }}}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            My Schedule
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Semester {user?.semester} • {moment().format('dddd, MMMM Do YYYY')}
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchSchedule}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </Box>
                
                <Grid container spacing={3} alignItems="stretch">
                    {/* Today's Lectures */}
                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Today's Lectures</Typography>
                                <Chip 
                                    label={`${todayLectures.length} lectures`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                />
                            </Box>
                            <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {todayLectures.length > 0 ? 
                                    todayLectures.map(lecture => <LectureCard key={lecture._id} lecture={lecture} />) :
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography>No lectures scheduled for today.</Typography>
                                        {loading && (
                                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                                                Loading...
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Upcoming Lectures */}
                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 3, bgcolor: 'success.main', color: 'white', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Upcoming This Week</Typography>
                                <Chip 
                                    label={`${upcomingLectures.length} lectures`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                />
                            </Box>
                            <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {upcomingLectures.length > 0 ? 
                                    upcomingLectures.map(lecture => <LectureCard key={lecture._id} lecture={lecture} showDate={true} />) :
                                    <Typography>No upcoming lectures this week.</Typography>
                                }
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Last Week's Lectures */}
                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 3, bgcolor: 'secondary.main', color: 'white', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Past Week</Typography>
                                <Chip 
                                    label={`${lastWeekLectures.length} lectures`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                />
                            </Box>
                            <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {lastWeekLectures.length > 0 ? 
                                    lastWeekLectures.map(lecture => <LectureCard key={lecture._id} lecture={lecture} showDate={true} />) :
                                    <Typography>No lectures from the past week.</Typography>
                                }
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default MySchedule;
