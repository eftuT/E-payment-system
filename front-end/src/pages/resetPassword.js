import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaArrowRight, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { MdEmail, MdLock } from 'react-icons/md';
import companyLogo from '../image/logoimage.jpg';
import Header from './Header';
import './ResetPassword.css';

const ResetPasswordForm = () => {
  const [Email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!Email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3000/Users/requestPasswordReset', { Email: Email });
      setMessage(response.data.message || 'Password reset email sent successfully!');
      setSuccess(true);
      localStorage.setItem('Email', Email);
      console.log(Email);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Failed to send reset email. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-container">
      <Header />

      <main className="rp-main">
        <div className="rp-card">
          {/* Header */}
          <div className="rp-card-header">
            <div className="rp-header-icon">
              <MdLock />
            </div>
            <h1>Reset Password</h1>
            <p>Enter your email to receive reset instructions</p>
          </div>

          <div className="rp-card-body">
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="rp-input-group">
                <label htmlFor="Email">
                  <MdEmail className="rp-input-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="Email"
                  value={Email}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  className={`rp-input ${message && !success ? 'error' : ''} ${success ? 'success' : ''}`}
                  required
                />
                <p className="rp-input-hint">
                  We'll send a password reset link to this email
                </p>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`rp-message ${success ? 'success' : 'error'}`}>
                  {success ? <FaCheckCircle className="rp-message-icon" /> : null}
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="rp-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="rp-spinner">⏳</span>
                ) : (
                  <>
                    Send Reset Link <FaArrowRight />
                  </>
                )}
              </button>
            </form>

          
          </div>

          {/* Footer */}
          <div className="rp-card-footer">
            <span>Remember your password?</span>
            <a href="/login">Back to Login</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordForm;