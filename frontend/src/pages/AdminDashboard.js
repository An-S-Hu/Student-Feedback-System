import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

function AdminDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analytics, setAnalytics] = useState(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load feedback');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalytics(null);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Example: get analytics for all courses (could be improved)
      // Here, just get analytics for the first course if exists
      if (feedback.length > 0) {
        const courseId = feedback[0].course_id;
        const res = await axios.get(`http://localhost:5000/api/feedback/course/${courseId}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data);
      }
    } catch (err) {
      setError('Failed to load analytics');
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    if (feedback.length > 0) fetchAnalytics();
  }, [feedback]);

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Feedback deleted');
      setFeedback(feedback.filter(fb => fb.id !== id));
    } catch (err) {
      setError('Failed to delete feedback');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Admin Dashboard
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
          {loading ? <CircularProgress /> : (
            <>
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Comment</TableCell>
                      <TableCell>Sentiment</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedback.map(fb => (
                      <TableRow key={fb.id}>
                        <TableCell>{fb.id}</TableCell>
                        <TableCell>{fb.course_name}</TableCell>
                        <TableCell>{fb.teacher_name}</TableCell>
                        <TableCell>{fb.student_name}</TableCell>
                        <TableCell>{fb.rating}</TableCell>
                        <TableCell>{fb.comment}</TableCell>
                        <TableCell>{fb.sentiment}</TableCell>
                        <TableCell>{new Date(fb.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button color="error" variant="contained" size="small" onClick={() => handleDelete(fb.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {analytics && (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="h6">Analytics (for course: {feedback[0]?.course_name})</Typography>
                  <Typography>Average Rating: {typeof analytics.avg_rating === 'number' ? analytics.avg_rating.toFixed(2) : 'N/A'}</Typography>
                  <Typography>Total Feedback: {analytics.total_feedback}</Typography>
                  <Typography>Sentiments:</Typography>
                  <ul>
                    {analytics.sentiments?.map(s => (
                      <li key={s.sentiment}>{s.sentiment}: {s.count}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default AdminDashboard; 