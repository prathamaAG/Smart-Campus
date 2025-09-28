import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, Box, Avatar, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/users');
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, []);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            console.log('Deleting user:', userToDelete);
            
            const response = await api.delete(`/users/${userToDelete._id}`);
            console.log('Delete response:', response.data);
            
            setUsers(prevUsers => prevUsers.filter(u => u._id !== userToDelete._id));
            showSnackbar('User deleted successfully');
            
        } catch (error) {
            console.error("Error deleting user:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Error config:", error.config);
            
            let errorMessage = 'Failed to delete user';
            if (error.response?.status === 403) {
                errorMessage = 'Cannot delete admin users';
            } else if (error.response?.status === 404) {
                errorMessage = 'User not found. It may have been already deleted.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            showSnackbar(errorMessage, 'error');
        }
        
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>User Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage system users, roles, and permissions</Typography>
                </Box>
                <Chip label={`Total Users: ${users.length}`} color="info" sx={{ fontWeight: 'bold' }} />
            </Box>
            <Paper sx={{ p: 2, borderRadius: '12px' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.dark' }}>
                                <TableCell sx={{ color: 'primary.contrastText', border: 0, fontWeight: 'bold' }}>NAME</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', border: 0, fontWeight: 'bold' }}>EMAIL</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', border: 0, fontWeight: 'bold' }}>ROLE</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', border: 0, fontWeight: 'bold' }}>STATUS</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', border: 0, fontWeight: 'bold' }}>JOINED</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', border: 0, fontWeight: 'bold' }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                                    <TableCell sx={{ border: 0, display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{user.name.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                {user.name}
                                            </Typography>
                                            {user.role === 'Student' && user.semester && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Semester {user.semester}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ border: 0 }}>{user.email}</TableCell>
                                    <TableCell sx={{ border: 0 }}>
                                        <Chip 
                                            label={user.role} 
                                            size="small" 
                                            color={user.role === 'Admin' ? 'error' : user.role === 'Faculty' ? 'success' : 'info'}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ border: 0 }}>
                                        <Chip 
                                            label={user.status || 'active'} 
                                            size="small" 
                                            color={user.status === 'pending' ? 'warning' : 'success'}
                                            variant={user.status === 'pending' ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ border: 0, color: 'text.secondary' }}>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell sx={{ border: 0 }}>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleDeleteClick(user)}
                                            disabled={user.role === 'Admin'} // Prevent deleting admin users
                                            title={user.role === 'Admin' ? 'Cannot delete admin users' : 'Delete user'}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the user "{userToDelete?.name}" ({userToDelete?.email})?
                        This action cannot be undone and will permanently remove the user from the system.
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

export default UserManagement;