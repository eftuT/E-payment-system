import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout, Menu, Avatar, Button, message, Form, Input, Upload, Modal, Spin } from 'antd';
import Dashboard from "./Dashboard";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from '@ant-design/icons';

const AgentRegistrationForm = () => {

  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
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
  const [errors, setErrors] = useState({});
  const [agentAuthorizationLetterUrl, setAgentAuthorizationLetterUrl] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const validateForm = async () => {
    try {
      await form.validateFields();
      return isFileValid(file);
    } catch (error) {
      const newErrors = {};
      error.errorFields.forEach((field) => {
        newErrors[field.name[0]] = field.errors[0];
      });
      setErrors(newErrors);
      return false;
    }
  };

  function isFileValid(file) {
    if (!file) {
      message.error('No file selected.');
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(`image/${fileExtension}`)) {
      message.error('Invalid file type. Please select an image file (JPEG, JPG, PNG, GIF).');
      return false;
    } else {
      return true;
    }
  }


  const handleFileChange = (info) => {
    const file = info.file?.originFileObj;
    if (!file) {
      setFile(null);
      setAgentAuthorizationLetterUrl(null);
      return;
    }
  
    setFile(file);
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileUrl = event.target.result;
      setAgentAuthorizationLetterUrl(fileUrl);
    };
    reader.readAsDataURL(file);
  };


  const handleSubmit = async () => {
    if (await validateForm()) {
      try {
        const formData = new FormData();
        formData.append("agentBIN", agentData.agentBIN);
        formData.append("agentName", agentData.agentName);
        formData.append("agentEmail", agentData.agentEmail);
        formData.append("servicesOffered", agentData.servicesOffered);
        formData.append("phoneNumber", agentData.phoneNumber);
        formData.append("agentAuthorizationLetter", file);
  
        const response = await axios.post('http://localhost:3000/agents', formData);
        if (response.status === 200) {
          // Register admin activity
          const activity = {
            adminName: `Admin ${adminData.user.FirstName}`,
            action: 'registered',
            targetAdminName: `Agent ${agentData.agentName}`,
            timestamp: new Date().getTime(),
          };
  
          try {
            const activityResponse = await axios.post('http://localhost:3000/admin-activity', activity, {
              headers: {
                Authorization: adminData.token,
              },
            });
  
            if (activityResponse.status === 200) {
              console.log('Admin activity registered successfully!');
            } else {
              console.error('Error registering admin activity:', activityResponse);
            }
          } catch (error) {
            console.error('Error registering admin activity:', error);
          }
  
          form.resetFields();
          setFile(null);
          setAgentAuthorizationLetterUrl(null);
          console.log('Agent registered successfully!');
          message.success('Agent registered successfully!');
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          const errorMessage = error.response.data.error;
        } else {
          message.error('Failed to register Agent. Please try again.');
          console.error('Error:', error);
        }
      }
    }
  };

  return (
    <Dashboard
      content={
        <Form name="agentRegistrationForm" layout="vertical" onFinish={handleSubmit} form={form}>
          <h1>Agent Registration</h1>

          <Form.Item
            label="Business Identification Number"
            name="agentBIN"
            validateStatus={errors.agentBIN && 'error'}
            help={errors.agentBIN}
            rules={[{ required: true }]}
          >
            <Input name="agentBIN" onChange={handleChange} placeholder="Enter the agent business Identification Number" />
          </Form.Item>

          <Form.Item
            label="Agent Name"
            name="agentName"
            validateStatus={errors.agentName && 'error'}
            help={errors.agentName}
            rules={[{ required: true }]}
          >
            <Input name="agentName" onChange={handleChange} placeholder="Enter Agent's Name" />
          </Form.Item>

          <Form.Item
            label="Agent Email"
            name="agentEmail"
            validateStatus={errors.agentEmail && 'error'}
            help={errors.agentEmail}
            rules={[{ required: true }]}
          >
            <Input name="agentEmail" onChange={handleChange} placeholder="Enter Agent's Email address" />
          </Form.Item>

          <Form.Item
            label="Services Offered"
            name="servicesOffered"
            validateStatus={errors.servicesOffered && 'error'}
            help={errors.servicesOffered}
            rules={[{ required: true }]}
          >
            <Input name="servicesOffered" onChange={handleChange} placeholder="List the services that this Agent would give" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            validateStatus={errors.phoneNumber && 'error'}
            help={errors.phoneNumber}
            rules={[{ required: true }]}
          >
            <Input name="phoneNumber" onChange={handleChange} placeholder="Enter Agent's Phonenumber" />
          </Form.Item>


          <Form.Item
            label="Agent Authorization Letter"
            name="agentAuthorizationLetter"
            validateStatus={errors.agentAuthorizationLetter && 'error'}
            help={errors.agentAuthorizationLetter}
            rules={[{ required: true }]}
          >
            <Upload
              name="agentAuthorizationLetter"
              accept=".jpeg,.jpg,.png,.gif"
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>

            {agentAuthorizationLetterUrl && (
              <img src={agentAuthorizationLetterUrl} alt="Auth Letter" style={{ width: '200px' }} />
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>Register</Button>
          </Form.Item>
        </Form>
    } />
  );
};

export default AgentRegistrationForm;