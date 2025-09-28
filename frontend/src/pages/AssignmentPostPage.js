import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, TextField, Button, useTheme, MenuItem, 
    Divider, List, ListItem, ListItemText, IconButton, FormControl, 
    InputLabel, Select, RadioGroup, FormControlLabel, Radio, Chip
} from '@mui/material';
import { AddTask, Delete, Description, AttachFile } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import moment from 'moment';

const AssignmentPostPage = ({ toggleTheme }) => {
    const { user } = useAuth();
    const theme = useTheme();
    
    const [subjects, setSubjects] = useState([]);
    const [assignmentData, setAssignmentData] = useState({ 
        subject: '', 
        title: '', 
        description: '', 
        content: '',
        assignmentType: 'text',
        semester: '',
        dueDate: '', 
        file: null 
    });
    const [allAssignments, setAllAssignments] = useState([]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await api.get('/subjects');
                // Filter subjects assigned to current faculty
                const facultySubjects = data.filter(subject => 
                    subject.faculty && subject.faculty.includes(user?.name)
                );
                setSubjects(facultySubjects);
            } catch (error) {
                console.error("Error fetching subjects", error);
            }
        };
        
        const fetchAssignments = async () => {
            try {
                const { data } = await api.get('/assignments');
                setAllAssignments(data);
            } catch (error) {
                console.error("Error fetching assignments", error);
            }
        };

        if (user?._id) {
            fetchSubjects();
            fetchAssignments();
        }
    }, [user]);

    const handleAssignmentChange = (e) => {
        const { name, value, files } = e.target;
        setAssignmentData(prev => ({ 
            ...prev, 
            [name]: files ? files[0] : value 
        }));
    };

    const handlePostAssignment = async (e) => {
        e.preventDefault();
        if (!assignmentData.subject || !assignmentData.title || !assignmentData.dueDate || 
            !assignmentData.semester) {
            alert('Please fill all required fields.');
            return;
        }

        if (assignmentData.assignmentType === 'text' && !assignmentData.content.trim()) {
            alert('Please enter assignment content.');
            return;
        }

        if (assignmentData.assignmentType === 'file' && !assignmentData.file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        Object.entries(assignmentData).forEach(([key, value]) => {
            if (value && key !== 'file') {
                formData.append(key, value);
            }
        });
        
        if (assignmentData.file) {
            formData.append('file', assignmentData.file);
        }

        try {
            const { data } = await api.post('/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setAssignmentData({ 
                subject: '', 
                title: '', 
                description: '', 
                content: '',
                assignmentType: 'text',
                semester: '',
                dueDate: '', 
                file: null 
            });
            
            setAllAssignments(prev => [data, ...prev]);
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
                setAllAssignments(prev => prev.filter(a => a._id !== assignmentId));
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
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Assignment Management
                </Typography>
                
                <Grid container spacing={4}>
                    {/* Post Assignment Form */}
                    <Grid item xs={12} lg={5}>
                        <Paper component="form" onSubmit={handlePostAssignment} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper' }}>
                            <Typography variant="h6" gutterBottom>Create New Assignment</Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {/* Assignment Type Selection */}
                            <FormControl component="fieldset" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Assignment Type</Typography>
                                <RadioGroup
                                    row
                                    name="assignmentType"
                                    value={assignmentData.assignmentType}
                                    onChange={handleAssignmentChange}
                                >
                                    <FormControlLabel 
                                        value="text" 
                                        control={<Radio />} 
                                        label="Text Assignment" 
                                        icon={<Description />}
                                    />
                                    <FormControlLabel 
                                        value="file" 
                                        control={<Radio />} 
                                        label="File Upload" 
                                        icon={<AttachFile />}
                                    />
                                </RadioGroup>
                            </FormControl>

                            <TextField 
                                select 
                                label="Subject" 
                                name="subject" 
                                value={assignmentData.subject} 
                                onChange={handleAssignmentChange} 
                                fullWidth 
                                required 
                                margin="normal"
                            >
                                {subjects.map(s => (
                                    <MenuItem key={s._id} value={s._id}>
                                        {s.name} ({s.code})
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField 
                                label="Assignment Title" 
                                name="title" 
                                value={assignmentData.title} 
                                onChange={handleAssignmentChange} 
                                fullWidth 
                                required 
                                margin="normal" 
                            />
                            
                            <TextField 
                                label="Description (Optional)" 
                                name="description" 
                                value={assignmentData.description} 
                                onChange={handleAssignmentChange} 
                                fullWidth 
                                multiline 
                                rows={2} 
                                margin="normal" 
                            />

                            <TextField 
                                label="Semester" 
                                name="semester" 
                                type="number"
                                value={assignmentData.semester} 
                                onChange={handleAssignmentChange} 
                                fullWidth 
                                required 
                                margin="normal"
                                inputProps={{ min: 1, max: 8 }}
                            />

                            {assignmentData.assignmentType === 'text' ? (
                                <TextField 
                                    label="Assignment Content" 
                                    name="content" 
                                    value={assignmentData.content} 
                                    onChange={handleAssignmentChange} 
                                    fullWidth 
                                    multiline 
                                    rows={6} 
                                    required
                                    margin="normal"
                                    placeholder="Enter the assignment questions/instructions here..."
                                />
                            ) : (
                                <Box sx={{ mt: 2 }}>
                                    <Button 
                                        component="label" 
                                        variant="outlined" 
                                        fullWidth 
                                        startIcon={<AttachFile />}
                                        sx={{ py: 2 }}
                                    >
                                        Upload Assignment File
                                        <input 
                                            type="file" 
                                            name="file" 
                                            hidden 
                                            onChange={handleAssignmentChange}
                                            accept=".pdf,.doc,.docx,.txt"
                                        />
                                    </Button>
                                    {assignmentData.file && (
                                        <Chip 
                                            label={assignmentData.file.name}
                                            onDelete={() => setAssignmentData(prev => ({...prev, file: null}))}
                                            sx={{ mt: 1 }}
                                        />
                                    )}
                                </Box>
                            )}

                            <TextField 
                                type="datetime-local" 
                                label="Due Date & Time" 
                                name="dueDate" 
                                value={assignmentData.dueDate} 
                                onChange={handleAssignmentChange} 
                                fullWidth 
                                required 
                                margin="normal" 
                                InputLabelProps={{ shrink: true }} 
                            />
                            
                            <Button 
                                type="submit" 
                                variant="contained" 
                                startIcon={<AddTask />} 
                                sx={{ mt: 3, width: '100%', py: 1.5 }}
                            >
                                Post Assignment
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Posted Assignments List */}
                    <Grid item xs={12} lg={7}>
                        <Paper sx={{ p: 3, borderRadius: '16px', height: 'fit-content' }}>
                            <Typography variant="h6" gutterBottom>
                                Your Posted Assignments ({allAssignments.length})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                                {allAssignments.length > 0 ? allAssignments.map((item) => (
                                    <ListItem 
                                        key={item._id}
                                        sx={{ 
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: '8px',
                                            mb: 2,
                                            bgcolor: 'background.default'
                                        }}
                                        secondaryAction={
                                            <IconButton 
                                                edge="end" 
                                                color="error"
                                                onClick={() => handleDeleteAssignment(item._id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {item.title}
                                                    </Typography>
                                                    <Chip 
                                                        label={item.assignmentType === 'text' ? 'Text' : 'File'}
                                                        size="small"
                                                        color={item.assignmentType === 'text' ? 'primary' : 'secondary'}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Subject: {item.subject?.name} | Semester: {item.semester}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Due: {moment(item.dueDate).format('MMMM Do, YYYY [at] h:mm A')}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Posted: {moment(item.createdAt).fromNow()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                )) : (
                                    <ListItem>
                                        <ListItemText primary="No assignments posted yet." />
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default AssignmentPostPage;
