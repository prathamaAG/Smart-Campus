import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, Chip, IconButton, Grid, Card, CardContent,
    Divider, Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Download, Grade, Quiz, Visibility, ExpandMore, Refresh } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import moment from 'moment';

const StudentSubmissions = ({ onStatsUpdate }) => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
    const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
    const [grade, setGrade] = useState('');
    const [maxMarks, setMaxMarks] = useState(100);
    const [remarks, setRemarks] = useState('');
    const [questions, setQuestions] = useState([]);
    const [grading, setGrading] = useState(false);
    const [generatingQuestions, setGeneratingQuestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            console.log('Fetching faculty submissions...');
            const { data } = await api.get('/submissions/faculty/submissions');
            console.log('Faculty submissions received:', data);
            setSubmissions(data);
            
            // Update stats in parent component
            if (onStatsUpdate) {
                onStatsUpdate();
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchSubmissions();
        setRefreshing(false);
    };

    const handleGradeSubmission = async () => {
        if (!selectedSubmission || !grade) return;
        
        setGrading(true);
        try {
            await api.put(
                `/submissions/assignments/${selectedSubmission.assignmentId}/submissions/${selectedSubmission._id}/grade`,
                { grade: parseFloat(grade), remarks, maxMarks }
            );
            
            alert('Submission graded successfully!');
            setGradeDialogOpen(false);
            fetchSubmissions();
            resetGradeDialog();
        } catch (error) {
            console.error('Error grading submission:', error);
            alert('Failed to grade submission. Please try again.');
        }
        setGrading(false);
    };

    const handleGenerateQuestions = async (submission) => {
        setGeneratingQuestions(true);
        try {
            const { data } = await api.post(
                `/questions/generate/${submission.assignmentId}/${submission._id}`
            );
            setQuestions(data.questions);
            setSelectedSubmission({ ...submission, studentName: data.studentName });
            setQuestionsDialogOpen(true);
        } catch (error) {
            console.error('Error generating questions:', error);
            alert('Failed to generate questions. Please try again.');
        }
        setGeneratingQuestions(false);
    };

   const handleDownloadSubmission = async (assignmentId, submissionId) => {
    try {
        const response = await api.get(
            `/submissions/download/${assignmentId}/${submissionId}`,
            { responseType: 'blob' }
        );
        
        // Get the content-disposition header to extract the filename
        const contentDisposition = response.headers['content-disposition'];
        let filename = `submission_${submissionId}.docx`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        // Create blob with proper MIME type for DOCX
        const blob = new Blob([response.data], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error downloading submission:', error);
        alert('Failed to download submission.');
    }
};

const resetGradeDialog = () => {
    setGrade('');
    setRemarks('');
    setMaxMarks(100);
    setSelectedSubmission(null);
};

const getSubmissionsByAssignment = () => {
    const grouped = {};
    submissions.forEach(assignment => {
        assignment.submissions.forEach(submission => {
            const key = assignment._id;
            if (!grouped[key]) {
                grouped[key] = {
                    assignment: assignment,
                    submissions: []
                };
            }
            grouped[key].submissions.push({
                ...submission,
                assignmentId: assignment._id,
                assignmentTitle: assignment.title,
                subject: assignment.subject
            });
        });
    });
    return grouped;
};

const groupedSubmissions = getSubmissionsByAssignment();

const getTotalStats = () => {
    let total = 0;
    let graded = 0;
    let pending = 0;

    Object.values(groupedSubmissions).forEach(({ submissions }) => {
        total += submissions.length;
        submissions.forEach(submission => {
            if (submission.grade !== undefined) {
                graded++;
            } else {
                pending++;
            }
        });
    });

    return { total, graded, pending };
};

const stats = getTotalStats();

return (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Student Submissions Management
            </Typography>
            <Button 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={refreshing}
            >
                {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
                    <Typography variant="body2">Total Submissions</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending}</Typography>
                    <Typography variant="body2">Pending Grading</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.graded}</Typography>
                    <Typography variant="body2">Graded</Typography>
                </Paper>
            </Grid>
        </Grid>

        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        ) : Object.keys(groupedSubmissions).length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
                <Typography variant="h6">No student submissions found</Typography>
                <Typography variant="body2">
                    Submissions will appear here once students submit their assignments.
                </Typography>
            </Alert>
        ) : (
            Object.values(groupedSubmissions).map(({ assignment, submissions }) => (
                <Accordion key={assignment._id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {assignment.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Subject: {assignment.subject.name} | Due: {moment(assignment.dueDate).format('MMM Do, YYYY')}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                    label={`${submissions.length} submissions`}
                                    color="primary"
                                    size="small"
                                />
                                <Chip 
                                    label={`${submissions.filter(s => s.grade !== undefined).length} graded`}
                                    color="success"
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student Details</TableCell>
                                        <TableCell>Submission Info</TableCell>
                                        <TableCell>Grade Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {submissions.map((submission) => (
                                        <TableRow key={submission._id} hover>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                        {submission.student.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Semester {submission.student.semester}
                                                    </Typography>
                                                    <br />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {submission.student.email}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    Submitted: {moment(submission.submittedAt).format('MMM Do, YYYY')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {moment(submission.submittedAt).format('h:mm A')} ({moment(submission.submittedAt).fromNow()})
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {submission.grade !== undefined ? (
                                                    <Box>
                                                        <Chip 
                                                            label={`${submission.grade}/${submission.maxMarks || 100}`}
                                                            color="success"
                                                            size="small"
                                                            sx={{ mb: 1 }}
                                                        />
                                                        {submission.remarks && (
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                "{submission.remarks}"
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Graded: {moment(submission.gradedAt).format('MMM Do, h:mm A')}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Chip 
                                                        label="Pending Grading"
                                                        color="warning"
                                                        size="small"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleDownloadSubmission(submission.assignmentId, submission._id)}
                                                        title="Download Submission"
                                                        size="small"
                                                    >
                                                        <Download />
                                                    </IconButton>
                                                    
                                                    <IconButton
                                                        color="secondary"
                                                        onClick={() => {
                                                            setSelectedSubmission(submission);
                                                            setGrade(submission.grade || '');
                                                            setRemarks(submission.remarks || '');
                                                            setMaxMarks(submission.maxMarks || 100);
                                                            setGradeDialogOpen(true);
                                                        }}
                                                        title="Grade Submission"
                                                        size="small"
                                                    >
                                                        <Grade />
                                                    </IconButton>
                                                    
                                                    <IconButton
                                                        color="info"
                                                        onClick={() => handleGenerateQuestions(submission)}
                                                        disabled={generatingQuestions}
                                                        title="Generate AI Questions"
                                                        size="small"
                                                    >
                                                        {generatingQuestions ? <CircularProgress size={16} /> : <Quiz />}
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))
        )}

        {/* Grade Submission Dialog */}
        <Dialog 
            open={gradeDialogOpen} 
            onClose={() => setGradeDialogOpen(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Grade Submission: {selectedSubmission?.student?.name}
                    </Typography>
                    <Chip 
                        label={selectedSubmission?.assignmentTitle}
                        color="primary"
                        size="small"
                    />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Student:</strong> {selectedSubmission?.student?.name} (Semester {selectedSubmission?.student?.semester})
                        </Typography>
                        <Typography variant="body2">
                            <strong>Submitted:</strong> {moment(selectedSubmission?.submittedAt).format('MMMM Do, YYYY [at] h:mm A')}
                        </Typography>
                    </Alert>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Grade"
                                type="number"
                                fullWidth
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                inputProps={{ min: 0, max: maxMarks }}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Maximum Marks"
                                type="number"
                                fullWidth
                                value={maxMarks}
                                onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                    </Grid>
                    
                    <TextField
                        label="Remarks & Feedback (Optional)"
                        multiline
                        rows={4}
                        fullWidth
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        sx={{ mt: 2 }}
                        placeholder="Enter detailed feedback, suggestions, or comments for the student..."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setGradeDialogOpen(false)}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleGradeSubmission}
                    variant="contained"
                    disabled={!grade || grading}
                >
                    {grading ? 'Saving Grade...' : 'Save Grade & Feedback'}
                </Button>
            </DialogActions>
        </Dialog>

        {/* AI Questions Dialog */}
        <Dialog 
            open={questionsDialogOpen} 
            onClose={() => setQuestionsDialogOpen(false)}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        AI Generated Questions for {selectedSubmission?.studentName}
                    </Typography>
                    <Chip 
                        label="AI Powered"
                        color="secondary"
                        size="small"
                    />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        These questions are automatically generated based on the student's submitted solution. 
                        Use them for oral examination, viva voce, or additional assessment.
                    </Typography>
                </Alert>
                
                {questions.map((question, index) => (
                    <Card key={index} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Question {index + 1}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label={question.difficulty} 
                                        color={question.difficulty === 'Easy' ? 'success' : 'warning'}
                                        size="small"
                                    />
                                    <Chip 
                                        label={question.estimatedTime} 
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>
                            
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                                {question.question}
                            </Typography>
                            
                            {question.expectedKeyPoints && question.expectedKeyPoints.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Expected Key Points:
                                    </Typography>
                                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                        {question.expectedKeyPoints.map((point, pointIndex) => (
                                            <Typography component="li" key={pointIndex} variant="body2" sx={{ mb: 0.5 }}>
                                                {point}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            
                            {question.rationale && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        <strong>Assessment Rationale:</strong> {question.rationale}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setQuestionsDialogOpen(false)} variant="outlined">
                    Close
                </Button>
                <Button 
                    onClick={() => {
                        setQuestionsDialogOpen(false);
                        setSelectedSubmission({...selectedSubmission});
                        setGradeDialogOpen(true);
                    }}
                    variant="contained"
                >
                    Grade This Submission
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
);
};

export default StudentSubmissions;