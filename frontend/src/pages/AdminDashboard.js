import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar } from '@mui/material';
import Layout from '../components/common/Layout';
import api from '../api/api';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CampaignIcon from '@mui/icons-material/Campaign';
import moment from 'moment';

const StatCard = ({ title, value, icon, color = 'primary', to }) => (
    <Paper 
        component={Link}
        to={to}
        sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            borderRadius: '12px',
            color: (theme) => theme.palette[color]?.contrastText || 'white',
            backgroundColor: (theme) => theme.palette[color]?.main || color,
            height: '120px',
            textDecoration: 'none',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'scale(1.05)'
            }
        }}
    >
        <Box>
            <Typography variant="body1">{title}</Typography>
            <Typography variant="h4" sx={{fontWeight: 'bold'}}>{value}</Typography>
        </Box>
        <Avatar sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
            {icon}
        </Avatar>
    </Paper>
);

const AdminDashboard = ({ toggleTheme }) => {
    const [stats, setStats] = useState({ students: 0, faculty: 0, lectures: 0, subjects: 0, announcements: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    const [pendingFacultyCount, setPendingFacultyCount] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [usersRes, subjectsRes, lecturesRes, activitiesRes, announcementsRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/subjects'),
                    api.get('/lectures'),
                    api.get('/activities'),
                    api.get('/announcements')
                ]);

                const allUsers = usersRes.data;
                const allSubjects = subjectsRes.data;
                const allLectures = lecturesRes.data;
                const allActivities = activitiesRes.data;
                const allAnnouncements = announcementsRes.data;

                const pendingFaculty = allUsers.filter(u => u.role === 'Faculty' && u.status === 'pending');
                setPendingFacultyCount(pendingFaculty.length);

                setStats({
                    students: allUsers.filter(u => u.role === 'Student').length,
                    faculty: allUsers.filter(u => u.role === 'Faculty').length,
                    lectures: allLectures.filter(l => moment(l.start).isAfter(moment().startOf('day')) && moment(l.start).isBefore(moment().endOf('day'))).length,
                    subjects: allSubjects.length,
                    announcements: allAnnouncements.length
                });
                
                setRecentUsers(allUsers.slice(-5).reverse());

                const formattedActivities = allActivities.slice(-7).reverse().map(activity => {
                    let icon;
                    let color;
                    switch (activity.type) {
                        case 'user_registered':
                            icon = <PeopleIcon />;
                            color = 'info.main';
                            break;
                        case 'faculty_approved':
                            icon = <SchoolIcon />;
                            color = 'success.main';
                            break;
                        case 'lecture_scheduled':
                            icon = <EventAvailableIcon />;
                            color = 'warning.main';
                            break;
                        default:
                            icon = <MenuBookIcon />;
                            color = 'secondary.main';
                    }
                    return {
                        ...activity,
                        time: moment(activity.timestamp).fromNow(),
                        icon,
                        color
                    };
                });
                setActivityFeed(formattedActivities);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <Layout>
            <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', minHeight: 'calc(100vh - 64px)' }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Admin Dashboard</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Pending Faculty Requests" value={pendingFacultyCount} icon={<PendingActionsIcon />} color="warning" to="/admin/faculty-requests" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Total Students" value={stats.students} icon={<PeopleIcon />} color="info" to="/admin/users" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Total Faculty" value={stats.faculty} icon={<SchoolIcon />} color="success" to="/admin/users" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Announcements" value={stats.announcements} icon={<CampaignIcon />} color="secondary" to="/admin/announcements" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Total Subjects" value={stats.subjects} icon={<MenuBookIcon />} color="error" to="/admin/subjects" />
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.paper', color: 'text.primary', height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent User Registrations</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'text.secondary', border: 0 }}>Name</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', border: 0 }}>Role</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', border: 0 }}>Date Joined</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentUsers.map((user) => (
                                            <TableRow key={user._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ color: 'text.primary', border: 0 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{user.name.charAt(0)}</Avatar>
                                                        {user.name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ border: 0 }}>
                                                    <Chip 
                                                        label={user.role} 
                                                        size="small" 
                                                        color={user.role === 'Student' ? 'info' : user.role === 'Admin' ? 'error' : 'success'}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.primary', border: 0 }}>{moment(user.createdAt).format('DD MMM YYYY')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.paper', color: 'text.primary', height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Activity Feed</Typography>
                            <Box>
                                {activityFeed.length > 0 ? activityFeed.map((activity) => (
                                    <Box key={activity._id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: activity.color, width: 32, height: 32, mr: 2 }}>{activity.icon}</Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'text.primary' }}>{activity.description}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{activity.time}</Typography>
                                        </Box>
                                    </Box>
                                )) : (
                                    <Typography sx={{ color: 'text.secondary' }}>No recent activities</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default AdminDashboard;