import React, { useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import companyLogo from '../image/logoimage.jpg';
import { Input } from 'antd';
import USER from '../image/himage3.jpg';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [Email, setEmail] = useState(localStorage.getItem('Email'));
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Track password visibility
  const { token } = useParams();

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const token = window.location.hash.substr(2);
      const response = await axios.post('http://localhost:3000/Users/updatePasswordWithToken', {
        Email: Email,
        Password: password,
        token: token,
      });

      if (response.status === 200) {
        setMessage('Password updated successfully');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to update password');
    }
  };


  return (

    <div>

      {/* Logo and company name */}
      <div style={{ alignItems: 'center', marginTop: '25px', width: '80%', position: 'relative' }}>
        <div className='logo' style={{ display: 'flex', alignItems: 'center', height: 'fit-content', width: '60%', margin: '2%', position: 'absolute' }}>
          <img src={companyLogo} alt="company-logo" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
          <div className="company-name">
            E-payment-system
            <div className="slogan">your trusted online payment system</div>
          </div>
        </div>
      </div>
      <div className='login-section'>
        <div className='login-box' style={{
          textAlign: 'right', width: '110PX'
        }}>
          <img src={USER} alt='login-icon' className='login-icon' style={{ width: '20PX' }}></img>
          <Link to="/login" className='login'>Login</Link>
        </div>
      </div>

      <form className='body' onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="password" style={labelStyle}>New Password:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input.Password
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handleChangePassword}
              required
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password:</label>
          <Input.Password type="password" id="confirmPassword" value={confirmPassword} onChange={handleChangeConfirmPassword} required style={inputStyle} />
        </div>
        <button type="submit" style={buttonStyle}>Reset Password</button>
      </form>
      {message && <p style={messageStyle}>{message}</p>}
      <p style={instructionStyle}>
        To update your password, enter a new password and confirm it in the fields above. Make sure the passwords match before submitting the form.
      </p>
    </div>
  );
};

export default UpdatePassword;

// Inline styles
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '300px',
  margin: '0 auto',
};

const labelStyle = {
  marginBottom: '5px',
};

const inputStyle = {
  padding: '0.5rem',
  marginBottom: '1rem',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const messageStyle = {
  marginTop: '1rem',
  padding: '0.5rem',
  backgroundColor: '#f8f8f8',
  border: '1px solid #ccc',
  borderRadius: '4px',
  textAlign: 'center',
  justifyContent: 'center',
};

const instructionStyle = {
  marginTop: '1rem',
  fontSize: '0.9rem',
  textAlign: 'center',
  color: '#555',
};