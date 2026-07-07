import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';
import { Layout, Menu, Avatar, Button, message, Form, Input, Upload, Modal, Spin } from 'antd';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';

const BillGenerationForm = () => {
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    billNumber: '',
    dateIssued: '',
    dueDate: '',
    amountDue: '',
    serviceDescription: '',
    servicePeriod: '',
    serviceCharges: '',
    additionalCharges: '',
    billStatus: "Unpaid",
    serviceProviderBIN: '',
    UserId: '',
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
    localStorage.setItem('selectedMenu', 11);
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
      setErrors({}); // Reset the errors state when the form is valid
      return true; // Return true when the form is valid
    } catch (error) {
      const newErrors = {};
      error.errorFields.forEach((field) => {
        newErrors[field.name[0]] = field.errors[0];
      });
      setErrors(newErrors);
      return false; // Return false when there are validation errors
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (await validateForm()) {
      try {
        console.log(formData);

        const formDataToSend = {
          billNumber: formData.billNumber,
          dateIssued: formData.dateIssued,
          dueDate: formData.dueDate,
          amountDue: parseFloat(formData.amountDue),
          serviceDescription: formData.serviceDescription,
          servicePeriod: formData.servicePeriod,
          serviceCharges: parseFloat(formData.serviceCharges),
          additionalCharges: parseFloat(formData.additionalCharges),
          billStatus: formData.billStatus,
          serviceProviderBIN: parseInt(formData.serviceProviderBIN),
          UserId: parseInt(formData.UserId)
        };

        console.log(formDataToSend);

        console.log(formDataToSend);
        const response = await axios.post('http://localhost:3000/bills', formDataToSend);

        if (response.status === 200) {
          const activity = {
            adminName: `Admin ${adminData.user.FirstName}`,
            action: 'registered',
            targetAdminName: `bill for ${response.data.customerName}`,
            timestamp: new Date().getTime(),
          };

          // Save the admin activity to the database
          axios.post('http://localhost:3000/admin-activity', activity, {
            headers: {
              Authorization: adminData.token,
            },
          });

          message.success('Bill registered successfully!');
          console.log('Bill registered successfully!');
          form.resetFields(); // Reset the form fields
          return;
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          const errorMessage = error.response.data.error;
          message.error(`Failed to register bill. ${errorMessage}`);
        } else {
          message.error('Failed to register bill. Please try again.');
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
            label="Bill number"
            name="billNumber"
            validateStatus={errors.billNumber && 'error'}
            help={errors.billNumber}
            rules={[{ required: true }]}
          >
            <Input name="billNumber" onChange={handleChange} placeholder="Enter bill number" />
          </Form.Item>

          <Form.Item
            label="Date issued"
            name="dateIssued"
            validateStatus={errors.dateIssued && 'error'}
            help={errors.dateIssued}
            rules={[{ required: true }]}
          >
            <Input name="dateIssued" onChange={handleChange} placeholder="Enter date issued" />
          </Form.Item>

          <Form.Item
            label="Due date"
            name="dueDate"
            validateStatus={errors.dueDate && 'error'}
            help={errors.dueDate}
            rules={[{ required: true }]}
          >
            <Input name="dueDate" onChange={handleChange} placeholder="Enter due date" />
          </Form.Item>

          <Form.Item
            label="Amount due"
            name="amountDue"
            validateStatus={errors.amountDue && 'error'}
            help={errors.amountDue}
            rules={[{ required: true }]}
          >
            <Input name="amountDue" onChange={handleChange} placeholder="Enter amount due" />
          </Form.Item>

          <Form.Item
            label="Service description"
            name="serviceDescription"
            validateStatus={errors.serviceDescription && 'error'}
            help={errors.serviceDescription}
            rules={[{ required: true }]}
          >
            <Input name="serviceDescription" onChange={handleChange} placeholder="Enter service description" />
          </Form.Item>

          <Form.Item
            label="Service period"
            name="servicePeriod"
            validateStatus={errors.servicePeriod && 'error'}
            help={errors.servicePeriod}
            rules={[{ required: true }]}
          >
            <Input name="servicePeriod" onChange={handleChange} placeholder="Enter service period" />
          </Form.Item>

          <Form.Item
            label="Service charges"
            name="serviceCharges"
            validateStatus={errors.serviceCharges && 'error'}
            help={errors.serviceCharges}
            rules={[{ required: true }]}
          >
            <Input name="serviceCharges" onChange={handleChange} placeholder="Enter service charges" />
          </Form.Item>

          <Form.Item
            label="Additional charges"
            name="additionalCharges"
            validateStatus={errors.additionalCharges && 'error'}
            help={errors.additionalCharges}
            rules={[{ required: true }]}
          >
            <Input name="additionalCharges" onChange={handleChange} placeholder="Enter additional charges" />
          </Form.Item>

          <Form.Item
            label="Service provider BIN"
            name="serviceProviderBIN"
            validateStatus={errors.serviceProviderBIN && 'error'}
            help={errors.serviceProviderBIN}
            rules={[{ required: true }]}
          >
            <Input name="serviceProviderBIN" onChange={handleChange} placeholder="Enter service provider BIN" />
          </Form.Item>

          <Form.Item
            label="User ID"
            name="UserId"
            validateStatus={errors.UserId && 'error'}
            help={errors.UserId}
            rules={[{ required: true }]}
          >
            <Input name="UserId" onChange={handleChange} placeholder="Enter user ID" />
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

export default BillGenerationForm;