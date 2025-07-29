import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
  Paper,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';

function Feedback() {
  const [form, setForm] = useState({ course_id: '', teacher_id: '', rating: '', comment: '', anonymous: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/feedback/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load courses');
      }
    };
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/feedback/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeachers(res.data);
      } catch (err) {
        setError('Failed to load teachers');
      }
    };
    fetchCourses();
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/feedback', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Feedback submitted!');
    } catch (err) {
      const backendMsg = err.response?.data?.message || 'Submission failed';
      const backendDetail = err.response?.data?.error;
      const fullError = backendDetail ? `${backendMsg}: ${backendDetail}` : backendMsg;
      setError(fullError);
      // If token is invalid, log out and redirect
      if (backendMsg === 'Invalid token') {
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={6} sx={{ mt: 8, p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Submit Feedback
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel id="course-label">Course</InputLabel>
              <Select
                labelId="course-label"
                name="course_id"
                value={form.course_id}
                label="Course"
                onChange={handleChange}
              >
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel id="teacher-label">Teacher</InputLabel>
              <Select
                labelId="teacher-label"
                name="teacher_id"
                value={form.teacher_id}
                label="Teacher"
                onChange={handleChange}
              >
                {teachers.map(teacher => (
                  <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="rating"
              label="Rating (1-5)"
              type="number"
              inputProps={{ min: 1, max: 5 }}
              value={form.rating}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="comment"
              label="Comment"
              multiline
              minRows={3}
              value={form.comment}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="anonymous"
                  checked={form.anonymous}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Submit as anonymous"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Feedback; 