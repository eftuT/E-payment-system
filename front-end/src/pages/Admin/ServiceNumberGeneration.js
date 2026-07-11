import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Modal, Spin, Table, message, Input as AntInput } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { FaUserPlus, FaUsers, FaHashtag, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import Dashboard from './Dashboard';
import './ServiceNumberGeneration.css';

const ServiceNumberGeneration = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [userList, setUserList] = useState([]);
  const [formData, setFormData] = useState({
    UserID: '',
    serviceProviderBINs: [],
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showList, setShowList] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [isListLoading, setIsListLoading] = useState(false);

  // ========== LOAD ADMIN DATA ==========
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdminData(parsedAdmin);
      } catch (e) {
        console.error('Error parsing admin data:', e);
        navigate('/admin/login');
        message.error('Session expired. Please login again.');
      }
    } else {
      navigate('/admin/login');
      message.error('Please login to access the dashboard');
    }
    localStorage.setItem('selectedMenu', 10);
  }, [navigate]);

  // ========== LOAD SAVED USER LIST FROM LOCALSTORAGE ==========
  useEffect(() => {
    const savedUsers = localStorage.getItem('serviceNumberUsers');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUserList(parsedUsers);
          setShowList(true);
        }
      } catch (e) {
        console.error('Error loading saved users:', e);
      }
    }
  }, []);

  // ========== AUTO-REFRESH USERS ON MOUNT ==========
  useEffect(() => {
    if (adminData) {
      refreshUserList();
    }
    setIsLoading(false);
  }, [adminData]);

  // ========== REFRESH USER LIST FUNCTION ==========
  const refreshUserList = async () => {
    setIsListLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/Users');
      const responseData = response.data;

      if (response.status === 200 && responseData) {
        let users = [];
        if (Array.isArray(responseData)) {
          users = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          users = responseData.data;
        } else {
          users = [responseData];
        }

        const modifiedData = users
          .map((user) => {
            let serviceProviders = [];

            // Handle ServiceProviders array
            if (user.ServiceProviders && Array.isArray(user.ServiceProviders)) {
              serviceProviders = user.ServiceProviders.map((sp) => ({
                serviceNo: sp.userServiceProvider?.serviceNo || sp.serviceNo || 'N/A',
                name: sp.serviceProviderName || sp.name || 'Unknown'
              }));
            } 
            // Handle serviceProviders array
            else if (user.serviceProviders && Array.isArray(user.serviceProviders)) {
              serviceProviders = user.serviceProviders.map((sp) => ({
                serviceNo: sp.serviceNo || 'N/A',
                name: sp.name || 'Unknown'
              }));
            }
            // Handle serviceProviderBINs directly
            else if (user.serviceProviderBINs && Array.isArray(user.serviceProviderBINs)) {
              serviceProviders = user.serviceProviderBINs.map((bin) => ({
                serviceNo: bin,
                name: 'Service Provider'
              }));
            }

            // Only include users with service providers
            if (serviceProviders.length > 0) {
              return {
                UserID: user.UserID || user.userId || 'N/A',
                FirstName: user.FirstName || user.firstName || 'Unknown',
                LastName: user.LastName || user.lastName || '',
                serviceProviders: serviceProviders
              };
            }
            return null;
          })
          .filter(user => user !== null);

        setUserList(modifiedData);
        setShowList(true);
        setIsListLoading(false);

        // Save to localStorage for persistence
        localStorage.setItem('serviceNumberUsers', JSON.stringify(modifiedData));

        if (modifiedData.length === 0) {
          message.info('No users with service numbers found.');
        } else {
          message.success(`Found ${modifiedData.length} users with service numbers.`);
        }
      } else {
        message.error('Failed to fetch users.');
        setIsListLoading(false);
      }
    } catch (error) {
      console.error('Error refreshing user list:', error);
      message.error('Failed to fetch users. Please try again.');
      setIsListLoading(false);
    }
  };

  // ========== HANDLE SEARCH ==========
  const handleSearch = async (value) => {
    setSearchInput(value);
    
    // Log activity
    if (adminData) {
      const activity = {
        adminName: `Admin ${adminData?.user?.FirstName || 'Admin'}`,
        action: 'Searched for',
        targetAdminName: `${value} in service Number List`,
        timestamp: new Date().getTime(),
      };

      try {
        await axios.post('http://localhost:3000/admin-activity', activity, {
          headers: { Authorization: adminData?.token },
        });
      } catch (error) {
        console.error('Error saving admin search activity:', error);
      }
    }

    if (userList.length > 0 && value.trim()) {
      const searchTerm = value.toLowerCase().trim();
      const filteredUsers = userList.filter((user) =>
        user.serviceProviders?.some((provider) =>
          String(provider.serviceNo || '').toLowerCase().includes(searchTerm) ||
          String(user.UserID || '').toLowerCase().includes(searchTerm) ||
          String(user.FirstName || '').toLowerCase().includes(searchTerm) ||
          String(user.LastName || '').toLowerCase().includes(searchTerm) ||
          String(provider.name || '').toLowerCase().includes(searchTerm)
        ) ||
        // Also search in the user object directly
        String(user.UserID || '').toLowerCase().includes(searchTerm) ||
        String(user.FirstName || '').toLowerCase().includes(searchTerm) ||
        String(user.LastName || '').toLowerCase().includes(searchTerm)
      );
      setFilteredUserList(filteredUsers);
    } else {
      setFilteredUserList([]);
    }
  };

  // ========== VALIDATE FORM ==========
  const validateForm = async () => {
    try {
      await form.validateFields();
      return true;
    } catch (error) {
      const newErrors = {};
      error.errorFields.forEach((field) => {
        newErrors[field.name[0]] = field.errors[0];
      });
      setErrors(newErrors);
      return false;
    }
  };

  // ========== HANDLE INPUT CHANGE ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'serviceProviderBINs') {
      processedValue = value.split(/[,\s]+/).filter(item => item.trim() !== '');
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ========== HANDLE SUBMIT ==========
  const handleSubmit = async () => {
    setErrors({});
    setGeneratedData(null);
    
    if (await validateForm()) {
      setLoading(true);
      try {
        const { UserID, serviceProviderBINs } = formData;
        const binsArray = Array.isArray(serviceProviderBINs) 
          ? serviceProviderBINs 
          : [serviceProviderBINs];
        
        const formDataToSend = {
          UserID,
          serviceProviderBINs: binsArray,
        };
        
        const response = await axios.post('http://localhost:3000/Users/associate', formDataToSend);
        const responseData = response.data;

        if (response.status === 200) {
          const userData = responseData.user || responseData;
          
          // Prepare table data
          const serviceProviders = userData.ServiceProviders || [];
          const tableData = {
            UserID: userData.UserID || UserID,
            FirstName: userData.FirstName || 'Unknown',
            LastName: userData.LastName || '',
            serviceProviders: serviceProviders.map((sp) => ({
              serviceNo: sp.userServiceProvider?.serviceNo || sp.serviceNo || 'N/A',
              name: sp.serviceProviderName || sp.name || 'Unknown'
            }))
          };

          // Update user list and save to localStorage
          setUserList((prevList) => {
            const exists = prevList.some(user => user.UserID === tableData.UserID);
            let newList;
            if (exists) {
              newList = prevList.map(user => 
                user.UserID === tableData.UserID ? tableData : user
              );
            } else {
              newList = [tableData, ...prevList];
            }
            // Save to localStorage
            localStorage.setItem('serviceNumberUsers', JSON.stringify(newList));
            return newList;
          });
          
          setShowList(true);
          
          // Show success modal
          setGeneratedData({
            UserID: userData.UserID || UserID,
            serviceProviderBINs: binsArray,
            serviceProviders: serviceProviders
          });
          
          setModalVisible(true);
          setModalContent(userData);
          
          // Log activity
          if (adminData) {
            const activity = {
              adminName: `Admin ${adminData?.user?.FirstName || 'Admin'}`,
              action: `associated user UserID: "${formDataToSend.UserID}"`,
              targetAdminName: `with serviceBINs: "${formDataToSend.serviceProviderBINs.join(', ')}"`,
              timestamp: new Date().getTime(),
            };

            axios.post('http://localhost:3000/admin-activity', activity, {
              headers: { Authorization: adminData?.token },
            }).catch(err => console.error('Activity log error:', err));
          }
          
          message.success(`User associated successfully!`);
          form.resetFields();
          setFormData({ UserID: '', serviceProviderBINs: [] });
          setLoading(false);
          
        } else {
          message.error(responseData.message || 'Failed to associate user');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error associating user with service providers:', error);
        
        if (error.response) {
          if (error.response.status === 404) {
            message.error('User not found. Please check the User ID.');
          } else if (error.response.status === 400) {
            message.error(error.response.data?.message || 'Invalid request. Please check your input.');
          } else if (error.response.status === 409) {
            message.error('User already associated with these service providers.');
          } else {
            message.error(error.response.data?.message || 'Failed to associate user. Please try again.');
          }
        } else if (error.request) {
          message.error('No response from server. Please check your connection.');
        } else {
          message.error('Failed to associate user. Please try again.');
        }
        setLoading(false);
      }
    }
  };

  // ========== TABLE COLUMNS ==========
  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="sn-index">{index + 1}</span>,
      width: 50,
    },
    {
      title: 'User ID',
      dataIndex: 'UserID',
      key: 'UserID',
      render: (text) => <span className="sn-user-id">{text || 'N/A'}</span>,
      sorter: (a, b) => (a.UserID || '').localeCompare(b.UserID || ''),
    },
    {
      title: 'User Name',
      key: 'userName',
      render: (_, record) => (
        <span className="sn-user-name">
          {record.FirstName || ''} {record.LastName || ''}
        </span>
      ),
      sorter: (a, b) => ((a.FirstName || '') + (a.LastName || '')).localeCompare((b.FirstName || '') + (b.LastName || '')),
    },
    {
      title: 'Service No',
      key: 'serviceNo',
      render: (_, record) => (
        <span>
          {record.serviceProviders?.map((provider, idx) => (
            <div key={idx} className="sn-service-tag">{provider.serviceNo || 'N/A'}</div>
          ))}
        </span>
      ),
    },
    {
      title: 'Service Name',
      key: 'name',
      render: (_, record) => (
        <span>
          {record.serviceProviders?.map((provider, idx) => (
            <div key={idx} className="sn-service-name">{provider.name || 'N/A'}</div>
          ))}
        </span>
      ),
    },
  ];

  // ========== GET DISPLAY DATA ==========
  const getDisplayData = () => {
    if (searchInput && filteredUserList.length > 0) {
      return filteredUserList;
    }
    return userList;
  };

  // ========== RENDER LOADING ==========
  if (isLoading) {
    return (
      <div className="sn-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  // ========== RENDER MAIN ==========
  return (
    <Dashboard content={
      <div className="sn-container">
        <div className="sn-card">
          {/* Header */}
          <div className="sn-header">
            <div className="sn-header-left">
              <div className="sn-icon">
                <FaHashtag />
              </div>
              <div>
                <h1>Service Number Generation</h1>
                <p>Associate users with service providers</p>
              </div>
            </div>
            <div className="sn-badge">
              <FaUserPlus /> Generate
            </div>
          </div>

          <div className="sn-body">
            {/* Form */}
            <div className="sn-form-wrapper">
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div className="sn-form-grid">
                  <div className="form-group">
                    <label>
                      <UserOutlined className="field-icon" />
                      User ID <span className="required">*</span>
                    </label>
                    <Input
                      name="UserID"
                      placeholder="Enter User ID"
                      value={formData.UserID}
                      onChange={handleChange}
                      className={errors.UserID ? 'error' : ''}
                      status={errors.UserID ? 'error' : ''}
                    />
                    {errors.UserID && <div className="error-message">{errors.UserID}</div>}
                  </div>

                  <div className="form-group">
                    <label>
                      <FaBuilding className="field-icon" />
                      Service Provider BINs <span className="required">*</span>
                    </label>
                    <Input
                      name="serviceProviderBINs"
                      placeholder="Enter BINs (comma or space separated)"
                      value={formData.serviceProviderBINs}
                      onChange={handleChange}
                      className={errors.serviceProviderBINs ? 'error' : ''}
                      status={errors.serviceProviderBINs ? 'error' : ''}
                    />
                    {errors.serviceProviderBINs && <div className="error-message">{errors.serviceProviderBINs}</div>}
                    <span className="field-hint">Enter any BINs (numbers, letters, or both) separated by comma or space</span>
                  </div>
                </div>

                <div className="sn-form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="submit-btn"
                  >
                    {loading ? 'Generating...' : <> Generate Service Number</>}
                  </Button>
                </div>
              </Form>
            </div>

            {/* List Users Button */}
            <div className="sn-list-section">
              <Button 
                onClick={refreshUserList} 
                className="list-users-btn"
                loading={isListLoading}
              >
                <FaUsers /> List Users with Service Numbers
              </Button>
            </div>

            {/* User List */}
            <div className="sn-list-wrapper">
              <div className="sn-list-header">
                <h2><FaUsers /> Users with Service Numbers</h2>
                <span className="sn-list-count">{userList.length} Users</span>
              </div>

              <div className="sn-search-wrapper">
                <AntInput
                  placeholder="Search by User ID, Name, Service No or Service Name..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined className="search-icon" />}
                  className="sn-search-input"
                  allowClear
                />
              </div>

              <div className="sn-table-wrapper">
                <Table 
                  dataSource={getDisplayData()} 
                  columns={columns} 
                  scroll={{ x: 800 }}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total) => `Total ${total} users`,
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    },
                    onShowSizeChange: (current, size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    },
                  }}
                  className="sn-table"
                  rowClassName="sn-table-row"
                  rowKey={(record, index) => record.UserID || index}
                  locale={{ 
                    emptyText: 'No users with service numbers yet. Generate one above!' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <Modal
          title={
            <div className="modal-title">
              <FaCheckCircle className="modal-title-icon success" /> Association Successful
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)} className="modal-close-btn">
              Close
            </Button>,
          ]}
          width={550}
          className="sn-modal"
        >
          <div className="sn-modal-content">
            <div className="sn-modal-icon">
              <FaCheckCircle />
            </div>
            <h3>Service Numbers Generated Successfully!</h3>
            
            <div className="sn-modal-details">
              <div className="sn-modal-row">
                <span>User ID:</span>
                <span className="sn-modal-value">{modalContent?.UserID || generatedData?.UserID || 'N/A'}</span>
              </div>
              <div className="sn-modal-row">
                <span>User Name:</span>
                <span className="sn-modal-value">
                  {modalContent?.FirstName || ''} {modalContent?.LastName || ''}
                </span>
              </div>
              
              <div className="sn-modal-divider">Service Providers Associated</div>
              
              {modalContent?.ServiceProviders?.length > 0 ? (
                modalContent.ServiceProviders.map((sp, idx) => (
                  <div key={idx} className="sn-modal-provider">
                    <div className="sn-modal-provider-row">
                      <span className="sn-modal-provider-label">Service No:</span>
                      <span className="sn-modal-provider-value">
                        {sp.userServiceProvider?.serviceNo || sp.serviceNo || 'N/A'}
                      </span>
                    </div>
                    <div className="sn-modal-provider-row">
                      <span className="sn-modal-provider-label">Service Name:</span>
                      <span className="sn-modal-provider-value">
                        {sp.serviceProviderName || sp.name || 'Unknown'}
                      </span>
                    </div>
                    {idx < modalContent.ServiceProviders.length - 1 && 
                      <div className="sn-modal-provider-divider"></div>
                    }
                  </div>
                ))
              ) : (
                <div className="sn-modal-provider">
                  <div className="sn-modal-provider-row">
                    <span className="sn-modal-provider-label">Service No:</span>
                    <span className="sn-modal-provider-value">
                      {generatedData?.serviceProviderBINs?.join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    } />
  );
};

export default ServiceNumberGeneration;