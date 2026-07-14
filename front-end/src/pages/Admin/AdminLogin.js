import React, { useState } from 'react';
import { message } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaLock, FaEye, FaEyeSlash, FaUserCircle,
  FaShieldAlt, FaSignInAlt, FaHome, FaInfoCircle, FaEnvelope
} from 'react-icons/fa';
import companyLogo from '../../image/logoimage.jpg';
import adminImage from '../../image/payment.png';
import './AdminLogin.css';

const AdminLogin = () => {
  const [Identifier, setIdentifier] = useState('');
  const [Password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  // Removed: isLoggedIn state (not used)

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
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: Identifier, Password: Password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data && data.token) {
          if (data.user.Role === "Admin" || data.user.Role === "SuperAdmin") {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify(data));
            console.log('Admin logged in successfully');
            message.success('Admin logged in successfully');
            localStorage.setItem('isLoggedInAdmin', 'true');
            console.log(`${data.token},${data.user.id}`);
            console.log(localStorage.getItem('adminData'));
            console.log(localStorage.getItem('isLoggedInAdmin'));
            navigate(`/admin/dashboard/${data.user.id}`);
          } else if (data.user.Role !== 'Admin' && data.user.Role !== 'SuperAdmin') {
            setErrorMessage('You are not authorized to access the admin panel');
            message.error('You are not authorized to access the admin panel');
            console.error('Unauthorized access');
          }
        } else {
          setErrorMessage('Invalid server response');
          message.error('server error');
          console.error('Invalid server response:', data);
        }
      } else {
        setErrorMessage('Invalid username or password');
        message.error('Admin login failed');
        message.error('insert valid UserName and Password');
        console.error('Admin login failed:', data.error);
      }
    } catch (error) {
      setErrorMessage('An error occurred during admin login');
      message.error('An error occurred during admin login');
      console.error('An error occurred during admin login:', error);
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <ToastContainer />
      
      <header className="admin-login-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={companyLogo} alt="company-logo" className="company-logo" />
            <div className="company-info">
              <h1>E-Payment-System</h1>
              <p className="slogan">your trusted online payment system</p>
            </div>
          </div>
          
        </div>
      </header>

      <main className="admin-login-main">
        <div className="admin-login-wrapper">
          <div className="admin-login-image-side">
            <div className="image-content">
              <div className="image-overlay">
                <div className="admin-badge">
                  <FaShieldAlt className="shield-icon" />
                </div>
                <h2>Admin Portal</h2>
                <p>Secure access to the payment management system</p>
                <img src={adminImage} alt="Admin System" className="side-image" />
              </div>
            </div>
          </div>
          <div className="admin-login-form-side">
            <div className="admin-login-card">
              <div className="profile-icon-container">
                <FaUserCircle className="profile-icon" />
                <span className="admin-label">Admin</span>
              </div>

              <div className="login-title-section">
                <h2 className="login-title">Admin Login</h2>
              </div>

              <form onSubmit={handleSubmit} className="admin-login-form">
                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    USERNAME OR EMAIL
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="identifier"
                      type="text"
                      name="identifier"
                      value={Identifier}
                      onChange={handleIdentifierChange}
                      placeholder="Enter your username or email"
                      className={`form-input ${errorMessage ? 'error' : ''}`}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    PASSWORD
                  </label>
                  <div className="input-wrapper password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={Password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      className={`form-input ${errorMessage ? 'error' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}

                <div className="forgot-password">
                  <Link to="/admin/reset-password">Forgot Password?</Link>
                </div>

                <button
                  type="submit"
                  className="btn-submit admin-btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner">⟳</span> Logging in...
                    </>
                  ) : (
                    <>
                    Log In
                    </>
                  )}
                </button>

             
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;