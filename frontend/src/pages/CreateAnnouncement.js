import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Snackbar, Alert } from '@mui/material';
import Layout from '../components/common/Layout';
import api from '../api/api';

const CreateAnnouncement = ({ toggleTheme }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', { title, message });
            setSnackbarMessage('Announcement sent successfully!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error("Error sending announcement:", error.response ? error.response.data : error);
            const errorMessage = error.response?.data?.message || 'Failed to send announcement.';
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Create Announcement</Typography>
                        <Typography variant="body2" color="text.secondary">Send notifications to all users</Typography>
                    </Box>
                </Box>
                <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper' }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Title"
                            variant="outlined"
                            fullWidth
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Message"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            sx={{ 
                                mt: 2, 
                                fontWeight: 'bold' 
                            }}
                        >
                            Send Announcement
                        </Button>
                    </form>
                </Paper>
                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Layout>
    );
};

export default CreateAnnouncement;
