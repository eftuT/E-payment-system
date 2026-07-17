import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Form, Input, Spin, Input as AntInput, Upload } from 'antd';
import { DeleteOutlined, EditOutlined, SearchOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { FaUserPlus, FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './ServiceProvidersList.css';

const ServiceProvidersList = ({ isLoggedIn, setIsLoggedIn }) => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [serviceProviderData, setServiceProviderData] = useState([]);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const fetchServiceProviders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/serviceproviders');
      setServiceProviderData(response.data);
      localStorage.setItem('serviceProvidersData', JSON.stringify(response.data));
    } catch (error) {
      message.error('Failed to fetch service providers.');
    }
  };

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
        message.error('Please login to access the dashboard');
      }, 5000);
    } else {
      setIsLoading(false);
    }
    localStorage.setItem('selectedMenu', 5);
    fetchServiceProviders();
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="spl-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const handleEdit = (serviceProvider) => {
    form.setFieldsValue(serviceProvider);
    setEditMode(true);
    setServiceProvider(serviceProvider);
    if (serviceProvider.serviceProviderAuthorizationLetter) {
      setFilePreview(`http://localhost:3000/${serviceProvider.serviceProviderAuthorizationLetter}`);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileChange = (info) => {
    const file = info.file?.originFileObj || info.file;
    if (!file) {
      setFile(null);
      setFilePreview(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(`image/${fileExtension}`) && !allowedTypes.includes(file.type)) {
      message.error('Invalid file type. Please select an image file (JPEG, JPG, PNG, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('File size should be less than 5MB');
      return;
    }

    setFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    Modal.confirm({
      title: 'Confirm Edit',
      content: 'Are you sure you want to edit this service provider?',
      okText: 'Edit',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        form.validateFields().then((values) => {
          setLoading(true);
          const updatedServiceProvider = { ...values };
          
          if (file) {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
              if (key !== 'serviceProviderAuthorizationLetter') {
                formData.append(key, values[key]);
              }
            });
            formData.append('serviceProviderAuthorizationLetter', file);
            
            axios
              .put(`http://localhost:3000/serviceproviders/${serviceProvider.serviceProviderBIN}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              })
              .then((response) => {
                if (response.status === 200) {
                  message.success('Service provider data updated successfully.');
                  fetchServiceProviders();
                  setEditMode(false);
                  form.resetFields();
                  setFile(null);
                  setFilePreview(null);
                } else {
                  message.error('Failed to update service provider data.');
                }
                setLoading(false);
              })
              .catch((error) => {
                message.error('Failed to update service provider data.');
                console.log(error);
                setLoading(false);
              });
          } else {
            axios
              .put(`http://localhost:3000/serviceproviders/${serviceProvider.serviceProviderBIN}`, updatedServiceProvider)
              .then((response) => {
                if (response.status === 200) {
                  message.success('Service provider data updated successfully.');
                  fetchServiceProviders();
                  setEditMode(false);
                  form.resetFields();
                } else {
                  message.error('Failed to update service provider data.');
                }
                setLoading(false);
              })
              .catch((error) => {
                message.error('Failed to update service provider data.');
                console.log(error);
                setLoading(false);
              });
          }

          const editActivity = {
            adminName: `Admin ${adminData.user.FirstName}`,
            action: 'Edited',
            targetAdminName: `Service Provider ${updatedServiceProvider.serviceProviderName}`,
            timestamp: new Date().getTime(),
          };

          axios.post('http://localhost:3000/admin-activity', editActivity, {
            headers: { Authorization: adminData.token },
          }).catch(err => console.error('Activity log error:', err));
        });
      },
    });
  };

  const handleDelete = (serviceProviderBIN) => {
    const deletedServiceProvider = serviceProviderData.find(
      (sp) => sp.serviceProviderBIN === serviceProviderBIN
    );

    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this service provider?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        axios
          .delete(`http://localhost:3000/serviceproviders/${serviceProviderBIN}`)
          .then((response) => {
            if (response.status === 200) {
              message.success('Service provider deleted successfully.');

              const deleteActivity = {
                adminName: `Admin ${adminData.user.FirstName}`,
                action: 'Deleted',
                targetAdminName: `Service Provider ${deletedServiceProvider.serviceProviderName}`,
                timestamp: new Date().getTime(),
              };

              axios.post('http://localhost:3000/admin-activity', deleteActivity, {
                headers: { Authorization: adminData.token },
              }).catch(err => console.error('Activity log error:', err));

              fetchServiceProviders();
            } else {
              message.error('Failed to delete service provider.');
            }
          })
          .catch((error) => {
            message.error('Failed to delete service provider.');
          });
      },
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="spl-index">{index + 1}</span>,
      width: 50,
    },
    {
      title: 'Provider BIN',
      dataIndex: 'serviceProviderBIN',
      key: 'serviceProviderBIN',
      render: (text) => <span className="spl-bin">{text}</span>,
    },
    {
      title: 'Provider Name',
      dataIndex: 'serviceProviderName',
      key: 'serviceProviderName',
      render: (text) => <span className="spl-name">{text}</span>,
    },
    {
      title: 'Bank',
      dataIndex: 'BankName',
      key: 'BankName',
      render: (text) => <span className="spl-bank">{text}</span>,
    },
    {
      title: 'Account',
      dataIndex: 'BankAccountNumber',
      key: 'BankAccountNumber',
      render: (text) => <span className="spl-account">{text}</span>,
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text) => <span className="spl-phone">{text}</span>,
    },
    {
      title: 'Services',
      dataIndex: 'servicesOffered',
      key: 'servicesOffered',
      render: (text) => <span className="spl-services">{text}</span>,
    },
    {
      title: 'Auth Letter',
      key: 'authLetter',
      render: (_, provider) => (
        provider.serviceProviderAuthorizationLetter ? (
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            className="spl-auth-download-btn"
            onClick={() => {
              const downloadLink = document.createElement('a');
              downloadLink.href = `http://localhost:3000/${provider.serviceProviderAuthorizationLetter}`;
              downloadLink.download = `auth-letter-${provider.serviceProviderBIN}`;
              downloadLink.target = '_blank';
              downloadLink.click();
            }}
          >
            Download
          </Button>
        ) : (
          <span className="spl-no-file">No file</span>
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, provider) => (
        <div className="spl-action-buttons">
          <Button 
            onClick={() => handleEdit(provider)} 
            icon={<EditOutlined />} 
            className="spl-action-btn spl-edit-btn"
          />
          <Button 
            onClick={() => handleDelete(provider.serviceProviderBIN)} 
            icon={<DeleteOutlined />} 
            className="spl-action-btn spl-delete-btn"
          />
        </div>
      ),
    },
  ];

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredServiceProviders = serviceProviderData.filter((serviceProvider) =>
    serviceProvider &&
    (serviceProvider.serviceProviderBIN?.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.serviceProviderName?.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.BankName?.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.servicesOffered?.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.BankAccountNumber?.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.phoneNumber?.toLowerCase().includes(searchInput.toLowerCase()))
  );

  return (
    <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} 
      content={
        <div className="spl-container">
          <div className="spl-card">
            <div className="spl-header">
              <div className="spl-header-left">
                <div className="spl-icon">
                  <FaBuilding />
                </div>
                <div>
                  <h1>Service Providers List</h1>
                  <p>Manage all registered service providers</p>
                </div>
              </div>
              <div className="spl-badge">
                <FaUserPlus /> {filteredServiceProviders.length} Providers
              </div>
            </div>

            <div className="spl-body">
              <div className="spl-search-wrapper">
                <AntInput
                  placeholder="Search providers by name, BIN, bank, phone or services..."
                  value={searchInput}
                  onChange={handleSearch}
                  prefix={<SearchOutlined className="spl-search-icon" />}
                  className="spl-search-input"
                  allowClear
                />
              </div>

              <div className="spl-table-wrapper">
                <Table 
                  dataSource={filteredServiceProviders} 
                  columns={columns} 
                  scroll={{ x: 900 }}
                  pagination={{
                    showSizeChanger: true,
                    showTotal: (total, range) => {
                      const totalPages = Math.ceil(total / pageSize);
                      return `Showing ${range[0]}-${range[1]} of ${totalPages} pages`;
                    },
                    showQuickJumper: false,
                  }}
                  className="spl-table"
                  rowClassName="spl-table-row"
                  rowKey="serviceProviderBIN"
                  onChange={(pagination) => {
                    setCurrentPage(pagination.current);
                    setPageSize(pagination.pageSize);
                  }}
                />
              </div>
            </div>
          </div>

          <Modal
            title={
              <div className="spl-modal-title">
                <EditOutlined /> Edit Service Provider
              </div>
            }
            open={editMode}
            onCancel={() => {
              setEditMode(false);
              form.resetFields();
              setFile(null);
              setFilePreview(null);
            }}
            footer={null}
            width={600}
            className="spl-modal"
          >
            <Form form={form} layout="vertical" className="spl-edit-form">
              <div className="spl-modal-form-grid">
                <Form.Item name="serviceProviderBIN" label="Provider BIN" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
                <Form.Item name="serviceProviderName" label="Provider Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="BankName" label="Bank Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="BankAccountNumber" label="Bank Account" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </div>
              
              <Form.Item name="servicesOffered" label="Services Offered" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item name="serviceProviderAuthorizationLetter" label="Authorization Letter">
                <div className="spl-modal-file-upload">
                  {filePreview ? (
                    <div className="spl-modal-file-preview">
                      <img src={filePreview} alt="Auth Letter" className="spl-modal-file-img" />
                      <Button 
                        type="link" 
                        danger 
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Upload 
                      accept=".jpeg, .jpg, .png, .gif" 
                      beforeUpload={() => false}
                      onChange={handleFileChange}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} className="spl-upload-btn">
                        Upload Authorization Letter
                      </Button>
                    </Upload>
                  )}
                  <p className="spl-upload-hint">Supported: JPEG, JPG, PNG, GIF (Max 5MB)</p>
                </div>
              </Form.Item>

              <div className="spl-modal-actions">
                <Button 
                  onClick={() => {
                    setEditMode(false);
                    form.resetFields();
                    setFile(null);
                    setFilePreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSave}
                  loading={loading}
                  className="spl-modal-save-btn"
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      }
    />
  );
};

export default ServiceProvidersList;