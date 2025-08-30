import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Snackbar, Alert, Grid, Chip, Avatar } from '@mui/material';
import api from '../../../api/api';

const FacultyAssignmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assigning, setAssigning] = useState({});
  const [selectedSubject, setSelectedSubject] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [facultyRes, subjectRes] = await Promise.all([
          api.get('/users/faculty'),
          api.get('/subjects')
        ]);
        const pendingRequests = facultyRes.data.filter(faculty => faculty.status === 'pending');
        setRequests(pendingRequests);
        setSubjects(subjectRes.data);
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubjectChange = (facultyId, subjectId) => {
    setSelectedSubject((prev) => ({ ...prev, [facultyId]: subjectId }));
  };

  const handleAccept = async (facultyId) => {
    const subjectId = selectedSubject[facultyId];
    if (!subjectId) {
      setSnackbar({ open: true, message: 'Please select a subject', severity: 'warning' });
      return;
    }
    setAssigning((prev) => ({ ...prev, [facultyId]: true }));
    try {
      await api.put(`/users/faculty/${facultyId}/subjects`, { subjects: [subjectId] });
      await api.patch(`/users/${facultyId}`, { status: 'active' });
      
      setRequests((prev) => prev.filter((f) => f._id !== facultyId));
      setSnackbar({ open: true, message: 'Faculty accepted and subject assigned!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to assign subject', severity: 'error' });
    }
    setAssigning((prev) => ({ ...prev, [facultyId]: false }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Faculty Assignment Requests</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: '12px', textAlign: 'center' }}>
            <Typography>No pending faculty requests.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {requests.map((faculty) => (
            <Grid xs={12} key={faculty._id}>
                <Paper sx={{ p: 2, mb: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>{faculty.name.charAt(0)}</Avatar>
                        <Box>
                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>{faculty.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{faculty.email}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Assign Subject</InputLabel>
                            <Select
                                value={selectedSubject[faculty._id] || ''}
                                label="Assign Subject"
                                onChange={(e) => handleSubjectChange(faculty._id, e.target.value)}
                            >
                                {subjects.map((subject) => (
                                    <MenuItem key={subject._id} value={subject._id}>{subject.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={assigning[faculty._id]}
                            onClick={() => handleAccept(faculty._id)}
                            sx={{ fontWeight: 'bold' }}
                        >
                            {assigning[faculty._id] ? <CircularProgress size={24} color="inherit" /> : 'Accept & Assign'}
                        </Button>
                    </Box>
                </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacultyAssignmentRequests;
