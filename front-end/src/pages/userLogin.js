import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser, FaLock, FaSignInAlt, FaHome, FaEye, FaEyeSlash, FaUserCircle
} from 'react-icons/fa';
import companyLogo from '../image/logoimage.jpg';
import paymentImage from '../image/payment.png';
import './LoginForm.css';

const UserLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedIsLoggedInUser = localStorage.getItem('isLoggedInUser');
    setIsLoggedInUser(storedIsLoggedInUser === 'true');
  }, []);

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    setErrorMessage('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Using your original working API endpoint
      const response = await axios.post('http://localhost:3000/Users/login', {
        identifier: identifier,
        Password: password,
      });

      console.log('Login response:', response);

      if (response.status === 200) {
        setIsLoggedInUser(true);
        localStorage.setItem('isLoggedInUser', 'true');
        localStorage.setItem('userData', JSON.stringify(response.data.user || response.data));
        
        toast.success('🎉 Login successful!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        
        message.success('User logged in successfully');
        console.log('User logged in successfully');
        
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('An error occurred during User login:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 400) {
          setErrorMessage('Invalid email or password format');
        } else if (error.response.status === 401) {
          setErrorMessage('Incorrect email or password');
        } else {
          setErrorMessage(error.response.data?.message || 'Login failed');
        }
        message.error(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        // The request was made but no response was received
        setErrorMessage('No response from server. Please try again.');
        message.error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request
        setErrorMessage('An error occurred. Please try again.');
        message.error('An error occurred. Please try again.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <ToastContainer />
      
      {/* Header */}
      <header className="login-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={companyLogo} alt="company-logo" className="company-logo" />
            <div className="company-info">
              <h1>E-Payment-System</h1>
              <p className="slogan">your trusted online payment system</p>
            </div>
          </div>
          <nav className="header-nav">
            <Link to="/users" className="nav-link">
              <FaHome /> Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-wrapper">
          {/* Left Side - Image */}
          <div className="login-image-side">
            <div className="image-content">
              <img src={paymentImage} alt="Payment System" className="side-image" />
              <div className="image-overlay">
                <h2>Device Entry Portal</h2>
                <p>The smart solution for seamless device entry and secure exit management.</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-form-side">
            <div className="login-card">
              {/* Profile Icon */}
              <div className="profile-icon-container">
                <FaUserCircle className="profile-icon" />
              </div>

              <div className="login-title-section">
                <h2 className="login-title">Log In</h2>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {/* Email/Username Field */}
                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    EMPLOYEE EMAIL
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    name="identifier"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder="Enter your email or username"
                    className={`form-input ${errorMessage ? 'error' : ''}`}
                  />
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    PASSWORD
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      className={`form-input ${errorMessage ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}

                {/* Forgot Password Link */}
                <div className="forgot-password">
                  <Link to="/reset-password">Forgot Password?</Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner">⟳</span> Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>

                {/* Register Link */}
                <div className="login-footer">
                  <p className="register-link">
                    Don't have an account? <Link to="/signup">register</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserLogin;