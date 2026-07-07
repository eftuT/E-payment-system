import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import companyLogo from '../image/logoimage.jpg';
import USER from '../image/himage3.jpg';
import './style.css';
import { Form } from 'antd';
import { Layout, Button, Input, Modal, message, Menu } from 'antd';
import axios from 'axios';


const { Sider } = Layout;


const Header = () => {

  // State variables
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData')) ? JSON.parse(localStorage.getItem('userData')) : {});
  const [profilePictureUrl, setProfilePictureUrl] = useState(userData?.ProfilePicture ? `http://localhost:3000/${userData.ProfilePicture}` : '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoggedInUser, setIsLoggedInUser] = useState(localStorage.getItem('isLoggedInUser') || false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userSelectedMenu, setUserSelectedMenu] = useState(localStorage.getItem("userSelectedMenu") || '1');
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
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
    if (localStorage.getItem('isLoggedInUser')) {
      try {
        const loggedInUser = localStorage.getItem('userData');
        const parsedAdminData = JSON.parse(loggedInUser);
        setFormData(parsedAdminData.user);
        setUserData(parsedAdminData);
        setProfilePictureUrl(`http://localhost:3000/${userData.ProfilePicture}`);
      } catch (error) {
        console.error('Error parsing user data:', error);
        message.error('Error parsing user data');
        // Handle error while parsing the data from localStorage
      }
    }
    const handleResize = () => {

      setIsSmallScreen(window.innerWidth <= 800);
    };


    handleResize(); // Check on initial load
    if (!isSmallScreen)
      closeMenu();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [window.innerWidth, isMenuOpen, isSmallScreen, editMode]);

  useEffect(() => {
    const pathname = location.pathname;
    const selectedMenu = getSelectedMenu(pathname); // Implement this function to map the current route to the corresponding menu item key
    setUserSelectedMenu(selectedMenu);
  }, [location]);


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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setProfilePictureUrl(url);
    setFormData((prevData) => ({
      ...prevData,
      ProfilePicture: file,
    }));
  };

  const handleEdit = (user) => {
    form.setFieldsValue(user);
    setEditMode(true);
    setUserData(user);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleMenuSelect = ({ key }) => {
    setUserSelectedMenu([key]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    Modal.confirm({
      title: 'Confirm Edit',
      content: 'Are you sure you want to edit your profile ?',
      okText: 'Edit',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Get form values
          const values = await form.validateFields(); // Validate the form fields and get the values

          // Update the formData state with the form values
          setFormData((prevData) => ({
            ...prevData,
            ...values,
          }));

          // Create a new FormData object
          const updatedUserData = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (key === 'ProfilePicture') {
              // Skip the ProfilePicture field if it's not updated
              if (formData.ProfilePicture) {
                updatedUserData.append(key, formData.ProfilePicture);
              }
            } else {
              updatedUserData.append(key, value);
            }
          });


          // Send the updated user profile to the server
          const response = await axios.put(
            `http://localhost:3000/Users/${userData.id}`,
            updatedUserData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const abcd = await axios.get(
            `http://localhost:3000/Users/${userData.id}`)
          console.log(abcd);
          // Update the user data in local storage and state
          const updatedUser = response.data;
          localStorage.setItem('userData', JSON.stringify(updatedUser.user));
          setUserData(updatedUser.user);
          console.log(formData);
          console.log(formData.ProfilePicture);
          console.log(updatedUser);
          setProfilePictureUrl(`http://localhost:3000/${formData.ProfilePicture}`);
          message.success('User data updated successfully.');

        } catch (error) {
          console.error('Error updating user profile:', error);
          message.error('Error updating user profile');
        }

        setEditMode(false);
      },
    });
  };

  const handleLogout = () => {
    setEditMode(false);
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to Logout ?',
      okText: 'LOGOUT',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        // Clear local storage and navigate to the login page
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedInUser')
        setUserData(null);
        navigate('/login');
      },
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  return (
    <div className='container'>
      <div className="overlay-curve" >
        <div className='header' >
          <div className='pp' >
            {isLoggedInUser ? (
              <div className='ppp' >
                <div className='profile-picture' onClick={() => handleEdit(userData)}>
                  {profilePictureUrl !== 'http://localhost:3000/null' ? (
                    <img src={profilePictureUrl} alt="Profile" className="logo-image" style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      marginRight: '10px',
                    }} />
                  ) : (
                    <div style={{ width: '45px', height: '45px', margin: '17px', marginRight: '10px', borderRadius: '50%', backgroundImage: 'linear-gradient(to right, rgb(95, 174, 230), rgb(3, 55, 100))', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', color: 'white', justifyContent: 'center' }}>
                        {localStorage.userData && JSON.parse(localStorage.userData) && JSON.parse(localStorage.userData).FirstName ? (JSON.parse(localStorage.userData).FirstName.charAt(0)) : (null)}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '17px', fontStyle: 'italic', fontWeight: 'bold', justifyContent: 'center', marginTop: '30px', marginRight: '10px' }}>{JSON.parse(localStorage.userData) && JSON.parse(localStorage.userData).FirstName}</div>
                </div>
                <div className='login-box' style={{ justifyContent: 'right' }}>
                  <LogoutOutlined className='login' />
                  <Link className='login' onClick={handleLogout}>
                    Logout
                  </Link>
                </div>
              </div>) : (
              <div className='login-section'>
                <div className='login-box' style={{
                  textAlign: 'right', width: '110PX'
                }}>
                  <img src={USER} alt='login-icon' className='login-icon' style={{ width: '20PX' }}></img>
                  <Link to="/login" className='login'>Login</Link>
                </div>
              </div>)}
          </div>
          <div className='logo-menu'>
            {isSmallScreen ? (
              <div className='nav' style={{ minWidth: '100px' }}>
                <MenuOutlined style={{ fontSize: '40px', position: 'relative' }} onClick={toggleMenu} />
                {isMenuOpen && (
                  <Sider
                    theme="light"
                    trigger={null}
                    collapsible
                    collapsed={isSmallScreen && !isMenuOpen}
                    breakpoint="lg"
                    collapsedWidth="0"
                    className='sider'
                    onBreakpoint={(broken) => {
                      setIsSmallScreen(broken);
                    }} >

                    <Menu
                      theme="light"
                      defaultSelectedKeys={['1']}
                      mode="inline"
                      className='sider'
                      selectedKeys={[userSelectedMenu]}
                      onSelect={handleMenuSelect}

                    >
                      {/* Sidebar menu items */}
                      <Menu.Item key="1" className='nav-item'>
                        <Link to="/users" >Home</Link>
                      </Menu.Item>
                      <Menu.Item key="2" className='nav-item'>
                        <Link to="/aboutUs" >About Us</Link>
                      </Menu.Item>
                      <Menu.Item key="3" className='nav-item'>
                        <Link to="/contactUs" >Contact Us</Link>
                      </Menu.Item>
                      {isLoggedInUser && (
                        <>
                          <Menu.Item key="4" className='nav-item'>
                            <Link to="/serviceProviders" >Payment</Link>
                          </Menu.Item>
                          <Menu.Item key="5" className='nav-item'>
                            <Link to="/history" >History</Link>
                          </Menu.Item>
                        </>
                      )}
                    </Menu>
                  </Sider>)}</div>) : (
              <div className="menu">
                <div className="nav">
                  <NavLink exact to="/users" className="nav-item" activeClassName="active-nav-item">
                    Home
                  </NavLink>
                  <NavLink to="/contactUs" className="nav-item" activeClassName="active-nav-item">
                    Contact Us
                  </NavLink>
                  <NavLink to="/aboutUs" className="nav-item" activeClassName="active-nav-item">
                    About Us
                  </NavLink>
                  {isLoggedInUser ? (
                    <>
                      <NavLink to="/serviceProviders" className="nav-item" activeClassName="active-nav-item">
                        Payment
                      </NavLink>
                      <NavLink to="/history" className="nav-item" activeClassName="active-nav-item">
                        History
                      </NavLink>
                    </>
                  ) : null}
                </div>
              </div>
            )}

            <Modal
              title={editMode ? 'Edit User' : 'Create User'}
              visible={editMode}
              onCancel={() => {
                setEditMode(false);
                form.resetFields();
              }}
              onOk={handleSave}
            >
              <Form form={form} onSubmit={handleSave} initialValues={formData}>
                <Form.Item name="UserID" label="UserID" >
                  <Input onChange={handleFormChange} name="UserID" disabled />
                </Form.Item>
                <Form.Item name="FirstName" label="First Name" >
                  <Input onChange={handleFormChange} name="FirstName" />
                </Form.Item>
                <Form.Item name="LastName" label="Last Name" >
                  <Input onChange={handleFormChange} name="LastName" />
                </Form.Item>
                <Form.Item name="Gender" label="Gender">
                  <Input onChange={handleFormChange} name="Gender" />
                </Form.Item>
                <Form.Item name="UserName" label="User Name" >
                  <Input onChange={handleFormChange} name="UserName" />
                </Form.Item>
                <Form.Item name="Email" label="Email" >
                  <Input type="email" onChange={handleFormChange} name="Email" />
                </Form.Item>
                <Form.Item name="PhoneNumber" label="Phone Number" >
                  <Input type="tel" onChange={handleFormChange} name="PhoneNumber" />
                </Form.Item>
                <Form.Item name="Address" label="Address" onChange={handleFormChange}>
                  <Input onChange={handleFormChange} name="Address" />
                </Form.Item>
                <Form.Item name="ProfilePicture" >
                  <label htmlFor="profilePicture">Profile Picture:</label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept=".jpeg, .jpg, .png, .gif"
                    onChange={handleProfilePictureChange}
                  />
                  {profilePictureUrl && (
                    <img src={profilePictureUrl} alt="Profile" style={{ width: '200px' }} />
                  )}
                </Form.Item>
                <Button type="primary" onClick={handleSave}>
                  Save
                </Button>
              </Form>
            </Modal>
            <div className='logo'>
              <img src={companyLogo} alt='company logo' />
              <div className='company-name'>
                E-payment-system
                <div className='slogan'>your trusted online payment system</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;