import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { MenuOutlined, LogoutOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import companyLogo from '../image/logoimage.jpg';
import USER from '../image/himage3.jpg';
import { Form, Button, Input, Modal, message } from 'antd';
import axios from 'axios';
import {
  FaUser,
  FaUserPlus, FaCamera, FaGenderless
} from 'react-icons/fa';
import { MdEmail, MdPerson, MdPhone, MdHome } from 'react-icons/md';
import './Header.css';

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
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

  const getProfilePictureUrl = (userData) => {
    if (!userData) return '';
    
    const profilePhoto = userData.ProfilePhoto || userData.profilePicture || userData.ProfilePicture;
    
    if (!profilePhoto) return '';
    
    if (profilePhoto.startsWith('data:image') || profilePhoto.startsWith('http')) {
      return profilePhoto;
    }
    
    return `http://localhost:3000/${profilePhoto}`;
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedInUser');

    if (loggedIn === 'true') {
      try {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          setFormData(parsedData);
          
          const picUrl = getProfilePictureUrl(parsedData);
          setProfilePictureUrl(picUrl);
        }
      } catch (error) {
        // Silent fail
      }
    }

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 800);
    };

    handleResize();
    if (!isSmallScreen) closeMenu();
    window.addEventListener('resize', handleResize);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSmallScreen]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userData') {
        try {
          const updatedData = JSON.parse(e.newValue);
          if (updatedData) {
            setUserData(updatedData);
            setFormData(updatedData);
            const picUrl = getProfilePictureUrl(updatedData);
            setProfilePictureUrl(picUrl);
          }
        } catch (error) {
          // Silent fail
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
        const imageDataUrl = reader.result;
        setProfilePictureUrl(imageDataUrl);
        setFormData(prev => ({
          ...prev,
          ProfilePicture: imageDataUrl,
          ProfilePhoto: imageDataUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setIsDropdownOpen(false);
    form.setFieldsValue(userData);
  };

  const handleChangePassword = () => {
    setIsDropdownOpen(false);
    navigate('/users/updatepassword');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const updatedData = {
        ...userData,
        ...values,
        ProfilePicture: formData.ProfilePicture || userData?.ProfilePicture || userData?.ProfilePhoto || null,
        ProfilePhoto: formData.ProfilePicture || userData?.ProfilePicture || userData?.ProfilePhoto || null
      };

      localStorage.setItem('userData', JSON.stringify(updatedData));
      
      setUserData(updatedData);
      setFormData(updatedData);
      
      const picUrl = getProfilePictureUrl(updatedData);
      setProfilePictureUrl(picUrl);
      
      try {
        const userId = userData?.id || userData?.UserID;
        if (userId) {
          await axios.put(`http://localhost:3000/Users/${userId}`, updatedData);
        }
      } catch (apiError) {
        // Silent fail
      }

      message.success('Profile updated successfully!');
      setEditMode(false);
      setLoading(false);
    } catch (error) {
      message.error('Please fill all required fields correctly');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
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
        setProfilePictureUrl('');
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
      <header className="app-header">
        <div className="header-content">
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

          <nav className="header-nav">
            <div className="desktop-nav">
              <NavLink to="/users" className="nav-link" activeClassName="active">
                Home
              </NavLink>
              <NavLink to="/aboutUs" className="nav-link" activeClassName="active">
                About Us
              </NavLink>
              <NavLink to="/contactUs" className="nav-link" activeClassName="active">
                Contact Us
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

            <div className="user-section">
              {isLoggedInUser ? (
                <div className="user-profile-dropdown" ref={dropdownRef}>
                  <div className="user-profile-trigger" onClick={toggleDropdown}>
                    {profilePictureUrl && profilePictureUrl !== 'http://localhost:3000/null' ? (
                      <img 
                        src={profilePictureUrl} 
                        alt="Profile" 
                        className="profile-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const initialsDiv = document.createElement('div');
                          initialsDiv.className = 'profile-avatar-initial';
                          initialsDiv.textContent = getUserInitials();
                          parent.appendChild(initialsDiv);
                        }}
                      />
                    ) : (
                      <div className="profile-avatar-initial">
                        {getUserInitials()}
                      </div>
                    )}
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="profile-dropdown-menu">
                      <div className="dropdown-item" onClick={handleEdit}>
                        <UserOutlined className="dropdown-icon" />
                        <span>Edit Profile</span>
                      </div>
                      <div className="dropdown-item" onClick={handleChangePassword}>
                        <KeyOutlined className="dropdown-icon" />
                        <span>Change Password</span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-item logout-item" onClick={handleLogout}>
                        <LogoutOutlined className="dropdown-icon" />
                        <span>Logout</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-link">
                  <img src={USER} alt="login-icon" className="login-icon" />
                  Login
                </Link>
              )}
            </div>

            <button className="mobile-menu-btn" onClick={toggleMenu}>
              <MenuOutlined />
            </button>
          </nav>
        </div>

        {isMenuOpen && isSmallScreen && (
          <div className="mobile-menu">
            <NavLink to="/users" className="mobile-nav-link" onClick={closeMenu}>
             Home
            </NavLink>
              <NavLink to="/aboutUs" className="mobile-nav-link" onClick={closeMenu}>
              About Us
            </NavLink>
            <NavLink to="/contactUs" className="mobile-nav-link" onClick={closeMenu}>
              Contact Us
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
              <>
                <div className="mobile-divider"></div>
                <NavLink to="/users/updatepassword" className="mobile-nav-link" onClick={closeMenu}>
                  <KeyOutlined /> Change Password
                </NavLink>
                <button className="mobile-logout-btn" onClick={() => { closeMenu(); handleLogout(); }}>
                  <LogoutOutlined /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </header>

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
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    const initialsDiv = document.createElement('div');
                    initialsDiv.style.cssText = `
                      width: 100px;
                      height: 100px;
                      borderRadius: 50%;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      display: flex;
                      justifyContent: center;
                      alignItems: center;
                      border: 3px solid #667eea;
                    `;
                    const span = document.createElement('span');
                    span.style.cssText = 'fontSize: 40px; color: white; fontWeight: bold;';
                    span.textContent = getUserInitials();
                    initialsDiv.appendChild(span);
                    parent.appendChild(initialsDiv);
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