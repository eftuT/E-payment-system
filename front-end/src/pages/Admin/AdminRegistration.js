import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined
} from '@ant-design/icons';
import { Layout, Button, message, Form, Input, Select, Spin } from 'antd';
import { FaUserPlus, FaUserCog, FaVenusMars, FaCamera, FaTimes, FaUser } from 'react-icons/fa';
import Dashboard from './Dashboard';
import './AdminRegistration.css';

const { Option } = Select;

const AdminRegistrationForm = ({ addActivity }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const getNextUserID = () => {
    const timestamp = Date.now().toString();
    const randomNumber = Math.floor(Math.random() * 10000).toString();
    return `P${timestamp}${randomNumber}`;
  };

  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    UserID: getNextUserID(),
    FirstName: '',
    LastName: '',
    Gender: '',
    UserName: '',
    Password: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
    Role: 'Admin',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
        message.error('Please login to access the dashboard');
      }, 5000);
    } else {
      setIsLoading(false);
    }
    localStorage.setItem('selectedMenu', 6);
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        message.error('Invalid file type. Please select an image file (JPEG, JPG, PNG, GIF).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setProfilePhotoFile(file);
      setFormData((prevData) => ({
        ...prevData,
        ProfilePicture: file,
      }));
      if (errors.ProfilePicture) {
        setErrors((prev) => ({ ...prev, ProfilePicture: '' }));
      }
    }
  };

  const handleDeletePhoto = () => {
    setProfilePhotoPreview(null);
    setProfilePhotoFile(null);
    setFormData((prevData) => ({
      ...prevData,
      ProfilePicture: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (errors.ProfilePicture) {
      setErrors((prev) => ({ ...prev, ProfilePicture: '' }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.FirstName?.trim()) newErrors.FirstName = 'First Name is required';
    if (!formData.LastName?.trim()) newErrors.LastName = 'Last Name is required';
    if (!formData.Gender) newErrors.Gender = 'Gender is required';
    if (!formData.UserName?.trim()) newErrors.UserName = 'Username is required';
    if (!formData.Password) newErrors.Password = 'Password is required';
    if (formData.Password && formData.Password.length < 6) {
      newErrors.Password = 'Password must be at least 6 characters';
    }
    if (!formData.Email?.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.Email)) {
      newErrors.Email = 'Email is invalid';
    }
    if (!formData.PhoneNumber?.trim()) {
      newErrors.PhoneNumber = 'Phone Number is required';
    } else if (!/^\+?\d+$/.test(formData.PhoneNumber)) {
      newErrors.PhoneNumber = 'Phone Number is invalid';
    }
    if (!formData.Address?.trim()) newErrors.Address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'ProfilePicture') {
          if (profilePhotoFile) {
            submitData.append(key, profilePhotoFile);
          }
        } else if (key !== 'Role') {
          submitData.append(key, formData[key] || '');
        }
      });
      submitData.append('Role', 'Admin');

      const response = await axios.post(`http://localhost:3000/Users`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: adminData?.token,
        },
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Admin registered successfully!');
        
        if (addActivity) {
          const activity = {
            adminName: `Admin ${adminData?.user?.FirstName || ''}`,
            action: 'registered',
            targetAdminName: `Admin ${formData.FirstName}`,
            timestamp: new Date().getTime(),
          };

          try {
            await axios.post('http://localhost:3000/admin-activity', activity, {
              headers: { Authorization: adminData?.token },
            });
          } catch (error) {
            console.error('Error registering admin activity:', error);
          }
        }

        form.resetFields();
        setProfilePhotoPreview(null);
        setProfilePhotoFile(null);
        setFormData({
          UserID: getNextUserID(),
          FirstName: '',
          LastName: '',
          Gender: '',
          UserName: '',
          Password: '',
          Email: '',
          PhoneNumber: '',
          Address: '',
          Role: 'Admin',
        });
        setErrors({});
        setLoading(false);
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error registering admin:', error);
      message.error(error.response?.data?.message || 'Error registering admin');
      setLoading(false);
    }
  };

  return (
    <Dashboard
      content={
        <div className="admin-reg-container">
          <div className="admin-reg-card">
            {/* Header */}
            <div className="admin-reg-header">
              <div className="admin-reg-header-left">
                <div className="admin-reg-icon">
                  <FaUserCog />
                </div>
                <div>
                  <h1>Admin Registration</h1>
                  <p>Register a new administrator for the system</p>
                </div>
              </div>
              <div className="admin-reg-badge">
                <FaUserPlus /> New Admin
              </div>
            </div>

            <div className="admin-reg-body">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                className="admin-reg-form"
              >
                {/* Profile Photo - OPTIONAL */}
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
                    {profilePhotoPreview ? 'CLICK X TO DELETE' : 'UPLOAD PROFILE PHOTO (OPTIONAL)'}
                  </p>
                </div>

                {/* Form Fields - All in 2 columns */}
                <div className="form-grid">
                  {/* First Name */}
                  <div className="form-group">
                    <label>
                      <UserOutlined className="field-icon" />
                      First Name <span className="required">*</span>
                    </label>
                    <Input
                      name="FirstName"
                      placeholder="Enter first name"
                      value={formData.FirstName}
                      onChange={handleFormChange}
                      className={errors.FirstName ? 'error' : ''}
                      status={errors.FirstName ? 'error' : ''}
                    />
                    {errors.FirstName && <div className="error-message">{errors.FirstName}</div>}
                  </div>

                  {/* Last Name */}
                  <div className="form-group">
                    <label>
                      <UserOutlined className="field-icon" />
                      Last Name <span className="required">*</span>
                    </label>
                    <Input
                      name="LastName"
                      placeholder="Enter last name"
                      value={formData.LastName}
                      onChange={handleFormChange}
                      className={errors.LastName ? 'error' : ''}
                      status={errors.LastName ? 'error' : ''}
                    />
                    {errors.LastName && <div className="error-message">{errors.LastName}</div>}
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label>
                      <FaVenusMars className="field-icon" />
                      Gender <span className="required">*</span>
                    </label>
                    <Select
                      value={formData.Gender || undefined}
                      onChange={(value) => handleSelectChange('Gender', value)}
                      placeholder="Select gender"
                      className={errors.Gender ? 'error' : ''}
                      status={errors.Gender ? 'error' : ''}
                    >
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                    </Select>
                    {errors.Gender && <div className="error-message">{errors.Gender}</div>}
                  </div>

                  {/* Username */}
                  <div className="form-group">
                    <label>
                      <UserOutlined className="field-icon" />
                      Username <span className="required">*</span>
                    </label>
                    <Input
                      name="UserName"
                      placeholder="Enter username"
                      value={formData.UserName}
                      onChange={handleFormChange}
                      className={errors.UserName ? 'error' : ''}
                      status={errors.UserName ? 'error' : ''}
                    />
                    {errors.UserName && <div className="error-message">{errors.UserName}</div>}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label>
                      <LockOutlined className="field-icon" />
                      Password <span className="required">*</span>
                    </label>
                    <Input.Password
                      name="Password"
                      placeholder="Enter password (min 6 characters)"
                      value={formData.Password}
                      onChange={handleFormChange}
                      className={errors.Password ? 'error' : ''}
                      status={errors.Password ? 'error' : ''}
                    />
                    {errors.Password && <div className="error-message">{errors.Password}</div>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label>
                      <MailOutlined className="field-icon" />
                      Email <span className="required">*</span>
                    </label>
                    <Input
                      name="Email"
                      type="email"
                      placeholder="Enter email"
                      value={formData.Email}
                      onChange={handleFormChange}
                      className={errors.Email ? 'error' : ''}
                      status={errors.Email ? 'error' : ''}
                    />
                    {errors.Email && <div className="error-message">{errors.Email}</div>}
                  </div>

                  {/* Phone Number */}
                  <div className="form-group">
                    <label>
                      <PhoneOutlined className="field-icon" />
                      Phone Number <span className="required">*</span>
                    </label>
                    <Input
                      name="PhoneNumber"
                      placeholder="+251 XXX XXX XXX"
                      value={formData.PhoneNumber}
                      onChange={handleFormChange}
                      className={errors.PhoneNumber ? 'error' : ''}
                      status={errors.PhoneNumber ? 'error' : ''}
                    />
                    {errors.PhoneNumber && <div className="error-message">{errors.PhoneNumber}</div>}
                  </div>

                  {/* Address - Now beside Phone Number */}
                  <div className="form-group">
                    <label>
                      <HomeOutlined className="field-icon" />
                      Address <span className="required">*</span>
                    </label>
                    <Input
                      name="Address"
                      placeholder="Enter address"
                      value={formData.Address}
                      onChange={handleFormChange}
                      className={errors.Address ? 'error' : ''}
                      status={errors.Address ? 'error' : ''}
                    />
                    {errors.Address && <div className="error-message">{errors.Address}</div>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : <><FaUserPlus /> Register Admin</>}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default AdminRegistrationForm;