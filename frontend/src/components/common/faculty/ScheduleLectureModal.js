import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Fade } from '@mui/material';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const ScheduleLectureModal = ({ open, handleClose, refreshLectures }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('');
    const [division, setDivision] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchFacultySubjects = async () => {
            if (user?._id) {
                const { data } = await api.get('/subjects');
                setSubjects(data);
            }
        };
        if (open) {
            fetchFacultySubjects();
        }
    }, [user, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lectures', { title, subject, semester, division, start, end });
            refreshLectures();
            handleClose();
        } catch (error) {
            console.error("Failed to schedule lecture", error);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} closeAfterTransition>
            <Fade in={open}>
                <Box sx={style} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Schedule a New Lecture</Typography>
                    <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth margin="normal" required />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Subject</InputLabel>
                        <Select value={subject} onChange={e => setSubject(e.target.value)} label="Subject">
                            {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Semester" type="number" value={semester} onChange={e => setSemester(e.target.value)} fullWidth margin="normal" required />
                    <TextField label="Division" value={division} onChange={e => setDivision(e.target.value)} fullWidth margin="normal" required />
                    <TextField label="Start Time" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                    <TextField label="End Time" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                    <Button type="submit" variant="contained" sx={{ mt: 2, py: 1.5, width: '100%' }}>Schedule</Button>
                </Box>
            </Fade>
        </Modal>
    );
};

export default ScheduleLectureModal;