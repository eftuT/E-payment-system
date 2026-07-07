import React, { useState } from 'react';
import axios from 'axios';
import companyLogo from '../image/logoimage.jpg';

const ResetPasswordForm = () => {
  const [Email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/Users/requestPasswordReset', { Email: Email });
      setMessage(response.data.message);
      localStorage.setItem('Email',Email);
      console.log(Email);
      console.log(localStorage.getItem('Email'));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className='logo' style={{ display: 'flex', alignItems: 'center', height: 'fit-content', width: '60%', margin: '2%', position: 'absolute' }}>
        <img src={companyLogo} alt="company-logo" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
        <div className="company-name">
          E-payment-system
          <div className="slogan">your trusted online payment system</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="Email" style={labelStyle}>Email:</label>
          <input type="Email" id="Email" value={Email} onChange={handleChange} required style={inputStyle} />
        </div>
        <button type="submit" style={buttonStyle}>Send Email</button>
      </form>
      {message && <p style={messageStyle}>{message}</p>}
      <p style={instructionStyle}>
          If the provided email is associated with an account, you will receive an email with instructions on how to reset your password.
        </p>
    </div>
  );
};

export default ResetPasswordForm;

// Inline styles
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '300px',
  margin: '0 auto',
};

const labelStyle = {
  marginBottom: '0.5rem',
};

const inputStyle = {
  padding: '0.5rem',
  marginBottom: '1rem',
  marginTop: '12rem',
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
  textAlign:'center',
  justifyContent:'center',
};

const instructionStyle = {
  marginTop: '1rem',
  fontSize: '0.9rem',
  textAlign: 'center',
  color: '#555',
};