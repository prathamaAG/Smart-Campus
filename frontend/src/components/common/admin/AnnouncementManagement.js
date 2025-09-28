import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, TextField, Button, List, ListItem, 
    ListItemText, IconButton, Divider, Dialog, DialogTitle, DialogContent, 
    DialogActions, Snackbar, Alert
} from '@mui/material';
import { Delete, Add, Edit } from '@mui/icons-material';
import api from '../../../api/api';
import moment from 'moment';

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get('/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
            showSnackbar('Failed to fetch announcements', 'error');
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            showSnackbar('Please fill in all fields', 'warning');
            return;
        }

        try {
            if (editingId) {
                await api.put(`/announcements/${editingId}`, { title, message });
                showSnackbar('Announcement updated successfully');
            } else {
                await api.post('/announcements', { title, message });
                showSnackbar('Announcement created successfully');
            }
            
            setTitle('');
            setMessage('');
            setEditingId(null);
            fetchAnnouncements();
        } catch (error) {
            console.error("Error saving announcement:", error);
            showSnackbar('Failed to save announcement', 'error');
        }
    };

    const handleEdit = (announcement) => {
        setTitle(announcement.title);
        setMessage(announcement.message);
        setEditingId(announcement._id);
    };

    const handleDeleteClick = (announcement) => {
        setSelectedAnnouncement(announcement);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/announcements/${selectedAnnouncement._id}`);
            showSnackbar('Announcement deleted successfully');
            fetchAnnouncements();
        } catch (error) {
            console.error("Error deleting announcement:", error);
            showSnackbar('Failed to delete announcement', 'error');
        }
        setDeleteDialogOpen(false);
        setSelectedAnnouncement(null);
    };

    const handleCancel = () => {
        setTitle('');
        setMessage('');
        setEditingId(null);
    };

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                Announcement Management
            </Typography>
            
            <Grid container spacing={3}>
                {/* Create/Edit Announcement Form */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom>
                            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
                        </Typography>
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
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={editingId ? <Edit /> : <Add />}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {editingId ? 'Update' : 'Create'} Announcement
                                </Button>
                                {editingId && (
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                {/* Announcements List */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper', height: 'fit-content' }}>
                        <Typography variant="h6" gutterBottom>
                            All Announcements ({announcements.length})
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                            {announcements.length > 0 ? announcements.map((announcement) => (
                                <ListItem 
                                    key={announcement._id}
                                    sx={{ 
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '8px',
                                        mb: 2,
                                        bgcolor: 'background.default'
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {announcement.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                                                    {announcement.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    By {announcement.author?.name || 'Admin'} • {moment(announcement.createdAt).fromNow()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <IconButton 
                                            size="small" 
                                            color="primary" 
                                            onClick={() => handleEdit(announcement)}
                                            title="Edit"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleDeleteClick(announcement)}
                                            title="Delete"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            )) : (
                                <ListItem>
                                    <ListItemText 
                                        primary="No announcements found"
                                        secondary="Create your first announcement using the form"
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the announcement "{selectedAnnouncement?.title}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
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

export default AnnouncementManagement;