import React, { useState } from 'react';
import axios from 'axios';

function Feedback() {
  const [form, setForm] = useState({ course_id: '', teacher_id: '', rating: '', comment: '', anonymous: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Submit Feedback</h2>
      <input name="course_id" value={form.course_id} onChange={handleChange} placeholder="Course ID" required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="teacher_id" value={form.teacher_id} onChange={handleChange} placeholder="Teacher ID" required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="rating" type="number" min="1" max="5" value={form.rating} onChange={handleChange} placeholder="Rating (1-5)" required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Comment" style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <label style={{ display: 'block', marginBottom: 10 }}>
        <input name="anonymous" type="checkbox" checked={form.anonymous} onChange={handleChange} /> Anonymous
      </label>
      <button type="submit" style={{ width: '100%' }}>Submit</button>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
    </form>
  );
}

export default Feedback; 