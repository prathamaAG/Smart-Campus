import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, List, ListItem, ListItemText, IconButton, useTheme } from '@mui/material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import Announcements from '../components/common/Announcements';

const StudentDashboard = ({ toggleTheme }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [schedule, setSchedule] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

    const fetchSchedule = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/lectures'); 
            setSchedule(data);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
    };

    const fetchAssignments = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/assignments');
            setAssignments(data);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchSchedule();
            fetchAssignments();
        }
    }, [user]);

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks(); // Refetch tasks to reflect the deletion
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4, px: { xs: 1, md: 4 }}}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Hello, {user?.name}</Typography>
                <Grid container spacing={3} sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }} alignItems="stretch">
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white', height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>Today's Schedule</Typography>
                            <Box sx={{ flexGrow: 1 }}>
                                {schedule.length > 0 ? schedule.map(item => (
                                    <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 2, borderLeft: `4px solid #fff`, bgcolor: 'primary.dark', color: 'white' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{item.subject.name}</Typography>
                                        <Typography variant="body2">{new Date(item.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(item.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | {item.faculty.name}</Typography>
                                    </Paper>
                                )) : <Typography>No lectures scheduled for today.</Typography>}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: 'secondary.main', color: 'white', height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>Assignments</Typography>
                            <Box sx={{ flexGrow: 1 }}>
                                {assignments.length > 0 ? assignments.map(item => (
                                    <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 2, borderLeft: `4px solid #fff`, bgcolor: 'secondary.dark', color: 'white' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                                        <Typography variant="body2">Due: {new Date(item.dueDate).toLocaleDateString()}</Typography>
                                    </Paper>
                                )) : <Typography>No assignments due.</Typography>}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid xs={12} md={6}>
                        <Announcements />
                    </Grid>
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'error.main', color: 'white', height: '100%', borderRadius: '16px' }}>
                            <Typography variant="h6" gutterBottom>Today's Tasks</Typography>
                            <List dense sx={{ flex: 1, overflow: 'auto' }}>
                                <AnimatePresence>
                                    {tasks.map((task) => (
                                        <motion.div key={task._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                            <ListItem
                                                secondaryAction={
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task._id)}>
                                                        <DeleteIcon sx={{ color: 'white' }} />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText primary={task.text} />
                                            </ListItem>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default StudentDashboard;