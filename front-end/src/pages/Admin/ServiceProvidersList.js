import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Form, Input, Spin } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';

const ServiceProvidersList = ({ isLoggedIn, setIsLoggedIn }) => {

  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [serviceProviderData, setServiceProviderData] = useState([]);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [serviceProviderAuthorizationLetterUrl, setServiceProviderAuthorizationLetterUrl] = useState();
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchServiceProviders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/serviceProviders');
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }




  const handleEdit = (serviceProvider) => {
    form.setFieldsValue(serviceProvider);
    setEditMode(true);
    setServiceProvider(serviceProvider);
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
          const updatedServiceProvider = { ...values };
          axios
            .put(
              `http://localhost:3000/serviceProviders/${serviceProvider.serviceProviderBIN}`,
              updatedServiceProvider
            )
            .then((response) => {
              if (response.status === 200) {
                message.success('Service provider data updated successfully.');


                // Retrieve the previous serviceProvider data from localStorage
                const previousData = JSON.parse(localStorage.getItem('serviceProvidersData')) || [];

                // Find the index of the updated serviceProvider in the previous data
                const updatedIndex = previousData.findIndex((serviceProvider) => serviceProvider.serviceProviderBIN === updatedServiceProvider.serviceProviderBIN);

                // Create a copy of the previous data
                const updatedData = [...previousData];

                // Get the previous serviceProvider data
                const previousServiceProvider = updatedData[updatedIndex];

                // Create a change object to track the changes
                const changes = {};

                // Compare each field of the updated serviceProvider with the previous serviceProvider
                for (const key in updatedServiceProvider) {
                  if (key !== 'serviceProviderBIN' && updatedServiceProvider[key] !== previousServiceProvider[key]) {
                    changes[key] = {
                      from: previousServiceProvider[key],
                      to: updatedServiceProvider[key],
                    };
                  }
                }

                // Update the serviceProviderBIN if it has changed
                if (updatedServiceProvider.serviceProviderBIN !== previousServiceProvider.serviceProviderBIN) {
                  updatedData[updatedIndex].serviceProviderBIN = updatedServiceProvider.serviceProviderBIN;
                  changes.serviceProviderBIN = {
                    from: previousServiceProvider.serviceProviderBIN,
                    to: updatedServiceProvider.serviceProviderBIN,
                  };
                }

                // Add the changes object to the updated serviceProvider data
                updatedServiceProvider.changes = changes;

                // Replace the updated serviceProvider with the new serviceProvider data in the copy
                updatedData[updatedIndex] = updatedServiceProvider;

                // Update the serviceProvider data in localStorage
                localStorage.setItem('serviceProviderData', JSON.stringify(updatedData));

                // Create a new activity object for the service provider edit action
                const editActivity = {
                  adminName: `Admin ${adminData.user.FirstName}`,
                  action: 'Edited',
                  targetAdminName: `Service Provider ${updatedServiceProvider.serviceProviderName}`,
                  timestamp: new Date().getTime(),
                  updatedData: updatedServiceProvider,
                };

                // Save the admin activity to the database
                axios.post('http://localhost:3000/admin-activity', editActivity, {
                  headers: {
                    Authorization: adminData.token,
                  },
                });

                setServiceProviderData(updatedData);
                setEditMode(false);
                form.resetFields();
              } else {
                message.error('Failed to update service provider data.');
              }
            })
            .catch((error) => {
              message.error('Failed to update service provider data.');
            });
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
          .delete(`http://localhost:3000/serviceProviders/${serviceProviderBIN}`)
          .then((response) => {
            if (response.status === 200) {
              message.success('Service provider deleted successfully.');

              // Create a new activity object for the service provider delete action
              const deleteActivity = {
                adminName: `Admin ${adminData.user.FirstName}`,
                action: 'Deleted',
                targetAdminName: `Service Provider ${deletedServiceProvider.serviceProviderName}`,
                timestamp: new Date().getTime(),
                deletedData: deletedServiceProvider,
              };

              // Save the admin activity to the database
              axios.post('http://localhost:3000/admin-activity', deleteActivity, {
                headers: {
                  Authorization: adminData.token,
                },
              });

              const updatedData = serviceProviderData.filter(
                (sp) => sp.serviceProviderBIN !== serviceProviderBIN
              );
              setServiceProviderData(updatedData);
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
      title: 'Service Provider BIN',
      dataIndex: 'serviceProviderBIN',
      key: 'serviceProviderBIN',
    },
    {
      title: 'Service Provider Name',
      dataIndex: 'serviceProviderName',
      key: 'serviceProviderName',
    },
    {
      title: 'Services Offered',
      dataIndex: 'servicesOffered',
      key: 'servicesOffered',
    },
    {
      title: 'Bank Name',
      dataIndex: 'BankName',
      key: 'BankName',
    },
    {
      title: 'Bank Account Number',
      dataIndex: 'BankAccountNumber',
      key: 'BankAccountNumber',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Authorization Letter',
      dataIndex: 'serviceProviderAuthorizationLetter',
      key: 'serviceProviderAuthorizationLetter',
      render: (_, serviceProvider) => (
        <div>
          {serviceProvider.serviceProviderAuthorizationLetter && (
            <div>
              <a href={`http://localhost:3000/${serviceProvider.serviceProviderAuthorizationLetter}`} download>
                Authorization Letter
              </a>
              <Button
                type="primary"
                onClick={() => {
                  const downloadLink = document.createElement('a');
                  downloadLink.href = `http://localhost:3000/${serviceProvider.serviceProviderAuthorizationLetter}`;
                  downloadLink.download = 'Authorization Letter';
                  downloadLink.target = '_blank';
                  downloadLink.click();
                }}
              >
                Download
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, serviceProvider) => (
        <div>
          <Button onClick={() => handleEdit(serviceProvider)} icon={<EditOutlined />} type="danger">
            Edit
          </Button>
          <Button onClick={() => handleDelete(serviceProvider.serviceProviderBIN)} icon={<DeleteOutlined />} type="danger">
            Delete
          </Button>
        </div>
      ),
    },
  ];
  const handleSearch = (value) => {
    setSearchInput(value);
    const activity = {
      adminName: `Admin ${adminData.user.FirstName}`,
      action: 'Searched for',
      targetAdminName: `${value} in Service Providers List`,
      timestamp: new Date().getTime(),
    };

    // Save the admin activity to the database
    axios.post('http://localhost:3000/admin-activity', activity, {
      headers: {
        Authorization: adminData.token,
      },
    });
  };

  const filteredServiceProviders = serviceProviderData.filter((serviceProvider) =>
    serviceProvider &&
    (serviceProvider.serviceProviderBIN.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.serviceProviderName.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.BankName.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.servicesOffered.toLowerCase().includes(searchInput.toLowerCase()) ||
      serviceProvider.BankAccountNumber.toLowerCase().includes(searchInput.toLowerCase()) ||
      (typeof serviceProvider.phoneNumber === 'string' &&
        serviceProvider.phoneNumber.toLowerCase().includes(searchInput.toLowerCase())))
  );


  return (
    <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} content={
      <div>
        <h1>Service Providers List</h1>
        <Input.Search
          placeholder="Search Service provider"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Table dataSource={filteredServiceProviders} columns={columns} scroll={{ x: true }} />        <Modal
          title={editMode ? 'Edit Service Provider' : 'Create Service Provider'}
          visible={editMode}
          onCancel={() => {
            setEditMode(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form}>
            <Form.Item name="serviceProviderBIN" label="Service Provider BIN">
              <Input />
            </Form.Item>
            <Form.Item name="serviceProviderName" label="Service Provider Name">
              <Input />
            </Form.Item>
            <Form.Item name="servicesOffered" label="Services Offered">
              <Input />
            </Form.Item>
            <Form.Item name="BankName" label="Bank Name">
              <Input />
            </Form.Item>
            <Form.Item name="BankAccountNumber" label="Bank Account Number">
              <Input />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Phone Number">
              <Input />
            </Form.Item>
            <Form.Item >
              <label htmlFor="serviceProviderAuthorizationLetter">Authorization Letter:</label>
              <input
                type="file"
                id="serviceProvider"
                accept=".jpeg, .jpg, .png, .gif"
              />
              {serviceProviderAuthorizationLetterUrl && (
                <img src={serviceProviderAuthorizationLetterUrl} alt="Auth Letter" style={{ width: '200px' }} />
              )}
            </Form.Item>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </Form>
        </Modal>
      </div>}
    />
  );
};

export default ServiceProvidersList;