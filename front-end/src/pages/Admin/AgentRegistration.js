import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, message, Form, Input, Spin } from 'antd';
import { 
  BankOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  FileTextOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { 
  FaUserPlus, 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaFileUpload,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import Dashboard from "./Dashboard";
import { useNavigate } from "react-router-dom"; // Removed useParams
import './AgentRegistration.css';

const AgentRegistrationForm = () => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData'))); // Removed setAdminData
  const [form] = Form.useForm();
  const [agentData, setAgentData] = useState({
    agentBIN: '',
    agentName: '',
    agentEmail: '',
    servicesOffered: '',
    phoneNumber: '+251',
    agentAuthorizationLetter: null,
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
    localStorage.setItem('selectedMenu', 2);
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="agent-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgentData((prevData) => ({
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
    
    if (errors.agentAuthorizationLetter) {
      setErrors((prev) => ({ ...prev, agentAuthorizationLetter: '' }));
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
    if (!agentData.agentBIN?.trim()) newErrors.agentBIN = 'Business Identification Number is required';
    if (!agentData.agentName?.trim()) newErrors.agentName = 'Agent Name is required';
    if (!agentData.agentEmail?.trim()) {
      newErrors.agentEmail = 'Agent Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(agentData.agentEmail)) {
      newErrors.agentEmail = 'Email is invalid';
    }
    if (!agentData.servicesOffered?.trim()) newErrors.servicesOffered = 'Services Offered is required';
    if (!agentData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    } else if (!/^\+?\d+$/.test(agentData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone Number is invalid';
    }
    if (!file) {
      newErrors.agentAuthorizationLetter = 'Authorization Letter is required';
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
      const formData = new FormData();
      formData.append("agentBIN", agentData.agentBIN);
      formData.append("agentName", agentData.agentName);
      formData.append("agentEmail", agentData.agentEmail);
      formData.append("servicesOffered", agentData.servicesOffered);
      formData.append("phoneNumber", agentData.phoneNumber);
      formData.append("agentAuthorizationLetter", file);

      const response = await axios.post('http://localhost:3000/agents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: adminData?.token,
        },
      });
      
      if (response.status === 200 || response.status === 201) {
        // Register admin activity
        const activity = {
          adminName: `Admin ${adminData.user.FirstName}`,
          action: 'registered',
          targetAdminName: `Agent ${agentData.agentName}`,
          timestamp: new Date().getTime(),
        };

        try {
          await axios.post('http://localhost:3000/admin-activity', activity, {
            headers: { Authorization: adminData.token },
          });
        } catch (error) {
          console.error('Error registering admin activity:', error);
        }

        form.resetFields();
        setFile(null);
        setFilePreview(null);
        setAgentData({
          agentBIN: '',
          agentName: '',
          agentEmail: '',
          servicesOffered: '',
          phoneNumber: '+251',
          agentAuthorizationLetter: null,
        });
        setErrors({});
        message.success('Agent registered successfully!');
        setLoading(false);
        
        setTimeout(() => {
          navigate('/admin/agents');
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.response?.data?.message || 'Failed to register Agent. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dashboard
      content={
        <div className="agent-reg-container">
          <div className="agent-reg-card">
            {/* Header */}
            <div className="agent-reg-header">
              <div className="agent-reg-header-left">
                <div className="agent-reg-icon">
                  <FaBuilding />
                </div>
                <div>
                  <h1>Agent Registration</h1>
                  <p>Register a new agent for the payment system</p>
                </div>
              </div>
              <div className="agent-reg-badge">
                <FaUserPlus /> New Agent
              </div>
            </div>

            <div className="agent-reg-body">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="agent-reg-form"
              >
                {/* Form Fields */}
                <div className="form-grid">
                  {/* Agent BIN */}
                  <div className="form-group">
                    <label>
                      <BankOutlined className="field-icon" />
                      Business Identification Number <span className="required">*</span>
                    </label>
                    <Input
                      name="agentBIN"
                      placeholder="Enter Business Identification Number"
                      value={agentData.agentBIN}
                      onChange={handleChange}
                      className={errors.agentBIN ? 'error' : ''}
                      status={errors.agentBIN ? 'error' : ''}
                    />
                    {errors.agentBIN && <div className="error-message">{errors.agentBIN}</div>}
                  </div>

                  {/* Agent Name */}
                  <div className="form-group">
                    <label>
                      <FaBuilding className="field-icon" />
                      Agent Name <span className="required">*</span>
                    </label>
                    <Input
                      name="agentName"
                      placeholder="Enter agent's name"
                      value={agentData.agentName}
                      onChange={handleChange}
                      className={errors.agentName ? 'error' : ''}
                      status={errors.agentName ? 'error' : ''}
                    />
                    {errors.agentName && <div className="error-message">{errors.agentName}</div>}
                  </div>

                  {/* Agent Email */}
                  <div className="form-group">
                    <label>
                      <MailOutlined className="field-icon" />
                      Agent Email <span className="required">*</span>
                    </label>
                    <Input
                      name="agentEmail"
                      type="email"
                      placeholder="Enter agent's email"
                      value={agentData.agentEmail}
                      onChange={handleChange}
                      className={errors.agentEmail ? 'error' : ''}
                      status={errors.agentEmail ? 'error' : ''}
                    />
                    {errors.agentEmail && <div className="error-message">{errors.agentEmail}</div>}
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
                      value={agentData.phoneNumber}
                      onChange={handleChange}
                      className={errors.phoneNumber ? 'error' : ''}
                      status={errors.phoneNumber ? 'error' : ''}
                    />
                    {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                  </div>

              {/* Services Offered - Full Width with TextArea */}
<div className="form-group full-width">
  <label>
    <FileTextOutlined className="field-icon" />
    Services Offered <span className="required">*</span>
  </label>
  <Input.TextArea
    name="servicesOffered"
    placeholder="List the services this agent offers"
    value={agentData.servicesOffered}
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
                      {errors.agentAuthorizationLetter && (
                        <div className="error-message">{errors.agentAuthorizationLetter}</div>
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
                    {loading ? 'Registering...' : <><FaUserPlus /> Register Agent</>}
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

export default AgentRegistrationForm;