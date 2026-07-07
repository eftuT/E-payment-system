import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Form, Input, Upload, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';


const AgentsList = ({ isLoggedIn, setIsLoggedIn }) => {
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [agentData, setAgentData] = useState([]);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [agent, setAgent] = useState(null);
  const [agentAuthorizationLetterUrl, setAgentAuthorizationLetterUrl] = useState();
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  
  const fetchAgents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/agents');
      setAgentData(response.data);
      localStorage.setItem('agentData', JSON.stringify(response.data)); // Store agent data in localStorage
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }


 

  const handleEdit = (agent) => {
    form.setFieldsValue(agent);
    setEditMode(true);
    setAgent(agent);
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
          const updatedAgent = { ...values };
          axios
            .put(`http://localhost:3000/agents/${agent.agentBIN}`, updatedAgent)
            .then((response) => {
              if (response.status === 200) {
                message.success('Agent data updated successfully.');
  
                // Retrieve the previous agent data from localStorage
                const previousData = JSON.parse(localStorage.getItem('agentData')) || [];
  
                // Find the index of the updated agent in the previous data
                const updatedIndex = previousData.findIndex((agent) => agent.agentBIN === updatedAgent.agentBIN);
  
                // Create a copy of the previous data
                const updatedData = [...previousData];
  
                // Get the previous agent data
                const previousAgent = updatedData[updatedIndex];
  
                // Create a change object to track the changes
                const changes = {};
  
                // Compare each field of the updated agent with the previous agent
                for (const key in updatedAgent) {
                  if ( key !== 'agentBIN' && updatedAgent[key] !== previousAgent[key]) {
                    changes[key] = {
                      from: previousAgent[key],
                      to: updatedAgent[key],
                    };
                  }
                }
  
                // Update the agentBIN if it has changed
                if (updatedAgent.agentBIN !== previousAgent.agentBIN) {
                  updatedData[updatedIndex].agentBIN = updatedAgent.agentBIN;
                  changes.agentBIN = {
                    from: previousAgent.agentBIN,
                    to: updatedAgent.agentBIN,
                  };
                }
  
                // Add the changes object to the updated agent data
                updatedAgent.changes = changes;
  
                // Replace the updated agent with the new agent data in the copy
                updatedData[updatedIndex] = updatedAgent;
  
                // Update the agent data in localStorage
                localStorage.setItem('agentData', JSON.stringify(updatedData));
  
                // Create a new activity object for the agent edit action
                const editActivity = {
                  adminName: `Admin ${adminData.user.FirstName}`,
                  action: 'Edited',
                  targetAdminName: `Agent ${updatedAgent.agentName}`,
                  timestamp: new Date().getTime(),
                  changedData: updatedAgent,
                };
  
                 axios.post('http://localhost:3000/admin-activity', editActivity, {
                  headers: {
                    Authorization: adminData.token,
                  },
                });
  
                setEditMode(false);
                form.resetFields();
              } else {
                message.error('Failed to update agent data.');
              }
            })
            .catch((error) => {
              message.error('Failed to update agent data.');
              console.log(error);
            });
        });
      },
    });
  };

  const handleDelete = (agentBIN) => {
    const deletedAgent = agentData.find((agent) => agent.agentBIN === agentBIN); // Find the agent to be deleted
  
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
  
              // Create a new activity object for the agent delete action
              const deleteActivity = {
                adminName: `Admin ${adminData.user.FirstName}`,
                action: 'Deleted',
                targetAdminName: `Agent ${deletedAgent.agentName}`,
                timestamp: new Date().getTime(),
                changedData: deletedAgent,
              };
  
              axios.post('http://localhost:3000/admin-activity', deleteActivity, {
                headers: {
                  Authorization: adminData.token,
                },
              });
  
              const updatedData = agentData.filter((agent) => agent.agentBIN !== agentBIN);
              setAgentData(updatedData);
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
      title: 'Agent BIN',
      dataIndex: 'agentBIN',
      key: 'agentBIN',
    },
    {
      title: 'Agent Name',
      dataIndex: 'agentName',
      key: 'agentName',
    },
    {
      title: 'Agent Email',
      dataIndex: 'agentEmail',
      key: 'agentEmail',
    },
    {
      title: 'Services Offered',
      dataIndex: 'servicesOffered',
      key: 'servicesOffered',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Authorization Letter',
      dataIndex: 'agentAuthorizationLetter',
      key: 'agentAuthorizationLetter',
      render: (_, agent) => (
        <div>
          {agent.agentAuthorizationLetter && (
            <div>
              <a href={`http://localhost:3000/${agent.agentAuthorizationLetter}`} download>
                Authorization Letter
              </a>
              <Button
                type="primary"
                onClick={() => {
                  const downloadLink = document.createElement('a');
                  downloadLink.href = `http://localhost:3000/${agent.agentAuthorizationLetter}`;
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
      render: (_, agent) => (
        <div>
          <Button onClick={() => handleEdit(agent)} icon={<EditOutlined />} type="danger">Edit</Button>
          <Button onClick={() => handleDelete(agent.agentBIN)} icon={<DeleteOutlined />} type="danger">Delete</Button>
        </div>
      ),
    },
  ];

  const handleSearch = async (value) => {
    setSearchInput(value);
    try {
      const activity = {
      adminName: `Admin ${adminData.user.FirstName}`,
      action: 'Searched for',
      targetAdminName: `${value} in Agent List`,
      timestamp: new Date().getTime(),
    };

      // Save the admin activity to the database
    axios.post('http://localhost:3000/admin-activity', activity, {
      headers: {
        Authorization: adminData.token,
      },
    });
  
    } catch (error) {
      console.error('Error saving admin search activity:', error);
    }
  };

  const filteredAgents = agentData.filter((agent) =>
    agent &&
    (agent.agentBIN.toLowerCase().includes(searchInput.toLowerCase()) ||
      agent.agentName.toLowerCase().includes(searchInput.toLowerCase()) ||
      agent.agentEmail.toLowerCase().includes(searchInput.toLowerCase()) ||
      agent.servicesOffered.toLowerCase().includes(searchInput.toLowerCase()) ||
      (typeof agent.phoneNumber === 'string' &&
        agent.phoneNumber.toLowerCase().includes(searchInput.toLowerCase())))
  );



  return (
    <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} content={
      <div>
        <h1>Agents List</h1>
        <Input.Search
          placeholder="Search agents"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: '16px' }}
        />

        <Table dataSource={filteredAgents} columns={columns} scroll={{ x: true }} />

        <Modal
          title={editMode ? 'Edit Agent' : 'Create Agent'}
          visible={editMode}
          onCancel={() => {
            setEditMode(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form}>
            <Form.Item name="agentBIN" label="Agent BIN">
              <Input />
            </Form.Item>
            <Form.Item name="agentName" label="Agent Name">
              <Input />
            </Form.Item>
            <Form.Item name="agentEmail" label="Agent Email">
              <Input />
            </Form.Item>
            <Form.Item name="servicesOffered" label="Services Offered">
              <Input />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Phone Number">
              <Input />
            </Form.Item>
            <Form.Item name="agentAuthorizationLetter" label="Agent Authorization Letter">
              <Upload accept=".jpeg, .jpg, .png, .gif" beforeUpload={() => false}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
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

export default AgentsList;