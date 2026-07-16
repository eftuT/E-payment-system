import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaEye, FaEyeSlash, FaUserCircle 
} from 'react-icons/fa';
import companyLogo from '../image/logoimage.jpg';
import paymentImage from '../image/payment.png';
import './LoginForm.css';

const UserLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    
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
      const response = await axios.post('http://localhost:3000/Users/login', {
        identifier: identifier,
        Password: password,
      });

      if (response.status === 200) {
        localStorage.setItem('isLoggedInUser', 'true');
        localStorage.setItem('userData', JSON.stringify(response.data.user || response.data));
        
        message.success('User logged in successfully');
        
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage('Invalid email or password format');
        } else if (error.response.status === 401) {
          setErrorMessage('Incorrect email or password');
        } else {
          setErrorMessage(error.response.data?.message || 'Login failed');
        }
        message.error(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        setErrorMessage('No response from server. Please try again.');
        message.error('No response from server. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
        message.error('An error occurred. Please try again.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <ToastContainer />
      
      <header className="login-header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src={companyLogo} 
              alt="company-logo" 
              className="company-logo spinning-logo" 
            />
            <div className="company-info">
              <h1>E-Payment-System</h1>
              <p className="slogan">your trusted online payment system</p>
            </div>
          </div>
          <nav className="header-nav">
            <Link to="/users" className="nav-link">
              Home
            </Link>
            <Link to="/aboutUs" className="nav-link">
             About Us
            </Link>
            <Link to="/contactUs" className="nav-link">
               Contact Us
            </Link>
          </nav>
        </div>
      </header>

      <main className="login-main">
        <div className="login-wrapper">
          <div className="login-image-side">
            <div className="image-content">
              <div className="image-overlay">
                <h2>E-payment System</h2>
                <p>The smart solution for seamless payment.</p>
                <img src={paymentImage} alt="Payment System" className="side-image" />
              </div>
            </div>
          </div>
          <div className="login-form-side">
            <div className="login-card">
              <div className="profile-icon-container">
                <FaUserCircle className="profile-icon" />
              </div>

              <div className="login-title-section">
                <h2 className="login-title">Log In</h2>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    USER EMAIL
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

                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}

                <div className="forgot-password">
                  <Link to="/users/resetpassword">Forgot Password?</Link>
                </div>

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

                <div className="login-footer">
                  <p className="register-link">
                    Don't have an account? <Link to="/signup">Register</Link>
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