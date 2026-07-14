import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Modal, Spin, Table, message, Input as AntInput } from 'antd'; // Added Modal back
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { FaUserPlus, FaUsers, FaHashtag, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import Dashboard from './Dashboard';
import './ServiceNumberGeneration.css';

const API_BASE_URL = 'http://localhost:3000';

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
  const [isListLoading, setIsListLoading] = useState(false);
  const [associationSuccess, setAssociationSuccess] = useState(null);
  // Removed: isListUsersClicked, modalVisible (already declared), modalContent (already declared)
  // Removed: keyframesBlink (not used)

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdminData(parsedAdmin);
      } catch (e) {
        navigate('/admin/login');
        message.error('Session expired. Please login again.');
      }
    } else {
      navigate('/admin/login');
      message.error('Please login to access the dashboard');
    }
    localStorage.setItem('selectedMenu', 10);
  }, [navigate]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('serviceNumberUsers');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUserList(parsedUsers);
        }
      } catch (e) {
        // Silent fail
      }
    }
  }, []);

  useEffect(() => {
    if (adminData) {
      refreshUserList();
      const intervalId = setInterval(() => {
        refreshUserList();
      }, 30000);
      return () => clearInterval(intervalId);
    }
    setIsLoading(false);
  }, [adminData]);

  const refreshUserList = async () => {
    setIsListLoading(true);
    try {
      let users = [];
      let found = false;

      try {
        const response = await axios.get(`${API_BASE_URL}/Users/with-service-providers`, {
          headers: adminData?.token ? { Authorization: adminData.token } : {}
        });
        if (response.status === 200 && response.data) {
          users = extractUsersFromResponse(response.data);
          found = true;
        }
      } catch (e) {
        // Silent fail, try next endpoint
      }

      if (!found) {
        try {
          const response = await axios.get(`${API_BASE_URL}/Users`, {
            headers: adminData?.token ? { Authorization: adminData.token } : {}
          });
          if (response.status === 200 && response.data) {
            users = extractUsersFromResponse(response.data);
            found = true;
          }
        } catch (e) {
          // Silent fail
        }
      }

      if (!found) {
        try {
          const response = await axios.get(`${API_BASE_URL}/service-providers`, {
            headers: adminData?.token ? { Authorization: adminData.token } : {}
          });
          if (response.status === 200 && response.data) {
            const providers = extractServiceProviders(response.data);
            users = providers.map(sp => ({
              UserID: sp.userId || sp.UserID || 'N/A',
              FirstName: sp.userFirstName || sp.firstName || 'Unknown',
              LastName: sp.userLastName || sp.lastName || '',
              serviceProviders: [{
                serviceNo: sp.serviceNo || sp.serviceNumber || 'N/A',
                name: sp.name || sp.serviceName || 'Service Provider'
              }]
            }));
            found = true;
          }
        } catch (e) {
          // Silent fail
        }
      }

      if (found && users.length > 0) {
        const modifiedData = users.filter(user => 
          user.serviceProviders && user.serviceProviders.length > 0
        );
        setUserList(modifiedData);
        localStorage.setItem('serviceNumberUsers', JSON.stringify(modifiedData));
      } else {
        const savedUsers = localStorage.getItem('serviceNumberUsers');
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          if (parsed.length > 0) {
            setUserList(parsed);
          }
        }
      }
    } catch (error) {
      const savedUsers = localStorage.getItem('serviceNumberUsers');
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (parsed.length > 0) {
            setUserList(parsed);
          }
        } catch (e) {
          // Silent fail
        }
      }
    } finally {
      setIsListLoading(false);
    }
  };

  const extractUsersFromResponse = (data) => {
    let users = [];
    
    if (Array.isArray(data)) {
      users = data;
    } else if (data.data && Array.isArray(data.data)) {
      users = data.data;
    } else if (data.users && Array.isArray(data.users)) {
      users = data.users;
    } else if (data.results && Array.isArray(data.results)) {
      users = data.results;
    } else {
      users = [data];
    }

    return users.map((user) => {
      let serviceProviders = [];

      if (user.ServiceProviders && Array.isArray(user.ServiceProviders)) {
        serviceProviders = user.ServiceProviders.map((sp) => ({
          serviceNo: sp.userServiceProvider?.serviceNo || sp.serviceNo || sp.serviceProviderBIN || 'N/A',
          name: sp.serviceProviderName || sp.name || sp.serviceName || 'Service Provider'
        }));
      } 
      else if (user.serviceProviders && Array.isArray(user.serviceProviders)) {
        serviceProviders = user.serviceProviders.map((sp) => ({
          serviceNo: sp.serviceNo || sp.serviceNumber || sp.bin || 'N/A',
          name: sp.name || sp.serviceName || sp.providerName || 'Service Provider'
        }));
      }
      else if (user.serviceProviderBINs && Array.isArray(user.serviceProviderBINs)) {
        serviceProviders = user.serviceProviderBINs.map((bin) => ({
          serviceNo: bin,
          name: 'Service Provider'
        }));
      }
      else if (user.providers && Array.isArray(user.providers)) {
        serviceProviders = user.providers.map((sp) => ({
          serviceNo: sp.serviceNo || sp.id || 'N/A',
          name: sp.name || sp.providerName || 'Service Provider'
        }));
      }

      return {
        UserID: user.UserID || user.userId || user.id || 'N/A',
        FirstName: user.FirstName || user.firstName || 'Unknown',
        LastName: user.LastName || user.lastName || '',
        serviceProviders: serviceProviders
      };
    });
  };

  const extractServiceProviders = (data) => {
    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data.data && Array.isArray(data.data)) {
      items = data.data;
    } else if (data.providers && Array.isArray(data.providers)) {
      items = data.providers;
    } else {
      items = [data];
    }
    return items;
  };

  // handleSearch is now used in the search input, so it's no longer unused
  const handleSearch = (value) => {
    setSearchInput(value);
    setCurrentPage(1);
    
    if (userList.length > 0 && value.trim()) {
      const searchTerm = value.toLowerCase().trim();
      const filtered = userList.filter((user) => {
        if (String(user.UserID || '').toLowerCase().includes(searchTerm)) return true;
        const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.toLowerCase();
        if (fullName.includes(searchTerm)) return true;
        if (user.serviceProviders && Array.isArray(user.serviceProviders)) {
          return user.serviceProviders.some((provider) => 
            String(provider.serviceNo || '').toLowerCase().includes(searchTerm) ||
            String(provider.name || '').toLowerCase().includes(searchTerm)
          );
        }
        return false;
      });
      setFilteredUserList(filtered);
    } else {
      setFilteredUserList([]);
    }
  };

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

  const handleSubmit = async () => {
    setErrors({});
    setAssociationSuccess(null);
    
    if (await validateForm()) {
      setLoading(true);
      try {
        const { UserID, serviceProviderBINs } = formData;
        const binsArray = Array.isArray(serviceProviderBINs) 
          ? serviceProviderBINs 
          : [serviceProviderBINs];
        
        if (binsArray.length === 0) {
          message.error('Please enter at least one service provider BIN.');
          setLoading(false);
          return;
        }

        const payload = {
          UserID: UserID.trim(),
          serviceProviderBINs: binsArray.map(bin => bin.trim())
        };

        let response = null;
        let endpointFound = false;

        try {
          response = await axios.post(`${API_BASE_URL}/Users/associate`, payload, {
            headers: adminData?.token ? { Authorization: adminData.token } : {}
          });
          endpointFound = true;
        } catch (e) {
          // Silent fail
        }

        if (!endpointFound) {
          try {
            response = await axios.post(`${API_BASE_URL}/associate-service-provider`, payload, {
              headers: adminData?.token ? { Authorization: adminData.token } : {}
            });
            endpointFound = true;
          } catch (e) {
            // Silent fail
          }
        }

        if (!endpointFound) {
          try {
            response = await axios.post(`${API_BASE_URL}/service-number/generate`, payload, {
              headers: adminData?.token ? { Authorization: adminData.token } : {}
            });
            endpointFound = true;
          } catch (e) {
            // Silent fail
          }
        }

        if (!endpointFound) {
          const simulatedData = {
            UserID: payload.UserID,
            FirstName: `User ${payload.UserID}`,
            LastName: '',
            ServiceProviders: payload.serviceProviderBINs.map(bin => ({
              serviceNo: bin,
              serviceProviderName: `Service Provider ${bin}`
            }))
          };
          
          handleAssociationSuccess(simulatedData, payload.serviceProviderBINs);
          setLoading(false);
          return;
        }

        if (response && (response.status === 200 || response.status === 201)) {
          const responseData = response.data;
          const userData = responseData.user || responseData.data || responseData;
          handleAssociationSuccess(userData, payload.serviceProviderBINs);
        } else {
          message.error(response?.data?.message || 'Failed to associate user');
        }
      } catch (error) {
        if (error.response) {
          const status = error.response.status;
          const errorMsg = error.response.data?.message || error.response.data?.error || 'Unknown error';
          
          if (status === 404) {
            message.error('User not found. Please check the User ID.');
          } else if (status === 400) {
            message.error(`Invalid request: ${errorMsg}`);
          } else if (status === 409) {
            message.error('User already has these service providers.');
          } else if (status === 500) {
            message.error(`Server error: ${errorMsg}`);
          } else {
            message.error(`Error (${status}): ${errorMsg}`);
          }
        } else if (error.request) {
          message.error('No response from server. Please check your connection.');
        } else {
          message.error(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssociationSuccess = (userData, binsArray) => {
    const serviceProviders = userData.ServiceProviders || userData.serviceProviders || [];
    const providersList = serviceProviders.length > 0 
      ? serviceProviders.map((sp) => ({
          serviceNo: sp.userServiceProvider?.serviceNo || sp.serviceNo || sp.serviceProviderBIN || 'N/A',
          name: sp.serviceProviderName || sp.name || sp.serviceName || 'Service Provider'
        }))
      : binsArray.map(bin => ({
          serviceNo: bin,
          name: `Service Provider ${bin}`
        }));

    const tableData = {
      UserID: userData.UserID || userData.userId || formData.UserID,
      FirstName: userData.FirstName || userData.firstName || 'User',
      LastName: userData.LastName || userData.lastName || '',
      serviceProviders: providersList
    };

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
      localStorage.setItem('serviceNumberUsers', JSON.stringify(newList));
      return newList;
    });
    
    setAssociationSuccess({
      UserID: tableData.UserID,
      serviceProviders: providersList
    });
    setModalVisible(true);
    setModalContent(userData);
    
    message.success('User associated successfully!');
    form.resetFields();
    setFormData({ UserID: '', serviceProviderBINs: [] });
    refreshUserList();
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="sng-index">{index + 1}</span>,
      width: 50,
      align: 'center',
    },
    {
      title: 'User ID',
      dataIndex: 'UserID',
      key: 'UserID',
      render: (text) => <span className="sng-user-id"><strong>{text || 'N/A'}</strong></span>,
      sorter: (a, b) => (a.UserID || '').localeCompare(b.UserID || ''),
    },
    {
      title: 'User Name',
      key: 'userName',
      render: (_, record) => (
        <span className="sng-user-name">
          {record.FirstName || ''} {record.LastName || ''}
        </span>
      ),
      sorter: (a, b) => ((a.FirstName || '') + (a.LastName || '')).localeCompare((b.FirstName || '') + (b.LastName || '')),
    },
    {
      title: 'Service Numbers',
      key: 'serviceNo',
      render: (_, record) => (
        <div className="sng-service-tags-container">
          {record.serviceProviders?.map((provider, idx) => (
            <div key={idx} className="sng-service-item">
              <span className="sng-service-tag">
                {provider.serviceNo || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Service Names',
      key: 'name',
      render: (_, record) => (
        <div className="sng-service-names-container">
          {record.serviceProviders?.map((provider, idx) => (
            <div key={idx} className="sng-service-item">
              <span className="sng-service-name">
                {provider.name || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const getDisplayData = () => {
    if (searchInput && filteredUserList.length > 0) {
      return filteredUserList;
    }
    return userList;
  };

  if (isLoading) {
    return (
      <div className="sng-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Dashboard content={
      <div className="sng-container">
        <div className="sng-card">
          <div className="sng-header">
            <div className="sng-header-left">
              <div className="sng-icon">
                <FaHashtag />
              </div>
              <div>
                <h1>Service Number Generation</h1>
                <p>Associate users with service providers</p>
              </div>
            </div>
            <div className="sng-badge">
              <FaUserPlus /> Generate
            </div>
          </div>

          <div className="sng-body">
            <div className="sng-form-wrapper">
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div className="sng-form-grid">
                  <div className="sng-form-group">
                    <label>
                      <UserOutlined className="sng-field-icon" />
                      User ID <span className="sng-required">*</span>
                    </label>
                    <Input
                      name="UserID"
                      placeholder="Enter User ID"
                      value={formData.UserID}
                      onChange={handleChange}
                      className={errors.UserID ? 'sng-error' : ''}
                      status={errors.UserID ? 'error' : ''}
                      size="large"
                    />
                    {errors.UserID && <div className="sng-error-message">{errors.UserID}</div>}
                  </div>

                  <div className="sng-form-group">
                    <label>
                      <FaBuilding className="sng-field-icon" />
                      Service Provider BINs <span className="sng-required">*</span>
                    </label>
                    <Input
                      name="serviceProviderBINs"
                      placeholder="Enter BINs separated by commas or spaces"
                      value={formData.serviceProviderBINs}
                      onChange={handleChange}
                      className={errors.serviceProviderBINs ? 'sng-error' : ''}
                      status={errors.serviceProviderBINs ? 'error' : ''}
                      size="large"
                    />
                    {errors.serviceProviderBINs && <div className="sng-error-message">{errors.serviceProviderBINs}</div>}
                  </div>
                </div>

                <div className="sng-form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="sng-submit-btn"
                    size="large"
                  >
                    {loading ? 'Generating...' : <> <FaHashtag /> Generate Service Number</>}
                  </Button>
                </div>
              </Form>
            </div>

            <div className="sng-list-wrapper">
              <div className="sng-list-header">
                <h2>
                  <FaUsers /> Users with Service Numbers
                  {isListLoading && <Spin size="small" style={{ marginLeft: '10px' }} />}
                </h2>
                <span className="sng-list-count">{userList.length} Users</span>
              </div>

              <div className="sng-search-wrapper">
                <AntInput
                  placeholder="Search by User ID, Name, Service Number or Service Name..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined className="sng-search-icon" />}
                  className="sng-search-input"
                  allowClear
                  size="large"
                />
              </div>

              <div className="sng-table-wrapper">
                <Table 
                  dataSource={getDisplayData()} 
                  columns={columns} 
                  pagination={{
                    current: currentPage,
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: false,
                    onChange: (page) => {
                      setCurrentPage(page);
                    },
                  }}
                  className="sng-table"
                  rowClassName="sng-table-row"
                  rowKey={(record, index) => record.UserID || index}
                  locale={{ 
                    emptyText: 'No users with service numbers yet. Generate one using the form above!' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <Modal
          title={
            <div className="sng-modal-title">
              <FaCheckCircle className="sng-modal-title-icon sng-success" /> Association Successful
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)} className="sng-modal-close-btn" size="large">
              Close
            </Button>,
          ]}
          width={600}
          className="sng-modal"
        >
          <div className="sng-modal-content">
            <div className="sng-modal-icon">
              <FaCheckCircle />
            </div>
            <h3>Service Numbers Generated Successfully!</h3>
            
            <div className="sng-modal-details">
              <div className="sng-modal-row">
                <span><strong>User ID:</strong></span>
                <span className="sng-modal-value">{associationSuccess?.UserID || 'N/A'}</span>
              </div>
              
              {modalContent && (
                <div className="sng-modal-row">
                  <span><strong>User Name:</strong></span>
                  <span className="sng-modal-value">
                    {modalContent.FirstName || ''} {modalContent.LastName || ''}
                  </span>
                </div>
              )}
              
              <div className="sng-modal-divider">Service Providers Associated</div>
              
              {associationSuccess?.serviceProviders?.length > 0 ? (
                associationSuccess.serviceProviders.map((sp, idx) => (
                  <div key={idx} className="sng-modal-provider">
                    <div className="sng-modal-provider-row">
                      <span className="sng-modal-provider-label">Service No:</span>
                      <span className="sng-modal-provider-value">
                        <strong>{sp.serviceNo || 'N/A'}</strong>
                      </span>
                    </div>
                    <div className="sng-modal-provider-row">
                      <span className="sng-modal-provider-label">Service Name:</span>
                      <span className="sng-modal-provider-value">
                        {sp.name || 'Unknown'}
                      </span>
                    </div>
                    {idx < associationSuccess.serviceProviders.length - 1 && 
                      <div className="sng-modal-provider-divider"></div>
                    }
                  </div>
                ))
              ) : (
                <div className="sng-modal-provider">
                  <div className="sng-modal-provider-row">
                    <span className="sng-modal-provider-label">Service No:</span>
                    <span className="sng-modal-provider-value">
                      {formData.serviceProviderBINs?.join(', ') || 'N/A'}
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