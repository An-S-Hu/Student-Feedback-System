import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      setSuccess('Registration successful! You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ maxWidth: 300, margin: '2rem auto' }}>
      <h2>Register</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <input name="department_id" value={form.department_id} onChange={handleChange} placeholder="Department ID" required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
      <button type="submit" style={{ width: '100%' }}>Register</button>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
    </form>
  );
}

export default Register; 