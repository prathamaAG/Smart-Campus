import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Paper, List, ListItemButton, ListItemText, Divider, Select, MenuItem, Chip, Button, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import api from '../../api/api';

const UserSubjectManagement = ({ onUpdate }) => {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [assignedSubjects, setAssignedSubjects] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const [facultyRes, subjectsRes] = await Promise.all([
                api.get('/users/faculty'),
                api.get('/subjects')
            ]);
            setFaculty(facultyRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectFaculty = (facultyMember) => {
        setSelectedFaculty(facultyMember);
        setAssignedSubjects(facultyMember.subjects.map(s => s._id));
    };

    const handleSubjectChange = (event) => {
        const { target: { value } } = event;
        setAssignedSubjects(typeof value === 'string' ? value.split(',') : value);
    };

    const handleSaveChanges = async () => {
        if (!selectedFaculty) return;
        try {
            await api.put(`/users/faculty/${selectedFaculty._id}/subjects`, { subjects: assignedSubjects });
            alert('Subjects updated successfully!');
            fetchData(); // Refresh faculty list with updated data
            onUpdate(); // Refresh dashboard stats
        } catch (error) {
            console.error("Failed to update subjects", error);
            alert('Failed to update subjects.');
        }
    };

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h5" gutterBottom>User-Subject Assignments</Typography>
            <Grid container spacing={3} sx={{ flex: 1 }}>
                <Grid xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6">Select User</Typography>
                        <Divider sx={{ my: 1 }} />
                        <List disablePadding>
                            {faculty.map((member, index) => (
                                <React.Fragment key={member._id}>
                                    <ListItemButton selected={selectedFaculty?._id === member._id} onClick={() => handleSelectFaculty(member)}>
                                        <ListItemText primary={member.name} secondary={member.email} />
                                    </ListItemButton>
                                    {index < faculty.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid xs={12} md={8}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6">Manage Subjects for {selectedFaculty?.name}</Typography>
                        <Divider sx={{ my: 1 }} />
                        {selectedFaculty ? (
                            <Box>
                                <FormControl fullWidth>
                                    <InputLabel id="assign-subjects-label">Assign Subjects</InputLabel>
                                    <Select
                                        labelId="assign-subjects-label"
                                        multiple
                                        value={assignedSubjects}
                                        onChange={handleSubjectChange}
                                        input={<OutlinedInput label="Assign Subjects" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const subject = subjects.find(s => s._id === value);
                                                    return <Chip key={value} label={subject?.name || ''} />;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {subjects.map((subject) => (
                                            <MenuItem key={subject._id} value={subject._id}>
                                                {subject.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button variant="contained" sx={{ mt: 3 }} onClick={handleSaveChanges}>
                                    Save Changes
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                                <Typography>Select a faculty member to view and manage their subjects.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserSubjectManagement;