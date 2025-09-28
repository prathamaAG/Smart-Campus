import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { 
    Paper, Typography, TextField, Button, Box, Select, MenuItem, FormControl, 
    InputLabel, Chip, Grid, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Divider, IconButton, Dialog, DialogTitle, 
    DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { Delete, Edit, Add, RemoveCircle } from '@mui/icons-material';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');
    const [newSubjectSemester, setNewSubjectSemester] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [editingSubject, setEditingSubject] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [removeFacultyDialogOpen, setRemoveFacultyDialogOpen] = useState(false);
    const [facultyToRemove, setFacultyToRemove] = useState(null);
    const [subjectToRemoveFrom, setSubjectToRemoveFrom] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
            showSnackbar('Failed to fetch data', 'error');
        }
    };

    useEffect(() => {
        fetchSubjectsAndFaculty();
    }, []);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName.trim() || !newSubjectCode.trim() || !newSubjectSemester) {
            showSnackbar('Please fill in all required fields', 'warning');
            return;
        }

        try {
            if (editingSubject) {
                await api.put(`/subjects/${editingSubject._id}`, { 
                    name: newSubjectName, 
                    code: newSubjectCode,
                    semester: newSubjectSemester
                });
                showSnackbar('Subject updated successfully');
                setEditingSubject(null);
            } else {
                await api.post('/subjects', { 
                    name: newSubjectName, 
                    code: newSubjectCode,
                    semester: newSubjectSemester
                });
                showSnackbar('Subject created successfully');
            }
            
            setNewSubjectName('');
            setNewSubjectCode('');
            setNewSubjectSemester('');
            fetchSubjectsAndFaculty();
        } catch (error) {
            console.error("Error saving subject:", error);
            showSnackbar(
                error.response?.data?.message || 'Failed to save subject. Subject code might already exist.',
                'error'
            );
        }
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setNewSubjectName(subject.name);
        setNewSubjectCode(subject.code);
        setNewSubjectSemester(subject.semester || '');
    };

    const handleDeleteClick = (subject) => {
        setSubjectToDelete(subject);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/subjects/${subjectToDelete._id}`);
            showSnackbar('Subject deleted successfully');
            fetchSubjectsAndFaculty();
        } catch (error) {
            console.error("Error deleting subject:", error);
            showSnackbar('Failed to delete subject', 'error');
        }
        setDeleteDialogOpen(false);
        setSubjectToDelete(null);
    };

    const handleCancelEdit = () => {
        setEditingSubject(null);
        setNewSubjectName('');
        setNewSubjectCode('');
        setNewSubjectSemester('');
    };

    const handleAssignSubject = async (e) => {
        e.preventDefault();
        if (!selectedFaculty || !selectedSubject) {
            showSnackbar('Please select both a faculty and a subject', 'warning');
            return;
        }
        try {
            await api.post('/subjects/assign', { 
                facultyId: selectedFaculty, 
                subjectId: selectedSubject 
            });
            setSelectedFaculty('');
            setSelectedSubject('');
            showSnackbar('Subject assigned successfully!');
            fetchSubjectsAndFaculty();
        } catch (error) {
            console.error("Error assigning subject:", error);
            showSnackbar('Failed to assign subject. The faculty member may already be assigned to this subject.', 'error');
        }
    };

    const handleRemoveFacultyClick = (facultyName, subject) => {
        setFacultyToRemove(facultyName);
        setSubjectToRemoveFrom(subject);
        setRemoveFacultyDialogOpen(true);
    };

    const handleRemoveFacultyConfirm = async () => {
        try {
            console.log('Removing faculty:', facultyToRemove, 'from subject:', subjectToRemoveFrom?.name);
            
            // Find the faculty member by name
            const facultyMember = faculty.find(f => f.name === facultyToRemove);
            if (!facultyMember) {
                showSnackbar('Faculty member not found', 'error');
                console.error('Faculty not found in list:', facultyToRemove);
                return;
            }

            console.log('Found faculty member:', { id: facultyMember._id, name: facultyMember.name });
            console.log('Removing from subject:', { id: subjectToRemoveFrom._id, name: subjectToRemoveFrom.name });

            const response = await api.post('/subjects/remove-faculty', {
                facultyId: facultyMember._id,
                subjectId: subjectToRemoveFrom._id
            });
            
            console.log('Remove faculty response:', response.data);
            showSnackbar(`${facultyToRemove} removed from ${subjectToRemoveFrom.name} successfully`);
            fetchSubjectsAndFaculty();
            
        } catch (error) {
            console.error("Error removing faculty from subject:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error config:", error.config);
            
            let errorMessage = 'Failed to remove faculty from subject';
            if (error.response?.status === 404) {
                if (error.config?.url?.includes('/subjects/remove-faculty')) {
                    errorMessage = 'Remove faculty endpoint not found. Please contact administrator.';
                } else {
                    errorMessage = 'Faculty or subject not found.';
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            showSnackbar(errorMessage, 'error');
        }
        
        setRemoveFacultyDialogOpen(false);
        setFacultyToRemove(null);
        setSubjectToRemoveFrom(null);
    };

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                Subject Management
            </Typography>
            
            <Grid container spacing={3}>
                {/* Create/Edit Subject Form */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper', height: 'fit-content' }}>
                        <Typography variant="h6" gutterBottom>
                            {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <form onSubmit={handleCreateSubject}>
                            <TextField 
                                label="Subject Name" 
                                value={newSubjectName} 
                                onChange={(e) => setNewSubjectName(e.target.value)} 
                                required 
                                fullWidth 
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField 
                                label="Subject Code" 
                                value={newSubjectCode} 
                                onChange={(e) => setNewSubjectCode(e.target.value)} 
                                required 
                                fullWidth 
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField 
                                label="Semester" 
                                type="number"
                                value={newSubjectSemester} 
                                onChange={(e) => setNewSubjectSemester(e.target.value)} 
                                required 
                                fullWidth 
                                margin="normal"
                                inputProps={{ min: 1, max: 8 }}
                            />
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={editingSubject ? <Edit /> : <Add />}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {editingSubject ? 'Update' : 'Create'} Subject
                                </Button>
                                {editingSubject && (
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Box>
                        </form>
                    </Paper>

                    {/* Quick Assign Section */}
                    <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper', mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Quick Assign Subject</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <form onSubmit={handleAssignSubject}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Select Faculty</InputLabel>
                                <Select 
                                    value={selectedFaculty} 
                                    onChange={(e) => setSelectedFaculty(e.target.value)}
                                    label="Select Faculty"
                                >
                                    {faculty.filter(f => f.status === 'active').map(f => (
                                        <MenuItem key={f._id} value={f._id}>{f.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Select Subject</InputLabel>
                                <Select 
                                    value={selectedSubject} 
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    label="Select Subject"
                                >
                                    {subjects.map(s => (
                                        <MenuItem key={s._id} value={s._id}>
                                            {s.name} ({s.code}) - Sem {s.semester || 'N/A'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="secondary" 
                                fullWidth
                                sx={{ mt: 2, fontWeight: 'bold' }}
                            >
                                Assign Subject
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                {/* Subjects Table with Faculty Assignments */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom>
                            All Subjects & Faculty Assignments ({subjects.length})
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer sx={{ maxHeight: '70vh' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.dark', color: 'white' }}>
                                            Subject Name
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.dark', color: 'white' }}>
                                            Code
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.dark', color: 'white' }}>
                                            Semester
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.dark', color: 'white' }}>
                                            Faculty
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.dark', color: 'white' }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subjects.length > 0 ? subjects.map((subject) => (
                                        <TableRow key={subject._id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {subject.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={subject.code} 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={`Sem ${subject.semester || 'N/A'}`} 
                                                    size="small" 
                                                    color="info"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {subject.faculty && subject.faculty.length > 0 ? 
                                                        subject.faculty.map((facultyName, index) => (
                                                            <Chip 
                                                                key={index}
                                                                label={facultyName} 
                                                                size="small" 
                                                                color="success"
                                                                sx={{ mb: 0.5 }}
                                                                onDelete={() => handleRemoveFacultyClick(facultyName, subject)}
                                                                deleteIcon={<RemoveCircle />}
                                                            />
                                                        )) : 
                                                        <Typography variant="body2" color="text.secondary">
                                                            No faculty assigned
                                                        </Typography>
                                                    }
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        color="primary"
                                                        onClick={() => handleEditSubject(subject)}
                                                        title="Edit Subject"
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleDeleteClick(subject)}
                                                        title="Delete Subject"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography color="text.secondary">
                                                    No subjects found. Create your first subject using the form.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the subject "{subjectToDelete?.name}" ({subjectToDelete?.code})?
                        This action cannot be undone and will remove all faculty assignments for this subject.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Remove Faculty Confirmation Dialog */}
            <Dialog open={removeFacultyDialogOpen} onClose={() => setRemoveFacultyDialogOpen(false)}>
                <DialogTitle>Remove Faculty from Subject</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove "{facultyToRemove}" from the subject "{subjectToRemoveFrom?.name}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRemoveFacultyDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRemoveFacultyConfirm} color="error" variant="contained">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SubjectManagement;