import React, { useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { MdLock, MdLockOpen } from 'react-icons/md';
import Header from './Header';
import './UpdatePassword.css';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [Email, setEmail] = useState(localStorage.getItem('Email') || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setMessage('');
  };

  const handleChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    setMessage('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setSuccess(false);
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setSuccess(false);
      return;
    }

    setLoading(true);

    try {
      const tokenFromUrl = window.location.hash.substr(2) || token;
      const response = await axios.post('http://localhost:3000/Users/updatePasswordWithToken', {
        Email: Email,
        Password: password,
        token: tokenFromUrl,
      });

      if (response.status === 200) {
        setMessage('Password updated successfully!');
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
        localStorage.removeItem('Email');
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Failed to update password. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="up-container">
      <Header />

      <main className="up-main">
        <div className="up-card">
          {/* Header */}
          <div className="up-card-header">
            <div className="up-header-icon">
              <FaLock />
            </div>
            <h1>Set New Password</h1>
            <p>Create a strong password for your account</p>
          </div>

          <div className="up-card-body">
            <form onSubmit={handleSubmit}>
              {/* Password Input */}
              <div className="up-input-group">
                <label htmlFor="password">
                  <MdLock className="up-input-icon" />
                  New Password
                </label>
                <div className="up-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handleChangePassword}
                    placeholder="Enter your new password"
                    className={`up-input ${message && !success ? 'error' : ''} ${success ? 'success' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="up-password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="up-input-hint">Minimum 8 characters with numbers and letters</p>
              </div>

              {/* Confirm Password Input */}
              <div className="up-input-group">
                <label htmlFor="confirmPassword">
                  <MdLockOpen className="up-input-icon" />
                  Confirm Password
                </label>
                <div className="up-password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChangeConfirmPassword}
                    placeholder="Confirm your new password"
                    className={`up-input ${message && !success ? 'error' : ''} ${success ? 'success' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="up-password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="up-strength">
                  <div className="up-strength-bar">
                    <div 
                      className="up-strength-fill"
                      style={{ 
                        width: `${Math.min((password.length / 12) * 100, 100)}%`,
                        backgroundColor: password.length < 6 ? '#ef4444' : 
                                       password.length < 10 ? '#f59e0b' : '#22c55e'
                      }}
                    />
                  </div>
                  <span className="up-strength-text">
                    {password.length < 6 ? 'Weak' : 
                     password.length < 10 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`up-message ${success ? 'success' : 'error'}`}>
                  {success && <FaCheckCircle className="up-message-icon" />}
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="up-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="up-spinner">⏳</span>
                ) : (
                  <>
                    <FaShieldAlt /> Update Password
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="up-footer">
              <Link to="/login" className="up-back-link">
                <FaArrowLeft /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdatePassword;