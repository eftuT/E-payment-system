import React, { useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  FaUser, FaLock, FaEye, FaEyeSlash,
  FaUserPlus, FaHome, FaCamera, FaGenderless, FaTimes
} from 'react-icons/fa';
import { MdEmail, MdPerson, MdPhone, MdHome } from 'react-icons/md';
import companyLogo from '../image/logoimage.jpg';
import paymentImage from '../image/payment.png';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const getNextUserID = () => {
    const timestamp = Date.now().toString();
    const randomNumber = Math.floor(Math.random() * 10000).toString();
    return `P${timestamp}${randomNumber}`;
  };

  const [formData, setFormData] = useState({
    UserID: getNextUserID(),
    FirstName: '',
    LastName: '',
    Gender: '',
    UserName: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    PhoneNumber: '+251',
    Address: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateField = (name, value) => {
    const newErrors = {};

    switch (name) {
      case 'FirstName':
        if (!value) newErrors.FirstName = 'First Name is required';
        else if (!/^[A-Za-z]+$/.test(value)) newErrors.FirstName = 'Only letters allowed';
        break;
      case 'LastName':
        if (!value) newErrors.LastName = 'Last Name is required';
        else if (!/^[A-Za-z]+$/.test(value)) newErrors.LastName = 'Only letters allowed';
        break;
      case 'Gender':
        if (!value) newErrors.Gender = 'Gender is required';
        break;
      case 'UserName':
        if (!value) newErrors.UserName = 'User name is required';
        break;
      case 'Email':
        if (!value) newErrors.Email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) newErrors.Email = 'Email is invalid';
        break;
      case 'Password':
        if (!value) newErrors.Password = 'Password is required';
        else if (value.length < 8) newErrors.Password = 'Password must be at least 8 characters long';
        else if (!/\d/.test(value)) newErrors.Password = 'Must contain at least one digit';
        else if (!/[a-z]/.test(value)) newErrors.Password = 'Must contain at least one lowercase letter';
        else if (!/[A-Z]/.test(value)) newErrors.Password = 'Must contain at least one uppercase letter';
        else if (!/[^A-Za-z0-9]/.test(value)) newErrors.Password = 'Must contain at least one special character';
        break;
      case 'ConfirmPassword':
        if (!value) newErrors.ConfirmPassword = 'Confirm password is required';
        else if (value !== formData.Password) newErrors.ConfirmPassword = 'Passwords do not match';
        break;
      case 'PhoneNumber':
        if (!value) newErrors.PhoneNumber = 'Phone number is required';
        else if (!/^\+[0-9\s-()]+$/.test(value)) newErrors.PhoneNumber = 'Phone number is invalid';
        break;
      case 'Address':
        if (!value) newErrors.Address = 'Address is required';
        break;
      default:
        break;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClearErrors = () => {
    if (submitted) {
      setErrors({});
      setSubmitted(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'UserID') {
        const fieldError = validateField(key, formData[key]);
        Object.assign(newErrors, fieldError);
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUserExists = async (email) => {
    try {
      const response = await axios.get('http://localhost:3000/Users');
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data.some((user) => user.Email === email);
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.data)) {
          return data.data.some((user) => user.Email === email);
        }
        return data.Email === email;
      }
      return false;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  const checkUserNameExists = async (userName) => {
    try {
      const response = await axios.get('http://localhost:3000/Users');
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data.some((user) => user.UserName === userName);
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.data)) {
          return data.data.some((user) => user.UserName === userName);
        }
        return data.UserName === userName;
      }
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const checkPhoneNumberExists = async (phoneNumber) => {
    try {
      const response = await axios.get('http://localhost:3000/Users');
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data.some((user) => user.PhoneNumber === phoneNumber);
      } else if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.data)) {
          return data.data.some((user) => user.PhoneNumber === phoneNumber);
        }
        return data.PhoneNumber === phoneNumber;
      }
      return false;
    } catch (error) {
      console.error('Error checking phone number:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      const [emailExists, usernameExists, phoneExists] = await Promise.all([
        checkUserExists(formData.Email),
        checkUserNameExists(formData.UserName),
        checkPhoneNumberExists(formData.PhoneNumber)
      ]);

      const newErrors = {};
      if (emailExists) newErrors.Email = 'Email already exists';
      if (usernameExists) newErrors.UserName = 'Username already taken';
      if (phoneExists) newErrors.PhoneNumber = 'Phone number already exists';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      const submitData = {
        UserID: formData.UserID,
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        Gender: formData.Gender,
        UserName: formData.UserName,
        Password: formData.Password,
        PhoneNumber: formData.PhoneNumber,
        Email: formData.Email,
        Address: formData.Address,
        ProfilePhoto: profilePhotoPreview || null
      };

      const response = await axios.post('http://localhost:3000/Users', submitData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      message.success('Registered successfully!');
      localStorage.setItem('isLoggedInUser', 'true');
      localStorage.setItem('userData', JSON.stringify(response.data));
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="registration-container" onClick={handleClearErrors}>
      <ToastContainer />
      
      <header className="registration-header">
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

      <main className="registration-main">
        <div className="registration-wrapper">
          <div className="registration-image-side">
            <div className="image-content">
              <div className="image-overlay">
                <h2>E-payment System</h2>
                <p>The smart solution for seamless payment.</p>
              </div>
              <img src={paymentImage} alt="Payment System" className="side-image" />
            </div>
          </div>

          <div className="registration-form-side">
            <div className="registration-card">
              <div className="registration-title-section">
                <h2 className="registration-title">
                  <FaUserPlus className="title-icon" />
                  User Registration
                </h2>
                <p className="registration-subtitle">
                  Create your account for your easy payment
                </p>
              </div>

              <form onSubmit={handleSubmit} className="registration-form">
                <input
                  type="hidden"
                  name="UserID"
                  value={formData.UserID}
                />

                <div className="profile-upload-section">
                  <div className="profile-photo-container">
                    {profilePhotoPreview ? (
                      <>
                        <img 
                          src={profilePhotoPreview} 
                          alt="Profile" 
                          className="profile-photo-preview"
                        />
                        <button
                          type="button"
                          className="delete-photo-btn"
                          onClick={handleDeletePhoto}
                          title="Delete photo"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <div className="profile-photo-placeholder">
                        <FaUser className="placeholder-icon" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="upload-photo-btn"
                      onClick={triggerFileInput}
                    >
                      <FaCamera />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <p className="upload-hint">
                    {profilePhotoPreview ? 'CLICK X TO DELETE' : 'UPLOAD PROFILE PHOTO'}
                  </p>
                </div>

                <div className="form-fields">
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="FirstName">
                        <MdPerson className="input-icon" />
                        FIRST NAME <span className="required">*</span>
                      </label>
                      <input
                        id="FirstName"
                        type="text"
                        name="FirstName"
                        value={formData.FirstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="form-input"
                      />
                      {errors.FirstName && submitted && (
                        <div className="error-message">{errors.FirstName}</div>
                      )}
                    </div>

                    <div className="form-group half">
                      <label htmlFor="LastName">
                        <MdPerson className="input-icon" />
                        LAST NAME <span className="required">*</span>
                      </label>
                      <input
                        id="LastName"
                        type="text"
                        name="LastName"
                        value={formData.LastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="form-input"
                      />
                      {errors.LastName && submitted && (
                        <div className="error-message">{errors.LastName}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="UserName">
                        <FaUser className="input-icon" />
                        USERNAME <span className="required">*</span>
                      </label>
                      <input
                        id="UserName"
                        type="text"
                        name="UserName"
                        value={formData.UserName}
                        onChange={handleChange}
                        placeholder="Enter username"
                        className="form-input"
                      />
                      {errors.UserName && submitted && (
                        <div className="error-message">{errors.UserName}</div>
                      )}
                    </div>

                    <div className="form-group half">
                      <label htmlFor="Gender">
                        <FaGenderless className="input-icon" />
                        GENDER <span className="required">*</span>
                      </label>
                      <select
                        id="Gender"
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      {errors.Gender && submitted && (
                        <div className="error-message">{errors.Gender}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="Email">
                        <MdEmail className="input-icon" />
                        EMAIL <span className="required">*</span>
                      </label>
                      <input
                        id="Email"
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="Enter email"
                        className="form-input"
                      />
                      {errors.Email && submitted && (
                        <div className="error-message">{errors.Email}</div>
                      )}
                    </div>

                    <div className="form-group half">
                      <label htmlFor="PhoneNumber">
                        <MdPhone className="input-icon" />
                        PHONE <span className="required">*</span>
                      </label>
                      <input
                        id="PhoneNumber"
                        type="tel"
                        name="PhoneNumber"
                        value={formData.PhoneNumber}
                        onChange={handleChange}
                        placeholder="+251 XXX XXX XXX"
                        className="form-input"
                      />
                      {errors.PhoneNumber && submitted && (
                        <div className="error-message">{errors.PhoneNumber}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="Password">
                        <FaLock className="input-icon" />
                        PASSWORD <span className="required">*</span>
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          id="Password"
                          type={showPassword ? 'text' : 'password'}
                          name="Password"
                          value={formData.Password}
                          onChange={handleChange}
                          placeholder="Enter password"
                          className="form-input"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.Password && submitted && (
                        <div className="error-message">{errors.Password}</div>
                      )}
                    </div>

                    <div className="form-group half">
                      <label htmlFor="ConfirmPassword">
                        <FaLock className="input-icon" />
                        CONFIRM <span className="required">*</span>
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          id="ConfirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="ConfirmPassword"
                          value={formData.ConfirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          className="form-input"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.ConfirmPassword && submitted && (
                        <div className="error-message">{errors.ConfirmPassword}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="Address">
                      <MdHome className="input-icon" />
                      ADDRESS <span className="required">*</span>
                    </label>
                    <input
                      id="Address"
                      type="text"
                      name="Address"
                      value={formData.Address}
                      onChange={handleChange}
                      placeholder="Enter your residential address"
                      className="form-input"
                    />
                    {errors.Address && submitted && (
                      <div className="error-message">{errors.Address}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner">⟳</span> Registering...
                      </>
                    ) : (
                      <>
                        Register <FaUserPlus />
                      </>
                    )}
                  </button>
                </div>

                <div className="registration-footer">
                  <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
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

export default RegistrationForm;