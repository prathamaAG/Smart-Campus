import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box, Avatar, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

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
                                <TableCell sx={{ color: 'primary.contrastText', border: 0, fontWeight: 'bold' }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                                    <TableCell sx={{ border: 0, display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{user.name.charAt(0)}</Avatar>
                                        {user.name}
                                    </TableCell>
                                    <TableCell sx={{ border: 0 }}>{user.email}</TableCell>
                                    <TableCell sx={{ border: 0 }}>
                                        <Chip 
                                            label={user.role} 
                                            size="small" 
                                            color={user.role === 'Admin' ? 'error' : 'info'}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ border: 0 }}>
                                        <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default UserManagement;