import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, useTheme, MenuItem, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { AddTask, Delete } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import moment from 'moment';

const AssignmentPostPage = ({ toggleTheme }) => {
    const { user } = useAuth();
    const theme = useTheme();
    
    const subjects = user?.subjects || [];
    const [assignmentData, setAssignmentData] = useState({ subject: '', title: '', description: '', dueDate: '', file: null });
    const [allAssignments, setAllAssignments] = useState([]);

    const fetchAssignments = async () => {
        if (user?._id) {
            try {
                const res = await api.get(`/assignments/faculty/${user._id}`);
                setAllAssignments(res.data.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt))));
            } catch (error) {
                console.error("Error fetching assignments", error);
            }
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [user]);

    const handleAssignmentChange = (e) => {
        const { name, value, files } = e.target;
        setAssignmentData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handlePostAssignment = async (e) => {
        e.preventDefault();
        if (!assignmentData.subject || !assignmentData.title || !assignmentData.dueDate) {
            alert('Please fill all required fields.');
            return;
        }

        const formData = new FormData();
        Object.entries(assignmentData).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });
        formData.append('faculty', user._id);


        try {
            await api.post('/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAssignmentData({ subject: '', title: '', description: '', dueDate: '', file: null });
            fetchAssignments(); // Refresh the list
            alert('Assignment posted successfully!');
        } catch (error) {
            console.error("Failed to post assignment", error);
            alert('Failed to post assignment. Please try again.');
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await api.delete(`/assignments/${assignmentId}`);
                fetchAssignments(); // Refresh the list
                alert('Assignment deleted successfully!');
            } catch (error) {
                console.error("Failed to delete assignment", error);
                alert('Failed to delete assignment. Please try again.');
            }
        }
    };

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: { xs: 2, md: 4 } }}>
                <Grid container spacing={4}>
                    {/* Post Assignment Form */}
                    <Grid xs={12} md={5}>
                        <Paper component="form" onSubmit={handlePostAssignment} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper' }}>
                            <Typography variant="h6" gutterBottom>Post a New Assignment</Typography>
                            <TextField select label="Subject" name="subject" value={assignmentData.subject} onChange={handleAssignmentChange} fullWidth required margin="normal">
                                {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                            </TextField>
                            <TextField label="Title" name="title" value={assignmentData.title} onChange={handleAssignmentChange} fullWidth required margin="normal" />
                            <TextField label="Description" name="description" value={assignmentData.description} onChange={handleAssignmentChange} fullWidth multiline rows={3} margin="normal" />
                            <TextField type="date" label="Due Date" name="dueDate" value={assignmentData.dueDate} onChange={handleAssignmentChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} />
                            <Button component="label" variant="outlined" fullWidth sx={{ my: 1 }}>
                                Upload File (Optional)
                                <input type="file" name="file" hidden onChange={handleAssignmentChange} />
                            </Button>
                            {assignmentData.file && <Typography variant="caption">{assignmentData.file.name}</Typography>}
                            <Button type="submit" variant="contained" startIcon={<AddTask />} sx={{ mt: 2, width: '100%', py: 1.5 }}>Post Assignment</Button>
                        </Paper>
                    </Grid>
                    {/* Posted Assignments List */}
                    <Grid xs={12} md={7}>
                        <Paper sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Your Posted Assignments</Typography>
                            <Divider />
                            <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                                {allAssignments.length > 0 ? allAssignments.map((item) => (
                                    <ListItem 
                                        key={item._id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAssignment(item._id)}>
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            primary={`${item.subject.name} - ${item.title}`}
                                            secondary={`Due: ${moment(item.dueDate).format('MMMM Do, YYYY')}`}
                                        />
                                    </ListItem>
                                )) : <ListItem><ListItemText primary="No assignments posted yet." /></ListItem>}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default AssignmentPostPage;
