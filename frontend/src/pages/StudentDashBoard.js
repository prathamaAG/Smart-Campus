import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, List, ListItem, ListItemText, IconButton, useTheme, Chip, Divider, Select, MenuItem, FormControl } from '@mui/material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import Announcements from '../components/common/Announcements';
import moment from 'moment';

const StudentDashboard = ({ toggleTheme }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [schedule, setSchedule] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(false);

    // Use useCallback to prevent unnecessary re-renders
    const fetchTasks = useCallback(async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    }, []);

    const fetchSchedule = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            console.log('Fetching schedule for student:', {
                name: user.name,
                semester: user.semester
            });
            
            const { data } = await api.get('/lectures/student'); 
            console.log(`Received ${data.length} lectures for student`);
            setSchedule(data);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
        setLoading(false);
    }, [user]);

    const fetchAssignments = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/assignments');
            console.log(`Fetched ${data.length} assignments for student`);
            
            const upcomingAssignments = data
                .filter(assignment => moment(assignment.dueDate).isAfter(moment()))
                .sort((a, b) => moment(a.dueDate).diff(moment(b.dueDate)))
                .slice(0, 5);
            setAssignments(upcomingAssignments);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        }
    }, [user]);

    // Initial data fetch
    useEffect(() => {
        if (user) {
            console.log('Student user loaded:', {
                id: user._id,
                name: user.name,
                semester: user.semester
            });
            fetchTasks();
            fetchSchedule();
            fetchAssignments();
        }
    }, [user, fetchTasks, fetchSchedule, fetchAssignments]);

    // Auto-refresh schedule and assignments every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (user) {
                fetchSchedule();
                fetchAssignments();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user, fetchSchedule, fetchAssignments]);

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.trim()) return;
        try {
            await api.post('/tasks', { text: newTask });
            setNewTask('');
            fetchTasks();
        } catch (error) {
            console.error("Failed to add task", error);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task status", error);
        }
    };

    const handleRefresh = () => {
        console.log('Manual refresh clicked');
        fetchSchedule();
        fetchAssignments();
        fetchTasks();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'To Do':
                return 'error';
            case 'In Progress':
                return 'warning';
            case 'Done':
                return 'success';
            default:
                return 'default';
        }
    };

    // Get today's lectures - ensure we're filtering correctly
    const todayLectures = schedule
        .filter(item => {
            const lectureDate = moment(item.start);
            const today = moment();
            return lectureDate.isSame(today, 'day');
        })
        .sort((a, b) => moment(a.start).diff(moment(b.start)));

    // Get upcoming lectures (next 3 days)
    const upcomingLectures = schedule
        .filter(item => {
            const lectureDate = moment(item.start);
            const now = moment();
            const threeDaysFromNow = moment().add(3, 'days');
            return lectureDate.isAfter(now) && lectureDate.isBefore(threeDaysFromNow);
        })
        .sort((a, b) => moment(a.start).diff(moment(b.start)))
        .slice(0, 5);

    console.log('Dashboard render - Today lectures:', todayLectures.length, 'Total schedule:', schedule.length);

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4, px: { xs: 1, md: 4 }}}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            Hello, {user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Semester {user?.semester} • {moment().format('dddd, MMMM Do YYYY')}
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </Box>
                
                <Grid container spacing={3} sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }} alignItems="stretch">
                    {/* Today's Schedule */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white', height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Today's Schedule</Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip 
                                        label={`${todayLectures.length} lectures`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ color: 'white', borderColor: 'white' }}
                                        onClick={() => navigate('/student/schedule')}
                                    >
                                        View Full Schedule
                                    </Button>
                                </Box>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {todayLectures.length > 0 ? todayLectures.map(item => (
                                    <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 2, borderLeft: `4px solid #fff`, bgcolor: 'primary.dark', color: 'white' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">{item.subject?.name}</Typography>
                                            <Chip 
                                                label={item.subject?.code}
                                                size="small"
                                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                            />
                                        </Box>
                                        <Typography variant="body2">
                                            {moment(item.start).format('h:mm A')} - {moment(item.end).format('h:mm A')}
                                        </Typography>
                                        <Typography variant="body2">
                                            Faculty: {item.faculty?.name} | Venue: {item.venue || 'TBA'}
                                        </Typography>
                                        <Chip 
                                            label={moment(item.start).fromNow()}
                                            size="small"
                                            sx={{ 
                                                mt: 1,
                                                bgcolor: moment(item.start).diff(moment(), 'minutes') <= 30 ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,0,0.3)',
                                                color: 'white'
                                            }}
                                        />
                                    </Paper>
                                )) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography>No lectures scheduled for today.</Typography>
                                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                                            {schedule.length === 0 ? 'No lectures found for your semester.' : 'Check your full schedule for upcoming lectures.'}
                                        </Typography>
                                        {loading && (
                                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                                                Loading schedule...
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Upcoming Assignments */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: 'secondary.main', color: 'white', height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Assignments</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label={`${assignments.length} pending`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ color: 'white', borderColor: 'white' }}
                                        onClick={() => navigate('/student/assignments')}
                                    >
                                        View All
                                    </Button>
                                </Box>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {assignments.length > 0 ? assignments.map(item => (
                                    <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 2, borderLeft: `4px solid #fff`, bgcolor: 'secondary.dark', color: 'white' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                                                <Typography variant="body2">Subject: {item.subject?.name}</Typography>
                                                <Typography variant="body2">
                                                    Due: {moment(item.dueDate).format('MMM Do, YYYY [at] h:mm A')}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={item.assignmentType === 'text' ? 'Text' : 'File'}
                                                size="small"
                                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                            />
                                        </Box>
                                        <Chip 
                                            label={moment(item.dueDate).fromNow()}
                                            size="small"
                                            sx={{ 
                                                mt: 1,
                                                bgcolor: moment(item.dueDate).diff(moment(), 'days') <= 2 ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,0,0.3)',
                                                color: 'white'
                                            }}
                                        />
                                    </Paper>
                                )) : <Typography>No pending assignments.</Typography>}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Announcements */}
                    <Grid xs={12} md={6}>
                        <Announcements />
                    </Grid>

                    {/* Enhanced Tasks Manager with Status */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'error.main', color: 'white', height: '100%', borderRadius: '16px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Today's Tasks</Typography>
                                <Button 
                                    size="small" 
                                    variant="outlined"
                                    startIcon={<TaskAltIcon />}
                                    sx={{ color: 'white', borderColor: 'white' }}
                                    onClick={() => navigate('/student/tasks')}
                                >
                                    Manage Tasks
                                </Button>
                            </Box>
                            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                            
                            {/* Add Task Input */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Add a new task..."
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                    sx={{ 
                                        input: { color: 'white' },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                            '&.Mui-focused fieldset': { borderColor: 'white' }
                                        }
                                    }}
                                />
                                <IconButton onClick={handleAddTask} sx={{ color: 'white' }}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            
                            <List dense sx={{ flex: 1, overflow: 'auto' }}>
                                <AnimatePresence>
                                    {tasks.slice(0, 5).map((task) => (
                                        <motion.div 
                                            key={task._id} 
                                            initial={{ opacity: 0, x: -20 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            exit={{ opacity: 0, x: 20 }}
                                        >
                                            <Paper sx={{ p: 2, mb: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="body2" sx={{ color: 'white', flex: 1, mr: 1 }}>
                                                        {task.text}
                                                    </Typography>
                                                    <IconButton 
                                                        edge="end" 
                                                        size="small"
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        sx={{ color: 'white', p: 0.5 }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                                        <Select
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                            sx={{ 
                                                                color: 'white',
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: 'rgba(255,255,255,0.3)'
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: 'rgba(255,255,255,0.5)'
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: 'white'
                                                                },
                                                                '& .MuiSvgIcon-root': {
                                                                    color: 'white'
                                                                }
                                                            }}
                                                        >
                                                            <MenuItem value="To Do">To Do</MenuItem>
                                                            <MenuItem value="In Progress">In Progress</MenuItem>
                                                            <MenuItem value="Done">Done</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    <Chip 
                                                        label={task.status}
                                                        size="small"
                                                        color={getStatusColor(task.status)}
                                                        sx={{ 
                                                            ml: 1,
                                                            bgcolor: `${theme.palette[getStatusColor(task.status)].main}`,
                                                            color: 'white'
                                                        }}
                                                    />
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {tasks.length === 0 && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="No tasks for today. Add one above!" 
                                            sx={{ color: 'white' }}
                                        />
                                    </ListItem>
                                )}
                                {tasks.length > 5 && (
                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Button 
                                            variant="text"
                                            sx={{ color: 'white' }}
                                            onClick={() => navigate('/student/tasks')}
                                        >
                                            View {tasks.length - 5} more tasks
                                        </Button>
                                    </Box>
                                )}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default StudentDashboard;