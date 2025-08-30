import React, { useState } from 'react';
import { Box, Button, Paper, Typography, TextField, Chip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [solution, setSolution] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const paperType = 'Assignment';

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/msword' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        setFile(selectedFile);
        setError('');
    } else {
        setError('Please upload a .doc or .docx file.');
    }
  };

  const handleUpload = async () => {
    if (!file || !paperTitle) {
        setError('Please select a file and enter a title.');
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
        formData.append('paperTitle', paperTitle);

        const response = await api.post('/solver/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const responseData = response.data;
        console.log("API Response Data:", responseData);

        if (responseData && responseData.solution && responseData.download_url) {
            setSolution(responseData.solution);
            setDownloadUrl(responseData.download_url);
            setError('');
        } else {
            setError('Failed to get a valid solution and download link from the server.');
        }
    } catch (err) {
        console.error('Upload error:', err);
        const errorMessage = err.response?.data?.error || 'Network error. Please try again.';
        setError(errorMessage);
    } finally {
        setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      // Use the api instance which includes the auth token
      const response = await api.get(downloadUrl, {
        responseType: 'blob', // Crucial for file downloads
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadUrl.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download the file. Please check your connection and try again.');
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 700, margin: 'auto', mt: 4, bgcolor: 'background.default', borderRadius: '16px' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Assignment Solver
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Get AI-powered assistance with your assignments.
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Enter your assignment title"
        value={paperTitle}
        onChange={(e) => setPaperTitle(e.target.value)}
        margin="normal"
      />

      <DropzoneContainer sx={{ mt: 2, mb: 2 }}>
        <input
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
            Select File
          </Button>
        </label>
        {file && <Chip label={file.name} onDelete={() => setFile(null)} sx={{ mt: 2 }} />}
      </DropzoneContainer>

      {error && <Typography color="error" sx={{ my: 2 }}>{error}</Typography>}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={uploading || !file || !paperTitle}
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        {uploading ? <CircularProgress size={24} color="inherit" /> : 'Generate Solution'}
      </Button>

      {solution && (
        <Paper sx={{ p: 3, mt: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" gutterBottom>Solution</Typography>
          <ReactMarkdown>{solution}</ReactMarkdown>
          {downloadUrl && (
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
              sx={{ mt: 2 }}
            >
              Download Enhanced Document
            </Button>
          )}
        </Paper>
      )}
    </Paper>
  );
};

export default AssignmentSolver;
