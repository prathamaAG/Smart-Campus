import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, useTheme, Divider, List, ListItem, ListItemText, ListItemIcon, alpha } from '@mui/material';
import { Event, Assignment } from '@mui/icons-material';
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

    useEffect(() => {
        const fetchData = async () => {
            if (user?._id) {
                try {
                    const [lecturesRes, assignmentsRes] = await Promise.all([
                        api.get('/lectures'),
                        api.get(`/assignments/faculty/${user._id}`)
                    ]);
                    
                    const filteredLectures = lecturesRes.data
                        .filter(l => moment(l.start).isAfter(moment()))
                        .sort((a, b) => moment(a.start).diff(moment(b.start))) // Sort by upcoming
                        .slice(0, 5);

                    setUpcomingLectures(filteredLectures);
                    setPostedAssignments(assignmentsRes.data.slice(0, 5));
                } catch (error) {
                    console.error("Error fetching faculty-specific data", error);
                }
            }
        };
        fetchData();
    }, [user?._id]);

    const InfoCard = ({ title, data, icon, renderItem, bgColor }) => (
        <Paper sx={{ p: 3, borderRadius: '16px', height: '100%', bgcolor: bgColor || 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon}
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>{title}</Typography>
            </Box>
            <Divider />
            <List>
                {data.length > 0 ? data.map(renderItem) : <ListItem><ListItemText primary={`No ${title.toLowerCase()} found.`} /></ListItem>}
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
                            renderItem={(item) => (
                                <ListItem key={item._id}>
                                    <ListItemText 
                                        primary={`${item.subject.name} - ${item.title}`}
                                        secondary={`${moment(item.start).format('MMMM Do, h:mm a')} at ${item.venue || 'N/A'}`}
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
                            renderItem={(item) => (
                                <ListItem key={item._id}>
                                    <ListItemText 
                                        primary={`${item.subject.name} - ${item.title}`}
                                        secondary={`Due: ${moment(item.dueDate).format('MMMM Do, YYYY')}`}
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