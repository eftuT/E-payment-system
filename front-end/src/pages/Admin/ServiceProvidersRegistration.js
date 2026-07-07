import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';
import { Layout, Menu, Avatar, Button, message, Form, Input, Upload, Modal, Spin } from 'antd';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';

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
    agentAuthorizationLetter: null,
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [serviceProviderAuthorizationLetterUrl, setServiceProviderAuthorizationLetterUrl] = useState();
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
    localStorage.setItem('selectedMenu', 4);
  }, [adminData, navigate]);


  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (info) => {
    const file = info.file?.originFileObj;
    if (!file) {
      setFile(null);
      setServiceProviderAuthorizationLetterUrl(null);
      return;
    }
  
    setFile(file);
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileUrl = event.target.result;
      setServiceProviderAuthorizationLetterUrl(fileUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (await validateForm()) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('serviceProviderBIN', formData.serviceProviderBIN);
        formDataToSend.append('serviceProviderName', formData.serviceProviderName);
        formDataToSend.append('servicesOffered', formData.servicesOffered);
        formDataToSend.append('BankName', formData.BankName);
        formDataToSend.append('BankAccountNumber', formData.BankAccountNumber);
        formDataToSend.append('phoneNumber', formData.phoneNumber);
        formDataToSend.append('serviceProviderAuthorizationLetter', file);

        const response = await axios.post('http://localhost:3000/serviceproviders', formDataToSend);
        

        if(response.status === 200){
        const activity = {
          adminName: `Admin ${adminData.user.FirstName}`,
          action: 'registered',
          targetAdminName: `Service Provider ${formData.serviceProviderName}`,
          timestamp: new Date().getTime(),
        };

        // Save the admin activity to the database
        axios.post('http://localhost:3000/admin-activity', activity, {
          headers: {
            Authorization: adminData.token,
          },
        });

        message.success('Service provider registered successfully!');
        console.log('Service provider registered successfully!');
        form.resetFields(); // Reset the form fields
        setServiceProviderAuthorizationLetterUrl(null);
        return;
      }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          const errorMessage = error.response.data.error;
          message.error(`Failed to register service provider. ${errorMessage}`);
        } else {
          message.error('Failed to register service provider. Please try again.');
          console.error('Error:', error);
        }
      }
    }
  };
  return (
    <Dashboard
      content={
        <Form name="serviceProviderRegistrationForm" layout="vertical" onFinish={handleSubmit} form={form}>
          <h1>Service provider Registration</h1>
  
          <Form.Item
            label="Business Identification Number"
            name="serviceProviderBIN"
            validateStatus={errors.serviceProviderBIN && 'error'}
            help={errors.serviceProviderBIN}
            rules={[{ required: true }]}
          >
            <Input name="serviceProviderBIN" onChange={handleChange} placeholder="Enter BIN" />
          </Form.Item>
  
          <Form.Item
            label="Service Provider Name"
            name="serviceProviderName"
            validateStatus={errors.serviceProviderName && 'error'}
            help={errors.serviceProviderName}
            rules={[{ required: true }]}
          >
            <Input name="serviceProviderName" onChange={handleChange} placeholder="Enter Name" />
          </Form.Item>
  
          <Form.Item
            label="Services Offered"
            name="servicesOffered"
            validateStatus={errors.servicesOffered && 'error'}
            help={errors.servicesOffered}
            rules={[{ required: true }]}
          >
            <Input name="servicesOffered" onChange={handleChange} placeholder="Enter Services Offered" />
          </Form.Item>
  
          <Form.Item
            label="Bank Name"
            name="BankName"
            validateStatus={errors.BankName && 'error'}
            help={errors.BankName}
            rules={[{ required: true }]}
          >
            <Input name="BankName" onChange={handleChange} placeholder="Enter Bank Name" />
          </Form.Item>
  
          <Form.Item
            label="Bank Account Number"
            name="BankAccountNumber"
            validateStatus={errors.BankAccountNumber && 'error'}
            help={errors.BankAccountNumber}
            rules={[{ required: true }]}
          >
            <Input name="BankAccountNumber" onChange={handleChange} placeholder="Enter Bank Account Number" />
          </Form.Item>
  
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            validateStatus={errors.phoneNumber && 'error'}
            help={errors.phoneNumber}
            rules={[{ required: true }]}
          >
            <Input name="phoneNumber" onChange={handleChange} placeholder="Enter Phone Number" />
          </Form.Item>
  
          <Form.Item
            label="Service Provider Authorization Letter"
            name="serviceProviderAuthorizationLetter"
            validateStatus={errors.serviceProviderAuthorizationLetter && 'error'}
            help={errors.serviceProviderAuthorizationLetter}
            rules={[{ required: true }]}
          >
            <Upload
              name="serviceProviderAuthorizationLetter"
              accept=".jpeg,.jpg,.png,.gif"
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            {serviceProviderAuthorizationLetterUrl && (
              <img src={serviceProviderAuthorizationLetterUrl} alt="Auth Letter" style={{ width: '200px' }} />
            )}
          </Form.Item>
  
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
    };

export default ServiceProviderRegistrationForm;