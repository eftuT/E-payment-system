import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Avatar, Button, message, Form, Input, Upload, Modal, Select, Spin } from 'antd';
import Dashboard from './Dashboard';

const AdminRegistrationForm = ({ addActivity }) => {

  const { Option } = Select;
  const [counter, setCounter] = useState(1);
  const navigate = useNavigate();
  // Generate the next admin ID
  const getNextUserID = () => {
    const timestamp = Date.now().toString(); // Get the current timestamp
    const randomNumber = Math.floor(Math.random() * 10000).toString(); // Generate a random number between 0 and 9999
    return `P${timestamp}${randomNumber}`;
  };

  const incrementCounter = () => {
    setCounter((prevCounter) => prevCounter + 1);
  };

  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const [profilePictureUrl, setProfilePictureUrl] = useState(JSON.parse(localStorage.getItem('adminData'))?.ProfilePicture);
  const { adminId } = useParams();
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FirstName) {
      newErrors.FirstName = 'First Name is required';
    }

    if (!formData.LastName) {
      newErrors.LastName = 'Last Name is required';
    }

    if (!formData.Gender) {
      newErrors.Gender = 'Gender is required';
    }

    if (!formData.UserName) {
      newErrors.UserName = 'User Name is required';
    }

    if (!formData.Password) {
      newErrors.Password = 'Password is required';
    }

    if (!formData.Email) {
      newErrors.Email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.Email)) {
      newErrors.Email = 'Email is invalid';
    }

    if (!formData.PhoneNumber) {
      newErrors.PhoneNumber = 'Phone Number is required';
    } else if (!/^\+?\d+$/.test(formData.PhoneNumber)) {
      newErrors.PhoneNumber = 'Phone Number is invalid';
    }

    if (!formData.Address) {
      newErrors.Address = 'Address is required';
    }

    if (!formData.ProfilePicture) {
      newErrors.ProfilePicture = "Profile Picture is required";
    }
    else if (!isFileValid(formData.ProfilePicture)) {
      newErrors.ProfilePicture = "Invalid file format. Only JPG, JPEG, or PNG files are allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function isFileValid(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Invalid file type. Please select an image file (JPEG, JPG, PNG, GIF).');
      return false;
    }
    else return true;
  }

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
  
    // Check the file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Invalid file type. Please select an image file (JPEG, JPG, PNG, GIF).');
      return;
    }
  
    const url = URL.createObjectURL(file);
    setProfilePictureUrl(url);
    setFormData((prevData) => ({
      ...prevData,
      ProfilePicture: file,
    }));
  };

  const handleSave = async (e) => {
    try {
      // Get form values
      const values = await form.validateFields(); // Validate the form fields and get the values

      // Update the formData state with the form values
      setFormData((prevData) => ({
        ...prevData,
        ...values,
        Role: 'Admin',
      }));

      // Create a new FormData object
      const updatedAdminData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'ProfilePicture') {
          // Skip the ProfilePicture field if it's not updated
          if (formData.ProfilePicture) {
            updatedAdminData.append(key, formData.ProfilePicture);
          }
        } else {
          updatedAdminData.append(key, value);
        }
      });
      updatedAdminData.append('Role', 'Admin');

      // Send the updated admin profile to the server
      const response = await axios.post(`http://localhost:3000/Users`, updatedAdminData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: adminData.token,
        },
      });

      // Handle the response from the server
      if (response.status === 200) {
        message.success('Admin Registered successfully');
        // Register admin activity
      const activity = {
        adminName: `Admin ${adminData.user.FirstName}`,
        action: 'registered',
        targetAdminName:`Admin ${values.FirstName}`,
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
          } catch (error){
            console.error('Error registering admin activity:', error);
          }
      form.resetFields();
      window.location.href = window.location.href;
      } else {
        message.error('Failed to register admin');
      }
    } catch (error) {
      console.error('Error registering admin:', error);
      message.error('Error registering admin');
    }
    
  };

  return (
    <Layout>
      <Dashboard content={
        <Layout.Content className="admin-registration-content">
          <div className="admin-registration-wrapper">
            <div className="admin-registration-header">
            </div>
            <h1>ADMIN REGISTRATION</h1>
            <Form
              form={form}
              layout="vertical"
              initialValues={formData}
              onChange={handleFormChange}
              onFinish={handleSave}
            >
            <Form.Item label="UserID" name="UserID" rules={[{ required: true }]}>
  <Input defaultvalue={formData.UserID} disabled />
</Form.Item>
              
              <Form.Item label="First Name" 
              name="FirstName" rules={[{ required: true }]}>
                <Input placeholder="Enter First Name" />
              </Form.Item>
              {errors.FirstName &&
               <p className="error-message"
               >{errors.FirstName}</p>}
              
              
              
              
              <Form.Item label="Last Name" name="LastName" rules={[{ required: true }]}>
                <Input placeholder="Enter Last Name" />
              </Form.Item>
              {errors.LastName && <p className="error-message">{errors.LastName}</p>}
              <Form.Item label="Gender" name="Gender" rules={[{ required: true }]}>
                <Select>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </Form.Item>
              {errors.Gender && <p className="error-message">{errors.Gender}</p>}
              <Form.Item label="User Name" name="UserName" rules={[{ required: true }]}>
                <Input placeholder="Enter User Name" />
              </Form.Item>
              {errors.UserName && <p className="error-message">{errors.UserName}</p>}
              <Form.Item label="Password" name="Password" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Password" />
              </Form.Item>
              {errors.Password && <p className="error-message">{errors.Password}</p>}
              <Form.Item label="Email" name="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="Enter Email" />
              </Form.Item>
              {errors.Email && <p className="error-message">{errors.Email}</p>}
              <Form.Item label="Phone Number" name="PhoneNumber" rules={[{ required: true, pattern: /^\+?\d+$/ }]}>
                <Input placeholder="Enter Phone Number" />
              </Form.Item>
              {errors.PhoneNumber && <p className="error-message">{errors.PhoneNumber}</p>}
              <Form.Item label="Address" name="Address" rules={[{ required: true }]}>
                <Input placeholder="Enter Address" />
              </Form.Item>
              {errors.Address && <p className="error-message">{errors.Address}</p>}
              <Form.Item name="ProfilePicture" >
                <label htmlFor="profilePicture">Profile Picture:</label>
                <input
                  type="file"
                  id="profilePicture"
                  accept=".jpeg, .jpg, .png, .gif"
                  onChange={handleFileChange}
                />
                {profilePictureUrl && (
                  <img src={profilePictureUrl} alt="Profile" style={{ width: '200px' }} />
                )}
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Register
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Layout.Content>} />
    </Layout>
  );
};

export default AdminRegistrationForm;