import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  UploadOutlined, 
  BankOutlined, 
  PhoneOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Button, message, Form, Input, Upload, Spin } from 'antd';
import { 
  FaUserPlus, 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaFileUpload,
  FaTimes,
  FaCheckCircle,
  FaUniversity
} from 'react-icons/fa';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './ServiceProviderRegistration.css';

const ServiceProviderRegistrationForm = () => {
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    serviceProviderBIN: '',
    serviceProviderName: '',
    servicesOffered: '',
    BankName: '',
    BankAccountNumber: '',
    phoneNumber: '+251',
    serviceProviderAuthorizationLetter: null,
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
        message.error('Please login to access the dashboard');
      }, 5000);
    } else {
      setIsLoading(false);
    }
    localStorage.setItem('selectedMenu', 4);
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="sp-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (info) => {
    const file = info.file?.originFileObj || info.file;
    if (!file) {
      setFile(null);
      setFilePreview(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(`image/${fileExtension}`) && !allowedTypes.includes(file.type)) {
      message.error('Invalid file type. Please select an image file (JPEG, JPG, PNG, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('File size should be less than 5MB');
      return;
    }

    setFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target.result);
    };
    reader.readAsDataURL(file);
    
    if (errors.serviceProviderAuthorizationLetter) {
      setErrors((prev) => ({ ...prev, serviceProviderAuthorizationLetter: '' }));
    }
  };

  const handleDeleteFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.serviceProviderBIN?.trim()) newErrors.serviceProviderBIN = 'Business Identification Number is required';
    if (!formData.serviceProviderName?.trim()) newErrors.serviceProviderName = 'Service Provider Name is required';
    if (!formData.servicesOffered?.trim()) newErrors.servicesOffered = 'Services Offered is required';
    if (!formData.BankName?.trim()) newErrors.BankName = 'Bank Name is required';
    if (!formData.BankAccountNumber?.trim()) newErrors.BankAccountNumber = 'Bank Account Number is required';
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    } else if (!/^\+?\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone Number is invalid';
    }
    if (!file) {
      newErrors.serviceProviderAuthorizationLetter = 'Authorization Letter is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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
      const formDataToSend = new FormData();
      formDataToSend.append('serviceProviderBIN', formData.serviceProviderBIN);
      formDataToSend.append('serviceProviderName', formData.serviceProviderName);
      formDataToSend.append('servicesOffered', formData.servicesOffered);
      formDataToSend.append('BankName', formData.BankName);
      formDataToSend.append('BankAccountNumber', formData.BankAccountNumber);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('serviceProviderAuthorizationLetter', file);

      const response = await axios.post('http://localhost:3000/serviceproviders', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: adminData?.token,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const activity = {
          adminName: `Admin ${adminData.user.FirstName}`,
          action: 'registered',
          targetAdminName: `Service Provider ${formData.serviceProviderName}`,
          timestamp: new Date().getTime(),
        };

        axios.post('http://localhost:3000/admin-activity', activity, {
          headers: { Authorization: adminData.token },
        }).catch(err => console.error('Activity log error:', err));

        message.success('Service provider registered successfully!');
        form.resetFields();
        setFile(null);
        setFilePreview(null);
        setFormData({
          serviceProviderBIN: '',
          serviceProviderName: '',
          servicesOffered: '',
          BankName: '',
          BankAccountNumber: '',
          phoneNumber: '+251',
          serviceProviderAuthorizationLetter: null,
        });
        setErrors({});
        setLoading(false);
        
        setTimeout(() => {
          navigate('/admin/service-providers');
        }, 1500);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        message.error(`Failed to register service provider. ${error.response.data.error}`);
      } else {
        message.error('Failed to register service provider. Please try again.');
        console.error('Error:', error);
      }
      setLoading(false);
    }
  };

  return (
    <Dashboard
      content={
        <div className="sp-reg-container">
          <div className="sp-reg-card">
            {/* Header */}
            <div className="sp-reg-header">
              <div className="sp-reg-header-left">
                <div className="sp-reg-icon">
                  <FaBuilding />
                </div>
                <div>
                  <h1>Service Provider Registration</h1>
                  <p>Register a new service provider for the payment system</p>
                </div>
              </div>
              <div className="sp-reg-badge">
                <FaUserPlus /> New Provider
              </div>
            </div>

            <div className="sp-reg-body">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="sp-reg-form"
              >
                <div className="form-grid">
                  {/* Service Provider BIN */}
                  <div className="form-group">
                    <label>
                      <BankOutlined className="field-icon" />
                      Business Identification Number <span className="required">*</span>
                    </label>
                    <Input
                      name="serviceProviderBIN"
                      placeholder="Enter BIN"
                      value={formData.serviceProviderBIN}
                      onChange={handleChange}
                      className={errors.serviceProviderBIN ? 'error' : ''}
                      status={errors.serviceProviderBIN ? 'error' : ''}
                    />
                    {errors.serviceProviderBIN && <div className="error-message">{errors.serviceProviderBIN}</div>}
                  </div>

                  {/* Service Provider Name */}
                  <div className="form-group">
                    <label>
                      <FaBuilding className="field-icon" />
                      Service Provider Name <span className="required">*</span>
                    </label>
                    <Input
                      name="serviceProviderName"
                      placeholder="Enter name"
                      value={formData.serviceProviderName}
                      onChange={handleChange}
                      className={errors.serviceProviderName ? 'error' : ''}
                      status={errors.serviceProviderName ? 'error' : ''}
                    />
                    {errors.serviceProviderName && <div className="error-message">{errors.serviceProviderName}</div>}
                  </div>

                

                  {/* Bank Name */}
                  <div className="form-group">
                    <label>
                      <FaUniversity className="field-icon" />
                      Bank Name <span className="required">*</span>
                    </label>
                    <Input
                      name="BankName"
                      placeholder="Enter bank name"
                      value={formData.BankName}
                      onChange={handleChange}
                      className={errors.BankName ? 'error' : ''}
                      status={errors.BankName ? 'error' : ''}
                    />
                    {errors.BankName && <div className="error-message">{errors.BankName}</div>}
                  </div>

                  {/* Bank Account Number */}
                  <div className="form-group">
                    <label>
                      <BankOutlined className="field-icon" />
                      Bank Account Number <span className="required">*</span>
                    </label>
                    <Input
                      name="BankAccountNumber"
                      placeholder="Enter bank account number"
                      value={formData.BankAccountNumber}
                      onChange={handleChange}
                      className={errors.BankAccountNumber ? 'error' : ''}
                      status={errors.BankAccountNumber ? 'error' : ''}
                    />
                    {errors.BankAccountNumber && <div className="error-message">{errors.BankAccountNumber}</div>}
                  </div>

                  {/* Phone Number */}
                  <div className="form-group">
                    <label>
                      <PhoneOutlined className="field-icon" />
                      Phone Number <span className="required">*</span>
                    </label>
                    <Input
                      name="phoneNumber"
                      placeholder="+251 XXX XXX XXX"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={errors.phoneNumber ? 'error' : ''}
                      status={errors.phoneNumber ? 'error' : ''}
                    />
                    {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                  </div>
                    {/* Services Offered - Full Width */}
                  <div className="form-group full-width">
                    <label>
                      <FileTextOutlined className="field-icon" />
                      Services Offered <span className="required">*</span>
                    </label>
                    <Input.TextArea
                      name="servicesOffered"
                      placeholder="List the services this provider offers"
                      value={formData.servicesOffered}
                      onChange={handleChange}
                      className={`services-textarea ${errors.servicesOffered ? 'error' : ''}`}
                      rows={2}
                      style={{ resize: 'vertical', minHeight: '70px', maxHeight: '100px' }}
                    />
                    {errors.servicesOffered && <div className="error-message">{errors.servicesOffered}</div>}
                  </div>

                  {/* Authorization Letter - Full Width */}
                  <div className="form-group full-width">
                    <label>
                      <FaFileUpload className="field-icon" />
                      Authorization Letter <span className="required">*</span>
                    </label>
                    <div className="file-upload-section">
                      {filePreview ? (
                        <div className="file-preview-container">
                          <img 
                            src={filePreview} 
                            alt="Authorization Letter" 
                            className="file-preview"
                          />
                          <button
                            type="button"
                            className="file-delete-btn"
                            onClick={handleDeleteFile}
                            title="Delete file"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload-placeholder" onClick={triggerFileInput}>
                          <UploadOutlined className="file-upload-icon" />
                          <p>Click to upload authorization letter</p>
                          <span className="file-upload-hint">Supported: JPEG, JPG, PNG, GIF (Max 5MB)</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpeg,.jpg,.png,.gif"
                        onChange={(e) => handleFileChange({ file: e.target.files[0] })}
                        style={{ display: 'none' }}
                      />
                      {filePreview && (
                        <Button 
                          type="primary" 
                          ghost 
                          onClick={triggerFileInput}
                          className="file-change-btn"
                        >
                          Change File
                        </Button>
                      )}
                      {errors.serviceProviderAuthorizationLetter && (
                        <div className="error-message">{errors.serviceProviderAuthorizationLetter}</div>
                      )}
                    </div>
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
                    {loading ? 'Registering...' : <><FaUserPlus /> Register Provider</>}
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

export default ServiceProviderRegistrationForm;