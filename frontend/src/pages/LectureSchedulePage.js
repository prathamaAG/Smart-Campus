import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, useTheme, MenuItem, Divider, List, ListItem, ListItemText, IconButton, Chip, Alert } from '@mui/material';
import { Schedule, Delete, Warning } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const LectureSchedulePage = ({ toggleTheme }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    
    const [subjects, setSubjects] = useState([]);
    const [lectureData, setLectureData] = useState({ 
        subject: '', 
        date: '', 
        time: '', 
        venue: '',
        semester: ''
    });
    const [allLectures, setAllLectures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSubjectsAndLectures = async () => {
        if (user?._id) {
            try {
                console.log('Fetching subjects for user:', user.name, 'ID:', user._id);
                
                // Fetch subjects assigned to this faculty
                const subjectsRes = await api.get('/subjects');
                const facultySubjects = subjectsRes.data.filter(subject => 
                    subject.faculty && subject.faculty.includes(user?.name)
                );
                console.log('Faculty subjects found:', facultySubjects.length);
                setSubjects(facultySubjects);

                // Fetch all lectures by this faculty
                const lecturesRes = await api.get('/lectures');
                console.log('Lectures fetched:', lecturesRes.data.length);
                setAllLectures(lecturesRes.data.sort((a, b) => moment(b.start).diff(moment(a.start))));
            } catch (error) {
                console.error("Error fetching data", error);
                setError('Failed to fetch data. Please refresh the page.');
            }
        }
    };

    useEffect(() => {
        if (user && user._id) {
            console.log('User loaded:', { id: user._id, name: user.name, role: user.role });
            fetchSubjectsAndLectures();
        } else {
            console.log('User not loaded yet or missing _id:', user);
        }
    }, [user]);

    const handleLectureChange = (e) => {
        const { name, value } = e.target;
        console.log('Field changed:', name, '=', value);
        setError(''); // Clear error when user makes changes
        
        if (name === 'subject') {
            const selectedSubject = subjects.find(s => s._id === value);
            console.log('Selected subject:', selectedSubject);
            if (selectedSubject) {
                setLectureData(prev => ({ 
                    ...prev, 
                    [name]: value,
                    semester: selectedSubject.semester || ''
                }));
                console.log('Updated lecture data with semester:', selectedSubject.semester);
                return;
            }
        }
        
        setLectureData(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleLecture = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        console.log('=== FRONTEND SUBMISSION ===');
        console.log('User info:', { id: user._id, name: user.name });
        console.log('Submitting lecture with data:', lectureData);
        
        // Frontend validation
        const requiredFields = ['subject', 'date', 'time', 'semester'];
        const missingFields = requiredFields.filter(field => !lectureData[field]);
        
        if (missingFields.length > 0) {
            const errorMsg = `Please fill all required fields: ${missingFields.join(', ')}`;
            setError(errorMsg);
            setLoading(false);
            return;
        }
        
        try {
            const selectedSubject = subjects.find(s => s._id === lectureData.subject);
            if (!selectedSubject) {
                setError('Please select a valid subject.');
                setLoading(false);
                return;
            }

            // Create proper datetime objects
            const dateTimeString = `${lectureData.date}T${lectureData.time}:00`;
            const startDateTime = new Date(dateTimeString);
            const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000)); // Add 1 hour

            // Validate dates
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                setError('Invalid date or time format.');
                setLoading(false);
                return;
            }

            console.log('Start DateTime:', startDateTime);
            console.log('End DateTime:', endDateTime);

            const lecturePayload = {
                title: `${selectedSubject.name} Lecture`,
                subject: lectureData.subject,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                venue: lectureData.venue || '',
                semester: parseInt(lectureData.semester)
            };

            console.log('=== SENDING TO BACKEND ===');
            console.log('Payload:', JSON.stringify(lecturePayload, null, 2));

            const response = await api.post('/lectures', lecturePayload);
            console.log('Success response:', response.data);
            
            // Reset form
            setLectureData({ 
                subject: '', 
                date: '', 
                time: '', 
                venue: '',
                semester: ''
            });
            
            // Refresh the list
            await fetchSubjectsAndLectures();
            setError(''); // Clear any previous errors
            alert('Lecture scheduled successfully!');
            
        } catch (error) {
            console.error("=== FRONTEND ERROR ===");
            console.error("Full error:", error);
            console.error("Error response:", error.response);
            
            const errorMessage = error.response?.data?.message || 'Failed to schedule lecture. Please try again.';
            const errorDetails = error.response?.data?.details;
            const missingFields = error.response?.data?.missingFields;
            
            console.error("Error message:", errorMessage);
            console.error("Error details:", errorDetails);
            console.error("Missing fields:", missingFields);
            
            let displayError = errorMessage;
            if (missingFields && missingFields.length > 0) {
                displayError += `\n\nMissing fields: ${missingFields.join(', ')}`;
            }
            
            setError(displayError);
        }
        
        setLoading(false);
    };

    const handleDeleteLecture = async (lectureId) => {
        if (window.confirm('Are you sure you want to delete this lecture?')) {
            try {
                await api.delete(`/lectures/${lectureId}`);
                fetchSubjectsAndLectures(); // Refresh the list
                alert('Lecture deleted successfully!');
            } catch (error) {
                console.error("Failed to delete lecture", error);
                setError('Failed to delete lecture. Please try again.');
            }
        }
    };

    // Don't render if user is not loaded
    if (!user || !user._id) {
        return (
            <Layout toggleTheme={toggleTheme}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Typography>Loading...</Typography>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Schedule Lecture
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error.split('\n').map((line, index) => (
                            <div key={index}>{line}</div>
                        ))}
                    </Alert>
                )}
                
                <Grid container spacing={4}>
                    {/* Schedule Lecture Form */}
                    <Grid item xs={12} md={5}>
                        <Paper component="form" onSubmit={handleScheduleLecture} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Schedule a New Lecture</Typography>
                            
                            <TextField 
                                select 
                                label="Subject *" 
                                name="subject" 
                                value={lectureData.subject} 
                                onChange={handleLectureChange} 
                                fullWidth 
                                required 
                                margin="normal"
                                error={!lectureData.subject && subjects.length === 0}
                                helperText={subjects.length === 0 ? "No subjects assigned to you" : ""}
                            >
                                {subjects.map(s => (
                                    <MenuItem key={s._id} value={s._id}>
                                        {s.name} ({s.code}) - Sem {s.semester}
                                    </MenuItem>
                                ))}
                            </TextField>
                            
                            <TextField 
                                label="Semester *" 
                                name="semester" 
                                type="number"
                                value={lectureData.semester} 
                                onChange={handleLectureChange} 
                                fullWidth 
                                required 
                                margin="normal"
                                inputProps={{ min: 1, max: 8 }}
                                disabled // Auto-filled from subject
                                helperText="Auto-filled when you select a subject"
                            />
                            
                            <TextField 
                                type="date" 
                                name="date" 
                                label="Date *"
                                value={lectureData.date} 
                                onChange={handleLectureChange} 
                                fullWidth 
                                required 
                                margin="normal" 
                                InputLabelProps={{ shrink: true }} 
                                inputProps={{ min: moment().format('YYYY-MM-DD') }}
                            />
                            <TextField 
                                type="time" 
                                name="time" 
                                label="Time *"
                                value={lectureData.time} 
                                onChange={handleLectureChange} 
                                fullWidth 
                                required 
                                margin="normal" 
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField 
                                label="Venue" 
                                name="venue" 
                                value={lectureData.venue} 
                                onChange={handleLectureChange} 
                                fullWidth 
                                margin="normal" 
                                placeholder="e.g., Room 101, Lab 2, etc."
                            />
                            <Button 
                                type="submit" 
                                variant="contained" 
                                startIcon={<Schedule />} 
                                sx={{ mt: 2, width: '100%', py: 1.5 }}
                                disabled={loading || subjects.length === 0}
                            >
                                {loading ? 'Scheduling...' : 'Schedule Lecture'}
                            </Button>
                        </Paper>
                    </Grid>

                    {/* All Scheduled Lectures List */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Your Scheduled Lectures ({allLectures.length})</Typography>
                            <Divider />
                            <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                                {allLectures.length > 0 ? allLectures.map((item) => (
                                    <ListItem 
                                        key={item._id}
                                        sx={{ 
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: '8px',
                                            mb: 1,
                                            bgcolor: 'background.default'
                                        }}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteLecture(item._id)}>
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {item.subject?.name || 'Unknown Subject'}
                                                    </Typography>
                                                    <Chip 
                                                        label={`Sem ${item.semester}`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {moment(item.start).format('dddd, MMMM Do YYYY, h:mm A')}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Venue: {item.venue || 'Not specified'} | Duration: 1 hour
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                )) : (
                                    <ListItem>
                                        <ListItemText 
                                            primary="No lectures scheduled yet." 
                                            secondary={subjects.length === 0 ? 
                                                "Please contact admin to assign subjects to you first." : 
                                                "Use the form to schedule your first lecture."
                                            }
                                        />
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

export default LectureSchedulePage;
