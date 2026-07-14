import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import companyLogo from '../image/logoimage.jpg';
import USER from '../image/himage3.jpg';
import { Form, Layout, Button, Input, Modal, message } from 'antd';
import axios from 'axios';
import {
  FaUser,
  FaUserPlus, FaHome, FaCamera, FaGenderless
} from 'react-icons/fa';
import { MdEmail, MdPerson, MdPhone, MdHome } from 'react-icons/md';
import './Header.css';


const Header = () => {
  const [userData, setUserData] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // ✅ FIXED: Correct useState syntax
  const [userSelectedMenu, setUserSelectedMenu] = useState(localStorage.getItem("userSelectedMenu") || '1');
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    UserID: '',
    FirstName: '',
    LastName: '',
    Gender: '',
    UserName: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
    Role: 'User',
    ProfilePicture: null,
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedInUser');

    if (loggedIn === 'true') {
      try {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          setFormData(parsedData);
          
          if (parsedData.ProfilePhoto) {
            if (parsedData.ProfilePhoto.startsWith('data:image') || parsedData.ProfilePhoto.startsWith('http')) {
              setProfilePictureUrl(parsedData.ProfilePhoto);
            } else {
              setProfilePictureUrl(`http://localhost:3000/${parsedData.ProfilePhoto}`);
            }
          } else {
            setProfilePictureUrl('');
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 800);
    };

    handleResize();
    if (!isSmallScreen) closeMenu();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isSmallScreen]);

  useEffect(() => {
    if (userData?.ProfilePhoto) {
      // This effect runs when ProfilePhoto changes
    }
  }, [userData?.ProfilePhoto]); 

  useEffect(() => {
    const pathname = location.pathname;
    const selectedMenu = getSelectedMenu(pathname);
    setUserSelectedMenu(selectedMenu);
  }, [location, setUserSelectedMenu]); // Added setUserSelectedMenu to dependencies

  function getSelectedMenu(pathname) {
    switch (pathname) {
      case '/users':
        return '1';
      case '/aboutUs':
        return '2';
      case '/contactUs':
        return '3';
      case '/serviceProviders':
        return '4';
      case '/history':
        return '5';
      default:
        return '1';
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        message.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureUrl(reader.result);
        setFormData(prev => ({
          ...prev,
          ProfilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    form.setFieldsValue(userData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const updatedData = {
        ...userData,
        ...values,
        ProfilePicture: formData.ProfilePicture || userData?.ProfilePicture || null
      };

      localStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
      
      try {
        await axios.put(`http://localhost:3000/Users/${userData?.id || userData?.UserID}`, updatedData);
      } catch (apiError) {
        console.log('API update skipped or failed');
      }

      message.success('Profile updated successfully!');
      setEditMode(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Please fill all required fields correctly');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to Logout?',
      okText: 'LOGOUT',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedInUser');
        setUserData(null);
        navigate('/login');
      },
    });
  };

  const getUserInitials = () => {
    if (userData) {
      const firstName = userData.FirstName || '';
      const lastName = userData.LastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  const isLoggedInUser = localStorage.getItem('isLoggedInUser') === 'true';

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          {/* Logo Section with 3D Spin Animation */}
          <div className="logo-section">
            <div className="logo-wrapper">
              <img 
                src={companyLogo} 
                alt="company-logo" 
                className="company-logo spinning-logo" 
              />
            </div>
            <div className="company-info">
              <h1>E-Payment-System</h1>
              <p className="slogan">your trusted online payment system</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="header-nav">
            {/* Desktop Navigation */}
            <div className="desktop-nav">
              <NavLink to="/users" className="nav-link" activeClassName="active">
                <FaHome /> Home
              </NavLink>
              <NavLink to="/contactUs" className="nav-link" activeClassName="active">
                Contact Us
              </NavLink>
              <NavLink to="/aboutUs" className="nav-link" activeClassName="active">
                About Us
              </NavLink>
              {isLoggedInUser && (
                <>
                  <NavLink to="/serviceProviders" className="nav-link" activeClassName="active">
                    Payment
                  </NavLink>
                  <NavLink to="/history" className="nav-link" activeClassName="active">
                    History
                  </NavLink>
                </>
              )}
            </div>

            {/* User Profile / Login */}
            <div className="user-section">
              {isLoggedInUser ? (
                <div className="user-profile" onClick={handleEdit}>
                  {profilePictureUrl && profilePictureUrl !== 'http://localhost:3000/null' ? (
                    <img 
                      src={profilePictureUrl} 
                      alt="Profile" 
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar-initial">
                      {getUserInitials()}
                    </div>
                  )}
                  <button className="logout-btn" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                    <LogoutOutlined /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="login-link">
                  <img src={USER} alt="login-icon" className="login-icon" />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleMenu}>
              <MenuOutlined />
            </button>
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && isSmallScreen && (
          <div className="mobile-menu">
            <NavLink to="/users" className="mobile-nav-link" onClick={closeMenu}>
             Home
            </NavLink>
            <NavLink to="/contactUs" className="mobile-nav-link" onClick={closeMenu}>
              Contact Us
            </NavLink>
            <NavLink to="/aboutUs" className="mobile-nav-link" onClick={closeMenu}>
              About Us
            </NavLink>
            {isLoggedInUser && (
              <>
                <NavLink to="/serviceProviders" className="mobile-nav-link" onClick={closeMenu}>
                  Payment
                </NavLink>
                <NavLink to="/history" className="mobile-nav-link" onClick={closeMenu}>
                  History
                </NavLink>
              </>
            )}
            {isLoggedInUser && (
              <button className="mobile-logout-btn" onClick={() => { closeMenu(); handleLogout(); }}>
                <LogoutOutlined /> Logout
              </button>
            )}
          </div>
        )}
      </header>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            <FaUserPlus style={{ color: '#667eea', marginRight: '10px' }} />
            Edit Profile
          </div>
        }
        open={editMode}
        onCancel={() => {
          setEditMode(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="edit-profile-modal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={userData}
          onFinish={handleSave}
        >
          {/* Profile Photo */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {profilePictureUrl && profilePictureUrl !== 'http://localhost:3000/null' ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #667eea'
                  }}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '3px solid #667eea'
                }}>
                  <span style={{ fontSize: '40px', color: 'white', fontWeight: 'bold' }}>
                    {getUserInitials()}
                  </span>
                </div>
              )}
              <label
                htmlFor="profilePictureInput"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: '2px solid white',
                  color: 'white'
                }}
              >
                <FaCamera size={14} />
              </label>
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              Click camera icon to change photo
            </p>
          </div>

          <div className="modal-form-row">
            <Form.Item
              name="FirstName"
              label={
                <span>
                  <MdPerson style={{ color: '#667eea' }} /> FIRST NAME
                </span>
              }
              rules={[{ required: true, message: 'First Name is required' }]}
            >
              <Input placeholder="Enter first name" className="form-input" />
            </Form.Item>

            <Form.Item
              name="LastName"
              label={
                <span>
                  <MdPerson style={{ color: '#667eea' }} /> LAST NAME
                </span>
              }
              rules={[{ required: true, message: 'Last Name is required' }]}
            >
              <Input placeholder="Enter last name" className="form-input" />
            </Form.Item>
          </div>

          <div className="modal-form-row">
            <Form.Item
              name="UserName"
              label={
                <span>
                  <FaUser style={{ color: '#667eea' }} /> USERNAME
                </span>
              }
              rules={[{ required: true, message: 'Username is required' }]}
            >
              <Input placeholder="Enter username" className="form-input" />
            </Form.Item>

            <Form.Item
              name="Gender"
              label={
                <span>
                  <FaGenderless style={{ color: '#667eea' }} /> GENDER
                </span>
              }
              rules={[{ required: true, message: 'Gender is required' }]}
            >
              <select className="form-input" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '2px solid #e0e0e0' }}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Form.Item>
          </div>

          <div className="modal-form-row">
            <Form.Item
              name="Email"
              label={
                <span>
                  <MdEmail style={{ color: '#667eea' }} /> EMAIL
                </span>
              }
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input placeholder="Enter email" className="form-input" />
            </Form.Item>

            <Form.Item
              name="PhoneNumber"
              label={
                <span>
                  <MdPhone style={{ color: '#667eea' }} /> PHONE
                </span>
              }
              rules={[{ required: true, message: 'Phone number is required' }]}
            >
              <Input placeholder="+251 XXX XXX XXX" className="form-input" />
            </Form.Item>
          </div>

          <Form.Item
            name="Address"
            label={
              <span>
                <MdHome style={{ color: '#667eea' }} /> ADDRESS
              </span>
            }
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input placeholder="Enter your address" className="form-input" />
          </Form.Item>

          <Form.Item
            name="UserID"
            label="USER ID"
          >
            <Input disabled className="form-input" style={{ backgroundColor: '#f5f5f5' }} />
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => { setEditMode(false); form.resetFields(); }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
            >
              <FaUserPlus style={{ marginRight: '8px' }} />
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default Header;