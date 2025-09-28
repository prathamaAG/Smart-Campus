import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, List, ListItem, ListItemText, Button, 
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
    Divider, Grid, Card, CardContent
} from '@mui/material';
import { Download, Visibility, Assignment as AssignmentIcon, Schedule } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import moment from 'moment';

const MyAssignments = ({ toggleTheme }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [textDialogOpen, setTextDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!user) return;
            console.log('MyAssignments - Fetching assignments for user:', {
                id: user._id,
                name: user.name,
                role: user.role,
                semester: user.semester,
                division: user.division
            });
            
            setLoading(true);
            try {
                const { data } = await api.get('/assignments');
                console.log('MyAssignments - Raw assignments received:', data);
                console.log('MyAssignments - Number of assignments:', data.length);
                setAssignments(data);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            }
            setLoading(false);
        };

        fetchAssignments();
    }, [user]);

    const handleViewTextAssignment = (assignment) => {
        setSelectedAssignment(assignment);
        setTextDialogOpen(true);
    };

    const handleDownloadFile = async (assignment) => {
        try {
            console.log('Downloading assignment:', assignment);
            console.log('File URL:', assignment.fileUrl);
            
            // Use the direct file URL approach
            const fileUrl = assignment.fileUrl.startsWith('http') 
                ? assignment.fileUrl 
                : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${assignment.fileUrl}`;
            
            console.log('Constructed file URL:', fileUrl);

            // Method 1: Try direct download using assignment ID
            const response = await api.get(`/assignments/download/${assignment._id}`, {
                responseType: 'blob',
            });
            
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from response header or construct one
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'assignment-file';
            
            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            } else {
                // Construct filename from assignment title and get extension from fileUrl
                const extension = assignment.fileUrl.split('.').pop() || 'pdf';
                filename = `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Download error:', error);
            console.error('Error response:', error.response);
            
            // Fallback: Try direct URL access
            try {
                console.log('Trying fallback method...');
                const fileUrl = assignment.fileUrl.startsWith('http') 
                    ? assignment.fileUrl 
                    : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${assignment.fileUrl}`;
                
                window.open(fileUrl, '_blank');
            } catch (fallbackError) {
                console.error('Fallback download also failed:', fallbackError);
                alert('Failed to download file. Please try again or contact support.');
            }
        }
    };

    const getDueStatus = (dueDate) => {
        const now = moment();
        const due = moment(dueDate);
        const diffDays = due.diff(now, 'days');
        const diffHours = due.diff(now, 'hours');

        if (diffDays < 0) {
            return { label: 'Overdue', color: 'error' };
        } else if (diffHours <= 24) {
            return { label: 'Due Soon', color: 'warning' };
        } else if (diffDays <= 3) {
            return { label: 'Due This Week', color: 'info' };
        } else {
            return { label: 'Active', color: 'success' };
        }
    };

    const upcomingAssignments = assignments
        .filter(a => moment(a.dueDate).isAfter(moment()))
        .sort((a, b) => moment(a.dueDate).diff(moment(b.dueDate)));

    const pastAssignments = assignments
        .filter(a => moment(a.dueDate).isBefore(moment()))
        .sort((a, b) => moment(b.dueDate).diff(moment(a.dueDate)));

    const AssignmentCard = ({ assignment, isPast = false }) => {
        const dueStatus = getDueStatus(assignment.dueDate);
        
        return (
            <Card sx={{ mb: 2, bgcolor: isPast ? 'action.hover' : 'background.paper' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {assignment.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Subject: {assignment.subject?.name} ({assignment.subject?.code})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Faculty: {assignment.faculty?.name}
                            </Typography>
                            {assignment.fileUrl && (
                                <Typography variant="body2" color="text.secondary">
                                    File URL: {assignment.fileUrl}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Chip 
                                label={assignment.assignmentType === 'text' ? 'Text Assignment' : 'File Assignment'}
                                size="small"
                                color={assignment.assignmentType === 'text' ? 'primary' : 'secondary'}
                            />
                            {!isPast && (
                                <Chip 
                                    label={dueStatus.label}
                                    size="small"
                                    color={dueStatus.color}
                                />
                            )}
                        </Box>
                    </Box>

                    {assignment.description && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {assignment.description}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Due: {moment(assignment.dueDate).format('MMMM Do, YYYY [at] h:mm A')}
                            {isPast && ` (${moment(assignment.dueDate).fromNow()})`}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {assignment.assignmentType === 'text' ? (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    onClick={() => handleViewTextAssignment(assignment)}
                                >
                                    View Assignment
                                </Button>
                            ) : (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={() => handleDownloadFile(assignment)}
                                >
                                    Download
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Layout toggleTheme={toggleTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4, px: { xs: 1, md: 4 }}}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        My Assignments
                    </Typography>
                </Box>
                
                <Grid container spacing={3}>
                    {/* Upcoming Assignments */}
                    <Grid item xs={12} lg={8}>
                        <Paper sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                Upcoming Assignments ({upcomingAssignments.length})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                                {upcomingAssignments.length > 0 ? (
                                    upcomingAssignments.map(assignment => (
                                        <AssignmentCard key={assignment._id} assignment={assignment} />
                                    ))
                                ) : (
                                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                        No upcoming assignments found. 
                                        {assignments.length === 0 ? ' No assignments available for your semester/division.' : ' All assignments are past due.'}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Quick Stats */}
                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 3, borderRadius: '16px', mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Assignment Overview
                            </Typography>
                            <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Total Assignments:</Typography>
                                    <Typography fontWeight="bold">{assignments.length}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Upcoming:</Typography>
                                    <Typography fontWeight="bold">{upcomingAssignments.length}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Past Due:</Typography>
                                    <Typography fontWeight="bold">{pastAssignments.length}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Due This Week:</Typography>
                                    <Typography fontWeight="bold">
                                        {upcomingAssignments.filter(a => 
                                            moment(a.dueDate).diff(moment(), 'days') <= 7
                                        ).length}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Past Assignments */}
                        <Paper sx={{ p: 3, borderRadius: '16px' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Past Assignments ({pastAssignments.length})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ maxHeight: '40vh', overflow: 'auto' }}>
                                {pastAssignments.length > 0 ? (
                                    pastAssignments.slice(0, 5).map(assignment => (
                                        <AssignmentCard key={assignment._id} assignment={assignment} isPast={true} />
                                    ))
                                ) : (
                                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                        No past assignments
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Text Assignment Dialog */}
                <Dialog 
                    open={textDialogOpen} 
                    onClose={() => setTextDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{selectedAssignment?.title}</Typography>
                            <Chip 
                                label={`Due: ${moment(selectedAssignment?.dueDate).format('MMM Do, h:mm A')}`}
                                color={getDueStatus(selectedAssignment?.dueDate).color}
                                size="small"
                            />
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                            Subject: {selectedAssignment?.subject?.name} | Faculty: {selectedAssignment?.faculty?.name}
                        </Typography>
                        {selectedAssignment?.description && (
                            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                                {selectedAssignment.description}
                            </Typography>
                        )}
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {selectedAssignment?.content}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTextDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default MyAssignments;