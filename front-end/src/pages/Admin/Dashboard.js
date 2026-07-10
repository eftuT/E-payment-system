import React, { useEffect, useState } from 'react';
import axios from 'axios';
import companyLogo from '../../image/logoimage.jpg';
import { Layout, Menu, Button, Form, Input, Modal, message, Spin, Avatar, Badge, Dropdown } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  SolutionOutlined,
  TransactionOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserSwitchOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaShieldAlt, FaUserCircle } from 'react-icons/fa';
import './Dashboard.css';

const { Header, Content, Footer, Sider } = Layout;

const Dashboard = ({ content }) => {
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const { adminId } = useParams();
  const [formData, setFormData] = useState({
    UserID: '',
    FirstName: '',
    LastName: '',
    Gender: '',
    UserName: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
    Role: '',
    ProfilePicture: null,
  });
  const [selectedMenu, setSelectedMenu] = useState(localStorage.getItem("selectedMenu") || "1");
  const navigate = useNavigate();

  const handleMenuSelect = ({ key }) => {
    setSelectedMenu(key);
    localStorage.setItem("selectedMenu", key);
  };

  useEffect(() => {
    try {
      const loggedInAdmin = localStorage.getItem('adminData');
      if (loggedInAdmin) {
        const parsedAdminData = JSON.parse(loggedInAdmin);
        setFormData(parsedAdminData.user || parsedAdminData);
        setAdminData(parsedAdminData);
        if (parsedAdminData.user?.ProfilePicture) {
          setProfilePictureUrl(`http://localhost:3000/${parsedAdminData.user.ProfilePicture}`);
        }
      }
    } catch (error) {
      console.error('Error parsing admin data:', error);
      message.error('Error parsing admin data');
    }
  }, []);

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } else {
      setIsLoading(false);
    }
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <Spin size="large" />
        <p>Loading dashboard...</p>
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePictureUrl(url);
      setFormData((prevData) => ({
        ...prevData,
        ProfilePicture: file,
      }));
    }
  };

  const handleEdit = () => {
    form.setFieldsValue(formData);
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prevData) => ({
        ...prevData,
        ...values,
      }));

      const updatedAdminData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'ProfilePicture') {
          if (formData.ProfilePicture) {
            updatedAdminData.append(key, formData.ProfilePicture);
          }
        } else {
          updatedAdminData.append(key, value);
        }
      });

      const response = await axios.put(
        `http://localhost:3000/Users/${adminId}`,
        updatedAdminData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedAdmin = response.data;
      localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
      setAdminData(updatedAdmin);
      message.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating admin profile:', error);
      message.error('Error updating admin profile');
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('isLoggedInAdmin');
        setAdminData(null);
        navigate('/admin/login');
      },
    });
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { key: '1', icon: <DashboardOutlined />, label: 'Dashboard', path: `/admin/dashboard/${formData.id}` },
    { key: '2', icon: <BankOutlined />, label: 'Agents Registration', path: `/admin/agents/registration/${formData.id}` },
    { key: '3', icon: <BankOutlined />, label: 'Agents List', path: `/admin/agents/${formData.id}` },
    { key: '4', icon: <SolutionOutlined />, label: 'Service Providers Reg', path: `/admin/service-providers/registration/${formData.id}` },
    { key: '5', icon: <SolutionOutlined />, label: 'Service Providers List', path: `/admin/service-providers/${formData.id}` },
    { key: '6', icon: <UserOutlined />, label: 'Admin Registration', path: `/admin/user/registration/${formData.id}` },
    { key: '7', icon: <UserOutlined />, label: 'Admin List', path: `/admin/adminsList/${formData.id}` },
    { key: '8', icon: <UserSwitchOutlined />, label: 'Users List', path: `/admin/usersList/${formData.id}` },
    { key: '9', icon: <TransactionOutlined />, label: 'Transactions', path: `/admin/transactions/${formData.id}` },
    { key: '10', icon: <AppstoreOutlined />, label: 'Service Number Gen', path: `/admin/serviceNogenerator/${formData.id}` },
    { key: '11', icon: <AppstoreOutlined />, label: 'Bill Generation', path: `/admin/billgenerator/${formData.id}` },
    { key: '12', icon: <AppstoreOutlined />, label: 'Activities', path: `/admin/activities/${formData.id}` },
  ];

  const getUserInitials = () => {
    const firstName = formData.FirstName || '';
    const lastName = formData.LastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Layout className="admin-dashboard">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        className="admin-sider"
        width={260}
        trigger={null}
      >
        <div className="admin-logo-container">
          <img src={companyLogo} alt="company logo" className="admin-logo-img" />
          {!collapsed && (
            <div className="admin-logo-text">
              <h1>E-Payment</h1>
              <p>Admin Panel</p>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onSelect={handleMenuSelect}
          className="admin-menu"
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>

        <div className="admin-sider-footer">
          <Button 
            type="text" 
            onClick={toggleCollapsed}
            className="admin-toggle-btn"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div className="admin-header-left">
            <Button
              type="text"
              onClick={toggleCollapsed}
              className="admin-toggle-btn"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <span className="admin-header-title">Dashboard</span>
          </div>

          <div className="admin-header-right">
            <Badge count={3} className="admin-notification">
              <BellOutlined style={{ fontSize: '20px', color: '#fff' }} />
            </Badge>

            <Dropdown
              menu={{
                items: [
                  { key: '1', label: 'Profile', icon: <UserOutlined />, onClick: handleEdit },
                  { key: '2', label: 'Settings', icon: <SettingOutlined /> },
                  { type: 'divider' },
                  { key: '3', label: 'Logout', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
                ],
              }}
              placement="bottomRight"
            >
              <div className="admin-profile">
                {profilePictureUrl ? (
                  <Avatar src={profilePictureUrl} size={40} className="admin-avatar" />
                ) : (
                  <Avatar size={40} className="admin-avatar" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    {getUserInitials()}
                  </Avatar>
                )}
                {!collapsed && (
                  <div className="admin-profile-info">
                    <span className="admin-profile-name">{formData.FirstName} {formData.LastName}</span>
                    <span className="admin-profile-role">Administrator</span>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          {content}
        </Content>

        <Footer className="admin-footer">
          <span>E-Payment System ©{new Date().getFullYear()} Created by INSA</span>
        </Footer>
      </Layout>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <div className="modal-title">
            <UserOutlined /> Edit Profile
          </div>
        }
        open={editMode}
        onCancel={() => {
          setEditMode(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="admin-modal"
      >
        <Form form={form} layout="vertical" initialValues={formData} onFinish={handleSave}>
          <div className="modal-profile-upload">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="Profile" className="modal-profile-img" />
            ) : (
              <div className="modal-profile-placeholder">
                <FaUserCircle className="modal-profile-icon" />
              </div>
            )}
            <label htmlFor="profilePicture" className="modal-upload-label">
              <span>Change Photo</span>
              <input
                type="file"
                id="profilePicture"
                accept=".jpeg, .jpg, .png, .gif"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="modal-form-row">
            <Form.Item name="FirstName" label="First Name" rules={[{ required: true }]}>
              <Input onChange={handleFormChange} />
            </Form.Item>
            <Form.Item name="LastName" label="Last Name" rules={[{ required: true }]}>
              <Input onChange={handleFormChange} />
            </Form.Item>
          </div>

          <div className="modal-form-row">
            <Form.Item name="UserName" label="Username" rules={[{ required: true }]}>
              <Input onChange={handleFormChange} />
            </Form.Item>
            <Form.Item name="Gender" label="Gender" rules={[{ required: true }]}>
              <Input onChange={handleFormChange} />
            </Form.Item>
          </div>

          <div className="modal-form-row">
            <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input type="email" onChange={handleFormChange} />
            </Form.Item>
            <Form.Item name="PhoneNumber" label="Phone Number" rules={[{ required: true }]}>
              <Input type="tel" onChange={handleFormChange} />
            </Form.Item>
          </div>

          <Form.Item name="Address" label="Address">
            <Input onChange={handleFormChange} />
          </Form.Item>

          <Form.Item name="UserID" label="User ID">
            <Input disabled />
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => { setEditMode(false); form.resetFields(); }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="modal-save-btn">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;