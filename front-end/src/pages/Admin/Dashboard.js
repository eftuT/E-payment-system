import React, { useEffect, useState } from 'react';
import axios from 'axios';
import companyLogo from '../../image/logoimage.jpg';
import { Layout, Menu, Button, Form, Input, Modal, message, Spin } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  SolutionOutlined,
  TransactionOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

const Dashboard = ({ content }) => {

  // State variables
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(adminData?.user?.ProfilePicture ? `http://localhost:3000/${adminData.user.ProfilePicture}` : '');
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(true);
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
    setSelectedMenu([key]);
  };

  useEffect(() => {
    setSelectedMenu(localStorage.getItem("selectedMenu"));
    try {
      const loggedInAdmin = localStorage.getItem('adminData');
      const parsedAdminData = JSON.parse(loggedInAdmin);
      setFormData(parsedAdminData.user);
      setAdminData(parsedAdminData);
      console.log(profilePictureUrl);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      message.error('Error parsing admin data');
      // Handle error while parsing the data from localStorage
    }
  }, [selectedMenu]);

  useEffect(() => {
    // Check if adminData exists
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
      }, 5000);

    } else {
      setIsLoading(false);
    }
    localStorage.setItem('selectedMenu', selectedMenu);

  }, [adminData, navigate]);




  if (isLoading) {
    return (
      // Show loading spinner while checking login status
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setProfilePictureUrl(url);
    setFormData((prevData) => ({
      ...prevData,
      ProfilePicture: file,
    }));
  };

  const handleEdit = (admin) => {
    form.setFieldsValue(admin);
    setEditMode(true);
    setAdmin(admin);
  };

  const handleSiderHover = (isHovered) => {
    setIsSiderCollapsed(!isHovered);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    Modal.confirm({
      title: 'Confirm Edit',
      content: 'Are you sure you want to edit this admin?',
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

          // Send the updated admin profile to the server
          const response = await axios.put(
            `http://localhost:3000/Users/${adminId}`,
            updatedAdminData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const abcd = await axios.get(
            `http://localhost:3000/Users/${adminId}`)
          console.log(abcd);
          // Update the admin data in local storage and state
          const updatedAdmin = response.data;
          localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
          setAdminData(updatedAdmin);
          console.log(formData);
          console.log(formData.ProfilePicture);
          console.log(updatedAdmin);

          message.success('Admin data updated successfully.');

        } catch (error) {
          console.error('Error updating admin profile:', error);
          message.error('Error updating admin profile');
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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('isLoggedInAdmin');
        setAdminData(null);
        navigate('/admin/login');
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={isSiderCollapsed ? 190 : 350}
        onMouseEnter={() => handleSiderHover(true)}
        onMouseLeave={() => handleSiderHover(false)}
        style={{
          backgroundColor: '#333333',
          color: '#ffffff'
        }}
      >
        {isSiderCollapsed ? (
          <div className='logo' style={{ position: 'relative', width: '100%', height: '110px' }} >
            <img src={companyLogo} alt='company logo' />
            <div className='company-name' style={{ marginTop: '10%' }} >
              E-pay...
              <div className="slogan-container" >
                <div className="slogan" style={{ '--delay': '0s' }}>
                  your
                </div>
                <div className="slogan" style={{ '--delay': '0.2s' }}>
                  trusted
                </div>
                <div className="slogan" style={{ '--delay': '0.4s' }}>
                  online
                </div>
                <div className="slogan" style={{ '--delay': '0.6s' }}>
                  payment
                </div>
                <div className="slogan" style={{ '--delay': '0.8s' }}>
                  system
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='logo' style={{ position: 'relative', width: '100%', height: '110px' }} >
            <img src={companyLogo} alt='company logo' />
            <div className='company-name'>
              E-payment-system
              <div className='slogan'>your trusted online payment system</div>
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          selectedKeys={[selectedMenu]}
          onSelect={handleMenuSelect}
          style={{
            backgroundColor: '#333333',

          }}
        >

          <Menu.SubMenu
            key="submenu"
            icon={<HomeOutlined />}
            title="E-Payment System"
            style={{ position: 'fixed', marginTop: '-5px', minWidth: '190px', width: isSiderCollapsed ? '190px' : '350px', }}
          >
            <Menu.Item key="2" icon={<BankOutlined />}>
              <Link
                to={`/admin/agents/registration/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Agents Registration
              </Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<BankOutlined />}>
              <Link
                to={`/admin/agents/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Agents List
              </Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<SolutionOutlined />}>
              <Link
                to={`/admin/service-providers/registration/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Service Providers Registration
              </Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<SolutionOutlined />}>
              <Link
                to={`/admin/service-providers/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Service Providers List
              </Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<UserOutlined />}>
              <Link
                to={`/admin/user/registration/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Admin Registration
              </Link>
            </Menu.Item>
            <Menu.Item key="7" icon={<UserOutlined />}>
              <Link
                to={`/admin/adminsList/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Admin List
              </Link>
            </Menu.Item>
            <Menu.Item key="8" icon={<UserOutlined />}>
              <Link
                to={`/admin/usersList/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Users List
              </Link>
            </Menu.Item>
            <Menu.Item key="9" icon={<TransactionOutlined />}>
              <Link
                to={`/admin/transactions/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Transactions
              </Link>
            </Menu.Item>
            <Menu.Item key="10" icon={<AppstoreOutlined />}>
              <Link
                to={`/admin/serviceNogenerator/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Service Number Generation
              </Link>
            </Menu.Item>
            <Menu.Item key="11" icon={<AppstoreOutlined />}>
              <Link
                to={`/admin/billgenerator/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Bill Generation
              </Link>
            </Menu.Item>
            <Menu.Item key="12" icon={<AppstoreOutlined />}>
              <Link
                to={`/admin/activities/${formData.id}`}
                style={{ color: '#ffffff' }}
              >
                Activities
              </Link>
            </Menu.Item>
            
          </Menu.SubMenu>
        </Menu>
      </Sider>
      <Layout>
        <Header
          className="site-layout-background"
          style={{ padding: 0, display: 'flex', justifyContent: 'space-between' }}
        >
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center' }}>
            <Link type="primary" onClick={() => handleEdit(adminData)}>
              <div className="profile-picture" style={{ display: 'flex', alignItems: 'center' }}>
                {adminData.user.ProfilePicture !== null ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="logo-image"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      marginRight: '10px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      margin: '17px',
                      marginRight: '10px',
                      borderRadius: '50%',
                      backgroundImage: 'linear-gradient(to right, rgb(95, 174, 230), rgb(3, 55, 100))',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '24px', color: 'white', justifyContent: 'center' }}>
                      {JSON.parse(localStorage.adminData) && JSON.parse(localStorage.adminData).user.FirstName ? JSON.parse(localStorage.adminData).user.FirstName.charAt(0) : null}
                    </span>
                  </div>
                )}
                <span className="user-name">{formData.FirstName} {formData.LastName}</span>
              </div>
            </Link>
          </div>
          <Link onClick={handleLogout} style={{ paddingRight: 20 }}>
            <LogoutOutlined />
            Logout
          </Link>
        </Header>
        <Content style={{ padding: '10px ' }}>
          {content}
        </Content>
        <Modal
          title={editMode ? 'Edit Admin' : 'Create Admin'}
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

        <Footer style={{ textAlign: 'center' }}>
          E-Payment System ©{new Date().getFullYear()} Created by INSA
        </Footer>
      </Layout >
    </Layout >
  );
};

export default Dashboard;