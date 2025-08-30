import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, List, ListItem, ListItemText, IconButton, useTheme, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import Layout from '../components/common/Layout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';

const TaskManager = ({ toggleTheme }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const theme = useTheme();

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async () => {
        if (newTask.trim()) {
            try {
                await api.post('/tasks', { text: newTask.trim() });
                setNewTask('');
                fetchTasks();
            } catch (error) {
                console.error("Failed to add task", error);
            }
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(`/tasks/${id}`, { status });
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task status", error);
        }
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

    const columns = {
        'To Do': tasks.filter(t => t.status === 'To Do'),
        'In Progress': tasks.filter(t => t.status === 'In Progress'),
        'Done': tasks.filter(t => t.status === 'Done'),
    };

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4, px: { xs: 1, md: 4 }}}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>Task Manager</Typography>
                
                <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: '16px' }}>
                    <Typography variant="h6" gutterBottom>Add New Task</Typography>
                    <Box sx={{ display: 'flex' }}>
                        <TextField 
                            fullWidth 
                            value={newTask} 
                            onChange={e => setNewTask(e.target.value)} 
                            placeholder="Enter a new task description..." 
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            variant="outlined"
                        />
                        <Button variant="contained" onClick={handleAddTask} sx={{ ml: 2, px: 3, py: 1.5 }}><AddIcon /></Button>
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    {Object.entries(columns).map(([status, tasks]) => (
                        <Grid item xs={12} md={4} key={status}>
                            <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: '16px', height: '100%' }}>
                                <Typography variant="h6" sx={{ color: theme.palette[getStatusColor(status)].main, fontWeight: 'bold', mb: 2 }}>{status}</Typography>
                                <List dense>
                                    <AnimatePresence>
                                        {tasks.map((task) => (
                                            <motion.div key={task._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default', borderRadius: '12px' }}>
                                                    <ListItem
                                                        disableGutters
                                                        secondaryAction={
                                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task._id)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        }
                                                    >
                                                        <ListItemText primary={task.text} />
                                                    </ListItem>
                                                    <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                                                        <Select
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                            displayEmpty
                                                            inputProps={{ 'aria-label': 'Without label' }}
                                                        >
                                                            <MenuItem value="To Do">To Do</MenuItem>
                                                            <MenuItem value="In Progress">In Progress</MenuItem>
                                                            <MenuItem value="Done">Done</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Paper>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </List>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    );
};

export default TaskManager;
