import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider, List, ListItem, ListItemText, alpha, Button, Chip } from '@mui/material';
import { Event, Assignment, Refresh } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import moment from 'moment';
import Announcements from '../components/common/Announcements';

const FacultyDashboard = ({ toggleTheme }) => {
    const { user } = useAuth();
    const theme = useTheme();
    
    const [upcomingLectures, setUpcomingLectures] = useState([]);
    const [postedAssignments, setPostedAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUpcomingLectures = async () => {
        setLoading(true);
        try {
            const lecturesRes = await api.get('/lectures/faculty/upcoming');
            setUpcomingLectures(lecturesRes.data);
        } catch (error) {
            console.error("Error fetching upcoming lectures", error);
        }
        setLoading(false);
    };

    const fetchPostedAssignments = async () => {
        try {
            const assignmentsRes = await api.get('/assignments');
            const facultyAssignments = assignmentsRes.data
                .filter(assignment => assignment.faculty._id === user._id)
                .slice(0, 5);
            setPostedAssignments(facultyAssignments);
        } catch (error) {
            console.error("Error fetching posted assignments", error);
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchUpcomingLectures();
            fetchPostedAssignments();
        }
    }, [user?._id]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (user?._id) {
                fetchUpcomingLectures();
                fetchPostedAssignments();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user?._id]);

    const InfoCard = ({ title, data, icon, renderItem, bgColor, onRefresh }) => (
        <Paper sx={{ p: 3, borderRadius: '16px', height: '100%', bgcolor: bgColor || 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>{title}</Typography>
                </Box>
                {onRefresh && (
                    <Button 
                        size="small" 
                        onClick={onRefresh}
                        disabled={loading}
                        startIcon={<Refresh />}
                    >
                        Refresh
                    </Button>
                )}
            </Box>
            <Divider />
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {data.length > 0 ? data.map(renderItem) : (
                    <ListItem>
                        <ListItemText 
                            primary={`No ${title.toLowerCase()} found.`}
                            secondary="Data will appear here when available"
                        />
                    </ListItem>
                )}
            </List>
        </Paper>
    );

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Welcome, {user?.name}
                </Typography>
                <Grid container spacing={4}>
                    {/* Upcoming Lectures */}
                    <Grid xs={12} md={6} lg={4}>
                        <InfoCard
                            title="Upcoming Lectures"
                            icon={<Event color="primary" />}
                            data={upcomingLectures}
                            bgColor={alpha(theme.palette.primary.main, 0.1)}
                            onRefresh={fetchUpcomingLectures}
                            renderItem={(item) => (
                                <ListItem key={item._id}>
                                    <ListItemText 
                                        primary={
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {item.subject.name}
                                                </Typography>
                                                <Chip 
                                                    label={moment(item.start).fromNow()} 
                                                    size="small" 
                                                    color={moment(item.start).diff(moment(), 'hours') <= 2 ? 'error' : 'primary'}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {moment(item.start).format('MMMM Do, h:mm A')}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Venue: {item.venue || 'TBA'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            )}
                        />
                    </Grid>
                    {/* Posted Assignments */}
                    <Grid xs={12} md={6} lg={4}>
                        <InfoCard
                            title="Recently Posted Assignments"
                            icon={<Assignment color="secondary" />}
                            data={postedAssignments}
                            bgColor={alpha(theme.palette.secondary.main, 0.1)}
                            onRefresh={fetchPostedAssignments}
                            renderItem={(item) => (
                                <ListItem key={item._id}>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {item.subject?.name} - {item.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Due: {moment(item.dueDate).format('MMMM Do, YYYY')}
                                                </Typography>
                                                <Chip 
                                                    label={moment(item.dueDate).diff(moment(), 'days') <= 3 ? 'Due Soon' : 'Active'} 
                                                    size="small" 
                                                    color={moment(item.dueDate).diff(moment(), 'days') <= 3 ? 'warning' : 'success'}
                                                    sx={{ mt: 0.5 }}
                                                />
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            )}
                        />
                    </Grid>
                    {/* Announcements */}
                    <Grid xs={12} lg={4}>
                        <Announcements />
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default FacultyDashboard;