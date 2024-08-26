import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from'react-router-dom';

const VerifyEmail = () => {
  const [formData, setFormData] = useState({
    email: '',
    verification_code: '',
  })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/verify-email', formData)
      setMessage(response.data.message)
      setFormData({ email: '', verification_code: '' })
      navigate('/login')

    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred during email verification');
    }
  };

  return (
    <div className="login-container">
      <h2>Verify Your Email</h2>
      <form className='login-form' onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor="verification_code">Verification Code:</label>
          <input
            type="text"
            id="verification_code"
            name="verification_code"
            value={formData.verification_code}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className='login-btn'>Verify Email</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default VerifyEmail;