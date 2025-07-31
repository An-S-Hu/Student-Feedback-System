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
  FormControl,
  CircularProgress,
  Grid,
  Divider,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { jwtDecode } from 'jwt-decode';

function Feedback() {
  const [form, setForm] = useState({ course_id: '', teacher_id: '', rating: '', comment: '', anonymous: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [addCourseName, setAddCourseName] = useState('');
  const [addTeacherName, setAddTeacherName] = useState('');
  const [addCourseMsg, setAddCourseMsg] = useState('');
  const [addTeacherMsg, setAddTeacherMsg] = useState('');

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
    setLoading(true);
    Promise.all([fetchCourses(), fetchTeachers()]).finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const errors = {};
    if (!form.course_id) errors.course_id = 'Course is required';
    if (!form.teacher_id) errors.teacher_id = 'Teacher is required';
    if (!form.rating) errors.rating = 'Rating is required';
    if (form.rating && (form.rating < 1 || form.rating > 5)) errors.rating = 'Rating must be between 1 and 5';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setFieldErrors({ ...fieldErrors, [name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/feedback', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Feedback submitted!');
      setForm({ course_id: '', teacher_id: '', rating: '', comment: '', anonymous: false });
    } catch (err) {
      const backendMsg = err.response?.data?.message || 'Submission failed';
      const backendDetail = err.response?.data?.error;
      const fullError = backendDetail ? `${backendMsg}: ${backendDetail}` : backendMsg;
      setError(fullError);
      if (backendMsg === 'Invalid token') {
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setAddCourseMsg('');
    if (!addCourseName.trim()) {
      setAddCourseMsg('Course name is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/feedback/courses', { name: addCourseName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddCourseMsg('Course added!');
      setAddCourseName('');
      // Refresh courses
      const res = await axios.get('http://localhost:5000/api/feedback/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      setAddCourseMsg('Failed to add course');
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setAddTeacherMsg('');
    if (!addTeacherName.trim()) {
      setAddTeacherMsg('Teacher name is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/feedback/teachers', { name: addTeacherName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddTeacherMsg('Teacher added!');
      setAddTeacherName('');
      // Refresh teachers
      const res = await axios.get('http://localhost:5000/api/feedback/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data);
    } catch (err) {
      setAddTeacherMsg('Failed to add teacher');
    }
  };

  const isAdmin = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const decoded = jwtDecode(token);
      return decoded.role === 'admin';
    } catch {
      return false;
    }
  })();

  const noCourses = !loading && courses.length === 0;
  const noTeachers = !loading && teachers.length === 0;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', py: 8 }}>
      <Container component="main" maxWidth="sm">
        {isAdmin && (
          <Box sx={{ mb: 3 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <AddCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Add New Course</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="form" onSubmit={handleAddCourse} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="Course Name"
                    value={addCourseName}
                    onChange={e => setAddCourseName(e.target.value)}
                    size="small"
                  />
                  <Button type="submit" variant="contained" color="primary">Add</Button>
                  {addCourseMsg && <Typography color={addCourseMsg.includes('added') ? 'success.main' : 'error'}>{addCourseMsg}</Typography>}
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <AddCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Add New Teacher</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="form" onSubmit={handleAddTeacher} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="Teacher Name"
                    value={addTeacherName}
                    onChange={e => setAddTeacherName(e.target.value)}
                    size="small"
                  />
                  <Button type="submit" variant="contained" color="primary">Add</Button>
                  {addTeacherMsg && <Typography color={addTeacherMsg.includes('added') ? 'success.main' : 'error'}>{addTeacherMsg}</Typography>}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
        <Paper elevation={8} sx={{ p: 4, borderRadius: 4, boxShadow: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <RateReviewIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 700, letterSpacing: 1 }}>
              Submit Feedback
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              We value your opinion! Please fill out the form below.
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Fade in={!!error}><div>{error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}</div></Fade>
          <Fade in={!!success}><div>{success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}</div></Fade>
          {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress size={40} /></Box> : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {noCourses && <Alert severity="warning" sx={{ mb: 2 }}>No courses available. Please contact admin.</Alert>}
              {noTeachers && <Alert severity="warning" sx={{ mb: 2 }}>No teachers available. Please contact admin.</Alert>}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!fieldErrors.course_id} sx={{ mb: 1 }} disabled={noCourses}>
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
                    {fieldErrors.course_id && <Typography color="error" variant="caption">{fieldErrors.course_id}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!fieldErrors.teacher_id} sx={{ mb: 1 }} disabled={noTeachers}>
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
                    {fieldErrors.teacher_id && <Typography color="error" variant="caption">{fieldErrors.teacher_id}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!fieldErrors.rating} sx={{ mb: 1 }}>
                    <InputLabel id="rating-label">Rating</InputLabel>
                    <Select
                      labelId="rating-label"
                      name="rating"
                      value={form.rating}
                      label="Rating"
                      onChange={handleChange}
                    >
                      {[1, 2, 3, 4, 5].map(r => (
                        <MenuItem key={r} value={r}>{r}</MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary">1 = Poor, 5 = Excellent</Typography>
                    {fieldErrors.rating && <Typography color="error" variant="caption">{fieldErrors.rating}</Typography>}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="normal"
                    fullWidth
                    name="comment"
                    label="Comment (optional)"
                    multiline
                    minRows={3}
                    value={form.comment}
                    onChange={handleChange}
                    sx={{ mb: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
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
                    sx={{ mb: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, fontWeight: 600, fontSize: 18, letterSpacing: 1 }}
                    disabled={submitting || noCourses || noTeachers}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Submit'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Feedback; 