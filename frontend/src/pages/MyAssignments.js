import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Download,
  Visibility,
  Assignment as AssignmentIcon,
  Schedule,
  Upload,
  Grade,
} from "@mui/icons-material";
import Layout from "../components/common/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import moment from "moment";

const MyAssignments = ({ toggleTheme }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;
      console.log("MyAssignments - Fetching assignments for user:", {
        id: user._id,
        name: user.name,
        role: user.role,
        semester: user.semester,
        division: user.division,
      });

      setLoading(true);
      try {
        const { data } = await api.get("/assignments");
        console.log("MyAssignments - Raw assignments received:", data);
        console.log("MyAssignments - Number of assignments:", data.length);

        // Add submission status to each assignment
        const assignmentsWithStatus = data.map((assignment) => {
          const userSubmission = assignment.submissions?.find(
            (sub) => sub.student._id === user._id || sub.student === user._id
          );
          return {
            ...assignment,
            userSubmission,
            isSubmitted: !!userSubmission,
            isGraded: userSubmission?.grade !== undefined,
          };
        });

        console.log(
          "MyAssignments - Processed assignments:",
          assignmentsWithStatus.length
        );
        setAssignments(assignmentsWithStatus);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
      setLoading(false);
    };

    fetchAssignments();
  }, [user]);

  const handleDownloadFile = async (assignment) => {
    try {
      console.log("Downloading assignment file:", assignment.fileUrl);
      const response = await api.get(
        `/assignments/download/${assignment._id}`,
        {
          responseType: "blob",
        }
      );

      // Get filename from Content-Disposition header or create one
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${assignment.title.replace(/[^a-zA-Z0-9]/g, "_")}_Assignment.docx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Create blob with proper MIME type
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again or contact support.");
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile || !selectedAssignment) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post(
        `/submissions/assignments/${selectedAssignment._id}/submit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Refresh assignments to show updated submission status
      const { data } = await api.get("/assignments");
      const assignmentsWithStatus = data.map((assignment) => {
        const userSubmission = assignment.submissions?.find(
          (sub) => sub.student._id === user._id || sub.student === user._id
        );
        return {
          ...assignment,
          userSubmission,
          isSubmitted: !!userSubmission,
          isGraded: userSubmission?.grade !== undefined,
        };
      });
      setAssignments(assignmentsWithStatus);

      setSubmissionDialogOpen(false);
      setSelectedFile(null);
      alert("Assignment submitted successfully!");
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment. Please try again.");
    }
    setSubmitting(false);
  };

  const handleViewTextAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setTextDialogOpen(true);
  };

  const getDueStatus = (dueDate) => {
    const now = moment();
    const due = moment(dueDate);
    const diffDays = due.diff(now, "days");
    const diffHours = due.diff(now, "hours");

    if (diffDays < 0) {
      return { label: "Overdue", color: "error" };
    } else if (diffHours <= 24) {
      return { label: "Due Soon", color: "warning" };
    } else if (diffDays <= 3) {
      return { label: "Due This Week", color: "info" };
    } else {
      return { label: "Active", color: "success" };
    }
  };

  const getSubmissionStatus = (assignment) => {
    if (assignment.isGraded) {
      return {
        text: `Graded (${assignment.userSubmission.grade}/${
          assignment.userSubmission.maxMarks || 100
        })`,
        color: "success",
      };
    } else if (assignment.isSubmitted) {
      return { text: "Submitted", color: "info" };
    } else if (moment(assignment.dueDate).isBefore(moment())) {
      return { text: "Not Submitted", color: "error" };
    } else {
      return { text: "Pending", color: "warning" };
    }
  };

  const upcomingAssignments = assignments
    .filter(
      (assignment) =>
        moment(assignment.dueDate).isAfter(moment()) || !assignment.isSubmitted
    )
    .sort((a, b) => moment(a.dueDate).diff(moment(b.dueDate)));

  const pastAssignments = assignments
    .filter(
      (assignment) =>
        moment(assignment.dueDate).isBefore(moment()) && assignment.isSubmitted
    )
    .sort((a, b) => moment(b.dueDate).diff(moment(a.dueDate)));

  const AssignmentCard = ({ assignment, isPast = false }) => {
    const dueStatus = getDueStatus(assignment.dueDate);
    const submissionStatus = getSubmissionStatus(assignment);

    return (
      <Card
        sx={{ mb: 2, bgcolor: isPast ? "action.hover" : "background.paper" }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
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
                  Type: File Assignment
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              <Chip
                label={dueStatus.label}
                size="small"
                color={dueStatus.color}
              />
              <Chip
                label={submissionStatus.text}
                size="small"
                color={submissionStatus.color}
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Due:{" "}
            {moment(assignment.dueDate).format("MMMM Do, YYYY [at] h:mm A")}
            {isPast && ` (${moment(assignment.dueDate).fromNow()})`}
          </Typography>

          {assignment.description && (
            <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
              {assignment.description}
            </Typography>
          )}

          {/* Show grades and remarks if graded */}
          {assignment.isGraded && (
            <Box
              sx={{ mb: 2, p: 2, bgcolor: "success.light", borderRadius: 1 }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                <Grade sx={{ mr: 1, verticalAlign: "middle" }} />
                Grade: {assignment.userSubmission.grade}/
                {assignment.userSubmission.maxMarks || 100}
              </Typography>
              {assignment.userSubmission.remarks && (
                <Typography variant="body2">
                  <strong>Faculty Remarks:</strong>{" "}
                  {assignment.userSubmission.remarks}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Graded on:{" "}
                {moment(assignment.userSubmission.gradedAt).format(
                  "MMMM Do, YYYY [at] h:mm A"
                )}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {assignment.assignmentType === "text" ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => handleViewTextAssignment(assignment)}
              >
                View Content
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

            {/* Submit Assignment Button */}
            {!assignment.isSubmitted && !isPast && (
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setSubmissionDialogOpen(true);
                }}
                size="small"
                color="primary"
              >
                Submit Solution
              </Button>
            )}

            {/* Resubmit Button */}
            {assignment.isSubmitted && !assignment.isGraded && !isPast && (
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setSubmissionDialogOpen(true);
                }}
                size="small"
                color="warning"
              >
                Resubmit
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout toggleTheme={toggleTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          py: 4,
          px: { xs: 1, md: 4 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <AssignmentIcon sx={{ mr: 2, color: "primary.main" }} />
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "primary.main", fontWeight: "bold" }}
          >
            My Assignments
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Upcoming Assignments */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: "16px", mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                Upcoming Assignments ({upcomingAssignments.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
                {upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                    />
                  ))
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    No upcoming assignments found.
                    {assignments.length === 0
                      ? " No assignments available for your semester/division."
                      : " All assignments are past due."}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "16px",
                mb: 3,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Assignment Overview
              </Typography>
              <Divider sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)" }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Total Assignments:</Typography>
                  <Typography fontWeight="bold">
                    {assignments.length}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Submitted:</Typography>
                  <Typography fontWeight="bold">
                    {assignments.filter((a) => a.isSubmitted).length}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Graded:</Typography>
                  <Typography fontWeight="bold">
                    {assignments.filter((a) => a.isGraded).length}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Pending:</Typography>
                  <Typography fontWeight="bold">
                    {
                      assignments.filter(
                        (a) =>
                          !a.isSubmitted && moment(a.dueDate).isAfter(moment())
                      ).length
                    }
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Past Assignments */}
            <Paper sx={{ p: 3, borderRadius: "16px" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Past Assignments ({pastAssignments.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: "40vh", overflow: "auto" }}>
                {pastAssignments.length > 0 ? (
                  pastAssignments
                    .slice(0, 5)
                    .map((assignment) => (
                      <AssignmentCard
                        key={assignment._id}
                        assignment={assignment}
                        isPast={true}
                      />
                    ))
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">{selectedAssignment?.title}</Typography>
              <Chip
                label={`Due: ${moment(selectedAssignment?.dueDate).format(
                  "MMM Do, h:mm A"
                )}`}
                color={getDueStatus(selectedAssignment?.dueDate).color}
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Subject: {selectedAssignment?.subject?.name} | Faculty:{" "}
              {selectedAssignment?.faculty?.name}
            </Typography>
            {selectedAssignment?.description && (
              <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
                {selectedAssignment.description}
              </Typography>
            )}
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
            >
              {selectedAssignment?.content}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTextDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Submission Dialog */}
        <Dialog
          open={submissionDialogOpen}
          onClose={() => setSubmissionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Submit Assignment: {selectedAssignment?.title}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your solution file (DOCX format only)
              </Typography>

              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />

              {selectedFile && (
                <Alert
                  severity={
                    selectedFile.name.toLowerCase().endsWith(".docx")
                      ? "success"
                      : "error"
                  }
                  sx={{ mt: 2 }}
                >
                  {selectedFile.name.toLowerCase().endsWith(".docx")
                    ? `Selected file: ${selectedFile.name}`
                    : "Please select a .docx file only"}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAssignment}
              variant="contained"
              disabled={!selectedFile || submitting || !selectedFile.name.toLowerCase().endsWith('.docx')}
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default MyAssignments;
