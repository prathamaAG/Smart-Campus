import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { 
    Paper, Typography, TextField, Button, Box, Select, MenuItem, FormControl, 
    InputLabel, Chip, Grid 
} from '@mui/material';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const fetchSubjectsAndFaculty = async () => {
        try {
            const [subjectsRes, facultyRes] = await Promise.all([
                api.get('/subjects'),
                api.get('/users/faculty')
            ]);
            setSubjects(subjectsRes.data);
            setFaculty(facultyRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchSubjectsAndFaculty();
    }, []);

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subjects', { name: newSubjectName, code: newSubjectCode });
            setNewSubjectName('');
            setNewSubjectCode('');
            fetchSubjectsAndFaculty(); // Refresh list
        } catch (error) {
            console.error("Error creating subject:", error);
        }
    };

    const handleAssignSubject = async (e) => {
        e.preventDefault();
        if (!selectedFaculty || !selectedSubject) {
            alert('Please select both a faculty and a subject.');
            return;
        }
        try {
            await api.post('/subjects/assign', { facultyId: selectedFaculty, subjectId: selectedSubject });
            setSelectedFaculty('');
            setSelectedSubject('');
            alert('Subject assigned!');
            fetchSubjectsAndFaculty(); // Refresh list
        } catch (error) {
            console.error("Error assigning subject:", error);
            alert('Failed to assign subject. The faculty member may already be assigned to this subject.');
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Subject & User Management</Typography>
            <Grid container spacing={3}>
                <Grid xs={12} md={7}>
                    <Paper sx={{ p: 2, mb: 2 }} component="form" onSubmit={handleCreateSubject}>
                        <Typography variant="h6">Add New Subject</Typography>
                        <TextField 
                            label="Subject Name" 
                            value={newSubjectName} 
                            onChange={(e) => setNewSubjectName(e.target.value)} 
                            required 
                            fullWidth 
                            margin="normal" 
                        />
                        <TextField 
                            label="Subject Code" 
                            value={newSubjectCode} 
                            onChange={(e) => setNewSubjectCode(e.target.value)} 
                            required 
                            fullWidth 
                            margin="normal" 
                        />
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>Create Subject</Button>
                    </Paper>
                </Grid>
                <Grid xs={12} md={5}>
                    <Paper sx={{ p: 2, height: '100%' }} component="form" onSubmit={handleAssignSubject}>
                        <Typography variant="h6">Assign Subject to Faculty</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Select Faculty</InputLabel>
                            <Select 
                                value={selectedFaculty} 
                                onChange={(e) => setSelectedFaculty(e.target.value)} 
                            >
                                {faculty.map(f => <MenuItem key={f._id} value={f._id}>{f.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Select Subject</InputLabel>
                            <Select 
                                value={selectedSubject} 
                                onChange={(e) => setSelectedSubject(e.target.value)} 
                            >
                                {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Button onClick={handleAssignSubject} variant="contained" color="secondary" sx={{ mt: 1 }}>Assign Subject</Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default SubjectManagement;