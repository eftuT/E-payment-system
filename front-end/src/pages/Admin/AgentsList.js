import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Form, Input, Upload, Spin, Input as AntInput } from 'antd';
import { DeleteOutlined, EditOutlined, UploadOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { FaUserPlus, FaBuilding, FaEnvelope, FaPhone, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './AgentsList.css';

const AgentsList = ({ isLoggedIn, setIsLoggedIn }) => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [agentData, setAgentData] = useState([]);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [agent, setAgent] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [ setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  
  const fetchAgents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/agents');
      setAgentData(response.data);
      localStorage.setItem('agentData', JSON.stringify(response.data));
    } catch (error) {
      message.error('Failed to fetch agents.');
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
    localStorage.setItem('selectedMenu', 3);
    fetchAgents();
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="agents-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const handleEdit = (agent) => {
    form.setFieldsValue(agent);
    setEditMode(true);
    setAgent(agent);
    if (agent.agentAuthorizationLetter) {
      setFilePreview(`http://localhost:3000/${agent.agentAuthorizationLetter}`);
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
      content: 'Are you sure you want to edit this agent?',
      okText: 'Edit',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        form.validateFields().then((values) => {
          setLoading(true);
          const updatedAgent = { ...values };
          
          if (file) {
            const formData = new FormData();
            Object.keys(values).forEach(key => {
              if (key !== 'agentAuthorizationLetter') {
                formData.append(key, values[key]);
              }
            });
            formData.append('agentAuthorizationLetter', file);
            
            axios
              .put(`http://localhost:3000/agents/${agent.agentBIN}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              })
              .then((response) => {
                if (response.status === 200) {
                  message.success('Agent data updated successfully.');
                  fetchAgents();
                  setEditMode(false);
                  form.resetFields();
                  setFile(null);
                  setFilePreview(null);
                } else {
                  message.error('Failed to update agent data.');
                }
                setLoading(false);
              })
              .catch((error) => {
                message.error('Failed to update agent data.');
                console.log(error);
                setLoading(false);
              });
          } else {
            axios
              .put(`http://localhost:3000/agents/${agent.agentBIN}`, updatedAgent)
              .then((response) => {
                if (response.status === 200) {
                  message.success('Agent data updated successfully.');
                  fetchAgents();
                  setEditMode(false);
                  form.resetFields();
                } else {
                  message.error('Failed to update agent data.');
                }
                setLoading(false);
              })
              .catch((error) => {
                message.error('Failed to update agent data.');
                console.log(error);
                setLoading(false);
              });
          }

          const editActivity = {
            adminName: `Admin ${adminData.user.FirstName}`,
            action: 'Edited',
            targetAdminName: `Agent ${updatedAgent.agentName}`,
            timestamp: new Date().getTime(),
          };

          axios.post('http://localhost:3000/admin-activity', editActivity, {
            headers: { Authorization: adminData.token },
          }).catch(err => console.error('Activity log error:', err));
        });
      },
    });
  };

  const handleDelete = (agentBIN) => {
    const deletedAgent = agentData.find((agent) => agent.agentBIN === agentBIN);

    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this agent?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        axios
          .delete(`http://localhost:3000/agents/${agentBIN}`)
          .then((response) => {
            if (response.status === 200) {
              message.success('Agent deleted successfully.');
              
              const deleteActivity = {
                adminName: `Admin ${adminData.user.FirstName}`,
                action: 'Deleted',
                targetAdminName: `Agent ${deletedAgent.agentName}`,
                timestamp: new Date().getTime(),
              };

              axios.post('http://localhost:3000/admin-activity', deleteActivity, {
                headers: { Authorization: adminData.token },
              }).catch(err => console.error('Activity log error:', err));

              fetchAgents();
            } else {
              message.error('Failed to delete agent.');
            }
          })
          .catch((error) => {
            message.error('Failed to delete agent.');
          });
      },
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="agent-index">{index + 1}</span>,
      width: 50,
    },
    {
      title: 'Agent BIN',
      dataIndex: 'agentBIN',
      key: 'agentBIN',
      render: (text) => <span className="agent-bin">{text}</span>,
    },
    {
      title: 'Agent Name',
      dataIndex: 'agentName',
      key: 'agentName',
      render: (text) => <span className="agent-name"><FaBuilding className="agent-icon-sm" /> {text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'agentEmail',
      key: 'agentEmail',
      render: (text) => <span className="agent-email"><FaEnvelope className="agent-icon-sm" /> {text}</span>,
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text) => <span className="agent-phone"><FaPhone className="agent-icon-sm" /> {text}</span>,
    },
    {
      title: 'Services',
      dataIndex: 'servicesOffered',
      key: 'servicesOffered',
      render: (text) => <span className="agent-services">{text}</span>,
    },
    {
      title: 'Auth Letter',
      key: 'authLetter',
      render: (_, agent) => (
        agent.agentAuthorizationLetter ? (
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            className="auth-download-btn"
            onClick={() => {
              const downloadLink = document.createElement('a');
              downloadLink.href = `http://localhost:3000/${agent.agentAuthorizationLetter}`;
              downloadLink.download = `auth-letter-${agent.agentBIN}`;
              downloadLink.target = '_blank';
              downloadLink.click();
            }}
          >
            Download
          </Button>
        ) : (
          <span className="no-file">No file</span>
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, agent) => (
        <div className="action-buttons">
          <Button 
            onClick={() => handleEdit(agent)} 
            icon={<EditOutlined />} 
            className="action-btn edit-btn"
          />
          <Button 
            onClick={() => handleDelete(agent.agentBIN)} 
            icon={<DeleteOutlined />} 
            className="action-btn delete-btn"
          />
        </div>
      ),
    },
  ];

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredAgents = agentData.filter((agent) =>
    agent &&
    (agent.agentBIN?.toLowerCase().includes(searchInput.toLowerCase()) ||
      agent.agentName?.toLowerCase().includes(searchInput.toLowerCase()) ||
      agent.agentEmail?.toLowerCase().includes(searchInput.toLowerCase()) ||
      agent.servicesOffered?.toLowerCase().includes(searchInput.toLowerCase()) ||
      agent.phoneNumber?.toLowerCase().includes(searchInput.toLowerCase()))
  );

  return (
    <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} 
      content={
        <div className="agents-list-container">
          <div className="agents-list-card">
            {/* Header */}
            <div className="agents-list-header">
              <div className="agents-list-header-left">
                <div className="agents-list-icon">
                  <FaBuilding />
                </div>
                <div>
                  <h1>Agents List</h1>
                  <p>Manage all registered agents</p>
                </div>
              </div>
              <div className="agents-list-badge">
                <FaUserPlus /> {filteredAgents.length} Agents
              </div>
            </div>

            <div className="agents-list-body">
              {/* Search Bar */}
              <div className="agents-search-wrapper">
                <AntInput
                  placeholder="Search agents by name, BIN, email, phone or services..."
                  value={searchInput}
                  onChange={handleSearch}
                  prefix={<SearchOutlined className="search-icon" />}
                  className="agents-search-input"
                  allowClear
                />
              </div>

              {/* Table */}
              <div className="agents-table-wrapper">
                <Table 
                  dataSource={filteredAgents} 
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
                  className="agents-table"
                  rowClassName="agents-table-row"
                  rowKey="agentBIN"
                  onChange={(pagination) => {
                    setCurrentPage(pagination.current);
                    setPageSize(pagination.pageSize);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          <Modal
            title={
              <div className="modal-title">
                <EditOutlined /> Edit Agent
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
            className="agents-modal"
          >
            <Form form={form} layout="vertical" className="agents-edit-form">
              <div className="modal-form-grid">
                <Form.Item name="agentBIN" label="Agent BIN" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
                <Form.Item name="agentName" label="Agent Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="agentEmail" label="Agent Email" rules={[{ required: true, type: 'email' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </div>
              
              <Form.Item name="servicesOffered" label="Services Offered" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item name="agentAuthorizationLetter" label="Authorization Letter">
                <div className="modal-file-upload">
                  {filePreview ? (
                    <div className="modal-file-preview">
                      <img src={filePreview} alt="Auth Letter" className="modal-file-img" />
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
                      <Button icon={<UploadOutlined />} className="upload-btn">
                        Upload Authorization Letter
                      </Button>
                    </Upload>
                  )}
                  <p className="upload-hint">Supported: JPEG, JPG, PNG, GIF (Max 5MB)</p>
                </div>
              </Form.Item>

              <div className="modal-actions">
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
                  className="modal-save-btn"
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

export default AgentsList;