import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, useTheme, MenuItem, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Schedule, Delete } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const LectureSchedulePage = ({ toggleTheme }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    
    const subjects = user?.subjects || [];
    const [lectureData, setLectureData] = useState({ subject: '', date: '', time: '', venue: '' });
    const [allLectures, setAllLectures] = useState([]);

    const fetchLectures = async () => {
        if (user?._id) {
            try {
                const res = await api.get('/lectures');
                setAllLectures(res.data.sort((a, b) => moment(b.start).diff(moment(a.start))));
            } catch (error) {
                console.error("Error fetching lectures", error);
            }
        }
    };

    useEffect(() => {
        fetchLectures();
    }, [user]);

    const handleLectureChange = (e) => {
        setLectureData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleScheduleLecture = async (e) => {
        e.preventDefault();
        if (!lectureData.subject || !lectureData.date || !lectureData.time) {
            alert('Please fill all required fields.');
            return;
        }
        try {
            const selectedSubject = subjects.find(s => s._id === lectureData.subject);
            const startDateTime = moment(`${lectureData.date} ${lectureData.time}`).toDate();
            const endDateTime = moment(startDateTime).add(1, 'hour').toDate();

            await api.post('/lectures', {
                ...lectureData,
                title: `${selectedSubject.name} Lecture`,
                start: startDateTime,
                end: endDateTime,
                faculty: user._id,
            });
            
            setLectureData({ subject: '', date: '', time: '', venue: '' });
            fetchLectures(); // Refresh the list
            alert('Lecture scheduled successfully!');
            navigate('/faculty'); // Redirect to dashboard
        } catch (error) {
            console.error("Failed to schedule lecture", error);
            alert('Failed to schedule lecture. Please try again.');
        }
    };

    const handleDeleteLecture = async (lectureId) => {
        if (window.confirm('Are you sure you want to delete this lecture?')) {
            try {
                await api.delete(`/lectures/${lectureId}`);
                fetchLectures(); // Refresh the list
                alert('Lecture deleted successfully!');
            } catch (error) {
                console.error("Failed to delete lecture", error);
                alert('Failed to delete lecture. Please try again.');
            }
        }
    };

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: { xs: 2, md: 4 } }}>
                <Grid container spacing={4}>
                    {/* Schedule Lecture Form */}
                    <Grid xs={12} md={5}>
                        <Paper component="form" onSubmit={handleScheduleLecture} sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper' }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Schedule a New Lecture</Typography>
                            <TextField select label="Subject" name="subject" value={lectureData.subject} onChange={handleLectureChange} fullWidth required margin="normal">
                                {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                            </TextField>
                            <TextField type="date" name="date" value={lectureData.date} onChange={handleLectureChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} />
                            <TextField type="time" name="time" value={lectureData.time} onChange={handleLectureChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} />
                            <TextField label="Venue" name="venue" value={lectureData.venue} onChange={handleLectureChange} fullWidth margin="normal" />
                            <Button type="submit" variant="contained" startIcon={<Schedule />} sx={{ mt: 2, width: '100%', py: 1.5 }}>Schedule Lecture</Button>
                        </Paper>
                    </Grid>

                    {/* All Scheduled Lectures List */}
                    <Grid xs={12} md={7}>
                        <Paper sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Your Scheduled Lectures</Typography>
                            <Divider />
                            <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                                {allLectures.length > 0 ? allLectures.map((item) => (
                                    <ListItem 
                                        key={item._id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteLecture(item._id)}>
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            primary={`${item.subject.name} - ${item.title}`}
                                            secondary={`${moment(item.start).format('dddd, MMMM Do YYYY, h:mm a')} at ${item.venue || 'N/A'}`}
                                        />
                                    </ListItem>
                                )) : <ListItem><ListItemText primary="No lectures scheduled yet." /></ListItem>}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default LectureSchedulePage;
