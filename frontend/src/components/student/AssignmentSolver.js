import React, { useState } from 'react';
import { 
    Box, Button, Paper, Typography, TextField, Chip, CircularProgress, 
    FormControl, InputLabel, Select, MenuItem, Alert, Divider 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ReactMarkdown from 'react-markdown';
import api from '../../api/api';

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.3s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const AssignmentSolver = () => {
  const [file, setFile] = useState(null);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperType, setPaperType] = useState('Assignment');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [solution, setSolution] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const documentTypes = [
    'Assignment',
    'Question Paper',
    'Research Paper',
    'Case Study',
    'Project Report',
    'Quiz'
  ];

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (
        selectedFile.type === 'application/msword' || 
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )) {
        setFile(selectedFile);
        setError('');
    } else {
        setError('Please upload a .doc or .docx file.');
    }
  };

  const handleUpload = async () => {
    if (!file || !paperTitle.trim() || !paperType) {
        setError('Please select a file, enter a title, and select document type.');
        return;
    }

    setUploading(true);
    setError('');
    setSolution('');
    setDownloadUrl('');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('paperType', paperType);
        formData.append('paperTitle', paperTitle.trim());

        console.log('Uploading:', {
            filename: file.name,
            paperType,
            paperTitle: paperTitle.trim()
        });

        // Fix: Change from '/solver/upload' to '/solver/process'
        const response = await api.post('/solver/process', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const responseData = response.data;
        console.log("AI Solution Response:", responseData);

        if (responseData && responseData.solution && responseData.download_url) {
            setSolution(responseData.solution);
            setDownloadUrl(responseData.download_url);
            setError('');
        } else {
            setError('Failed to get a valid solution and download link from the server.');
        }

    } catch (err) {
        console.error('Upload error:', err);
        let errorMessage = 'Network error. Please try again.';
        
        if (err.response?.status === 503) {
            errorMessage = 'AI service is temporarily overloaded. Please wait 2-3 minutes and try again.';
        } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
        }
        
        setError(errorMessage);
    } finally {
        setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      const response = await api.get(downloadUrl, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename based on paper type and title
      const filename = `${paperType.replace(' ', '_')}_${paperTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Solution.docx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download the file. Please check your connection and try again.');
    }
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      'Assignment': 'Get step-by-step solutions for homework and assignments',
      'Question Paper': 'Complete solutions for exam question papers',
      'Research Paper': 'Enhanced research papers with proper formatting and citations',
      'Lab Report': 'Comprehensive lab reports with calculations and analysis',
      'Case Study': 'Detailed case study analysis with recommendations',
      'Project Report': 'Professional project documentation and reports',
      'Quiz': 'Quick solutions for quiz questions',
      'Exam': 'Detailed exam paper solutions with explanations'
    };
    return descriptions[type] || 'AI-powered document processing';
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto', mt: 4, bgcolor: 'background.default', borderRadius: '16px' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <AutoFixHighIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          AI Assignment Solver
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Upload your academic documents and get comprehensive AI-powered solutions
        </Typography>
      </Box>

      {/* Document Type Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="paper-type-label">Document Type</InputLabel>
        <Select
          labelId="paper-type-label"
          value={paperType}
          label="Document Type"
          onChange={(e) => setPaperType(e.target.value)}
        >
          {documentTypes.map((type) => (
            <MenuItem key={type} value={type}>
              <Box>
                <Typography variant="body1">{type}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTypeDescription(type)}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Title Input */}
      <TextField
        fullWidth
        label={`Enter your ${paperType.toLowerCase()} title`}
        value={paperTitle}
        onChange={(e) => setPaperTitle(e.target.value)}
        margin="normal"
        placeholder={`e.g., ${paperType === 'Assignment' ? 'Data Structures Assignment 1' : 
                              paperType === 'Lab Report' ? 'Chemistry Lab - Acid-Base Titration' :
                              paperType === 'Case Study' ? 'Business Strategy Case Analysis' :
                              `${paperType} Title`}`}
        sx={{ mb: 3 }}
      />

      {/* File Upload */}
      <DropzoneContainer sx={{ mb: 3 }}>
        <input
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Box sx={{ cursor: 'pointer' }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Select Document File
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload .doc or .docx files (Max 10MB)
            </Typography>
          </Box>
        </label>
      </DropzoneContainer>

      {file && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Chip 
            label={file.name} 
            onDelete={() => setFile(null)} 
            color="primary"
            sx={{ maxWidth: '100%' }}
          />
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upload Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={uploading || !file || !paperTitle.trim()}
        fullWidth
        size="large"
        sx={{ 
          mt: 2, 
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
        startIcon={uploading ? <CircularProgress size={24} color="inherit" /> : <AutoFixHighIcon />}
      >
        {uploading ? `Processing ${paperType}...` : `Generate ${paperType} Solution`}
      </Button>

      {/* Solution Display */}
      {solution && (
        <Paper sx={{ p: 4, mt: 4, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              AI Solution
            </Typography>
            {downloadUrl && (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
              >
                Download Solution Document
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ 
            '& h1, & h2, & h3': { color: 'primary.main', fontWeight: 'bold' },
            '& code': { bgcolor: 'action.hover', p: 0.5, borderRadius: 1 },
            '& pre': { bgcolor: 'action.hover', p: 2, borderRadius: 1, overflow: 'auto' },
            '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, fontStyle: 'italic' }
          }}>
            <ReactMarkdown>{solution}</ReactMarkdown>
          </Box>
        </Paper>
      )}
    </Paper>
  );
};

export default AssignmentSolver;
